// ============================================================
// KLUP — Mensajería directa (coach ↔ familia)
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { ATHLETES, COACHES, GROUPS, getSport } from '../lib/mockData';
import { Icon } from './ui/index';

const MOCK_CONVERSATIONS = [
  { id:'conv1', familyId:'f1', coachId:'c1', athleteId:'a1', groupId:'g1',
    unread:1, lastText:'Hola, mañana Carlos no podrá venir por médico', lastAt: new Date(Date.now()-3600000) },
  { id:'conv2', familyId:'f2', coachId:'c1', athleteId:'a2', groupId:'g1',
    unread:0, lastText:'Perfecto, gracias por avisar', lastAt: new Date(Date.now()-2*86400000) },
  { id:'conv3', familyId:'f16', coachId:'c1', athleteId:'a16', groupId:'g4',
    unread:2, lastText:'¿Cuándo es el próximo torneo?', lastAt: new Date(Date.now()-7200000) },
];

const MOCK_MESSAGES = {
  conv1: [
    { id:'m1', senderId:'c1', text:'Hola Ana, quería comentarte que Carlos ha mejorado mucho el control de balón este mes. Sigue trabajando bien.', at: new Date(Date.now()-5*86400000) },
    { id:'m2', senderId:'f1', text:'¡Muchas gracias! En casa también practica, está muy motivado con el equipo.', at: new Date(Date.now()-4*86400000) },
    { id:'m3', senderId:'f1', text:'Hola, mañana Carlos no podrá venir por médico', at: new Date(Date.now()-3600000) },
  ],
  conv2: [
    { id:'m4', senderId:'f2', text:'Buenos días, Luis hoy llegará 10 minutos tarde por el cole.', at: new Date(Date.now()-3*86400000) },
    { id:'m5', senderId:'c1', text:'Perfecto, gracias por avisar', at: new Date(Date.now()-2*86400000) },
  ],
  conv3: [
    { id:'m6', senderId:'f16', text:'¿Cuándo es el próximo torneo?', at: new Date(Date.now()-7200000) },
  ],
};

function timeShort(date) {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return 'ahora';
  if (h < 24) return `${h}h`;
  if (d < 7) return `${d}d`;
  return new Date(date).toLocaleDateString('es-ES', { day:'numeric', month:'short' });
}

export default function Messaging({ myId, myRole, filterGroupId }) {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [messages, setMessages]           = useState(MOCK_MESSAGES);
  const [activeConv, setActiveConv]       = useState(null);
  const [text, setText]                   = useState('');
  const [newConvModal, setNewConvModal]   = useState(false);
  const [searchConv, setSearchConv]       = useState('');
  const bottomRef = useRef(null);

  const filtered = conversations.filter(c => {
    if (filterGroupId && c.groupId !== filterGroupId) return false;
    if (!searchConv) return true;
    const athlete = ATHLETES.find(a => a.id === c.athleteId);
    return athlete?.name.toLowerCase().includes(searchConv.toLowerCase());
  });

  const currentMessages = activeConv ? (messages[activeConv.id] || []) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [activeConv, currentMessages.length]);

  const sendMessage = () => {
    if (!text.trim() || !activeConv) return;
    const msg = { id:'m'+Date.now(), senderId:myId, text:text.trim(), at:new Date() };
    setMessages(prev => ({ ...prev, [activeConv.id]: [...(prev[activeConv.id]||[]), msg] }));
    setConversations(prev => prev.map(c =>
      c.id === activeConv.id ? { ...c, lastText:text.trim(), lastAt:new Date(), unread:0 } : c
    ));
    setText('');
  };

  const openConv = (conv) => {
    setActiveConv(conv);
    setConversations(prev => prev.map(c => c.id===conv.id ? {...c,unread:0} : c));
  };

  const totalUnread = conversations.reduce((acc,c) => acc + (c.unread||0), 0);

  return (
    <div style={{ display:'flex', height:'calc(100vh - 140px)', minHeight:400,
      background:'var(--surface)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)',
      overflow:'hidden' }}>

      {/* Conversation list */}
      <div style={{ width: activeConv ? '0' : '100%', minWidth: activeConv ? 0 : undefined,
        display:'flex', flexDirection:'column',
        borderRight:'1px solid var(--border)', overflow:'hidden',
        transition:'width .2s' }}
        className="conv-list-panel">

        {/* On desktop always show list */}
        <style>{`@media(min-width:640px){.conv-list-panel{width:280px!important;min-width:280px!important;}}`}</style>

        <div style={{ padding:'12px', borderBottom:'1px solid var(--border)', display:'flex', gap:8 }}>
          <input className="form-input" style={{ flex:1, height:34, fontSize:13 }}
            placeholder="Buscar conversación…" value={searchConv}
            onChange={e => setSearchConv(e.target.value)}/>
          {myRole === 'coach' && (
            <button className="btn btn-primary btn-icon" style={{ height:34, width:34, padding:0 }}
              onClick={() => setNewConvModal(true)} title="Nueva conversación">
              <svg width="16" height="16"><Icon.Plus/></svg>
            </button>
          )}
        </div>

        {totalUnread > 0 && (
          <div style={{ padding:'6px 12px', background:'#dbeafe', fontSize:12, color:'#1e40af', fontWeight:600 }}>
            {totalUnread} mensaje{totalUnread>1?'s':''} sin leer
          </div>
        )}

        <div style={{ flex:1, overflowY:'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:24, textAlign:'center', color:'var(--light)', fontSize:13 }}>
              No hay conversaciones
            </div>
          ) : filtered.map(conv => {
            const athlete = ATHLETES.find(a => a.id === conv.athleteId);
            const sport = getSport(GROUPS[conv.groupId]?.sportId);
            const isActive = activeConv?.id === conv.id;
            return (
              <div key={conv.id} onClick={() => openConv(conv)}
                style={{ padding:'12px 14px', cursor:'pointer', display:'flex', gap:10, alignItems:'flex-start',
                  background: isActive ? '#f0f7ff' : undefined,
                  borderBottom:'1px solid var(--bg)', transition:'background .1s' }}>
                <div className="avatar avatar-md"
                  style={{ background:`${sport?.color}20`, color:sport?.color, flexShrink:0 }}>
                  {athlete?.avatar}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>
                      {athlete?.name}
                    </div>
                    <div style={{ fontSize:11, color:'var(--light)' }}>{timeShort(conv.lastAt)}</div>
                  </div>
                  <div style={{ fontSize:11, color:sport?.color, fontWeight:600, marginBottom:2 }}>
                    {sport?.name} · {GROUPS[conv.groupId]?.name}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:12, color:'var(--muted)', overflow:'hidden',
                      textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>
                      {conv.lastText}
                    </div>
                    {conv.unread > 0 && (
                      <div style={{ background:'var(--blue)', color:'white', borderRadius:99,
                        fontSize:10, fontWeight:800, padding:'1px 6px', flexShrink:0 }}>
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message area */}
      {activeConv ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          {/* Conv header */}
          <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)',
            display:'flex', alignItems:'center', gap:10, background:'var(--surface)' }}>
            <button onClick={() => setActiveConv(null)}
              style={{ display:'flex', alignItems:'center', color:'var(--blue)', background:'none',
                border:'none', cursor:'pointer', gap:4, fontSize:13, fontWeight:600 }}
              className="mobile-back-btn">
              <svg width="16" height="16"><Icon.ChevronRight style={{ transform:'rotate(180deg)' }}/></svg>
            </button>
            <style>{`@media(min-width:640px){.mobile-back-btn{display:none!important;}}`}</style>
            {(() => {
              const athlete = ATHLETES.find(a => a.id === activeConv.athleteId);
              const sport = getSport(GROUPS[activeConv.groupId]?.sportId);
              return (
                <>
                  <div className="avatar avatar-sm"
                    style={{ background:`${sport?.color}20`, color:sport?.color }}>
                    {athlete?.avatar}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{athlete?.name}</div>
                    <div style={{ fontSize:11, color:sport?.color, fontWeight:600 }}>
                      {sport?.name} · {GROUPS[activeConv.groupId]?.name}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex',
            flexDirection:'column', gap:8 }}>
            {currentMessages.map(msg => {
              const isMe = msg.senderId === myId;
              return (
                <div key={msg.id} style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth:'75%', padding:'9px 13px', borderRadius:16,
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderBottomLeftRadius: isMe ? 16 : 4,
                    background: isMe ? 'var(--blue)' : 'var(--bg)',
                    color: isMe ? 'white' : 'var(--text)' }}>
                    <div style={{ fontSize:13, lineHeight:1.5 }}>{msg.text}</div>
                    <div style={{ fontSize:10, marginTop:3, opacity:.6, textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(msg.at).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border)',
            display:'flex', gap:8, background:'var(--surface)' }}>
            <input className="form-input" style={{ flex:1, height:40 }}
              placeholder="Escribe un mensaje…" value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}/>
            <button className="btn btn-primary btn-icon" style={{ height:40, width:40, padding:0, flexShrink:0 }}
              onClick={sendMessage} disabled={!text.trim()}>
              <svg width="16" height="16"><Icon.Megaphone/></svg>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:'none', alignItems:'center', justifyContent:'center',
          color:'var(--light)', fontSize:14 }} className="conv-empty">
          <style>{`@media(min-width:640px){.conv-empty{display:flex!important;}}`}</style>
          Selecciona una conversación
        </div>
      )}

      {/* New conversation modal */}
      {newConvModal && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.4)', display:'flex',
          alignItems:'flex-end', zIndex:100 }} onClick={() => setNewConvModal(false)}>
          <div style={{ background:'var(--surface)', borderRadius:'16px 16px 0 0', padding:'20px',
            width:'100%', maxHeight:'60%', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:12 }}>
              Nueva conversación
            </div>
            {ATHLETES.filter(a => filterGroupId ? a.groupId===filterGroupId : true).map(a => {
              const sport = getSport(GROUPS[a.groupId]?.sportId);
              const exists = conversations.find(c => c.athleteId===a.id);
              return (
                <div key={a.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0',
                  borderBottom:'1px solid var(--bg)', cursor: exists ? 'default' : 'pointer' }}
                  onClick={() => {
                    if (exists) { openConv(exists); setNewConvModal(false); return; }
                    const newConv = { id:'conv'+Date.now(), familyId:'f_new', coachId:myId,
                      athleteId:a.id, groupId:a.groupId, unread:0, lastText:'', lastAt:new Date() };
                    setConversations(prev => [newConv, ...prev]);
                    setMessages(prev => ({ ...prev, [newConv.id]: [] }));
                    openConv(newConv); setNewConvModal(false);
                  }}>
                  <div className="avatar avatar-sm" style={{ background:`${sport?.color}20`, color:sport?.color }}>
                    {a.avatar}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{a.name}</div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>{sport?.name} · {GROUPS[a.groupId]?.name}</div>
                  </div>
                  {exists && <span style={{ fontSize:11, color:'var(--blue)', fontWeight:600 }}>Existente</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

Icon.Megaphone = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>);
