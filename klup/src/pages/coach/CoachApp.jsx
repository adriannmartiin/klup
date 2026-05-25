// ============================================================
// KLUP — Coach Panel v3 (full feature set)
// ============================================================
import { useState, useRef } from 'react';
import { useAuth, useTheme, useOnlineStatus } from '../../contexts/AuthContext';
import { Icon, Avatar, OfflineBanner, AttBtn, Toggle, EmptyState } from '../../components/ui/index';
import { SPORTS, GROUPS, ATHLETES, OBSERVATIONS, PENDING_REQUESTS, POSTS,
         HEALTH_RECORDS, SKILL_ASSESSMENTS, ATTENDANCE_TODAY,
         getSport, timeAgo, countAttendance } from '../../lib/mockData';
import Messaging from '../../components/Messaging';

Icon.Megaphone  = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>);
Icon.Clipboard  = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>);
Icon.Warning    = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
Icon.Photos     = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>);
Icon.Trophy     = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>);

const MY_GROUP_IDS = ['g1', 'g4'];

const GROUP_TABS = [
  { id:'agenda',      label:'Agenda',    icon:<Icon.Calendar/> },
  { id:'atletas',     label:'Atletas',   icon:<Icon.Users/> },
  { id:'solicitudes', label:'Solic.',    icon:<Icon.Bell/> },
  { id:'publicar',    label:'Publicar',  icon:<Icon.Edit/> },
  { id:'lista',       label:'Lista',     icon:<Icon.Check/> },
  { id:'sesiones',    label:'Sesiones',  icon:<Icon.Clipboard/> },
  { id:'mensajes',    label:'Mensajes',  icon:<Icon.Megaphone/> },
  { id:'incidencias', label:'Incid.',    icon:<Icon.Warning/> },
  { id:'galeria',     label:'Galería',   icon:<Icon.Photos/> },
];

// Months helper
const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

// Mock sessions
const MOCK_SESSIONS = [
  { id:'ses1', groupId:'g1', date:'2025-05-27', title:'Control y pase corto', duration:60,
    objectives:'Mejorar primer toque y precisión de pase', exercises:['Rondos 4v1','Pases a 2 toques','Juego posicional'] },
  { id:'ses2', groupId:'g1', date:'2025-05-22', title:'Trabajo físico y velocidad', duration:60,
    objectives:'Capacidad aeróbica y velocidad de reacción', exercises:['Calentamiento dinámico','Sprints 10m','Juego de intensidad'] },
];

// Mock gallery
const MOCK_GALLERY = [
  { id:'g1', color:'#bbf7d0', consent:true,  date:'2025-05-20', desc:'Entrenamiento martes' },
  { id:'g2', color:'#dbeafe', consent:true,  date:'2025-05-15', desc:'Partido amistoso' },
  { id:'g3', color:'#fce7f3', consent:false, date:'2025-05-10', desc:'Sesión técnica' },
  { id:'g4', color:'#fef3c7', consent:true,  date:'2025-05-07', desc:'Calentamiento' },
  { id:'g5', color:'#f3e8ff', consent:true,  date:'2025-04-29', desc:'Torneo Delicias' },
  { id:'g6', color:'#ffedd5', consent:false, date:'2025-04-22', desc:'Entrenamiento' },
];

export default function CoachApp() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const online = useOnlineStatus();

  const myGroups = MY_GROUP_IDS.map(id => GROUPS[id]).filter(Boolean);
  const [selectedGroupId, setSelectedGroupId] = useState(myGroups.length===1 ? myGroups[0].id : null);
  const [activeTab, setActiveTab]     = useState('agenda');
  const [attRecords, setAttRecords]   = useState(ATTENDANCE_TODAY.g1?.records || {});
  const [attSaved, setAttSaved]       = useState(false);
  const [expandedAthlete, setExpandedAthlete] = useState(null);
  const [obsText, setObsText]         = useState({});
  const [obsType, setObsType]         = useState({});
  const [savedObs, setSavedObs]       = useState([...OBSERVATIONS]);
  const [pubType, setPubType]         = useState('noticia');
  const [pubTitle, setPubTitle]       = useState('');
  const [pubContent, setPubContent]   = useState('');
  const [pubDate, setPubDate]         = useState('');
  const [pubRsvp, setPubRsvp]         = useState(false);
  const [pubSent, setPubSent]         = useState(false);
  const [requests, setRequests]       = useState(PENDING_REQUESTS.filter(r=>r.type==='family'));
  const [selectedAthleteSheet, setSelectedAthleteSheet] = useState(null);
  const [sessions, setSessions]       = useState(MOCK_SESSIONS);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [newSession, setNewSession]   = useState({ title:'', date:'', duration:60, objectives:'', exercises:'' });
  const [incidents, setIncidents]     = useState([]);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [newIncident, setNewIncident] = useState({ athleteId:'', type:'lesion', severity:'leve', description:'', date:new Date().toISOString().slice(0,10) });
  const [gallery, setGallery]         = useState(MOCK_GALLERY);
  const [showSeasonReport, setShowSeasonReport] = useState(false);
  const [reportAthleteId, setReportAthleteId]   = useState('');
  const [attendanceHistory] = useState({
    a1: [{ month:'Ene',pct:95 },{ month:'Feb',pct:90 },{ month:'Mar',pct:85 },{ month:'Abr',pct:100 },{ month:'May',pct:87 }],
    a3: [{ month:'Ene',pct:70 },{ month:'Feb',pct:75 },{ month:'Mar',pct:65 },{ month:'Abr',pct:80 },{ month:'May',pct:60 }],
  });

  const selectedGroup   = selectedGroupId ? GROUPS[selectedGroupId] : null;
  const sport           = selectedGroup ? getSport(selectedGroup.sportId) : null;
  const groupAthletes   = selectedGroupId ? ATHLETES.filter(a=>a.groupId===selectedGroupId) : [];
  const counts          = countAttendance(attRecords);
  const today           = new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' });

  const saveAtt = () => { setAttSaved(true); setTimeout(()=>setAttSaved(false), 3000); };
  const markAll = (s) => {
    const u = {}; groupAthletes.forEach(a => { u[a.id]=s; });
    setAttRecords(p=>({...p,...u}));
  };
  const saveObs = (athleteId) => {
    if (!obsText[athleteId]?.trim()) return;
    setSavedObs(p=>[{ id:'o'+Date.now(), athleteId, coachId:'c1',
      type:obsType[athleteId]||'general', content:obsText[athleteId],
      isPrivate:false, createdAt:new Date() }, ...p]);
    setObsText(p=>({...p,[athleteId]:''}));
    setExpandedAthlete(null);
  };
  const publishPost = () => {
    if (!pubTitle.trim()) return;
    setPubSent(true); setPubTitle(''); setPubContent(''); setPubDate('');
    setTimeout(()=>setPubSent(false), 3500);
  };
  const addSession = () => {
    if (!newSession.title || !newSession.date) return;
    setSessions(p=>[{ id:'ses'+Date.now(), groupId:selectedGroupId, ...newSession,
      exercises: newSession.exercises.split('\n').filter(Boolean) }, ...p]);
    setNewSession({ title:'', date:'', duration:60, objectives:'', exercises:'' });
    setShowSessionForm(false);
  };
  const saveIncident = () => {
    if (!newIncident.athleteId || !newIncident.description) return;
    setIncidents(p=>[{ id:'i'+Date.now(), ...newIncident, groupId:selectedGroupId, resolved:false }, ...p]);
    setNewIncident({ athleteId:'', type:'lesion', severity:'leve', description:'', date:new Date().toISOString().slice(0,10) });
    setShowIncidentForm(false);
  };

  const groupSessions = sessions.filter(s=>s.groupId===selectedGroupId)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  return (
    <div className="app-shell">
      {!online && <OfflineBanner/>}

      {/* ── SIDEBAR ── */}
      <aside className="app-sidebar">
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo">Klup</div>
          <div className="sidebar-logo-sub">Panel Entrenador</div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Mis grupos</div>
          {myGroups.map(g => {
            const s = getSport(g.sportId);
            return (
              <button key={g.id} className={`sidebar-nav-item ${selectedGroupId===g.id?'active':''}`}
                onClick={() => { setSelectedGroupId(g.id); setActiveTab('agenda'); }}>
                <span style={{ width:8,height:8,borderRadius:'50%',background:s?.color,flexShrink:0,display:'inline-block' }}/>
                <span style={{ flex:1 }}>{s?.name} · {g.name}</span>
                <span style={{ fontSize:11, color:'var(--light)' }}>{g.count}</span>
              </button>
            );
          })}
          {selectedGroup && (
            <>
              <div className="sidebar-divider"/>
              <div className="sidebar-section-label">{sport?.name} · {selectedGroup.name}</div>
              {GROUP_TABS.map(t => (
                <button key={t.id} className={`sidebar-nav-item ${activeTab===t.id?'active':''}`}
                  onClick={() => setActiveTab(t.id)}>
                  <svg>{t.icon}</svg>
                  {t.label}
                  {t.id==='solicitudes' && requests.length>0 && <span className="s-badge">{requests.length}</span>}
                </button>
              ))}
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar avatar-md" style={{ background:'#dbeafe', color:'var(--blue)' }}>{user?.avatar||'JM'}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">Entrenador</div>
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
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div className="header-klup-tag">KLUP</div>
              <div className="header-title">{selectedGroup ? `${sport?.name} · ${selectedGroup.name}` : `Hola, ${user?.name?.split(' ')[0]}`}</div>
              <div className="header-subtitle">Escolapias Calasanz</div>
            </div>
            <button className="theme-toggle" onClick={toggle}>
              <svg width="16" height="16">{theme==='dark'?<Icon.Sun/>:<Icon.Moon/>}</svg>
            </button>
          </div>
        </header>

        {selectedGroup && (
          <div className="desktop-header">
            {myGroups.length>1 && (
              <button onClick={() => setSelectedGroupId(null)}
                style={{ color:'var(--muted)',background:'none',border:'none',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:4 }}>
                ← Grupos
              </button>
            )}
            <span style={{ width:10,height:10,borderRadius:'50%',background:sport?.color,display:'inline-block',flexShrink:0 }}/>
            <span className="desktop-header-title">{sport?.name} · {selectedGroup.name}</span>
            <span className="desktop-header-sub">{selectedGroup.count} atletas</span>
            <button className="theme-toggle" style={{ background:'var(--bg)',border:'1px solid var(--border)',color:'var(--muted)' }} onClick={toggle}>
              <svg width="16" height="16">{theme==='dark'?<Icon.Sun/>:<Icon.Moon/>}</svg>
            </button>
          </div>
        )}

        {!selectedGroupId ? (
          <div className="page-content">
            <div className="section-label">Mis grupos</div>
            {myGroups.map(g => {
              const s = getSport(g.sportId);
              const athletes = ATHLETES.filter(a=>a.groupId===g.id);
              return (
                <div key={g.id} className="group-card" onClick={() => { setSelectedGroupId(g.id); setActiveTab('agenda'); }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{ width:12,height:12,borderRadius:'50%',background:s?.color }}/>
                    <span style={{ fontSize:17, fontWeight:900, color:s?.color }}>{s?.name}</span>
                    <span style={{ fontSize:13, color:'var(--muted)' }}>· {g.name}</span>
                    <span style={{ marginLeft:'auto', fontSize:12, color:'var(--muted)', background:'var(--bg)', padding:'3px 8px', borderRadius:99, fontWeight:600 }}>
                      {g.count} atletas
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:0, marginBottom:10 }}>
                    {athletes.slice(0,6).map((a,i) => (
                      <div key={a.id} className="avatar avatar-sm"
                        style={{ background:`${s?.color}20`,color:s?.color,border:'2px solid var(--surface)',marginLeft:i>0?-8:0 }}>
                        {a.avatar}
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {GROUP_TABS.slice(0,5).map(t => (
                      <div key={t.id} style={{ padding:'5px 10px', background:'var(--bg)', borderRadius:'var(--r-sm)',
                        fontSize:11, fontWeight:600, color:'var(--muted)' }}>{t.label}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="tab-bar mobile-only">
              {GROUP_TABS.map(t => (
                <button key={t.id} className={`tab-item ${activeTab===t.id?'active':''}`} onClick={() => setActiveTab(t.id)}>
                  {t.label}
                  {t.id==='solicitudes' && requests.length>0 && (
                    <span style={{ background:'#dc2626',color:'white',borderRadius:99,padding:'1px 5px',fontSize:9,fontWeight:800,marginLeft:4 }}>{requests.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="page-content">
              {attSaved && <div className="toast-success"><svg width="15" height="15"><Icon.Check/></svg>Lista guardada</div>}
              {pubSent  && <div className="toast-success"><svg width="15" height="15"><Icon.Check/></svg>Publicación enviada</div>}

              {/* ── AGENDA ── */}
              {activeTab === 'agenda' && (() => {
                const posts = POSTS.filter(p=>p.groupId===selectedGroupId);
                const events = posts.filter(p=>p.type==='evento');
                const recent = [...posts].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
                return (
                  <>
                    {events.length > 0 && (
                      <>
                        <div className="section-label">Próximos eventos</div>
                        {events.map(e => {
                          const d = new Date(e.createdAt);
                          return (
                            <div key={e.id} className="agenda-item">
                              <div className="agenda-date-box">
                                <div className="agenda-date-day">{d.getDate()}</div>
                                <div className="agenda-date-month">{MONTHS_ES[d.getMonth()]}</div>
                              </div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{e.title}</div>
                                <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{e.content}</div>
                                {e.eventDate && <div style={{ fontSize:11, color:sport?.color, fontWeight:600, marginTop:4 }}>{e.eventDate}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                    <div className="section-label" style={{ marginTop:events.length>0?16:0 }}>Últimas publicaciones</div>
                    {recent.length === 0 ? (
                      <EmptyState icon={<Icon.Calendar/>} title="Sin publicaciones" text="Ve a Publicar para crear el primer post"/>
                    ) : recent.map(p => {
                      const bc = { noticia:'badge-noticia',foto:'badge-foto',evento:'badge-evento',resultado:'badge-resultado' }[p.type];
                      return (
                        <div key={p.id} style={{ background:'var(--surface)',borderRadius:'var(--r-md)',border:'1px solid var(--border)',padding:'12px 14px',marginBottom:8 }}>
                          <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:5 }}>
                            <span className={`badge ${bc}`}>{p.type}</span>
                            <span style={{ marginLeft:'auto', fontSize:11, color:'var(--light)' }}>{timeAgo(p.createdAt)}</span>
                          </div>
                          <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{p.title}</div>
                          <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>{p.content}</div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}

              {/* ── ATLETAS ── */}
              {activeTab === 'atletas' && (
                <>
                  <div style={{ marginBottom:12 }}>
                    <button className="btn btn-info btn-sm" onClick={() => setShowSeasonReport(true)}>
                      <svg width="13" height="13"><Icon.Trophy/></svg>
                      Informe fin de temporada
                    </button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10 }}>
                    {groupAthletes.map(a => {
                      const obsCount = savedObs.filter(o=>o.athleteId===a.id).length;
                      const history  = attendanceHistory[a.id];
                      const avgPct   = history ? Math.round(history.reduce((acc,m)=>acc+m.pct,0)/history.length) : 87;
                      return (
                        <div key={a.id} className="athlete-card" onClick={() => setSelectedAthleteSheet(selectedAthleteSheet?.id===a.id?null:a)}>
                          <div className="avatar avatar-lg" style={{ background:`${sport?.color}20`,color:sport?.color,margin:'0 auto 8px' }}>
                            {a.avatar}
                          </div>
                          <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{a.name.split(' ')[0]}</div>
                          <div style={{ fontSize:10, color:'var(--muted)', marginTop:1 }}>{a.course}</div>
                          <div style={{ fontSize:11, fontWeight:700, color:avgPct>=80?'var(--presente)':'var(--tarde)', marginTop:4 }}>
                            {avgPct}% asist.
                          </div>
                          {obsCount>0 && <div style={{ fontSize:10, color:'var(--blue)', marginTop:2 }}>{obsCount} obs.</div>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Athlete detail with attendance history */}
                  {selectedAthleteSheet && (() => {
                    const a = selectedAthleteSheet;
                    const history = attendanceHistory[a.id] || [{ month:'May',pct:87 }];
                    const maxPct = Math.max(...history.map(h=>h.pct));
                    return (
                      <div style={{ marginTop:14, background:'var(--surface)', borderRadius:'var(--r-lg)',
                        border:`1.5px solid ${sport?.color}40`, padding:'16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                          <div className="avatar avatar-lg" style={{ background:`${sport?.color}20`, color:sport?.color }}>{a.avatar}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:17, fontWeight:800, color:'var(--text)' }}>{a.name}</div>
                            <div style={{ fontSize:12, color:'var(--muted)' }}>{a.course}</div>
                          </div>
                          <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--light)',padding:4 }}
                            onClick={() => setSelectedAthleteSheet(null)}>
                            <svg width="16" height="16"><Icon.X/></svg>
                          </button>
                        </div>
                        {/* Attendance history chart */}
                        <div className="section-label">Historial de asistencia</div>
                        <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:60, marginBottom:12 }}>
                          {history.map((h,i) => (
                            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                              <div style={{ fontSize:9, color:'var(--muted)', marginBottom:2 }}>{h.pct}%</div>
                              <div style={{ width:'100%', borderRadius:'3px 3px 0 0', minHeight:4,
                                background: h.pct>=80 ? sport?.color : 'var(--tarde)',
                                height:`${(h.pct/100)*48}px` }}/>
                              <div style={{ fontSize:9, color:'var(--light)', marginTop:3 }}>{h.month}</div>
                            </div>
                          ))}
                        </div>
                        {/* Observations */}
                        {savedObs.filter(o=>o.athleteId===a.id&&!o.isPrivate).length>0 && (
                          <>
                            <div className="section-label">Observaciones</div>
                            {savedObs.filter(o=>o.athleteId===a.id&&!o.isPrivate).slice(0,3).map(o => (
                              <div key={o.id} style={{ fontSize:12, color:'var(--muted)', padding:'5px 0',
                                borderBottom:'1px solid var(--bg)', lineHeight:1.4 }}>
                                {o.content}
                                <span style={{ color:'var(--light)', marginLeft:6 }}>· {timeAgo(o.createdAt)}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}

              {/* ── SOLICITUDES ── */}
              {activeTab === 'solicitudes' && (
                requests.length===0 ? (
                  <EmptyState icon={<Icon.Check/>} title="Sin solicitudes" text="No hay familias pendientes"/>
                ) : requests.map(r => (
                  <div key={r.id} className="approval-card">
                    <div className="approval-header">
                      <div className="avatar avatar-md" style={{ background:'#dbeafe', color:'#2563eb' }}>{r.avatar}</div>
                      <div className="approval-info">
                        <div className="approval-name">{r.name}</div>
                        <div className="approval-email">{r.email}</div>
                      </div>
                    </div>
                    <div className="approval-details"><strong>Atleta:</strong> {r.athleteName} · {r.athleteCourse}</div>
                    <div className="approval-actions">
                      <button className="btn btn-success btn-sm" style={{ flex:1 }} onClick={() => setRequests(p=>p.filter(x=>x.id!==r.id))}>Aprobar</button>
                      <button className="btn btn-danger btn-sm"  style={{ flex:1 }} onClick={() => setRequests(p=>p.filter(x=>x.id!==r.id))}>Rechazar</button>
                    </div>
                  </div>
                ))
              )}

              {/* ── PUBLICAR ── */}
              {activeTab === 'publicar' && (
                <>
                  <div className="publish-type-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
                    {[{ id:'noticia',color:'#1e40af',bg:'#dbeafe' },{ id:'foto',color:'#166534',bg:'#dcfce7' },
                      { id:'evento',color:'#92400e',bg:'#fef3c7' },{ id:'resultado',color:'#7e22ce',bg:'#f3e8ff' }].map(t => (
                      <button key={t.id} className={`publish-type-card ${pubType===t.id?'selected':''}`}
                        style={pubType===t.id?{ borderColor:t.color,color:t.color,background:t.bg }:{}}
                        onClick={() => setPubType(t.id)}>
                        {t.id.charAt(0).toUpperCase()+t.id.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Título *</label>
                    <input className="form-input" value={pubTitle} onChange={e=>setPubTitle(e.target.value)} placeholder="Título de la publicación"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mensaje</label>
                    <textarea className="form-input form-textarea" rows={4} value={pubContent}
                      onChange={e=>setPubContent(e.target.value)} placeholder="Contenido…"/>
                  </div>
                  {pubType==='evento' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Fecha del evento</label>
                        <input className="form-input" type="datetime-local" value={pubDate} onChange={e=>setPubDate(e.target.value)}/>
                      </div>
                      <div className="toggle-wrapper">
                        <span className="toggle-label">Solicitar confirmación de asistencia (RSVP)</span>
                        <div className={`toggle ${pubRsvp?'on':''}`} onClick={() => setPubRsvp(p=>!p)}>
                          <div className="toggle-knob"/>
                        </div>
                      </div>
                      {pubRsvp && (
                        <div className="info-banner" style={{ marginTop:8 }}>
                          Las familias verán un botón "Confirmar asistencia" en el post.
                        </div>
                      )}
                    </>
                  )}
                  {pubType==='foto' && (
                    <div style={{ border:'2px dashed var(--border)',borderRadius:'var(--r-lg)',padding:'24px',
                      textAlign:'center',marginBottom:14,cursor:'pointer',color:'var(--muted)' }}>
                      <svg width="28" height="28" style={{ margin:'0 auto 8px',display:'block',color:'var(--light)' }}><Icon.Photos/></svg>
                      <div style={{ fontSize:13,fontWeight:600 }}>Toca para subir foto o archivo</div>
                      <div style={{ fontSize:11,color:'var(--light)',marginTop:2 }}>JPG, PNG, PDF, MP4</div>
                    </div>
                  )}
                  <button className="btn btn-primary btn-full" style={{ height:48,fontSize:15 }}
                    onClick={publishPost} disabled={!pubTitle.trim()}>
                    <svg width="15" height="15"><Icon.Megaphone/></svg>
                    Publicar en el grupo
                  </button>
                </>
              )}

              {/* ── LISTA ── */}
              {activeTab === 'lista' && (
                <>
                  <div style={{ fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:12 }}>
                    {today.charAt(0).toUpperCase()+today.slice(1)}
                  </div>
                  <div className="att-summary" style={{ marginBottom:12 }}>
                    {[['P',counts.P,'var(--presente-bg)','var(--presente)'],
                      ['A',counts.A,'var(--ausente-bg)','var(--ausente)'],
                      ['T',counts.T,'var(--tarde-bg)','var(--tarde)'],
                      ['J',counts.J,'var(--justificado-bg)','var(--justificado)']].map(([l,n,bg,c])=>(
                      <div key={l} className="att-pill" style={{ background:bg,color:c }}>{l}  {n}</div>
                    ))}
                  </div>
                  <div style={{ display:'flex',gap:8,marginBottom:12 }}>
                    <button className="btn btn-success btn-sm" style={{ flex:1 }} onClick={()=>markAll('P')}>Todos presentes</button>
                    <button className="btn btn-danger btn-sm"  style={{ flex:1 }} onClick={()=>markAll('A')}>Todos ausentes</button>
                  </div>
                  <div style={{ fontSize:11,color:'var(--light)',textAlign:'center',marginBottom:10,fontWeight:600 }}>
                    Toca el estado para cambiar · ✏ para observación
                  </div>
                  <div style={{ background:'var(--surface)',borderRadius:'var(--r-lg)',border:'1px solid var(--border)',overflow:'hidden',marginBottom:14 }}>
                    {groupAthletes.map((a,i) => {
                      const isExpanded = expandedAthlete===a.id;
                      const hasObs = savedObs.filter(o=>o.athleteId===a.id).length>0;
                      return (
                        <div key={a.id} style={{ borderBottom:i<groupAthletes.length-1?'1px solid var(--bg)':undefined }}>
                          <div className="athlete-row" style={{ background:isExpanded?'var(--bg)':undefined }}>
                            <div className="avatar avatar-sm" style={{ background:`${sport?.color}20`,color:sport?.color }}>{a.avatar}</div>
                            <div className="athlete-info">
                              <div className="athlete-name">
                                {a.name}
                                {hasObs && <span style={{ fontSize:9,color:'var(--blue)',marginLeft:5,fontWeight:800,background:'#dbeafe',padding:'1px 4px',borderRadius:4 }}>obs</span>}
                              </div>
                              <div className="athlete-course">{a.course}</div>
                            </div>
                            <button onClick={()=>setExpandedAthlete(isExpanded?null:a.id)}
                              style={{ background:isExpanded?'#dbeafe':'var(--bg)',border:'none',borderRadius:'var(--r-sm)',
                                padding:'6px 8px',color:isExpanded?'var(--blue)':'var(--light)',cursor:'pointer',flexShrink:0 }}>
                              <svg width="15" height="15"><Icon.Edit/></svg>
                            </button>
                            <AttBtn state={attRecords[a.id]||'P'} onChange={s=>setAttRecords(p=>({...p,[a.id]:s}))}/>
                          </div>
                          {isExpanded && (
                            <div className="obs-expand">
                              <div style={{ fontSize:12,fontWeight:600,color:'var(--text)',marginBottom:8 }}>
                                Observación para {a.name.split(' ')[0]}
                              </div>
                              <div style={{ display:'flex',gap:6,marginBottom:8 }}>
                                {[['general','General','#64748b'],['tecnica','Técnica','#2563eb'],['comportamiento','Comportam.','#9333ea']].map(([id,label,color])=>(
                                  <button key={id} onClick={()=>setObsType(p=>({...p,[a.id]:id}))}
                                    style={{ flex:1,padding:'6px 4px',borderRadius:'var(--r-sm)',fontSize:11,fontWeight:700,
                                      border:`1.5px solid ${(obsType[a.id]||'general')===id?color:'var(--border)'}`,
                                      background:(obsType[a.id]||'general')===id?color+'15':'var(--surface)',
                                      color:(obsType[a.id]||'general')===id?color:'var(--muted)',cursor:'pointer' }}>
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <textarea className="form-input form-textarea" rows={2}
                                placeholder="Añadir observación…"
                                value={obsText[a.id]||''} onChange={e=>setObsText(p=>({...p,[a.id]:e.target.value}))}/>
                              <div style={{ display:'flex',gap:8,marginTop:8 }}>
                                <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={()=>setExpandedAthlete(null)}>Cancelar</button>
                                <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={()=>saveObs(a.id)} disabled={!obsText[a.id]?.trim()}>Guardar</button>
                              </div>
                              {savedObs.filter(o=>o.athleteId===a.id).length>0 && (
                                <div style={{ marginTop:10,borderTop:'1px solid var(--border)',paddingTop:10 }}>
                                  <div style={{ fontSize:11,fontWeight:700,color:'var(--muted)',marginBottom:6 }}>Anteriores</div>
                                  {savedObs.filter(o=>o.athleteId===a.id&&!o.isPrivate).map(o=>(
                                    <div key={o.id} style={{ fontSize:12,color:'var(--muted)',marginBottom:4,paddingLeft:8,borderLeft:'2px solid var(--border)' }}>
                                      {o.content}<span style={{ color:'var(--light)',marginLeft:6 }}>· {timeAgo(o.createdAt)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button className="btn btn-primary btn-full" style={{ height:48,fontSize:15 }} onClick={saveAtt}>
                    <svg width="15" height="15"><Icon.Check/></svg>
                    Guardar lista{!online?' (offline)':''}
                  </button>
                </>
              )}

              {/* ── SESIONES ── */}
              {activeTab === 'sesiones' && (
                <>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
                    <div className="section-label" style={{ marginBottom:0 }}>Planificador de sesiones</div>
                    <button className="btn btn-primary btn-sm" onClick={()=>setShowSessionForm(s=>!s)}>
                      <svg width="13" height="13"><Icon.Plus/></svg> Nueva
                    </button>
                  </div>
                  {showSessionForm && (
                    <div className="card" style={{ marginBottom:14 }}>
                      <div className="form-group">
                        <label className="form-label">Título de la sesión</label>
                        <input className="form-input" placeholder="Ej: Técnica de control"
                          value={newSession.title} onChange={e=>setNewSession(p=>({...p,title:e.target.value}))}/>
                      </div>
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">Fecha</label>
                          <input className="form-input" type="date" value={newSession.date}
                            onChange={e=>setNewSession(p=>({...p,date:e.target.value}))}/>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Duración (min)</label>
                          <input className="form-input" type="number" value={newSession.duration}
                            onChange={e=>setNewSession(p=>({...p,duration:Number(e.target.value)}))}/>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Objetivos</label>
                        <input className="form-input" placeholder="Qué se trabaja en esta sesión"
                          value={newSession.objectives} onChange={e=>setNewSession(p=>({...p,objectives:e.target.value}))}/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Ejercicios (uno por línea)</label>
                        <textarea className="form-input form-textarea" rows={3}
                          placeholder={"Rondos 4v1\nPases a 2 toques\nJuego posicional"}
                          value={newSession.exercises} onChange={e=>setNewSession(p=>({...p,exercises:e.target.value}))}/>
                      </div>
                      <div style={{ display:'flex',gap:8 }}>
                        <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={()=>setShowSessionForm(false)}>Cancelar</button>
                        <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={addSession}
                          disabled={!newSession.title||!newSession.date}>Guardar sesión</button>
                      </div>
                    </div>
                  )}
                  {groupSessions.length===0 ? (
                    <EmptyState icon={<Icon.Clipboard/>} title="Sin sesiones planificadas"
                      text="Crea la primera sesión de entrenamiento"/>
                  ) : groupSessions.map(ses => (
                    <div key={ses.id} style={{ background:'var(--surface)',borderRadius:'var(--r-md)',
                      border:'1px solid var(--border)',padding:'12px 14px',marginBottom:8 }}>
                      <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
                        <div style={{ background:'var(--bg)',borderRadius:'var(--r-sm)',padding:'6px 8px',
                          textAlign:'center',flexShrink:0,minWidth:44 }}>
                          <div style={{ fontSize:16,fontWeight:900,color:'var(--text)',lineHeight:1 }}>
                            {new Date(ses.date).getDate()}
                          </div>
                          <div style={{ fontSize:9,fontWeight:700,color:'var(--muted)',textTransform:'uppercase' }}>
                            {MONTHS_ES[new Date(ses.date).getMonth()]}
                          </div>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14,fontWeight:700,color:'var(--text)' }}>{ses.title}</div>
                          <div style={{ fontSize:11,color:'var(--muted)',marginTop:1 }}>{ses.duration} min · {ses.objectives}</div>
                          {(ses.exercises||[]).length>0 && (
                            <div style={{ marginTop:6,display:'flex',gap:5,flexWrap:'wrap' }}>
                              {ses.exercises.map((ex,i)=>(
                                <span key={i} style={{ fontSize:11,background:'var(--bg)',color:'var(--muted)',
                                  padding:'2px 8px',borderRadius:99,fontWeight:500 }}>{ex}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* ── MENSAJES ── */}
              {activeTab === 'mensajes' && (
                <Messaging myId="c1" myRole="coach" filterGroupId={selectedGroupId}/>
              )}

              {/* ── INCIDENCIAS ── */}
              {activeTab === 'incidencias' && (
                <>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
                    <div className="section-label" style={{ marginBottom:0 }}>Registro de incidencias</div>
                    <button className="btn btn-primary btn-sm" onClick={()=>setShowIncidentForm(s=>!s)}>
                      <svg width="13" height="13"><Icon.Plus/></svg> Registrar
                    </button>
                  </div>
                  {showIncidentForm && (
                    <div className="card" style={{ marginBottom:14 }}>
                      <div className="form-group">
                        <label className="form-label">Atleta</label>
                        <select className="form-input form-select" value={newIncident.athleteId}
                          onChange={e=>setNewIncident(p=>({...p,athleteId:e.target.value}))}>
                          <option value="">Seleccionar atleta</option>
                          {groupAthletes.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">Tipo</label>
                          <select className="form-input form-select" value={newIncident.type}
                            onChange={e=>setNewIncident(p=>({...p,type:e.target.value}))}>
                            <option value="lesion">Lesión</option>
                            <option value="comportamiento">Comportamiento</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Gravedad</label>
                          <select className="form-input form-select" value={newIncident.severity}
                            onChange={e=>setNewIncident(p=>({...p,severity:e.target.value}))}>
                            <option value="leve">Leve</option>
                            <option value="medio">Medio</option>
                            <option value="grave">Grave</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Descripción</label>
                        <textarea className="form-input form-textarea" rows={3}
                          value={newIncident.description} onChange={e=>setNewIncident(p=>({...p,description:e.target.value}))}
                          placeholder="Qué ocurrió y cómo se actuó…"/>
                      </div>
                      <div style={{ display:'flex',gap:8 }}>
                        <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={()=>setShowIncidentForm(false)}>Cancelar</button>
                        <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={saveIncident}
                          disabled={!newIncident.athleteId||!newIncident.description}>Guardar</button>
                      </div>
                    </div>
                  )}
                  {incidents.length===0 ? (
                    <EmptyState icon={<Icon.Warning/>} title="Sin incidencias" text="Sin incidencias registradas en este grupo"/>
                  ) : incidents.map(inc => {
                    const athlete = ATHLETES.find(a=>a.id===inc.athleteId);
                    const sev = { leve:'#16a34a',medio:'#d97706',grave:'#dc2626' }[inc.severity];
                    return (
                      <div key={inc.id} style={{ background:'var(--surface)',borderRadius:'var(--r-md)',
                        border:`1px solid ${sev}30`,padding:'12px 14px',marginBottom:8 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
                          <div className="avatar avatar-sm" style={{ background:`${sport?.color}20`,color:sport?.color }}>{athlete?.avatar}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13,fontWeight:700,color:'var(--text)' }}>{athlete?.name}</div>
                            <div style={{ fontSize:11,color:'var(--muted)' }}>{inc.date}</div>
                          </div>
                          <span style={{ fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:99,background:sev+'15',color:sev }}>
                            {{ leve:'Leve',medio:'Medio',grave:'Grave' }[inc.severity]}
                          </span>
                        </div>
                        <div style={{ fontSize:13,color:'var(--text)',lineHeight:1.5 }}>{inc.description}</div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* ── GALERÍA ── */}
              {activeTab === 'galeria' && (
                <>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
                    <div style={{ fontSize:12,color:'var(--muted)' }}>
                      {gallery.filter(g=>!g.consent).length > 0 && (
                        <span style={{ color:'var(--tarde)',fontWeight:600 }}>
                          {gallery.filter(g=>!g.consent).length} fotos sin consentimiento de imagen
                        </span>
                      )}
                    </div>
                    <button className="btn btn-primary btn-sm">
                      <svg width="13" height="13"><Icon.Plus/></svg> Subir foto
                    </button>
                  </div>
                  <div className="gallery-grid" style={{ gap:6 }}>
                    {gallery.map(photo => (
                      <div key={photo.id} style={{ position:'relative', aspectRatio:'1', borderRadius:'var(--r-md)',
                        overflow:'hidden', background:`linear-gradient(135deg,${photo.color},${photo.color}88)`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        border: !photo.consent ? '2px solid var(--tarde)' : '1px solid var(--border)' }}>
                        <svg width="22" height="22" style={{ color:'rgba(0,0,0,.2)' }}><Icon.Photos/></svg>
                        {!photo.consent && (
                          <div style={{ position:'absolute', top:4, right:4, background:'var(--tarde)',
                            borderRadius:99, width:14, height:14, display:'flex', alignItems:'center',
                            justifyContent:'center' }}>
                            <svg width="8" height="8" style={{ color:'white' }}><Icon.X/></svg>
                          </div>
                        )}
                        <button onClick={() => setGallery(g=>g.filter(x=>x.id!==photo.id))}
                          style={{ position:'absolute', bottom:4, right:4, background:'rgba(0,0,0,.5)',
                            border:'none', borderRadius:99, width:22, height:22, display:'flex',
                            alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white' }}>
                          <svg width="10" height="10"><Icon.X/></svg>
                        </button>
                        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'4px 6px',
                          background:'rgba(0,0,0,.5)', fontSize:9, color:'white', fontWeight:500 }}>
                          {photo.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!photo?.consent && gallery.filter(g=>!g.consent).length>0 && (
                    <div className="warning-banner" style={{ marginTop:12 }}>
                      <svg width="14" height="14"><Icon.Warning/></svg>
                      Las fotos con borde naranja no tienen consentimiento de imagen para ser publicadas.
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        <nav className="bottom-nav mobile-only">
          {(selectedGroupId ? GROUP_TABS.slice(0,5) : [{ id:'grupos',label:'Grupos',icon:<Icon.Users/> }]).map(t => (
            <button key={t.id} className={`nav-item ${(activeTab||'grupos')===t.id?'active':''}`}
              onClick={() => t.id==='grupos' ? setSelectedGroupId(null) : setActiveTab(t.id)}>
              <svg>{t.icon}</svg>
              <span style={{ fontSize:9 }}>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Season report modal */}
      {showSeasonReport && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:200,display:'flex',alignItems:'flex-end' }}
          onClick={() => setShowSeasonReport(false)}>
          <div style={{ background:'var(--surface)',borderRadius:'16px 16px 0 0',padding:'20px',width:'100%',maxHeight:'80vh',overflowY:'auto' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:16 }}>Informe fin de temporada</div>
            <div className="form-group">
              <label className="form-label">Seleccionar atleta</label>
              <select className="form-input form-select" value={reportAthleteId} onChange={e=>setReportAthleteId(e.target.value)}>
                <option value="">Elegir atleta…</option>
                {groupAthletes.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            {reportAthleteId && (() => {
              const a = groupAthletes.find(x=>x.id===reportAthleteId);
              const history = attendanceHistory[reportAthleteId]||[{month:'May',pct:87}];
              const avg = Math.round(history.reduce((acc,m)=>acc+m.pct,0)/history.length);
              const obs = savedObs.filter(o=>o.athleteId===reportAthleteId&&!o.isPrivate);
              const skills = SKILL_ASSESSMENTS[reportAthleteId];
              return (
                <div style={{ background:'var(--bg)',borderRadius:'var(--r-md)',padding:'14px',marginBottom:16 }}>
                  <div style={{ fontSize:14,fontWeight:800,color:'var(--text)',marginBottom:8 }}>
                    {a?.name} · {sport?.name} · {selectedGroup?.name}
                  </div>
                  <div style={{ fontSize:13,color:'var(--muted)',lineHeight:1.8 }}>
                    <strong style={{ color:'var(--text)' }}>Asistencia media:</strong> {avg}%<br/>
                    <strong style={{ color:'var(--text)' }}>Observaciones:</strong> {obs.length}<br/>
                    {skills && Object.entries(skills).map(([k,v])=>(
                      <span key={k}><strong style={{ color:'var(--text)' }}>{k}:</strong> {v}/100  </span>
                    ))}
                  </div>
                  <div style={{ marginTop:8, fontSize:12, color:'var(--muted)' }}>
                    <strong style={{ color:'var(--text)' }}>Valoración general:</strong><br/>
                    <textarea className="form-input form-textarea" style={{ marginTop:6 }} rows={3}
                      placeholder="Escribe la valoración del entrenador para este atleta…"/>
                  </div>
                </div>
              );
            })()}
            <div style={{ display:'flex',gap:8 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>setShowSeasonReport(false)}>Cerrar</button>
              <button className="btn btn-primary" style={{ flex:1 }} disabled={!reportAthleteId}
                onClick={() => { alert('PDF generado (demo)'); setShowSeasonReport(false); }}>
                Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
