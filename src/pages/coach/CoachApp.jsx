// ============================================================
// KLUP — Coach Panel (groups, attendance + swipe, publish, observations)
// ============================================================
import { useState, useRef } from 'react';
import { useAuth, useTheme, useOnlineStatus, useSwipe } from '../../contexts/AuthContext';
import { Icon, Avatar, OfflineBanner, ApprovalCard, AttBtn, Toggle, Modal, EmptyState } from '../../components/ui/index';
import { SPORTS, GROUPS, ATHLETES, OBSERVATIONS, PENDING_REQUESTS, SKILL_DOMAINS,
         SKILL_ASSESSMENTS, ATTENDANCE_TODAY, POSTS, getSport, timeAgo, countAttendance } from '../../lib/mockData';

const VIEWS = [
  { id:'groups',      label:'Grupos',     icon:<Icon.Users/> },
  { id:'attendance',  label:'Asistencia', icon:<Icon.Check/> },
  { id:'publish',     label:'Publicar',   icon:<Icon.Edit/> },
  { id:'observations',label:'Informe',    icon:<Icon.File/> },
  { id:'profile',     label:'Perfil',     icon:<Icon.User/> },
];

export default function CoachApp() {
  const { user, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const online = useOnlineStatus();
  const [view, setView]             = useState('groups');
  const [selectedGroup, setSelectedGroup] = useState('g1');
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  // Attendance state
  const [attRecords, setAttRecords] = useState(ATTENDANCE_TODAY.g1?.records || {});
  const [attSaved, setAttSaved]     = useState(false);

  // Publish state
  const [pubType, setPubType]       = useState('noticia');
  const [pubTitle, setPubTitle]     = useState('');
  const [pubContent, setPubContent] = useState('');
  const [pubEventDate, setPubEventDate] = useState('');
  const [pubSent, setPubSent]       = useState(false);

  // Observations
  const [obsAthleteId, setObsAthleteId] = useState(null);
  const [obsText, setObsText]           = useState('');
  const [obsType, setObsType]           = useState('tecnica');
  const [obsPrivate, setObsPrivate]     = useState(false);
  const [observations, setObservations] = useState(OBSERVATIONS);
  const [obsSent, setObsSent]           = useState(false);

  // Pending family requests for this coach
  const [requests, setRequests] = useState(PENDING_REQUESTS.filter(r => r.type==='family'));

  // Active groups
  const coachGroups = Object.values(GROUPS).filter(g => SPORTS.find(s => g.sportId === s.id));
  const myGroups    = ['g1','g4'].map(id => GROUPS[id]).filter(Boolean);
  const currentGroup = GROUPS[selectedGroup];
  const currentSport = currentGroup ? getSport(currentGroup.sportId) : null;
  const groupAthletes = ATHLETES.filter(a => a.groupId === selectedGroup);

  const saveAttendance = () => {
    if (!online) {
      // Would enqueue to IndexedDB
    }
    setAttSaved(true);
    setTimeout(() => setAttSaved(false), 3000);
  };

  const markAll = (state) => {
    const updated = {};
    groupAthletes.forEach(a => { updated[a.id] = state; });
    setAttRecords(prev => ({ ...prev, ...updated }));
  };

  const publishPost = () => {
    if (!pubTitle.trim() || !pubContent.trim()) return;
    setPubSent(true);
    setPubTitle(''); setPubContent(''); setPubEventDate('');
    setTimeout(() => setPubSent(false), 3000);
  };

  const addObservation = () => {
    if (!obsText.trim() || !obsAthleteId) return;
    const newObs = {
      id: 'o' + Date.now(), athleteId: obsAthleteId, coachId:'c1',
      type: obsType, content: obsText, isPrivate: obsPrivate, createdAt: new Date()
    };
    setObservations(prev => [newObs, ...prev]);
    setObsText(''); setObsAthleteId(null); setObsSent(true);
    setTimeout(() => setObsSent(false), 3000);
  };

  const handleApprove = (id) => setRequests(r => r.filter(x => x.id !== id));
  const handleReject  = (id) => setRequests(r => r.filter(x => x.id !== id));

  const counts = countAttendance(attRecords);
  const today  = new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="app-shell">
      {!online && <OfflineBanner/>}

      {/* Header */}
      <header className="page-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div className="header-klup-tag">KLUP</div>
            <div className="header-title">Hola, {user?.name?.split(' ')[0]}</div>
            <div className="header-subtitle">Escolapias Calasanz</div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Tema">
            <svg width="16" height="16">{theme==='dark'?<Icon.Sun/>:<Icon.Moon/>}</svg>
          </button>
        </div>
        <div className="header-pills">
          <span className="header-pill">{myGroups.length} grupos</span>
          <span className="header-pill">{myGroups.reduce((acc,g) => acc+g.count,0)} deportistas</span>
          {requests.length > 0 && <span className="header-pill warning">{requests.length} solicitud{requests.length>1?'es':''}</span>}
        </div>
      </header>

      <main className="page-content">

        {/* ── GROUPS ── */}
        {view === 'groups' && (
          <>
            {requests.length > 0 && (
              <>
                <div className="warning-banner">
                  <svg width="15" height="15"><Icon.Alert/></svg>
                  {requests.length} familia{requests.length>1?'s':''} pendiente{requests.length>1?'s':''} de aprobación
                </div>
                {requests.map(r => (
                  <ApprovalCard key={r.id}
                    request={{ ...r, groupName:`${currentSport?.name} · ${currentGroup?.name}` }}
                    onApprove={handleApprove} onReject={handleReject}/>
                ))}
              </>
            )}

            <div className="section-label">Mis grupos</div>
            {myGroups.map(group => {
              const sport = getSport(group.sportId);
              const athletes = ATHLETES.filter(a => a.groupId === group.id);
              return (
                <div key={group.id} className="card" style={{ border:`1.5px solid ${sport?.color}40`, marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <span className="sport-dot-lg" style={{ background:sport?.color }}/>
                    <span style={{ fontSize:17, fontWeight:900, color:sport?.color }}>{sport?.name}</span>
                    <span style={{ fontSize:12, color:'var(--muted)', fontWeight:500 }}>· {group.name}</span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginBottom:12 }}>
                    Escolapias Calasanz · {group.count} deportistas
                    {group.count >= group.maxCapacity && <span style={{ color:'var(--ausente)', marginLeft:6, fontWeight:700 }}>· Completo</span>}
                  </div>

                  {/* Avatar stack */}
                  <div className="avatar-stack" style={{ marginBottom:12 }}>
                    {athletes.slice(0,4).map(a => (
                      <div key={a.id} className="avatar avatar-sm"
                        style={{ background:`${sport?.color}20`, color:sport?.color }}>
                        {a.avatar}
                      </div>
                    ))}
                    {athletes.length > 4 && (
                      <div className="avatar avatar-sm"
                        style={{ background:'var(--bg)', color:'var(--muted)' }}>
                        +{athletes.length-4}
                      </div>
                    )}
                  </div>

                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-sm" style={{ flex:1, background:`${sport?.bg}`, color:sport?.color }}
                      onClick={() => { setSelectedGroup(group.id); setView('attendance'); }}>
                      <svg width="15" height="15"><Icon.Check/></svg>
                      Pasar lista
                    </button>
                    <button className="btn btn-sm" style={{ flex:1, background:'#dbeafe', color:'#2563eb' }}
                      onClick={() => { setSelectedGroup(group.id); setView('publish'); }}>
                      <svg width="15" height="15"><Icon.Edit/></svg>
                      Publicar
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Today's quick summary */}
            <div className="section-label" style={{ marginTop:8 }}>Lista de hoy · {myGroups[0]?.name}</div>
            <div className="card" style={{ padding:0 }}>
              <div className="att-summary" style={{ padding:'11px 13px', marginBottom:0 }}>
                {[['P', counts.P,'var(--presente-bg)','var(--presente)'],
                  ['A', counts.A,'var(--ausente-bg)','var(--ausente)'],
                  ['T', counts.T,'var(--tarde-bg)','var(--tarde)'],
                  ['J', counts.J,'var(--justificado-bg)','var(--justificado)']].map(([l,n,bg,c]) => (
                  <div key={l} className="att-pill" style={{ background:bg, color:c }}>{l} · {n}</div>
                ))}
              </div>
              {groupAthletes.slice(0,3).map(a => (
                <div key={a.id} className="athlete-row">
                  <div className="avatar avatar-sm" style={{ background:`${currentSport?.color}20`, color:currentSport?.color }}>{a.avatar}</div>
                  <div className="athlete-info">
                    <div className="athlete-name">{a.name}</div>
                    <div className="athlete-course">{a.course}</div>
                  </div>
                  <span className={`att-btn att-${attRecords[a.id]||'P'}`} style={{ fontSize:12 }}>
                    {attRecords[a.id]||'P'}
                  </span>
                </div>
              ))}
              <button style={{ width:'100%', padding:'10px', fontSize:13, fontWeight:700,
                color:'var(--blue)', background:'none', border:'none', borderTop:'1px solid var(--bg)',
                cursor:'pointer' }} onClick={() => setView('attendance')}>
                Ver lista completa →
              </button>
            </div>
          </>
        )}

        {/* ── ATTENDANCE ── */}
        {view === 'attendance' && (
          <>
            {/* Group selector */}
            {myGroups.length > 1 && (
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {myGroups.map(g => {
                  const s = getSport(g.sportId);
                  return (
                    <button key={g.id}
                      onClick={() => setSelectedGroup(g.id)}
                      style={{ padding:'8px 14px', borderRadius:'var(--r-full)', fontSize:13, fontWeight:700,
                        background: selectedGroup===g.id ? s?.bg : 'var(--surface)',
                        color: selectedGroup===g.id ? s?.color : 'var(--muted)',
                        border: `1.5px solid ${selectedGroup===g.id ? s?.color : 'var(--border)'}`,
                        cursor:'pointer' }}>
                      {s?.name} · {g.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Date + summary */}
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:12 }}>{todayCap}</div>
            {attSaved && (
              <div className="toast-success">
                <svg width="16" height="16"><Icon.Check/></svg>
                Lista guardada correctamente
              </div>
            )}

            <div className="att-summary">
              {[['P',counts.P,'var(--presente-bg)','var(--presente)'],
                ['A',counts.A,'var(--ausente-bg)','var(--ausente)'],
                ['T',counts.T,'var(--tarde-bg)','var(--tarde)'],
                ['J',counts.J,'var(--justificado-bg)','var(--justificado)']].map(([l,n,bg,c]) => (
                <div key={l} className="att-pill" style={{ background:bg, color:c }}>{l}  {n}</div>
              ))}
            </div>

            {/* Quick buttons */}
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <button className="btn btn-success btn-sm" style={{ flex:1 }} onClick={() => markAll('P')}>Todos presentes</button>
              <button className="btn btn-danger btn-sm"  style={{ flex:1 }} onClick={() => markAll('A')}>Todos ausentes</button>
            </div>

            {/* Swipe hint */}
            <div style={{ fontSize:11, color:'var(--light)', textAlign:'center', marginBottom:10, fontWeight:600 }}>
              Desliza → Presente  ·  ← Ausente  ·  Toca para ciclar
            </div>

            {/* Athletes */}
            <div className="card" style={{ padding:0 }}>
              {groupAthletes.map(a => (
                <SwipeableAthleteRow key={a.id} athlete={a}
                  state={attRecords[a.id] || 'P'}
                  sportColor={currentSport?.color}
                  onChange={(s) => setAttRecords(prev => ({ ...prev, [a.id]: s }))}
                  onObs={() => { setObsAthleteId(a.id); setView('observations'); }}
                />
              ))}
            </div>

            <button className="btn btn-primary btn-full" style={{ marginTop:12, height:48, fontSize:15 }}
              onClick={saveAttendance}>
              <svg width="16" height="16"><Icon.Check/></svg>
              Guardar asistencia{!online ? ' (offline)' : ''}
            </button>

            {/* History */}
            <div className="section-label" style={{ marginTop:16 }}>Historial reciente</div>
            {[
              { date:'Jue 22 may', P:13, A:2 },
              { date:'Mar 20 may', P:14, A:1 },
              { date:'Jue 15 may', P:11, A:3, T:1 },
            ].map((h,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px',
                background:'var(--surface)', borderRadius:'var(--r-md)', marginBottom:6, border:'1px solid var(--border)' }}>
                <span style={{ fontSize:13, color:'var(--text)', flex:1, fontWeight:500 }}>{h.date}</span>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--presente)' }}>P·{h.P}</span>
                {h.A > 0 && <span style={{ fontSize:12, fontWeight:700, color:'var(--ausente)' }}>A·{h.A}</span>}
                {h.T  && <span style={{ fontSize:12, fontWeight:700, color:'var(--tarde)' }}>T·{h.T}</span>}
              </div>
            ))}
          </>
        )}

        {/* ── PUBLISH ── */}
        {view === 'publish' && (
          <>
            {pubSent && (
              <div className="toast-success">
                <svg width="16" height="16"><Icon.Check/></svg>
                Publicación enviada a todas las familias del grupo
              </div>
            )}

            <div className="section-label">Tipo de publicación</div>
            <div className="publish-type-grid">
              {[
                { id:'noticia',   label:'Noticia',  color:'#1e40af', bg:'#dbeafe' },
                { id:'foto',      label:'Foto',     color:'#166534', bg:'#dcfce7' },
                { id:'evento',    label:'Evento',   color:'#92400e', bg:'#fef3c7' },
                { id:'resultado', label:'Resultado',color:'#7e22ce', bg:'#f3e8ff' },
              ].map(t => (
                <button key={t.id} className={`publish-type-card ${pubType===t.id?'selected':''}`}
                  style={pubType===t.id ? { borderColor:t.color, color:t.color, background:t.bg } : {}}
                  onClick={() => setPubType(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Group selector */}
            <div className="form-group">
              <label className="form-label">Grupo</label>
              <select className="form-input form-select" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
                {myGroups.map(g => {
                  const s = getSport(g.sportId);
                  return <option key={g.id} value={g.id}>{s?.name} · {g.name}</option>;
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Título *</label>
              <input className="form-input" placeholder="Ej: Torneo el próximo sábado"
                value={pubTitle} onChange={e => setPubTitle(e.target.value)}/>
            </div>

            <div className="form-group">
              <label className="form-label">Mensaje *</label>
              <textarea className="form-input form-textarea" rows={4}
                placeholder="Detalles de la publicación…"
                value={pubContent} onChange={e => setPubContent(e.target.value)}/>
            </div>

            {pubType === 'evento' && (
              <div className="form-group">
                <label className="form-label">Fecha y hora del evento</label>
                <input className="form-input" type="datetime-local"
                  value={pubEventDate} onChange={e => setPubEventDate(e.target.value)}/>
              </div>
            )}

            {pubType === 'foto' && (
              <div style={{ border:'2px dashed var(--border)', borderRadius:'var(--r-lg)', padding:'24px',
                textAlign:'center', marginBottom:14, cursor:'pointer', color:'var(--muted)' }}>
                <svg width="28" height="28" style={{ margin:'0 auto 8px', color:'var(--light)' }}><Icon.Image/></svg>
                <div style={{ fontSize:13, fontWeight:600 }}>Toca para subir foto</div>
                <div style={{ fontSize:11, color:'var(--light)', marginTop:2 }}>JPG, PNG · máx. 10 MB</div>
              </div>
            )}

            {pubType === 'resultado' && (
              <div className="form-group">
                <label className="form-label">Marcador (ej: 3-1)</label>
                <input className="form-input" placeholder="3-1"/>
              </div>
            )}

            {/* Preview */}
            {pubTitle && pubContent && (
              <div style={{ borderRadius:'var(--r-lg)', border:'1px solid var(--border)',
                overflow:'hidden', marginBottom:16, background:'var(--surface)' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', padding:'8px 14px 4px',
                  borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
                  VISTA PREVIA
                </div>
                <div style={{ padding:'12px 14px' }}>
                  <span className={`badge badge-${pubType}`} style={{ marginBottom:6, display:'inline-block' }}>
                    {pubType.charAt(0).toUpperCase()+pubType.slice(1)}
                  </span>
                  <div style={{ fontSize:15, fontWeight:800, color:'var(--text)', marginBottom:4 }}>{pubTitle}</div>
                  <div style={{ fontSize:13, color:'var(--muted)' }}>{pubContent}</div>
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-full" style={{ height:48, fontSize:15 }}
              onClick={publishPost} disabled={!pubTitle.trim() || !pubContent.trim()}>
              <svg width="15" height="15"><Icon.Megaphone/></svg>
              Publicar en el grupo
            </button>
          </>
        )}

        {/* ── OBSERVATIONS ── */}
        {view === 'observations' && (
          <>
            {obsSent && (
              <div className="toast-success">
                <svg width="16" height="16"><Icon.Check/></svg>
                Observación guardada
              </div>
            )}

            <div className="section-label">Nueva observación</div>
            <div className="card">
              {/* Athlete selector */}
              <div className="form-group">
                <label className="form-label">Atleta</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, maxHeight:160, overflowY:'auto' }}>
                  {groupAthletes.map(a => (
                    <div key={a.id} onClick={() => setObsAthleteId(a.id)}
                      style={{ padding:'8px 10px', borderRadius:'var(--r-md)', cursor:'pointer', display:'flex', gap:6,
                        alignItems:'center', border:`1.5px solid ${obsAthleteId===a.id ? 'var(--blue)' : 'var(--border)'}`,
                        background: obsAthleteId===a.id ? '#dbeafe' : 'var(--surface)' }}>
                      <div className="avatar avatar-sm" style={{ background:`${currentSport?.color}20`, color:currentSport?.color }}>{a.avatar}</div>
                      <span style={{ fontSize:12, fontWeight:600, color: obsAthleteId===a.id ? 'var(--blue)' : 'var(--text)' }}>
                        {a.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo</label>
                <div style={{ display:'flex', gap:6 }}>
                  {[['tecnica','Técnica','#2563eb'],['comportamiento','Comportam.','#9333ea'],['general','General','#64748b']].map(([id,label,color]) => (
                    <button key={id} onClick={() => setObsType(id)}
                      style={{ flex:1, padding:'7px 4px', borderRadius:'var(--r-sm)', fontSize:12, fontWeight:700,
                        border:`1.5px solid ${obsType===id ? color : 'var(--border)'}`,
                        background: obsType===id ? color+'15' : 'var(--surface)',
                        color: obsType===id ? color : 'var(--muted)', cursor:'pointer' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observación</label>
                <textarea className="form-input form-textarea" rows={3}
                  placeholder="Describe la observación…"
                  value={obsText} onChange={e => setObsText(e.target.value)}/>
              </div>

              <Toggle on={obsPrivate} onChange={setObsPrivate}
                label="Privada — solo visible para entrenadores"/>

              <button className="btn btn-primary btn-full" style={{ marginTop:8 }}
                onClick={addObservation} disabled={!obsText.trim() || !obsAthleteId}>
                Guardar observación
              </button>
            </div>

            {/* Observations list */}
            <div className="section-label" style={{ marginTop:8 }}>Historial</div>
            {observations.length === 0 ? (
              <EmptyState icon={<Icon.File/>} title="Sin observaciones" text="Añade la primera observación de un atleta"/>
            ) : observations.map(obs => {
              const athlete = ATHLETES.find(a => a.id === obs.athleteId);
              const typeColor = { tecnica:'#2563eb', comportamiento:'#9333ea', general:'#64748b' }[obs.type] || '#64748b';
              const typeLabel = { tecnica:'Técnica', comportamiento:'Comportam.', general:'General' }[obs.type];
              return (
                <div key={obs.id} className="obs-card">
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <div className="avatar avatar-sm" style={{ background:`${currentSport?.color}20`, color:currentSport?.color }}>
                      {athlete?.avatar}
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text)', flex:1 }}>{athlete?.name}</span>
                    {obs.isPrivate && (
                      <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, color:'var(--muted)', fontWeight:700 }}>
                        <svg width="12" height="12"><Icon.Lock/></svg> Privada
                      </span>
                    )}
                  </div>
                  <div className="obs-type" style={{ color:typeColor }}>{typeLabel}</div>
                  <div className="obs-text">{obs.content}</div>
                  <div className="obs-meta">{timeAgo(obs.createdAt)}</div>
                </div>
              );
            })}
          </>
        )}

        {/* ── PROFILE ── */}
        {view === 'profile' && (
          <>
            <div className="profile-header" style={{ margin:'-16px -16px 16px', borderRadius:0 }}>
              <div className="avatar avatar-xl" style={{ background:'rgba(255,255,255,.2)', color:'white', fontSize:20 }}>
                {user?.avatar || 'JM'}
              </div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-role">Entrenador · Escolapias Calasanz</div>
            </div>

            <div className="section-label">Mis grupos</div>
            {myGroups.map(g => {
              const s = getSport(g.sportId);
              return (
                <div key={g.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  background:'var(--surface)', borderRadius:'var(--r-md)', marginBottom:6, border:'1px solid var(--border)' }}>
                  <span className="sport-dot-lg" style={{ background:s?.color }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{s?.name} · {g.name}</div>
                    <div style={{ fontSize:11, color:'var(--light)' }}>{g.count} atletas · cap. {g.maxCapacity}</div>
                  </div>
                  <span style={{ fontSize:11, color:'var(--muted)', background:'var(--bg)', padding:'3px 8px',
                    borderRadius:99, fontWeight:600 }}>Activo</span>
                </div>
              );
            })}

            <div className="section-label" style={{ marginTop:12 }}>Estadísticas del mes</div>
            <div className="grid-2" style={{ marginBottom:16 }}>
              <div className="stat-big"><div className="stat-big-num">12</div><div className="stat-big-label">Posts publicados</div></div>
              <div className="stat-big"><div className="stat-big-num">8</div><div className="stat-big-label">Listas pasadas</div></div>
              <div className="stat-big"><div className="stat-big-num">87%</div><div className="stat-big-label">Asistencia media</div></div>
              <div className="stat-big"><div className="stat-big-num">5</div><div className="stat-big-label">Observaciones</div></div>
            </div>

            <div style={{ borderTop:'1px solid var(--border)', paddingTop:12 }}>
              <div style={{ fontSize:13, color:'var(--muted)', marginBottom:8 }}>
                <strong style={{ color:'var(--text)' }}>Cuenta:</strong> {user?.email}
              </div>
              <button className="logout-btn" onClick={logout}>
                <svg width="16" height="16"><Icon.Logout/></svg>
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {VIEWS.map(v => (
          <button key={v.id} className={`nav-item ${view===v.id?'active':''}`}
            onClick={() => setView(v.id)} aria-label={v.label}>
            {v.id==='groups' && requests.length>0 && <span className="nav-badge"/>}
            <svg>{v.icon}</svg>
            <span>{v.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── Swipeable Athlete Row ─────────────────────────────────────

function SwipeableAthleteRow({ athlete, state, sportColor, onChange, onObs }) {
  const [delta, setDelta] = useState(0);
  const startX = useRef(null);

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchMove  = (e) => {
    if (startX.current === null) return;
    const d = e.touches[0].clientX - startX.current;
    setDelta(Math.max(-80, Math.min(80, d)));
  };
  const onTouchEnd = () => {
    if (delta > 50)  onChange('P');
    if (delta < -50) onChange('A');
    startX.current = null;
    setDelta(0);
  };

  const bgHint = delta > 20 ? 'var(--presente-bg)' : delta < -20 ? 'var(--ausente-bg)' : 'transparent';
  const textHint = delta > 20 ? 'Presente' : delta < -20 ? 'Ausente' : '';

  return (
    <div className="athlete-row" style={{ position:'relative', background:bgHint, transition: delta===0 ? 'background .2s' : 'none' }}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {textHint && (
        <div style={{ position:'absolute', [delta>0?'left':'right']:8, fontSize:11, fontWeight:800,
          color: delta>0 ? 'var(--presente)' : 'var(--ausente)', pointerEvents:'none' }}>
          {textHint}
        </div>
      )}
      <div style={{ transform:`translateX(${delta}px)`, display:'contents' }}>
        <div className="avatar avatar-sm" style={{ background:`${sportColor}20`, color:sportColor, flexShrink:0 }}>
          {athlete.avatar}
        </div>
        <div className="athlete-info">
          <div className="athlete-name">{athlete.name}</div>
          <div className="athlete-course">{athlete.course}</div>
        </div>
        <button onClick={onObs} style={{ background:'none', border:'none', padding:'4px 6px',
          color:'var(--light)', cursor:'pointer', flexShrink:0 }} aria-label="Añadir observación">
          <svg width="16" height="16"><Icon.Edit/></svg>
        </button>
        <AttBtn state={state} onChange={onChange}/>
      </div>
    </div>
  );
}
