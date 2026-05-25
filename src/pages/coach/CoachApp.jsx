// ============================================================
// KLUP — Coach Panel (responsive, group-centric)
// ============================================================
import { useState } from 'react';
import { useAuth, useTheme, useOnlineStatus } from '../../contexts/AuthContext';
import { Icon, Avatar, OfflineBanner, AttBtn, Toggle } from '../../components/ui/index';
import { SPORTS, GROUPS, ATHLETES, OBSERVATIONS, PENDING_REQUESTS, POSTS,
         getSport, timeAgo, countAttendance, ATTENDANCE_TODAY } from '../../lib/mockData';

// Coach's groups (mock: c1 has g1 + g4)
const MY_GROUP_IDS = ['g1', 'g4'];

const GROUP_TABS = [
  { id:'agenda',       label:'Agenda',      icon:<Icon.Calendar/> },
  { id:'atletas',      label:'Atletas',     icon:<Icon.Users/> },
  { id:'solicitudes',  label:'Solicitudes', icon:<Icon.Bell/> },
  { id:'publicar',     label:'Publicar',    icon:<Icon.Edit/> },
  { id:'lista',        label:'Lista',       icon:<Icon.Check/> },
];

export default function CoachApp() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const online = useOnlineStatus();

  const myGroups = MY_GROUP_IDS.map(id => GROUPS[id]).filter(Boolean);

  // If only 1 group → auto-select; if multiple → show selector
  const [selectedGroupId, setSelectedGroupId] = useState(
    myGroups.length === 1 ? myGroups[0].id : null
  );
  const [activeTab, setActiveTab] = useState('agenda');

  // Attendance state
  const [attRecords, setAttRecords] = useState(ATTENDANCE_TODAY.g1?.records || {});
  const [attSaved, setAttSaved]     = useState(false);
  const [expandedAthlete, setExpandedAthlete] = useState(null);
  const [obsText, setObsText]   = useState({});
  const [obsType, setObsType]   = useState({});
  const [savedObs, setSavedObs] = useState([...OBSERVATIONS]);

  // Publish state
  const [pubType, setPubType]     = useState('noticia');
  const [pubTitle, setPubTitle]   = useState('');
  const [pubContent, setPubContent] = useState('');
  const [pubDate, setPubDate]     = useState('');
  const [pubSent, setPubSent]     = useState(false);

  // Requests
  const [requests, setRequests] = useState(
    PENDING_REQUESTS.filter(r => r.type === 'family')
  );

  // Selected athlete sheet
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const selectedGroup = selectedGroupId ? GROUPS[selectedGroupId] : null;
  const sport = selectedGroup ? getSport(selectedGroup.sportId) : null;
  const groupAthletes = selectedGroupId
    ? ATHLETES.filter(a => a.groupId === selectedGroupId)
    : [];
  const counts = countAttendance(attRecords);

  const saveAtt = () => { setAttSaved(true); setTimeout(() => setAttSaved(false), 3000); };
  const markAll = (s) => {
    const u = {};
    groupAthletes.forEach(a => { u[a.id] = s; });
    setAttRecords(p => ({ ...p, ...u }));
  };

  const saveObs = (athleteId) => {
    if (!obsText[athleteId]?.trim()) return;
    setSavedObs(p => [{
      id:'o'+Date.now(), athleteId, coachId:'c1',
      type: obsType[athleteId] || 'general',
      content: obsText[athleteId],
      isPrivate: false, createdAt: new Date()
    }, ...p]);
    setObsText(p => ({ ...p, [athleteId]: '' }));
    setExpandedAthlete(null);
  };

  const publishPost = () => {
    if (!pubTitle.trim()) return;
    setPubSent(true);
    setPubTitle(''); setPubContent(''); setPubDate('');
    setTimeout(() => setPubSent(false), 3500);
  };

  const today = new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' });

  // ── Sidebar nav items ──────────────────────────────────────

  const sidebarGroups = myGroups.map(g => {
    const s = getSport(g.sportId);
    return { g, s };
  });

  return (
    <div className="app-shell">
      {!online && <OfflineBanner/>}

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="app-sidebar">
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo">Klup</div>
          <div className="sidebar-logo-sub">Panel Entrenador</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Mis grupos</div>
          {sidebarGroups.map(({ g, s }) => (
            <button key={g.id}
              className={`sidebar-nav-item ${selectedGroupId === g.id ? 'active' : ''}`}
              onClick={() => { setSelectedGroupId(g.id); setActiveTab('agenda'); }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:s?.color,
                flexShrink:0, display:'inline-block' }}/>
              <span style={{ flex:1 }}>{s?.name} · {g.name}</span>
              <span style={{ fontSize:11, color:'var(--light)' }}>{g.count}</span>
            </button>
          ))}

          {selectedGroup && (
            <>
              <div className="sidebar-divider"/>
              <div className="sidebar-section-label">{sport?.name} · {selectedGroup.name}</div>
              {GROUP_TABS.map(t => (
                <button key={t.id}
                  className={`sidebar-nav-item ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}>
                  <svg>{t.icon}</svg>
                  {t.label}
                  {t.id === 'solicitudes' && requests.length > 0 &&
                    <span className="s-badge">{requests.length}</span>}
                  {t.id === 'lista' && counts.A > 0 &&
                    <span className="s-badge" style={{ background:'var(--tarde)' }}>{counts.A}A</span>}
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar avatar-md" style={{ background:'#dbeafe', color:'var(--blue)' }}>
              {user?.avatar || 'JM'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">Entrenador</div>
            </div>
          </div>
          <button style={{ display:'flex', alignItems:'center', gap:6, width:'100%',
            padding:'8px 10px', borderRadius:'var(--r-md)', border:'1px solid var(--border)',
            background:'none', color:'var(--ausente)', fontSize:13, fontWeight:600, cursor:'pointer' }}
            onClick={logout}>
            <svg width="15" height="15"><Icon.Logout/></svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="app-main">

        {/* Mobile header */}
        <header className="page-header mobile-only">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div className="header-klup-tag">KLUP</div>
              <div className="header-title">
                {selectedGroup ? `${sport?.name} · ${selectedGroup.name}` : `Hola, ${user?.name?.split(' ')[0]}`}
              </div>
              <div className="header-subtitle">Escolapias Calasanz</div>
            </div>
            <button className="theme-toggle" onClick={toggle}>
              <svg width="16" height="16">{theme==='dark'?<Icon.Sun/>:<Icon.Moon/>}</svg>
            </button>
          </div>
          {!selectedGroup && (
            <div className="header-pills">
              <span className="header-pill">{myGroups.length} grupos</span>
              <span className="header-pill">{myGroups.reduce((a,g)=>a+g.count,0)} atletas</span>
            </div>
          )}
        </header>

        {/* Desktop header */}
        {selectedGroup && (
          <div className="desktop-header">
            {myGroups.length > 1 && (
              <button onClick={() => setSelectedGroupId(null)}
                style={{ color:'var(--muted)', background:'none', border:'none', cursor:'pointer',
                  fontSize:13, display:'flex', alignItems:'center', gap:4, fontWeight:500 }}>
                <svg width="16" height="16"><Icon.ChevronRight style={{ transform:'rotate(180deg)' }}/></svg>
                Grupos
              </button>
            )}
            <span style={{ color:'var(--light)' }}>/</span>
            <span style={{ width:10, height:10, borderRadius:'50%', background:sport?.color,
              display:'inline-block', flexShrink:0 }}/>
            <span className="desktop-header-title">{sport?.name} · {selectedGroup.name}</span>
            <span className="desktop-header-sub">{selectedGroup.count} atletas</span>
            <button className="theme-toggle" style={{ background:'var(--bg)', border:'1px solid var(--border)',
              color:'var(--muted)' }} onClick={toggle}>
              <svg width="16" height="16">{theme==='dark'?<Icon.Sun/>:<Icon.Moon/>}</svg>
            </button>
          </div>
        )}

        {/* ── GROUP SELECTOR (mobile + desktop when no group selected) ── */}
        {!selectedGroupId ? (
          <div className="page-content">
            <div className="section-label">Mis grupos</div>
            {myGroups.map(g => {
              const s = getSport(g.sportId);
              const athletes = ATHLETES.filter(a => a.groupId === g.id);
              return (
                <div key={g.id} className="group-card" onClick={() => { setSelectedGroupId(g.id); setActiveTab('agenda'); }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{ width:12, height:12, borderRadius:'50%', background:s?.color }}/>
                    <span style={{ fontSize:17, fontWeight:900, color:s?.color }}>{s?.name}</span>
                    <span style={{ fontSize:13, color:'var(--muted)' }}>· {g.name}</span>
                    <span style={{ marginLeft:'auto', fontSize:12, color:'var(--muted)',
                      background:'var(--bg)', padding:'3px 8px', borderRadius:99, fontWeight:600 }}>
                      {g.count}/{g.maxCapacity}
                    </span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:10 }}>
                    {athletes.slice(0,6).map(a => (
                      <div key={a.id} className="avatar avatar-sm"
                        style={{ background:`${s?.color}20`, color:s?.color,
                          border:'2px solid var(--surface)', marginLeft:a===athletes[0]?0:-8 }}>
                        {a.avatar}
                      </div>
                    ))}
                    {athletes.length > 6 && (
                      <div className="avatar avatar-sm"
                        style={{ background:'var(--bg)', color:'var(--muted)',
                          border:'2px solid var(--surface)', marginLeft:-8 }}>
                        +{athletes.length-6}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {GROUP_TABS.map(t => (
                      <div key={t.id} style={{ flex:1, padding:'7px 4px', background:'var(--bg)',
                        borderRadius:'var(--r-sm)', fontSize:10, fontWeight:700, color:'var(--muted)',
                        textAlign:'center' }}>
                        {t.label}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {/* Mobile tab bar */}
            <div className="tab-bar mobile-only">
              {GROUP_TABS.map(t => (
                <button key={t.id} className={`tab-item ${activeTab===t.id?'active':''}`}
                  onClick={() => setActiveTab(t.id)}>
                  {t.label}
                  {t.id==='solicitudes' && requests.length>0 &&
                    <span style={{ background:'#dc2626',color:'white',borderRadius:99,
                      padding:'1px 5px',fontSize:9,fontWeight:800,marginLeft:4 }}>
                      {requests.length}
                    </span>}
                </button>
              ))}
            </div>

            <div className="page-content">
              {attSaved && <div className="toast-success"><svg width="15" height="15"><Icon.Check/></svg>Lista guardada</div>}
              {pubSent  && <div className="toast-success"><svg width="15" height="15"><Icon.Check/></svg>Publicación enviada</div>}

              {/* ── AGENDA ── */}
              {activeTab === 'agenda' && <AgendaTab groupId={selectedGroupId} sport={sport}/>}

              {/* ── ATLETAS ── */}
              {activeTab === 'atletas' && (
                <AtletasTab athletes={groupAthletes} sport={sport}
                  observations={savedObs}
                  onSelect={setSelectedAthlete}/>
              )}

              {/* ── SOLICITUDES ── */}
              {activeTab === 'solicitudes' && (
                <SolicitudesTab requests={requests} groups={GROUPS} sport={sport}
                  onApprove={(id) => setRequests(r => r.filter(x => x.id !== id))}
                  onReject={(id) => setRequests(r => r.filter(x => x.id !== id))}/>
              )}

              {/* ── PUBLICAR ── */}
              {activeTab === 'publicar' && (
                <PublicarTab pubType={pubType} setPubType={setPubType}
                  pubTitle={pubTitle} setPubTitle={setPubTitle}
                  pubContent={pubContent} setPubContent={setPubContent}
                  pubDate={pubDate} setPubDate={setPubDate}
                  onPublish={publishPost}/>
              )}

              {/* ── LISTA ── */}
              {activeTab === 'lista' && (
                <ListaTab athletes={groupAthletes} sport={sport}
                  attRecords={attRecords} setAttRecords={setAttRecords}
                  counts={counts} today={today}
                  expandedAthlete={expandedAthlete} setExpandedAthlete={setExpandedAthlete}
                  obsText={obsText} setObsText={setObsText}
                  obsType={obsType} setObsType={setObsType}
                  savedObs={savedObs} saveObs={saveObs}
                  markAll={markAll} saveAtt={saveAtt} online={online}/>
              )}
            </div>
          </>
        )}

        {/* Mobile bottom nav */}
        {selectedGroupId ? (
          <nav className="bottom-nav mobile-only">
            {GROUP_TABS.map(t => (
              <button key={t.id} className={`nav-item ${activeTab===t.id?'active':''}`}
                onClick={() => setActiveTab(t.id)}>
                {t.id==='solicitudes' && requests.length>0 && <span className="nav-badge"/>}
                <svg>{t.icon}</svg>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        ) : (
          <nav className="bottom-nav mobile-only">
            <button className="nav-item active"><svg><Icon.Users/></svg><span>Grupos</span></button>
            <button className="nav-item" onClick={logout}><svg><Icon.Logout/></svg><span>Salir</span></button>
          </nav>
        )}
      </div>

      {/* Athlete detail sheet */}
      {selectedAthlete && (
        <AthleteSheet athlete={selectedAthlete} sport={sport}
          observations={savedObs.filter(o => o.athleteId === selectedAthlete.id && !o.isPrivate)}
          attRecords={attRecords}
          onClose={() => setSelectedAthlete(null)}/>
      )}
    </div>
  );
}

// ── AGENDA TAB ───────────────────────────────────────────────

function AgendaTab({ groupId, sport }) {
  const posts = POSTS.filter(p => p.groupId === groupId);
  const events = posts.filter(p => p.type === 'evento');
  const recent = [...posts].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

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
                  <div className="agenda-date-month">{months[d.getMonth()]}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{e.title}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{e.content}</div>
                  {e.eventDate && (
                    <div style={{ fontSize:11, color:sport?.color, fontWeight:600, marginTop:4,
                      display:'flex', alignItems:'center', gap:4 }}>
                      <svg width="12" height="12"><Icon.Calendar/></svg>{e.eventDate}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      <div className="section-label" style={{ marginTop: events.length>0 ? 16 : 0 }}>Últimas publicaciones</div>
      {recent.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><svg width="24" height="24" style={{ color:'var(--light)' }}><Icon.Calendar/></svg></div>
          <div className="empty-state-title">Sin publicaciones</div>
          <div className="empty-state-text">Ve a Publicar para crear el primer post del grupo</div>
        </div>
      ) : recent.map(p => {
        const badgeClass = { noticia:'badge-noticia',foto:'badge-foto',evento:'badge-evento',resultado:'badge-resultado' }[p.type];
        return (
          <div key={p.id} style={{ background:'var(--surface)', borderRadius:'var(--r-md)',
            border:'1px solid var(--border)', padding:'12px 14px', marginBottom:8 }}>
            <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:5 }}>
              <span className={`badge ${badgeClass}`}>{p.type.charAt(0).toUpperCase()+p.type.slice(1)}</span>
              <span style={{ marginLeft:'auto', fontSize:11, color:'var(--light)' }}>{timeAgo(p.createdAt)}</span>
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{p.title}</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>{p.content}</div>
          </div>
        );
      })}
    </>
  );
}

// ── ATLETAS TAB ──────────────────────────────────────────────

function AtletasTab({ athletes, sport, observations, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = athletes.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ marginBottom:14 }}>
        <input className="form-input" placeholder="Buscar atleta..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft:36 }}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10 }}>
        {filtered.map(a => {
          const obsCount = observations.filter(o => o.athleteId === a.id).length;
          return (
            <div key={a.id} className="athlete-card" onClick={() => onSelect(a)}>
              <div className="avatar avatar-lg" style={{ background:`${sport?.color}20`,
                color:sport?.color, margin:'0 auto 8px' }}>
                {a.avatar}
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{a.name.split(' ')[0]}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>{a.name.split(' ').slice(1).join(' ')}</div>
              <div style={{ fontSize:10, color:'var(--light)', marginTop:2 }}>{a.course}</div>
              {obsCount > 0 && (
                <div style={{ marginTop:6, fontSize:10, color:'var(--blue)', fontWeight:700 }}>
                  {obsCount} obs.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── SOLICITUDES TAB ──────────────────────────────────────────

function SolicitudesTab({ requests, groups, sport, onApprove, onReject }) {
  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><svg width="24" height="24" style={{ color:'var(--light)' }}><Icon.Check/></svg></div>
        <div className="empty-state-title">Sin solicitudes</div>
        <div className="empty-state-text">No hay familias pendientes de aprobación</div>
      </div>
    );
  }
  return (
    <>
      <div className="section-label">{requests.length} solicitud{requests.length>1?'es':''} pendiente{requests.length>1?'s':''}</div>
      {requests.map(r => (
        <div key={r.id} className="approval-card">
          <div className="approval-header">
            <div className="avatar avatar-md" style={{ background:'#dbeafe', color:'#2563eb' }}>{r.avatar}</div>
            <div className="approval-info">
              <div className="approval-name">{r.name}</div>
              <div className="approval-email">{r.email}</div>
            </div>
          </div>
          <div className="approval-details">
            <strong>Atleta:</strong> {r.athleteName} · {r.athleteCourse}
          </div>
          <div className="approval-actions">
            <button className="btn btn-success btn-sm" style={{ flex:1 }} onClick={() => onApprove(r.id)}>Aprobar</button>
            <button className="btn btn-danger btn-sm"  style={{ flex:1 }} onClick={() => onReject(r.id)}>Rechazar</button>
          </div>
        </div>
      ))}
    </>
  );
}

// ── PUBLICAR TAB ─────────────────────────────────────────────

function PublicarTab({ pubType, setPubType, pubTitle, setPubTitle, pubContent, setPubContent, pubDate, setPubDate, onPublish }) {
  return (
    <>
      <div className="section-label">Tipo de publicación</div>
      <div className="publish-type-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { id:'noticia',   label:'Noticia',  color:'#1e40af', bg:'#dbeafe' },
          { id:'foto',      label:'Foto',     color:'#166534', bg:'#dcfce7' },
          { id:'evento',    label:'Evento',   color:'#92400e', bg:'#fef3c7' },
          { id:'resultado', label:'Resultado',color:'#7e22ce', bg:'#f3e8ff' },
        ].map(t => (
          <button key={t.id}
            className={`publish-type-card ${pubType===t.id?'selected':''}`}
            style={pubType===t.id ? { borderColor:t.color, color:t.color, background:t.bg } : {}}
            onClick={() => setPubType(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="form-group">
        <label className="form-label">Título *</label>
        <input className="form-input" placeholder="Ej: Entrenamiento del martes"
          value={pubTitle} onChange={e => setPubTitle(e.target.value)}/>
      </div>

      <div className="form-group">
        <label className="form-label">Mensaje</label>
        <textarea className="form-input form-textarea" rows={4}
          placeholder="Escribe el contenido…"
          value={pubContent} onChange={e => setPubContent(e.target.value)}/>
      </div>

      {pubType === 'evento' && (
        <div className="form-group">
          <label className="form-label">Fecha del evento</label>
          <input className="form-input" type="datetime-local"
            value={pubDate} onChange={e => setPubDate(e.target.value)}/>
        </div>
      )}

      {pubType === 'foto' && (
        <div style={{ border:'2px dashed var(--border)', borderRadius:'var(--r-lg)',
          padding:'28px', textAlign:'center', marginBottom:14, cursor:'pointer', color:'var(--muted)' }}>
          <svg width="28" height="28" style={{ margin:'0 auto 8px', display:'block', color:'var(--light)' }}>
            <Icon.Image/>
          </svg>
          <div style={{ fontSize:13, fontWeight:600 }}>Toca para subir foto o archivo</div>
          <div style={{ fontSize:11, color:'var(--light)', marginTop:2 }}>JPG, PNG, PDF, MP4</div>
        </div>
      )}

      {pubType === 'resultado' && (
        <div className="form-group">
          <label className="form-label">Marcador (ej: 3-1)</label>
          <input className="form-input" placeholder="3-1"/>
        </div>
      )}

      <button className="btn btn-primary btn-full" style={{ height:48, fontSize:15 }}
        onClick={onPublish} disabled={!pubTitle.trim()}>
        <svg width="15" height="15"><Icon.Megaphone/></svg>
        Publicar en el grupo
      </button>

      <div style={{ textAlign:'center', fontSize:12, color:'var(--muted)', marginTop:10 }}>
        Las familias del grupo recibirán una notificación
      </div>
    </>
  );
}

// ── LISTA TAB ────────────────────────────────────────────────

function ListaTab({ athletes, sport, attRecords, setAttRecords, counts, today,
  expandedAthlete, setExpandedAthlete, obsText, setObsText, obsType, setObsType,
  savedObs, saveObs, markAll, saveAtt, online }) {

  return (
    <>
      <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:12 }}>
        {today.charAt(0).toUpperCase() + today.slice(1)}
      </div>

      {/* Summary pills */}
      <div className="att-summary" style={{ marginBottom:12 }}>
        {[['P',counts.P,'var(--presente-bg)','var(--presente)'],
          ['A',counts.A,'var(--ausente-bg)','var(--ausente)'],
          ['T',counts.T,'var(--tarde-bg)','var(--tarde)'],
          ['J',counts.J,'var(--justificado-bg)','var(--justificado)']].map(([l,n,bg,c]) => (
          <div key={l} className="att-pill" style={{ background:bg, color:c }}>{l}  {n}</div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        <button className="btn btn-success btn-sm" style={{ flex:1 }} onClick={() => markAll('P')}>
          Todos presentes
        </button>
        <button className="btn btn-danger btn-sm" style={{ flex:1 }} onClick={() => markAll('A')}>
          Todos ausentes
        </button>
      </div>

      <div style={{ fontSize:11, color:'var(--light)', textAlign:'center', marginBottom:10, fontWeight:600 }}>
        Toca el estado para cambiar · ✏ para añadir observación
      </div>

      {/* Athletes list */}
      <div style={{ background:'var(--surface)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)',
        overflow:'hidden', marginBottom:14 }}>
        {athletes.map((a, i) => {
          const isExpanded = expandedAthlete === a.id;
          const hasObs = savedObs.filter(o => o.athleteId === a.id).length > 0;
          return (
            <div key={a.id} style={{ borderBottom: i<athletes.length-1 ? '1px solid var(--bg)':undefined }}>
              {/* Athlete row */}
              <div className="athlete-row" style={{ background: isExpanded ? 'var(--bg)' : undefined }}>
                <div className="avatar avatar-sm"
                  style={{ background:`${sport?.color}20`, color:sport?.color }}>
                  {a.avatar}
                </div>
                <div className="athlete-info">
                  <div className="athlete-name">
                    {a.name}
                    {hasObs && <span style={{ fontSize:9, color:'var(--blue)', marginLeft:5,
                      fontWeight:800, background:'#dbeafe', padding:'1px 4px', borderRadius:4 }}>
                      obs
                    </span>}
                  </div>
                  <div className="athlete-course">{a.course}</div>
                </div>
                {/* Obs toggle button */}
                <button onClick={() => setExpandedAthlete(isExpanded ? null : a.id)}
                  style={{ background: isExpanded ? '#dbeafe' : 'var(--bg)',
                    border:'none', borderRadius:'var(--r-sm)', padding:'6px 8px',
                    color: isExpanded ? 'var(--blue)' : 'var(--light)', cursor:'pointer', flexShrink:0 }}
                  title="Observación">
                  <svg width="15" height="15"><Icon.Edit/></svg>
                </button>
                <AttBtn state={attRecords[a.id] || 'P'}
                  onChange={(s) => setAttRecords(p => ({ ...p, [a.id]: s }))}/>
              </div>

              {/* Expandable observation */}
              {isExpanded && (
                <div className="obs-expand">
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:8 }}>
                    Observación para {a.name.split(' ')[0]}
                  </div>
                  <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                    {[['general','General','#64748b'],['tecnica','Técnica','#2563eb'],
                      ['comportamiento','Comportam.','#9333ea']].map(([id,label,color]) => (
                      <button key={id}
                        onClick={() => setObsType(p => ({ ...p, [a.id]: id }))}
                        style={{ flex:1, padding:'6px 4px', borderRadius:'var(--r-sm)', fontSize:11,
                          fontWeight:700, border:`1.5px solid ${(obsType[a.id]||'general')===id ? color : 'var(--border)'}`,
                          background:(obsType[a.id]||'general')===id ? color+'15' : 'var(--surface)',
                          color:(obsType[a.id]||'general')===id ? color : 'var(--muted)', cursor:'pointer' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <textarea className="form-input form-textarea" rows={2}
                    placeholder="Ej: Buen trabajo en control de balón..."
                    value={obsText[a.id] || ''}
                    onChange={e => setObsText(p => ({ ...p, [a.id]: e.target.value }))}/>
                  <div style={{ display:'flex', gap:8, marginTop:8 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex:1 }}
                      onClick={() => setExpandedAthlete(null)}>Cancelar</button>
                    <button className="btn btn-primary btn-sm" style={{ flex:1 }}
                      onClick={() => saveObs(a.id)}
                      disabled={!obsText[a.id]?.trim()}>
                      Guardar obs.
                    </button>
                  </div>

                  {/* Previous obs for this athlete */}
                  {savedObs.filter(o => o.athleteId === a.id).length > 0 && (
                    <div style={{ marginTop:10, borderTop:'1px solid var(--border)', paddingTop:10 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:6 }}>
                        Observaciones anteriores
                      </div>
                      {savedObs.filter(o => o.athleteId === a.id && !o.isPrivate).map(o => (
                        <div key={o.id} style={{ fontSize:12, color:'var(--muted)', marginBottom:4,
                          paddingLeft:8, borderLeft:'2px solid var(--border)' }}>
                          {o.content}
                          <span style={{ color:'var(--light)', marginLeft:6 }}>· {timeAgo(o.createdAt)}</span>
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

      <button className="btn btn-primary btn-full" style={{ height:48, fontSize:15 }}
        onClick={saveAtt}>
        <svg width="15" height="15"><Icon.Check/></svg>
        Guardar lista{!online ? ' (offline)' : ''}
      </button>
    </>
  );
}

// ── ATHLETE DETAIL SHEET ─────────────────────────────────────

function AthleteSheet({ athlete, sport, observations, attRecords, onClose }) {
  const healthKey = athlete.id;
  import('../../lib/mockData').then(() => {});

  const attStatus = attRecords[athlete.id] || 'P';
  const statusLabel = { P:'Presente hoy', A:'Ausente hoy', T:'Tarde hoy', J:'Justificado' }[attStatus];
  const statusColor = { P:'var(--presente)', A:'var(--ausente)', T:'var(--tarde)', J:'var(--justificado)' }[attStatus];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"/>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div className="avatar avatar-xl"
            style={{ background:`${sport?.color}20`, color:sport?.color }}>
            {athlete.avatar}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, color:'var(--text)' }}>{athlete.name}</div>
            <div style={{ fontSize:13, color:'var(--muted)' }}>{athlete.course}</div>
            <div style={{ fontSize:12, fontWeight:700, color:statusColor, marginTop:2 }}>{statusLabel}</div>
          </div>
        </div>

        {observations.length > 0 && (
          <>
            <div className="section-label">Observaciones</div>
            {observations.map(o => (
              <div key={o.id} className="obs-card">
                <div className="obs-type" style={{ color:'var(--blue)' }}>
                  {{ tecnica:'Técnica', comportamiento:'Comportamiento', general:'General' }[o.type]}
                </div>
                <div className="obs-text">{o.content}</div>
                <div className="obs-meta">{timeAgo(o.createdAt)}</div>
              </div>
            ))}
          </>
        )}

        <button className="btn btn-ghost btn-full" style={{ marginTop:12 }} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

// Micro-import for Icon.Megaphone fix
Icon.Megaphone = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>);
