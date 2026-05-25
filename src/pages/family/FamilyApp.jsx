// ============================================================
// KLUP — Family Panel v3 (mensajería · RSVP · ficha médica)
// ============================================================
import { useState } from 'react';
import { useAuth, useTheme, useOnlineStatus } from '../../contexts/AuthContext';
import { Icon, Avatar, OfflineBanner, EmptyState, RadarChart, ProgressRing } from '../../components/ui/index';
import { SPORTS, GROUPS, ATHLETES, POSTS, OBSERVATIONS, NOTIFICATIONS, HEALTH_RECORDS,
         SKILL_ASSESSMENTS, COACHES, getSport, timeAgo } from '../../lib/mockData';
import Messaging from '../../components/Messaging';
import { getHistory, calcAvg, calcCatAvg, scoreColor } from '../../lib/evaluationStore';

const MY_ATHLETES = [
  { id:'a1',  name:'Carlos García', groupId:'g1', course:'4º Primaria', avatar:'CG' },
  { id:'a16', name:'María García',  groupId:'g4', course:'3º Primaria', avatar:'MG' },
];

const VIEWS = [
  { id:'feed',     label:'Feed',     icon:<Icon.Home/> },
  { id:'grupo',    label:'Grupo',    icon:<Icon.Users/> },
  { id:'informes', label:'Informes', icon:<Icon.File/> },
  { id:'mensajes', label:'Mensajes', icon:<Icon.Megaphone/> },
  { id:'alertas',  label:'Alertas',  icon:<Icon.Bell/> },
  { id:'perfil',   label:'Perfil',   icon:<Icon.User/> },
];

Icon.Megaphone = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>);
Icon.Warning   = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);

export default function FamilyApp() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const online = useOnlineStatus();

  const [activeAthleteId, setActiveAthleteId] = useState(MY_ATHLETES[0].id);
  const [view, setView]           = useState('feed');
  const [obsFilter, setObsFilter] = useState('all');
  const [showJoinModal, setShowJoinModal]   = useState(false);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [unreadNotifs] = useState(NOTIFICATIONS.filter(n=>!n.read).length);

  // RSVP state per post
  const [rsvpState, setRsvpState] = useState({});

  // Health record edit state
  const [healthDraft, setHealthDraft] = useState({});

  const athlete   = MY_ATHLETES.find(a=>a.id===activeAthleteId)||MY_ATHLETES[0];
  const sport     = getSport(GROUPS[athlete.groupId]?.sportId);
  const group     = GROUPS[athlete.groupId];
  const coach     = COACHES.find(c=>c.groups?.includes(athlete.groupId));
  const feedPosts = POSTS.filter(p=>p.groupId===athlete.groupId).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const myObs     = OBSERVATIONS.filter(o=>o.athleteId===athlete.id&&!o.isPrivate)
    .filter(o=>obsFilter==='all'||o.type===obsFilter);
  const healthRecord = HEALTH_RECORDS[athlete.id] || {};
  const skills    = SKILL_ASSESSMENTS[athlete.id];
  const attPct    = 87;

  return (
    <div className="app-shell">
      {!online && <OfflineBanner/>}

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="app-sidebar">
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo">Klup</div>
          <div className="sidebar-logo-sub">Portal Familiar</div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Mis hijos</div>
          {MY_ATHLETES.map(a => {
            const s = getSport(GROUPS[a.groupId]?.sportId);
            return (
              <button key={a.id} className={`sidebar-nav-item ${activeAthleteId===a.id?'active':''}`}
                onClick={() => { setActiveAthleteId(a.id); setView('feed'); }}>
                <div className="avatar avatar-sm" style={{ background:`${s?.color}20`,color:s?.color,fontSize:9 }}>{a.avatar}</div>
                <div style={{ flex:1,textAlign:'left' }}>
                  <div style={{ fontSize:13,fontWeight:600 }}>{a.name.split(' ')[0]}</div>
                  <div style={{ fontSize:10,opacity:.7 }}>{s?.name} · {GROUPS[a.groupId]?.name}</div>
                </div>
              </button>
            );
          })}
          <button className="sidebar-nav-item" onClick={() => setShowJoinModal(true)}
            style={{ borderStyle:'dashed',borderWidth:'1.5px',borderColor:'var(--border)',
              background:'none',color:'var(--muted)',marginTop:4 }}>
            <svg width="16" height="16"><Icon.Plus/></svg>
            Solicitar grupo
          </button>
          <div className="sidebar-divider"/>
          <div className="sidebar-section-label">{athlete.name.split(' ')[0]}</div>
          {VIEWS.map(v => (
            <button key={v.id} className={`sidebar-nav-item ${view===v.id?'active':''}`} onClick={() => setView(v.id)}>
              <svg>{v.icon}</svg>
              {v.label}
              {v.id==='alertas' && unreadNotifs>0 && <span className="s-badge">{unreadNotifs}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar avatar-md" style={{ background:'#f3e8ff',color:'#9333ea' }}>{user?.avatar||'AG'}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{MY_ATHLETES.length} atletas</div>
            </div>
          </div>
          <button style={{ display:'flex',alignItems:'center',gap:6,width:'100%',padding:'8px 10px',
            borderRadius:'var(--r-md)',border:'1px solid var(--border)',background:'none',
            color:'var(--ausente)',fontSize:13,fontWeight:600,cursor:'pointer' }} onClick={logout}>
            <svg width="15" height="15"><Icon.Logout/></svg> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="app-main">
        <header className="page-header mobile-only">
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <div>
              <div className="header-klup-tag">KLUP</div>
              <div className="header-title">Portal Familiar</div>
            </div>
            <button className="theme-toggle" onClick={toggle}>
              <svg width="16" height="16">{theme==='dark'?<Icon.Sun/>:<Icon.Moon/>}</svg>
            </button>
          </div>
          <div style={{ display:'flex',gap:8,marginTop:10,overflowX:'auto',paddingBottom:2 }}>
            {MY_ATHLETES.map(a => {
              const s = getSport(GROUPS[a.groupId]?.sportId);
              const isActive = activeAthleteId===a.id;
              return (
                <button key={a.id} onClick={() => { setActiveAthleteId(a.id); setView('feed'); }}
                  style={{ display:'inline-flex',alignItems:'center',gap:8,flexShrink:0,border:'none',cursor:'pointer',
                    background:isActive?'rgba(255,255,255,.25)':'rgba(255,255,255,.13)',
                    borderRadius:'var(--r-full)',padding:'5px 14px 5px 6px',
                    outline:isActive?'1.5px solid rgba(255,255,255,.5)':'1px solid rgba(255,255,255,.2)' }}>
                  <div className="avatar avatar-sm" style={{ background:s?.color,color:'white',fontSize:9 }}>{a.avatar}</div>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontSize:12,fontWeight:700,color:'white' }}>{a.name.split(' ')[0]}</div>
                    <div style={{ fontSize:10,color:'rgba(255,255,255,.6)' }}>{s?.name}</div>
                  </div>
                </button>
              );
            })}
            <button onClick={() => setShowJoinModal(true)}
              style={{ display:'inline-flex',alignItems:'center',gap:5,flexShrink:0,
                background:'rgba(255,255,255,.1)',border:'1px dashed rgba(255,255,255,.3)',
                borderRadius:'var(--r-full)',padding:'5px 14px 5px 10px',
                color:'rgba(255,255,255,.7)',fontSize:11,fontWeight:600,cursor:'pointer' }}>
              <svg width="12" height="12"><Icon.Plus/></svg> Añadir
            </button>
          </div>
        </header>

        <div className="desktop-header">
          <div style={{ width:10,height:10,borderRadius:'50%',background:sport?.color,flexShrink:0 }}/>
          <span className="desktop-header-title">{athlete.name} — {sport?.name} · {group?.name}</span>
          <span className="desktop-header-sub">{athlete.course}</span>
          <button className="theme-toggle" style={{ background:'var(--bg)',border:'1px solid var(--border)',color:'var(--muted)' }} onClick={toggle}>
            <svg width="16" height="16">{theme==='dark'?<Icon.Sun/>:<Icon.Moon/>}</svg>
          </button>
        </div>

        <div className="page-content">

          {/* ── FEED with RSVP ── */}
          {view === 'feed' && (
            <>
              {feedPosts.length===0 ? (
                <EmptyState icon={<Icon.Home/>} title="Sin publicaciones" text="El entrenador no ha publicado nada todavía"/>
              ) : feedPosts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <span className="sport-dot" style={{ background:sport?.color }}/>
                    <div className="post-meta">
                      <div className="post-group" style={{ color:sport?.color }}>{sport?.name} · {group?.name}</div>
                    </div>
                    <span className="post-time">{timeAgo(post.createdAt)}</span>
                  </div>
                  <div className="post-body">
                    <span className={`badge badge-${post.type}`} style={{ marginBottom:7,display:'inline-block' }}>
                      {post.type.charAt(0).toUpperCase()+post.type.slice(1)}
                    </span>
                    <div className="post-title">{post.title}</div>
                    {post.type==='foto' && (
                      <div className="post-image-placeholder"
                        style={{ background:`linear-gradient(135deg,${post.imageColor||'#e2e8f0'},${post.imageColor||'#e2e8f0'}88)`,marginBottom:8 }}>
                        <svg width="32" height="32" style={{ color:'rgba(255,255,255,.5)' }}><Icon.Image/></svg>
                      </div>
                    )}
                    <div className="post-text">{post.content}</div>
                    {post.type==='resultado' && (
                      <div style={{ display:'flex',alignItems:'center',gap:10,marginTop:8 }}>
                        <span style={{ fontSize:30,fontWeight:900,color:'var(--text)',letterSpacing:-1 }}>{post.score}</span>
                        <span style={{ fontSize:13,fontWeight:700,color:'var(--presente)' }}>{post.result}</span>
                      </div>
                    )}
                    {post.type==='evento' && post.eventDate && (
                      <div className="post-event-date">
                        <svg width="14" height="14"><Icon.Calendar/></svg>{post.eventDate}
                      </div>
                    )}
                    {/* RSVP for events */}
                    {post.type==='evento' && (
                      <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)' }}>
                        <div style={{ fontSize:12, color:'var(--muted)', marginBottom:8, fontWeight:600 }}>
                          ¿Asistirá {athlete.name.split(' ')[0]}?
                        </div>
                        <div style={{ display:'flex', gap:8 }}>
                          <button onClick={() => setRsvpState(p=>({...p,[post.id]:'yes'}))}
                            className="btn btn-sm"
                            style={{ flex:1, background:rsvpState[post.id]==='yes'?'var(--presente-bg)':'var(--bg)',
                              color:rsvpState[post.id]==='yes'?'var(--presente)':'var(--muted)',
                              border:`1.5px solid ${rsvpState[post.id]==='yes'?'var(--presente)':'var(--border)'}`,
                              fontWeight:700 }}>
                            {rsvpState[post.id]==='yes' ? '✓ Confirmado' : 'Sí, iremos'}
                          </button>
                          <button onClick={() => setRsvpState(p=>({...p,[post.id]:'no'}))}
                            className="btn btn-sm"
                            style={{ flex:1, background:rsvpState[post.id]==='no'?'var(--ausente-bg)':'var(--bg)',
                              color:rsvpState[post.id]==='no'?'var(--ausente)':'var(--muted)',
                              border:`1.5px solid ${rsvpState[post.id]==='no'?'var(--ausente)':'var(--border)'}`,
                              fontWeight:700 }}>
                            {rsvpState[post.id]==='no' ? '✗ No podemos' : 'No podemos'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── GRUPO ── */}
          {view === 'grupo' && (
            <>
              <div className="card" style={{ border:`1.5px solid ${sport?.color}30`,marginBottom:16 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
                  <span style={{ width:12,height:12,borderRadius:'50%',background:sport?.color }}/>
                  <span style={{ fontSize:17,fontWeight:900,color:sport?.color }}>{sport?.name}</span>
                  <span style={{ fontSize:13,color:'var(--muted)' }}>· {group?.name}</span>
                </div>
                <div style={{ fontSize:13,color:'var(--muted)',lineHeight:1.8 }}>
                  <strong style={{ color:'var(--text)' }}>Centro:</strong> Escolapias Calasanz<br/>
                  <strong style={{ color:'var(--text)' }}>Atletas:</strong> {group?.count}<br/>
                  <strong style={{ color:'var(--text)' }}>Temporada:</strong> 2024-25
                </div>
              </div>
              {coach && (
                <>
                  <div className="section-label">Entrenador</div>
                  <div className="card" style={{ display:'flex',alignItems:'center',gap:12,marginBottom:16 }}>
                    <div className="avatar avatar-lg" style={{ background:'#dbeafe',color:'#2563eb' }}>{coach.avatar}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15,fontWeight:800,color:'var(--text)' }}>{coach.name}</div>
                      <div style={{ fontSize:12,color:'var(--muted)' }}>{coach.email}</div>
                    </div>
                    <button className="btn btn-info btn-sm" onClick={() => setView('mensajes')}>
                      Mensaje
                    </button>
                  </div>
                </>
              )}
              <div className="section-label">Compañeros</div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(70px,1fr))',gap:8 }}>
                {ATHLETES.filter(a=>a.groupId===athlete.groupId&&a.id!==athlete.id).map(a=>(
                  <div key={a.id} style={{ textAlign:'center',padding:'8px 4px',background:'var(--surface)',
                    borderRadius:'var(--r-md)',border:'1px solid var(--border)' }}>
                    <div className="avatar avatar-sm" style={{ background:`${sport?.color}20`,color:sport?.color,margin:'0 auto 4px' }}>{a.avatar}</div>
                    <div style={{ fontSize:10,fontWeight:600,color:'var(--text)' }}>{a.name.split(' ')[0]}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── INFORMES ── */}
          {view === 'informes' && (
            <>
              <div className="card" style={{ display:'flex',alignItems:'center',gap:12,marginBottom:16 }}>
                <div className="avatar avatar-lg" style={{ background:`${sport?.color}20`,color:sport?.color }}>{athlete.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:16,fontWeight:800,color:'var(--text)' }}>{athlete.name}</div>
                  <div style={{ fontSize:12,color:'var(--muted)' }}>{sport?.name} · {group?.name} · {athlete.course}</div>
                </div>
                <ProgressRing value={attPct} max={100} color={sport?.color||'#2563eb'} size={52} label={`${attPct}%`}/>
              </div>
              <div className="grid-2" style={{ marginBottom:16 }}>
                <div className="stat-big"><div className="stat-big-num">{attPct}%</div><div className="stat-big-label">Asistencia</div></div>
                <div className="stat-big"><div className="stat-big-num">7</div><div className="stat-big-label">Racha actual</div></div>
              </div>
              {skills && (
                <>
                  <div className="section-label">Progreso técnico</div>
                  <div className="card" style={{ display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',marginBottom:16 }}>
                    <RadarChart skills={skills} color={sport?.color}/>
                    <div style={{ flex:1,minWidth:140 }}>
                      {Object.entries(skills).map(([k,v])=>(
                        <div key={k} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
                          <span style={{ width:80,fontSize:12,color:'var(--muted)',fontWeight:600 }}>{k}</span>
                          <div style={{ flex:1,height:6,background:'var(--border)',borderRadius:99,overflow:'hidden' }}>
                            <div style={{ height:'100%',width:`${v}%`,background:sport?.color,borderRadius:99 }}/>
                          </div>
                          <span style={{ fontSize:12,fontWeight:800,color:'var(--text)',width:28,textAlign:'right' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {/* Health record with edit */}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                <div className="section-label" style={{ marginBottom:0 }}>Ficha médica</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowHealthForm(s=>!s)}>
                  {showHealthForm ? 'Cancelar' : 'Editar'}
                </button>
              </div>
              {showHealthForm ? (
                <div className="health-card">
                  <div className="form-group">
                    <label className="form-label">Alergias</label>
                    <input className="form-input" defaultValue={healthRecord.allergies||''}
                      onChange={e=>setHealthDraft(p=>({...p,allergies:e.target.value}))}
                      placeholder="Ninguna / Polen / Penicilina…"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condiciones médicas</label>
                    <input className="form-input" defaultValue={healthRecord.conditions||''}
                      onChange={e=>setHealthDraft(p=>({...p,conditions:e.target.value}))}
                      placeholder="Asma, diabetes, etc."/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Medicación</label>
                    <input className="form-input" defaultValue={healthRecord.medication||''}
                      onChange={e=>setHealthDraft(p=>({...p,medication:e.target.value}))}
                      placeholder="Bajo demanda / Nombre del medicamento"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contacto de emergencia</label>
                    <input className="form-input" defaultValue={healthRecord.emergencyName||''}
                      onChange={e=>setHealthDraft(p=>({...p,emergencyName:e.target.value}))}
                      placeholder="Nombre completo"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono emergencia</label>
                    <input className="form-input" type="tel" defaultValue={healthRecord.emergencyPhone||''}
                      onChange={e=>setHealthDraft(p=>({...p,emergencyPhone:e.target.value}))}
                      placeholder="6XX XXX XXX"/>
                  </div>
                  <button className="btn btn-primary btn-full"
                    onClick={() => { setShowHealthForm(false); }}>
                    Guardar ficha médica
                  </button>
                </div>
              ) : (
                <div className="health-card">
                  <div style={{ fontSize:13,color:'#92400e',lineHeight:1.8 }}>
                    {healthRecord.allergies ? <div><strong>Alergias:</strong> {healthRecord.allergies}</div>
                      : <div style={{ color:'#b45309' }}>Sin alergias registradas</div>}
                    {healthRecord.conditions && <div><strong>Condiciones:</strong> {healthRecord.conditions}</div>}
                    {healthRecord.medication  && <div><strong>Medicación:</strong> {healthRecord.medication}</div>}
                    {(healthRecord.emergencyName||healthRecord.emergencyPhone) && (
                      <div style={{ borderTop:'1px solid #fed7aa',marginTop:6,paddingTop:6 }}>
                        <strong>Emergencia:</strong> {healthRecord.emergencyName} — {healthRecord.emergencyPhone}
                      </div>
                    )}
                    {!healthRecord.allergies&&!healthRecord.conditions&&!healthRecord.emergencyName && (
                      <div style={{ color:'#b45309',fontSize:12 }}>
                        Ficha médica vacía. Pulsa "Editar" para añadir información.
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Observations */}
              <div className="section-label" style={{ marginTop:16 }}>Observaciones del entrenador</div>
              <div className="chip-group" style={{ marginBottom:12 }}>
                {[['all','Todas'],['tecnica','Técnica'],['comportamiento','Comportam.'],['general','General']].map(([id,label])=>(
                  <span key={id} className={`chip ${obsFilter===id?'selected':''}`} onClick={()=>setObsFilter(id)}>{label}</span>
                ))}
              </div>
              {myObs.length===0 ? (
                <EmptyState icon={<Icon.File/>} title="Sin observaciones" text="El entrenador no ha añadido observaciones todavía"/>
              ) : myObs.map(obs=>{
                const typeColor={tecnica:'#2563eb',comportamiento:'#9333ea',general:'#64748b'}[obs.type];
                return (
                  <div key={obs.id} className="obs-card">
                    <div className="obs-type" style={{ color:typeColor }}>
                      {{tecnica:'Técnica',comportamiento:'Comportamiento',general:'General'}[obs.type]}
                    </div>
                    <div className="obs-text">{obs.content}</div>
                    <div className="obs-meta">{timeAgo(obs.createdAt)}</div>
                  </div>
                );
              })}

              {/* Evaluaciones del entrenador */}
              <EvaluationHistory athleteId={athlete.id} sport={sport}/>
            </>
          )}

          {/* ── MENSAJES ── */}
          {view === 'mensajes' && (
            <Messaging myId="u2" myRole="family"/>
          )}

          {/* ── ALERTAS ── */}
          {view === 'alertas' && (
            <>
              {NOTIFICATIONS.map(n=>{
                const colors={post:'#2563eb',approved:'#16a34a',absence:'#dc2626'};
                const icons={post:<Icon.Edit/>,approved:<Icon.Check/>,absence:<Icon.Warning/>};
                return (
                  <div key={n.id} style={{ display:'flex',gap:10,padding:'12px 14px',
                    background:'var(--surface)',borderRadius:'var(--r-md)',marginBottom:8,
                    border:`1px solid ${n.read?'var(--border)':colors[n.type]+'40'}`,opacity:n.read?.7:1 }}>
                    <div style={{ width:36,height:36,borderRadius:'50%',flexShrink:0,
                      background:`${colors[n.type]}15`,display:'flex',alignItems:'center',
                      justifyContent:'center',color:colors[n.type] }}>
                      <svg width="16" height="16">{icons[n.type]}</svg>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13,fontWeight:n.read?500:700,color:'var(--text)' }}>{n.title}</div>
                      <div style={{ fontSize:12,color:'var(--muted)' }}>{n.text}</div>
                      <div style={{ fontSize:11,color:'var(--light)',marginTop:2 }}>{timeAgo(n.createdAt)}</div>
                    </div>
                    {!n.read&&<div style={{ width:8,height:8,borderRadius:'50%',background:colors[n.type],flexShrink:0,marginTop:4 }}/>}
                  </div>
                );
              })}
            </>
          )}

          {/* ── PERFIL ── */}
          {view === 'perfil' && (
            <>
              <div className="profile-header" style={{ margin:'-24px -24px 20px',borderRadius:0 }}>
                <div className="avatar avatar-xl" style={{ background:'rgba(255,255,255,.2)',color:'white',fontSize:20 }}>{user?.avatar||'AG'}</div>
                <div className="profile-name">{user?.name}</div>
                <div className="profile-role">Familia · Escolapias Calasanz</div>
              </div>
              <div className="section-label">Mis atletas</div>
              {MY_ATHLETES.map(a=>{
                const s=getSport(GROUPS[a.groupId]?.sportId);
                const g=GROUPS[a.groupId];
                return (
                  <div key={a.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',
                    background:'var(--surface)',borderRadius:'var(--r-md)',marginBottom:8,
                    border:`1.5px solid ${s?.color}30`,cursor:'pointer' }}
                    onClick={()=>{setActiveAthleteId(a.id);setView('feed');}}>
                    <div className="avatar avatar-md" style={{ background:`${s?.color}20`,color:s?.color }}>{a.avatar}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14,fontWeight:800,color:'var(--text)' }}>{a.name}</div>
                      <div style={{ fontSize:12,color:'var(--muted)' }}>{s?.name} · {g?.name}</div>
                    </div>
                    <svg width="16" height="16" style={{ color:'var(--light)' }}><Icon.ChevronRight/></svg>
                  </div>
                );
              })}
              <div className="join-card" onClick={()=>setShowJoinModal(true)} style={{ marginBottom:16 }}>
                <svg width="24" height="24" style={{ color:'var(--blue)',margin:'0 auto 8px',display:'block' }}><Icon.Plus/></svg>
                <div style={{ fontSize:14,fontWeight:700,color:'var(--blue)' }}>Solicitar nuevo grupo</div>
                <div style={{ fontSize:12,color:'var(--muted)',marginTop:3 }}>Añade un hijo/a a una extraescolar</div>
              </div>
              <div className="section-label">Cuenta</div>
              <div className="card">
                <div style={{ fontSize:13,color:'var(--muted)',marginBottom:8 }}>
                  <strong style={{ color:'var(--text)' }}>Email:</strong> {user?.email}
                </div>
                <button style={{ fontSize:13,color:'var(--blue)',fontWeight:600,background:'none',border:'none',cursor:'pointer',padding:0 }}>
                  Exportar mis datos (RGPD)
                </button>
              </div>
              <button className="btn btn-ghost btn-full" style={{ marginBottom:8 }}>
                <svg width="15" height="15"><Icon.Calendar/></svg>
                Suscribirse al calendario (iCal)
              </button>
              <button className="logout-btn" onClick={logout}>
                <svg width="16" height="16"><Icon.Logout/></svg>
                Cerrar sesión
              </button>
            </>
          )}
        </div>

        <nav className="bottom-nav mobile-only">
          {VIEWS.map(v=>(
            <button key={v.id} className={`nav-item ${view===v.id?'active':''}`} onClick={()=>setView(v.id)}>
              {v.id==='alertas'&&unreadNotifs>0&&<span className="nav-badge"/>}
              <svg>{v.icon}</svg>
              <span style={{ fontSize:9 }}>{v.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {showJoinModal && <JoinGroupModal onClose={()=>setShowJoinModal(false)}/>}
    </div>
  );
}

// ── Join Group Modal ──────────────────────────────────────────

function JoinGroupModal({ onClose }) {
  const [step, setStep]=[useState(0),[]][0]; const [_,setStep2]=useState(0);
  const [sportId, setSportId]=useState('');
  const [groupId, setGroupId]=useState('');
  const [athleteName, setAthleteName]=useState('');
  const [course, setCourse]=useState('');
  const [sent, setSent]=useState(false);
  const [currentStep, setCurrentStep]=useState(0);

  const filteredGroups = Object.values(GROUPS).filter(g=>g.sportId===sportId);

  if (sent) return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:200,display:'flex',alignItems:'flex-end' }}
      onClick={onClose}>
      <div style={{ background:'var(--surface)',borderRadius:'16px 16px 0 0',padding:'24px',width:'100%' }} onClick={e=>e.stopPropagation()}>
        <div style={{ textAlign:'center',padding:'8px 0' }}>
          <div style={{ fontSize:40,marginBottom:12 }}>✅</div>
          <div style={{ fontSize:18,fontWeight:800,color:'var(--text)',marginBottom:6 }}>Solicitud enviada</div>
          <div style={{ fontSize:13,color:'var(--muted)',lineHeight:1.6 }}>
            El entrenador recibirá tu solicitud y te notificaremos cuando sea aprobada.
          </div>
          <button className="btn btn-primary btn-full" style={{ marginTop:20 }} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:200,display:'flex',alignItems:'flex-end' }}
      onClick={onClose}>
      <div style={{ background:'var(--surface)',borderRadius:'16px 16px 0 0',padding:'20px',
        width:'100%',maxHeight:'80vh',overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-title">Solicitar grupo</div>
        {currentStep===0 && (
          <>
            <div className="form-group">
              <label className="form-label">Nombre del atleta</label>
              <input className="form-input" placeholder="Nombre completo" value={athleteName} onChange={e=>setAthleteName(e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Curso</label>
              <select className="form-input form-select" value={course} onChange={e=>setCourse(e.target.value)}>
                <option value="">Seleccionar curso</option>
                {['1º Primaria','2º Primaria','3º Primaria','4º Primaria','5º Primaria','6º Primaria'].map(c=>(
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary btn-full" style={{ height:46 }}
              onClick={()=>setCurrentStep(1)} disabled={!athleteName.trim()||!course}>Continuar</button>
          </>
        )}
        {currentStep===1 && (
          <>
            <div className="form-group">
              <label className="form-label">Deporte</label>
              <div className="grid-2">
                {SPORTS.map(s=>(
                  <div key={s.id} onClick={()=>{setSportId(s.id);setGroupId('');}}
                    style={{ padding:'10px',borderRadius:'var(--r-md)',cursor:'pointer',
                      border:`1.5px solid ${sportId===s.id?s.color:'var(--border)'}`,
                      background:sportId===s.id?s.bg:'var(--surface)',
                      display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ width:8,height:8,borderRadius:'50%',background:s.color }}/>
                    <span style={{ fontSize:13,fontWeight:700,color:sportId===s.id?s.color:'var(--text)' }}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
            {sportId && (
              <div className="form-group">
                <label className="form-label">Grupo</label>
                <select className="form-input form-select" value={groupId} onChange={e=>setGroupId(e.target.value)}>
                  <option value="">Seleccionar grupo</option>
                  {filteredGroups.map(g=>(
                    <option key={g.id} value={g.id}>{g.name} ({g.count} atletas)</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display:'flex',gap:8,marginTop:8 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>setCurrentStep(0)}>Atrás</button>
              <button className="btn btn-primary" style={{ flex:2 }}
                onClick={()=>setSent(true)} disabled={!sportId||!groupId}>Enviar solicitud</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Evaluation History for Family ────────────────────────────

function EvaluationHistory({ athleteId, sport }) {
  const [expanded, setExpanded] = useState(null);
  const history = getHistory(athleteId);

  if (history.length === 0) return null;

  return (
    <>
      <div className="section-label" style={{ marginTop:20 }}>
        Evaluaciones del entrenador
        <span style={{ marginLeft:8, fontSize:10, background:'var(--presente-bg)',
          color:'var(--presente)', fontWeight:700, padding:'2px 6px', borderRadius:99 }}>
          {history.length} guardada{history.length!==1?'s':''}
        </span>
      </div>

      {history.map((eval_, i) => {
        const avg = calcAvg(eval_.scores, eval_.template);
        const isExp = expanded === eval_.id;
        return (
          <div key={eval_.id} style={{ background:'var(--surface)', borderRadius:'var(--r-md)',
            border:`1px solid ${isExp ? sport?.color+'60' : 'var(--border)'}`, marginBottom:8, overflow:'hidden' }}>

            {/* Header */}
            <div onClick={() => setExpanded(isExp ? null : eval_.id)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', cursor:'pointer' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{eval_.label}</div>
                <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>
                  {new Date(eval_.date).toLocaleDateString('es-ES', {
                    weekday:'long', day:'numeric', month:'long', year:'numeric'
                  })} · {eval_.coachName}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:18, fontWeight:900, color:scoreColor(avg) }}>{avg}/10</div>
                <div style={{ fontSize:10, color:'var(--muted)' }}>media</div>
              </div>
              <svg width="14" height="14" style={{ color:'var(--muted)',
                transform:isExp?'rotate(180deg)':'none', transition:'transform .2s' }}>
                {/* ChevronDown inline */}
                <polyline points="2 4 7 9 12 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Detail */}
            {isExp && (
              <div style={{ borderTop:'1px solid var(--border)', padding:'12px 14px' }}>
                {eval_.template.map(cat => {
                  const catAvg_ = calcCatAvg(eval_.scores, cat);
                  return (
                    <div key={cat.id} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:cat.color, flexShrink:0 }}/>
                        <span style={{ fontSize:13, fontWeight:700, color:cat.color, flex:1 }}>{cat.name}</span>
                        {catAvg_ !== null && (
                          <span style={{ fontSize:13, fontWeight:800, color:scoreColor(catAvg_) }}>
                            {catAvg_}/10
                          </span>
                        )}
                      </div>
                      {cat.criteria.map(cr => {
                        const val = eval_.scores[cr.id] ?? null;
                        if (val === null) return null;
                        return (
                          <div key={cr.id} style={{ display:'flex', alignItems:'center', gap:8,
                            padding:'5px 0', marginLeft:16 }}>
                            <span style={{ flex:1, fontSize:12, color:'var(--muted)' }}>{cr.name}</span>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <div style={{ width:50, height:4, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                                <div style={{ height:'100%', width:`${(val/10)*100}%`,
                                  background:scoreColor(val), borderRadius:99 }}/>
                              </div>
                              <span style={{ fontSize:13, fontWeight:800, color:scoreColor(val), minWidth:20 }}>{val}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Progress vs previous */}
                {i < history.length - 1 && (() => {
                  const prevAvg = calcAvg(history[i+1].scores, history[i+1].template);
                  const diff = Math.round((avg - prevAvg) * 10) / 10;
                  return (
                    <div style={{ marginTop:10, padding:'8px 12px', background:'var(--bg)',
                      borderRadius:'var(--r-sm)', fontSize:12, color:'var(--muted)',
                      display:'flex', alignItems:'center', gap:6 }}>
                      <span>Respecto a la evaluación anterior:</span>
                      <span style={{ fontWeight:800, color: diff>0?'var(--presente)':diff<0?'var(--ausente)':'var(--muted)' }}>
                        {diff>0?'+':''}{diff} puntos
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
