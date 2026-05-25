// ============================================================
// KLUP — Auth + App Context
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Auth Context ─────────────────────────────────────────────

const AuthCtx = createContext(null);

// Demo users for mock mode
const DEMO_USERS = {
  'coordinador@klup.es': { id:'u0', role:'coordinator', name:'Adrián Coordinador', email:'coordinador@klup.es',  centerId:'centro1', avatar:'AC' },
  'entrenador@klup.es':  { id:'u1', role:'coach',       name:'Juan Martínez',      email:'entrenador@klup.es',   coachId:'c1',       avatar:'JM' },
  'familia@klup.es':     { id:'u2', role:'family',      name:'Ana García',         email:'familia@klup.es',      familyId:'f1',      avatar:'AG' },
};

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem('klup_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    // Mock login — replace with supabase.auth.signInWithPassword
    const demo = DEMO_USERS[email.toLowerCase()];
    if (demo && password === 'klup2025') {
      localStorage.setItem('klup_user', JSON.stringify(demo));
      setUser(demo);
      return demo;
    }
    // Real Supabase auth (uncomment when configured):
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // if (error) throw error;
    // const profile = await supabase.from('users').select('*').eq('id', data.user.id).single();
    // setUser(profile.data);
    // return profile.data;
    throw new Error('Email o contraseña incorrectos. Demo: coordinador@klup.es / klup2025');
  }, []);

  const register = useCallback(async (userData) => {
    // Mock register
    const newUser = {
      id: 'u_new_' + Date.now(),
      role: userData.role,
      name: userData.name,
      email: userData.email,
      avatar: userData.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase(),
      status: 'pending',
    };
    localStorage.setItem('klup_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('klup_user');
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

// ── Theme Context ─────────────────────────────────────────────

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('klup_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('klup_theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);

// ── Online status hook ────────────────────────────────────────

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}

// ── Swipe hook ────────────────────────────────────────────────

export function useSwipe(onSwipeLeft, onSwipeRight, threshold = 60) {
  const [startX, setStartX] = useState(null);
  const [deltaX, setDeltaX] = useState(0);

  const onTouchStart = (e) => setStartX(e.touches[0].clientX);
  const onTouchMove  = (e) => {
    if (startX === null) return;
    setDeltaX(e.touches[0].clientX - startX);
  };
  const onTouchEnd   = () => {
    if (deltaX > threshold)  onSwipeRight?.();
    if (deltaX < -threshold) onSwipeLeft?.();
    setStartX(null);
    setDeltaX(0);
  };

  return { onTouchStart, onTouchMove, onTouchEnd, deltaX };
}
