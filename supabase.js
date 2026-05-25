// ============================================================
// KLUP — Supabase client
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
// ============================================================
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co';
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Auth helpers ───────────────────────────────────────────

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password, metadata) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: metadata },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Realtime helpers ────────────────────────────────────────

export function subscribeToAttendance(groupId, date, callback) {
  return supabase
    .channel(`attendance:${groupId}:${date}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'attendance_records',
      filter: `group_id=eq.${groupId}`,
    }, callback)
    .subscribe();
}

export function subscribeToPosts(groupId, callback) {
  return supabase
    .channel(`posts:${groupId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'posts',
      filter: `group_id=eq.${groupId}`,
    }, callback)
    .subscribe();
}

// ── Offline queue (IndexedDB) ───────────────────────────────

const DB_NAME = 'klup-offline';
const STORE   = 'queue';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { autoIncrement: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function enqueueOfflineAction(action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).add({ ...action, queuedAt: Date.now() });
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function flushOfflineQueue() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req   = store.getAll();
    req.onsuccess = async () => {
      const items = req.result;
      if (!items.length) { resolve(0); return; }
      // Process each queued action
      for (const item of items) {
        try {
          if (item.type === 'attendance') {
            await supabase.from('attendance_records').upsert(item.payload);
          }
          // add more action types as needed
        } catch (e) {
          console.warn('Failed to flush action:', e);
        }
      }
      store.clear();
      resolve(items.length);
    };
    req.onerror = () => reject(req.error);
  });
}
