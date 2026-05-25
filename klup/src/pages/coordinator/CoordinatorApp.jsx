// ============================================================
// KLUP — Coordinator Panel v4 (full feature set)
// ============================================================
import { useState } from 'react';
import { useAuth, useTheme, useOnlineStatus } from '../../contexts/AuthContext';
import { Icon, Avatar, OfflineBanner, EmptyState } from '../../components/ui/index';
import { SPORTS, GROUPS, COACHES, ATHLETES, POSTS, PENDING_REQUESTS,
         CENTER, getSportByGroupId, timeAgo } from '../../lib/mockData';
import FinanzasTab    from './FinanzasTab';
import CenterCalendar from '../../components/CenterCalendar';
import Messaging      from '../../components/Messaging';

Icon.Megaphone = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>);
Icon.Euro      = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M4 14h12M19.5 8a7.5 7.5 0 1 0 0 8"/></svg>);
Icon.Database  = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>);
Icon.Season    = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>);
Icon.Folder    = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>);
Icon.Warning   = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);

// ── Resources Section ─────────────────────────────────────────

const INITIAL_RESOURCES = [
  { id:'rec1', sportId:'all', name:'Protocolo de calentamiento general.pdf', size:'1.2 MB', uploadedAt:new Date(Date.now()-5*86400000) },
  { id:'rec2', sportId:'s1',  name:'Técnica individual — Fútbol.pdf',        size:'3.4 MB', uploadedAt:new Date(Date.now()-10*86400000) },
  { id:'rec3', sportId:'s1',  name:'Ejercicios de pase corto.pdf',           size:'2.1 MB', uploadedAt:new Date(Date.now()-15*86400000) },
  { id:'rec4', sportId:'s2',  name:'Fundamentos del voley — Principiantes.pdf', size:'1.8 MB', uploadedAt:new Date(Date.now()-8*86400000) },
  { id:'rec5', sportId:'s3',  name:'Rutinas de rítmica benjamín.pdf',        size:'4.2 MB', uploadedAt:new Date(Date.now()-12*86400000) },
  { id:'rec6', sportId:'s5',  name:'Kata básicos karate.pdf',                size:'2.7 MB', uploadedAt:new Date(Date.now()-20*86400000) },
  { id:'rec7', sportId:'s4',  name:'Circuitos FitKids — Nivel 1.pdf',       size:'1.5 MB', uploadedAt:new Date(Date.now()-7*86400000) },
];

function ResourcesSection({ sports, docSearch }) {
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [expandedSport, setExpandedSport] = useState('all');
  const [uploadingSport, setUploadingSport] = useState(null);
  const [newResName, setNewResName] = useState('');

  const addResource = (sportId) => {
    if (!newResName.trim()) return;
    setResources(prev => [...prev, {
      id: 'rec'+Date.now(), sportId,
      name: newResName.trim() + (newResName.includes('.') ? '' : '.pdf'),
      size: '—', uploadedAt: new Date()
    }]);
    setNewResName(''); setUploadingSport(null);
  };

  const sportBuckets = [
    { id:'all', name:'Todos los entrenadores', color:'#64748b', bg:'#f1f5f9' },
    ...sports.map(s => ({ id:s.id, name:s.name, color:s.color, bg:s.bg })),
  ];

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', gap:10, margin:'20px 0 12px',
        padding:'12px 14px', background:'#f0f7ff', borderRadius:'var(--r-md)',
        border:'1px solid #bfdbfe' }}>
        <svg width="18" height="18" style={{ color:'#2563eb', flexShrink:0 }}><Icon.Folder/></svg>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:'#1e40af' }}>Recursos para entrenadores</div>
          <div style={{ fontSize:12, color:'#3b82f6' }}>
            PDFs y archivos que los entrenadores pueden descargar desde su panel
          </div>
        </div>
      </div>

      {sportBuckets.map(bucket => {
        const bucketRes = resources.filter(r =>
          r.sportId === bucket.id &&
          (!docSearch || r.name.toLowerCase().includes(docSearch.toLowerCase()))
        );
        const isExp = expandedSport === bucket.id;

        return (
          <div key={bucket.id} style={{ background:'var(--surface)', borderRadius:'var(--r-md)',
            border:`1.5px solid ${bucket.color}25`, marginBottom:8, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', cursor:'pointer' }}
              onClick={() => setExpandedSport(isExp ? null : bucket.id)}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:bucket.color, flexShrink:0 }}/>
              <span style={{ fontSize:14, fontWeight:700, color:bucket.color, flex:1 }}>{bucket.name}</span>
              <span style={{ fontSize:12, color:'var(--muted)' }}>{bucketRes.length} archivo{bucketRes.length!==1?'s':''}</span>
              <svg width="14" height="14" style={{ color:'var(--muted)',
                transform:isExp?'rotate(180deg)':'none', transition:'transform .2s' }}>
                <Icon.ChevronDown/>
              </svg>
            </div>

            {isExp && (
              <div style={{ borderTop:'1px solid var(--border)' }}>
                {bucketRes.length === 0 ? (
                  <div style={{ padding:'14px', fontSize:13, color:'var(--light)', textAlign:'center' }}>
                    Sin recursos en esta categoría
                  </div>
                ) : bucketRes.map(res => (
                  <div key={res.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                    borderBottom:'1px solid var(--bg)' }}>
                    <div style={{ width:32, height:32, background:`${bucket.color}15`, borderRadius:'var(--r-sm)',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="16" height="16" style={{ color:bucket.color }}><Icon.File/></svg>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }} className="truncate">
                        {res.name}
                      </div>
                      <div style={{ fontSize:11, color:'var(--muted)' }}>
                        {res.size} · {timeAgo(res.uploadedAt)}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm">↓</button>
                    <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--light)', padding:4 }}
                      onClick={() => setResources(r => r.filter(x => x.id !== res.id))}>
                      <svg width="13" height="13"><Icon.X/></svg>
                    </button>
                  </div>
                ))}

                {/* Add resource */}
                {uploadingSport === bucket.id ? (
                  <div style={{ display:'flex', gap:8, padding:'10px 14px', borderTop:'1px solid var(--bg)' }}>
                    <input className="form-input" style={{ flex:1, height:34, fontSize:12 }}
                      placeholder="Nombre del archivo (ej: Calentamiento fútbol.pdf)"
                      value={newResName} onChange={e => setNewResName(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && addResource(bucket.id)} autoFocus/>
                    <button className="btn btn-primary btn-sm" onClick={() => addResource(bucket.id)}>Añadir</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setUploadingSport(null); setNewResName(''); }}>
                      <svg width="12" height="12"><Icon.X/></svg>
                    </button>
                  </div>
                ) : (
                  <button style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 14px',
                    fontSize:13, color:bucket.color, fontWeight:700, background:'none', border:'none', cursor:'pointer' }}
                    onClick={() => setUploadingSport(bucket.id)}>
                    <svg width="13" height="13"><Icon.Plus/></svg>
                    Subir recurso para {bucket.name === 'Todos los entrenadores' ? 'todos' : `entrenadores de ${bucket.name}`}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

const NAV_GROUPS = [
  { label:'Gestión', items:[
    { id:'dashboard',  label:'Inicio',       icon:<Icon.Home/> },
    { id:'athletes',   label:'Atletas',       icon:<Icon.Database/> },
    { id:'groups',     label:'Grupos',        icon:<Icon.Grid/> },
    { id:'season',     label:'Temporada',     icon:<Icon.Season/> },
  ]},
  { label:'Comunicación', items:[
    { id:'requests',   label:'Solicitudes',   icon:<Icon.Bell/> },
    { id:'messages',   label:'Mensajes',      icon:<Icon.Megaphone/> },
    { id:'calendar',   label:'Calendario',    icon:<Icon.Calendar/> },
  ]},
  { label:'Centro', items:[
    { id:'finanzas',   label:'Finanzas',      icon:<Icon.Euro/> },
    { id:'documents',  label:'Documentos',    icon:<Icon.Folder/> },
    { id:'incidents',  label:'Incidencias',   icon:<Icon.Warning/> },
    
    { id:'settings',   label:'Ajustes',       icon:<Icon.Settings/> },
  ]},
];

const ALL_TABS = NAV_GROUPS.flatMap(g => g.items);

// Mock documents
const MOCK_DOCS = [
  { id:'d1', name:'Reglamento interno 2024-25.pdf', size:'245 KB', cat:'reglamento', uploadedAt: new Date(Date.now()-30*86400000) },
  { id:'d2', name:'Formulario inscripción.pdf', size:'89 KB', cat:'inscripcion', uploadedAt: new Date(Date.now()-60*86400000) },
  { id:'d3', name:'Consentimiento imagen menores.pdf', size:'120 KB', cat:'rgpd', uploadedAt: new Date(Date.now()-60*86400000) },
  { id:'d4', name:'Protocolo lesiones.pdf', size:'310 KB', cat:'seguridad', uploadedAt: new Date(Date.now()-45*86400000) },
];

// Mock incidents
const MOCK_INCIDENTS_ALL = [
  { id:'i1', athleteId:'a1', coachId:'c1', groupId:'g1', type:'lesion', severity:'leve',
    description:'Esguince de tobillo derecho durante carrera. Aplicado hielo y comunicado a familia.',
    date:'2025-05-15', resolved:true },
  { id:'i2', athleteId:'a5', coachId:'c1', groupId:'g1', type:'comportamiento', severity:'medio',
    description:'Discusión con compañero. Se habló con ambos y con las familias.',
    date:'2025-05-10', resolved:true },
  { id:'i3', athleteId:'a16', coachId:'c1', groupId:'g4', type:'lesion', severity:'grave',
    description:'Caída al saltar. Posible contusión en rodilla. Derivada a médico.',
    date:'2025-05-20', resolved:false },
];

export default function CoordinatorApp() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const online = useOnlineStatus();

  const [tab, setTab]           = useState('dashboard');
  const [requests, setRequests] = useState(PENDING_REQUESTS);
  const [sports, setSports]     = useState(SPORTS);
  const [groups, setGroups]     = useState(GROUPS);
  const [expandedSport, setExpandedSport] = useState(null);
  const [toast, setToast]       = useState('');
  const [addingSport, setAddingSport]     = useState(false);
  const [newSportName, setNewSportName]   = useState('');
  const [addingGroupFor, setAddingGroupFor] = useState(null);
  const [newGroupName, setNewGroupName]     = useState('');

  // Athletes DB
  const [athleteSearch, setAthleteSearch] = useState('');
  const [athleteSportFilter, setAthleteSportFilter] = useState('all');
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  // Documents
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [docSearch, setDocSearch] = useState('');

  // Incidents
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS_ALL);
  const [newIncident, setNewIncident] = useState({ athleteId:'', type:'lesion', severity:'leve', description:'', date:new Date().toISOString().slice(0,10) });
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const handleApprove = (id) => { setRequests(r => r.filter(x => x.id !== id)); showToast('Aprobado'); };
  const handleReject  = (id) => { setRequests(r => r.filter(x => x.id !== id)); showToast('Rechazado'); };

  const addSport = () => {
    if (!newSportName.trim()) return;
    const id = 's'+Date.now();
    setSports(s => [...s, { id, name:newSportName.trim(), color:'#64748b', bg:'#f1f5f9', groups:[] }]);
    setNewSportName(''); setAddingSport(false);
    showToast(`Deporte "${newSportName}" creado`);
  };

  const addGroup = (sportId) => {
    if (!newGroupName.trim()) return;
    const id = 'g'+Date.now();
    setGroups(g => ({ ...g, [id]: { id, sportId, name:newGroupName.trim(), count:0, coachId:null } }));
    setSports(s => s.map(sp => sp.id===sportId ? { ...sp, groups:[...sp.groups, id] } : sp));
    setNewGroupName(''); setAddingGroupFor(null);
    showToast(`Grupo "${newGroupName}" creado`);
  };

  const saveIncident = () => {
    if (!newIncident.athleteId || !newIncident.description) return;
    setIncidents(prev => [{ id:'i'+Date.now(), ...newIncident, resolved:false }, ...prev]);
    setNewIncident({ athleteId:'', type:'lesion', severity:'leve', description:'', date:new Date().toISOString().slice(0,10) });
    setShowIncidentForm(false);
    showToast('Incidencia registrada');
  };

  const pendingCount  = requests.length;
  const totalAthletes = Object.values(groups).reduce((acc,g) => acc+(g.count||0), 0);
  const recentPosts   = [...POSTS].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);

  const filteredAthletes = ATHLETES.filter(a => {
    const matchSearch = !athleteSearch ||
      a.name.toLowerCase().includes(athleteSearch.toLowerCase()) ||
      a.course.toLowerCase().includes(athleteSearch.toLowerCase());
    const matchSport = athleteSportFilter === 'all' ||
      GROUPS[a.groupId]?.sportId === athleteSportFilter;
    return matchSearch && matchSport;
  });

  const unresolvedIncidents = incidents.filter(i => !i.resolved).length;

  return (
    <div className="app-shell">
      {!online && <OfflineBanner/>}

      {/* ── SIDEBAR ── */}
      <aside className="app-sidebar">
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo">Klup</div>
          <div className="sidebar-logo-sub">{CENTER.name}</div>
        </div>
        <nav className="sidebar-nav">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <div className="sidebar-section-label">{group.label}</div>
              {group.items.map(t => (
                <button key={t.id} className={`sidebar-nav-item ${tab===t.id?'active':''}`}
                  onClick={() => setTab(t.id)}>
                  <svg>{t.icon}</svg>
                  {t.label}
                  {t.id==='requests' && pendingCount>0 && <span className="s-badge">{pendingCount}</span>}
                  {t.id==='incidents' && unresolvedIncidents>0 && <span className="s-badge" style={{ background:'var(--tarde)' }}>{unresolvedIncidents}</span>}
                </button>
              ))}
              <div className="sidebar-divider"/>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontSize:11, color:'var(--light)', marginBottom:8, fontWeight:600 }}>{CENTER.season.name}</div>
          <div className="sidebar-user">
            <div className="avatar avatar-md" style={{ background:'#dbeafe', color:'#2563eb' }}>{user?.avatar||'AC'}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">Coordinador</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button className="theme-toggle" style={{ background:'var(--bg)', border:'1px solid var(--border)',
              color:'var(--muted)', width:34, height:34 }} onClick={toggle}>
              <svg width="15" height="15">{theme==='dark'?<Icon.Sun/>:<Icon.Moon/>}</svg>
            </button>
            <button style={{ flex:1, display:'flex', alignItems:'center', gap:6, padding:'8px 10px',
              borderRadius:'var(--r-md)', border:'1px solid var(--border)', background:'none',
              color:'var(--ausente)', fontSize:12, fontWeight:600, cursor:'pointer' }} onClick={logout}>
              <svg width="14" height="14"><Icon.Logout/></svg> Salir
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="app-main">
        <header className="page-header mobile-only">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div className="header-klup-tag">KLUP</div>
              <div className="header-title">Coordinador</div>
              <div className="header-subtitle">{CENTER.name}</div>
            </div>
            <button className="theme-toggle" onClick={toggle}>
              <svg width="16" height="16">{theme==='dark'?<Icon.Sun/>:<Icon.Moon/>}</svg>
            </button>
          </div>
          <div className="header-pills">
            <span className="header-pill">{totalAthletes} atletas</span>
            {pendingCount>0 && <span className="header-pill warning">{pendingCount} solicitudes</span>}
          </div>
        </header>

        <div className="desktop-header">
          <span className="desktop-header-title">{ALL_TABS.find(t=>t.id===tab)?.label}</span>
          <span className="desktop-header-sub">{CENTER.name} · {CENTER.season.name}</span>
        </div>

        <div className="tab-bar mobile-only" style={{ overflowX:'auto' }}>
          {ALL_TABS.slice(0,6).map(t => (
            <button key={t.id} className={`tab-item ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="page-content">
          {toast && <div className="toast-success"><svg width="15" height="15"><Icon.Check/></svg>{toast}</div>}

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <>
              <div className="desktop-grid-4 grid-2" style={{ marginBottom:16 }}>
                <div className="stat-big"><div className="stat-big-num">{totalAthletes}</div><div className="stat-big-label">Atletas</div></div>
                <div className="stat-big"><div className="stat-big-num">{Object.keys(groups).length}</div><div className="stat-big-label">Grupos</div></div>
                <div className="stat-big"><div className="stat-big-num">{COACHES.length}</div><div className="stat-big-label">Entrenadores</div></div>
                <div className="stat-big" style={{ background:pendingCount>0?'var(--pendiente-bg)':undefined }}>
                  <div className="stat-big-num" style={{ color:pendingCount>0?'var(--tarde)':undefined }}>{pendingCount}</div>
                  <div className="stat-big-label">Pendientes</div>
                </div>
              </div>
              {unresolvedIncidents > 0 && (
                <div className="warning-banner" style={{ cursor:'pointer' }} onClick={() => setTab('incidents')}>
                  <svg width="15" height="15"><Icon.Warning/></svg>
                  {unresolvedIncidents} incidencia{unresolvedIncidents>1?'s':''} sin resolver
                </div>
              )}
              <div className="section-label">Deportes</div>
              <div className="desktop-grid-3 grid-2" style={{ marginBottom:16 }}>
                {sports.map((s) => {
                  const ac = s.groups.reduce((acc,gid)=>acc+(groups[gid]?.count||0),0);
                  const pct = totalAthletes > 0 ? Math.round((ac/totalAthletes)*100) : 0;
                  return (
                    <div key={s.id} className="sport-card" style={{ borderColor:s.color }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <span className="sport-dot" style={{ background:s.color }}/>
                        <span className="sport-card-name" style={{ color:s.color }}>{s.name}</span>
                        <span style={{ marginLeft:'auto', fontSize:11, fontWeight:800, color:s.color }}>{pct}%</span>
                      </div>
                      <div style={{ height:4, background:'var(--border)', borderRadius:99, marginBottom:4, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:s.color, borderRadius:99 }}/>
                      </div>
                      <div className="sport-card-info">{s.groups.length} grupos · {ac} atletas · {pct}% del centro</div>
                    </div>
                  );
                })}
              </div>
              <div className="section-label">Últimas publicaciones</div>
              <div style={{ background:'var(--surface)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>
                {recentPosts.map((post,i) => {
                  const sport = getSportByGroupId(post.groupId);
                  const group = groups[post.groupId];
                  const coach = COACHES.find(c => c.id === post.coachId);
                  const badgeClass = { noticia:'badge-noticia',foto:'badge-foto',evento:'badge-evento',resultado:'badge-resultado' }[post.type];
                  return (
                    <div key={post.id} style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:10,
                      borderBottom:i<recentPosts.length-1?'1px solid var(--bg)':undefined }}>
                      <span className="sport-dot" style={{ background:sport?.color||'#64748b', flexShrink:0 }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                          <span className={`badge ${badgeClass}`}>{post.type}</span>
                          <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', flex:1 }} className="truncate">{post.title}</span>
                        </div>
                        <div style={{ fontSize:11, color:'var(--light)', marginTop:1 }}>{sport?.name} · {group?.name} · {coach?.name}</div>
                      </div>
                      <span style={{ fontSize:11, color:'var(--light)', flexShrink:0 }}>{timeAgo(post.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── ATHLETES DB ── */}
          {tab === 'athletes' && (
            <>
              <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                <input className="form-input" style={{ flex:1, minWidth:180 }}
                  placeholder="Buscar por nombre o curso…"
                  value={athleteSearch} onChange={e => setAthleteSearch(e.target.value)}/>
                <select className="form-input form-select" style={{ width:'auto' }}
                  value={athleteSportFilter} onChange={e => setAthleteSportFilter(e.target.value)}>
                  <option value="all">Todos los deportes</option>
                  {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10 }}>
                {filteredAthletes.length} atleta{filteredAthletes.length!==1?'s':''} encontrado{filteredAthletes.length!==1?'s':''}
              </div>
              <div style={{ background:'var(--surface)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ background:'var(--bg)' }}>
                        {['Atleta','Curso','Deporte','Grupo','Entrenador','Estado',''].map(h => (
                          <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontSize:11,
                            fontWeight:700, color:'var(--muted)', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAthletes.map((a,i) => {
                        const sport = getSportByGroupId(a.groupId);
                        const group = GROUPS[a.groupId];
                        const coach = COACHES.find(c => c.id === group?.coachId);
                        return (
                          <tr key={a.id} style={{ borderTop:'1px solid var(--bg)',
                            background: selectedAthlete?.id===a.id ? '#f0f7ff' : undefined }}>
                            <td style={{ padding:'9px 14px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div className="avatar avatar-sm"
                                  style={{ background:`${sport?.color}20`, color:sport?.color }}>
                                  {a.avatar}
                                </div>
                                <span style={{ fontWeight:600, color:'var(--text)' }}>{a.name}</span>
                              </div>
                            </td>
                            <td style={{ padding:'9px 14px', color:'var(--muted)' }}>{a.course}</td>
                            <td style={{ padding:'9px 14px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                <span className="sport-dot" style={{ background:sport?.color }}/>
                                <span style={{ color:sport?.color, fontWeight:600 }}>{sport?.name}</span>
                              </div>
                            </td>
                            <td style={{ padding:'9px 14px', color:'var(--muted)' }}>{group?.name}</td>
                            <td style={{ padding:'9px 14px', color:'var(--muted)' }}>{coach?.name||'—'}</td>
                            <td style={{ padding:'9px 14px' }}>
                              <span style={{ background:'var(--presente-bg)', color:'var(--presente)',
                                fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99 }}>Activo</span>
                            </td>
                            <td style={{ padding:'9px 14px' }}>
                              <button style={{ fontSize:11, color:'var(--blue)', fontWeight:700,
                                background:'none', border:'none', cursor:'pointer' }}
                                onClick={() => setSelectedAthlete(selectedAthlete?.id===a.id ? null : a)}>
                                {selectedAthlete?.id===a.id ? 'Cerrar' : 'Ver'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Athlete detail panel */}
              {selectedAthlete && (() => {
                const sport = getSportByGroupId(selectedAthlete.groupId);
                const group = GROUPS[selectedAthlete.groupId];
                const coach = COACHES.find(c => c.id === group?.coachId);
                return (
                  <div style={{ marginTop:14, background:'var(--surface)', borderRadius:'var(--r-lg)',
                    border:`1.5px solid ${sport?.color}40`, padding:'16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                      <div className="avatar avatar-lg" style={{ background:`${sport?.color}20`, color:sport?.color }}>
                        {selectedAthlete.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize:17, fontWeight:800, color:'var(--text)' }}>{selectedAthlete.name}</div>
                        <div style={{ fontSize:12, color:'var(--muted)' }}>
                          {sport?.name} · {group?.name} · {selectedAthlete.course}
                        </div>
                        <div style={{ fontSize:12, color:'var(--muted)' }}>Entrenador: {coach?.name||'—'}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-ghost btn-sm" style={{ flex:1 }}>Cambiar grupo</button>
                      <button className="btn btn-ghost btn-sm" style={{ flex:1 }}>Ver informe</button>
                      <button className="btn btn-danger btn-sm" style={{ flex:1 }}>Dar de baja</button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* ── GROUPS ── */}
          {tab === 'groups' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div className="section-label" style={{ marginBottom:0 }}>
                  {sports.length} deportes · {Object.keys(groups).length} grupos
                </div>
                <button className="btn btn-info btn-sm" onClick={() => setAddingSport(s=>!s)}>
                  <svg width="13" height="13"><Icon.Plus/></svg> Deporte
                </button>
              </div>
              {addingSport && (
                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  <input className="form-input" style={{ flex:1 }} placeholder="Nombre del deporte"
                    value={newSportName} onChange={e => setNewSportName(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && addSport()} autoFocus/>
                  <button className="btn btn-primary btn-sm" onClick={addSport}>Añadir</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setAddingSport(false); setNewSportName(''); }}>
                    <svg width="12" height="12"><Icon.X/></svg>
                  </button>
                </div>
              )}
              {sports.map(sport => {
                const isExp = expandedSport === sport.id;
                const sportGroups = sport.groups.map(gid => groups[gid]).filter(Boolean);
                return (
                  <div key={sport.id} className="card" style={{ padding:0, marginBottom:10, border:`1.5px solid ${sport.color}25` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', cursor:'pointer' }}
                      onClick={() => setExpandedSport(isExp?null:sport.id)}>
                      <span className="sport-dot-lg" style={{ background:sport.color }}/>
                      <span style={{ fontSize:15, fontWeight:800, color:sport.color, flex:1 }}>{sport.name}</span>
                      <span style={{ fontSize:12, color:'var(--muted)' }}>
                        {sportGroups.length} grupos · {sportGroups.reduce((a,g)=>a+(g.count||0),0)} atletas
                      </span>
                      <svg width="15" height="15" style={{ color:'var(--muted)', transform:isExp?'rotate(180deg)':'none', transition:'transform .2s' }}>
                        <Icon.ChevronDown/>
                      </svg>
                    </div>
                    {isExp && (
                      <div style={{ borderTop:'1px solid var(--border)' }}>
                        <div style={{ overflowX:'auto' }}>
                          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                            <thead><tr style={{ background:'var(--bg)' }}>
                              {['Grupo','Entrenador','Atletas','Asistencia',''].map(h => (
                                <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--muted)' }}>{h}</th>
                              ))}
                            </tr></thead>
                            <tbody>
                              {sportGroups.map(g => {
                                const coach = COACHES.find(c=>c.id===g.coachId);
                                const pct = Math.round(78+(g.count||0)%3*5);
                                return (
                                  <tr key={g.id} style={{ borderTop:'1px solid var(--bg)' }}>
                                    <td style={{ padding:'9px 14px', fontWeight:600, color:'var(--text)' }}>{g.name}</td>
                                    <td style={{ padding:'9px 14px', color:'var(--muted)' }}>{coach?.name||'—'}</td>
                                    <td style={{ padding:'9px 14px', fontWeight:700, color:'var(--text)' }}>{g.count||0}</td>
                                    <td style={{ padding:'9px 14px' }}>
                                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                        <div style={{ width:60, height:5, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                                          <div style={{ height:'100%', width:`${pct}%`, background:sport.color, borderRadius:99 }}/>
                                        </div>
                                        <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{pct}%</span>
                                      </div>
                                    </td>
                                    <td style={{ padding:'9px 14px' }}>
                                      <button style={{ fontSize:11, color:'var(--blue)', fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>Ver</button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {addingGroupFor===sport.id ? (
                          <div style={{ display:'flex', gap:8, padding:'10px 14px', borderTop:'1px solid var(--bg)' }}>
                            <input className="form-input" style={{ flex:1, height:36 }} placeholder="Nombre del grupo"
                              value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                              onKeyDown={e => e.key==='Enter' && addGroup(sport.id)} autoFocus/>
                            <button className="btn btn-primary btn-sm" onClick={() => addGroup(sport.id)}>Crear</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setAddingGroupFor(null); setNewGroupName(''); }}>
                              <svg width="12" height="12"><Icon.X/></svg>
                            </button>
                          </div>
                        ) : (
                          <div style={{ padding:'10px 14px', borderTop:'1px solid var(--bg)' }}>
                            <button style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:sport.color,
                              fontWeight:700, background:'none', border:'none', cursor:'pointer' }}
                              onClick={() => setAddingGroupFor(sport.id)}>
                              <svg width="14" height="14"><Icon.Plus/></svg>
                              Añadir grupo de {sport.name}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── SEASON ── */}
          {tab === 'season' && (
            <>
              <div className="card" style={{ marginBottom:16, border:'1.5px solid #bfdbfe', background:'#f0f7ff' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#3b82f6', marginBottom:4 }}>TEMPORADA ACTIVA</div>
                <div style={{ fontSize:20, fontWeight:900, color:'#1e40af' }}>{CENTER.season.name}</div>
                <div style={{ fontSize:13, color:'#3b82f6', marginTop:4 }}>
                  {CENTER.season.startDate} — {CENTER.season.endDate} · {totalAthletes} atletas
                </div>
              </div>
              <div className="section-label">Estado de inscripciones</div>
              <div className="grid-2" style={{ marginBottom:16 }}>
                <div className="stat-big"><div className="stat-big-num">{totalAthletes}</div><div className="stat-big-label">Atletas activos</div></div>
                <div className="stat-big"><div className="stat-big-num">{pendingCount}</div><div className="stat-big-label">Pendientes aprobación</div></div>
                <div className="stat-big"><div className="stat-big-num">{Object.keys(groups).length}</div><div className="stat-big-label">Grupos activos</div></div>
                <div className="stat-big"><div className="stat-big-num">2</div><div className="stat-big-label">En lista de espera</div></div>
              </div>
              <div className="section-label">Temporadas anteriores</div>
              {[{name:'Temporada 2023-24', athletes:112, end:'Jun 2024'},{name:'Temporada 2022-23', athletes:98, end:'Jun 2023'}].map((s,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
                  background:'var(--surface)', borderRadius:'var(--r-md)', marginBottom:8, border:'1px solid var(--border)' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{s.name}</div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>{s.athletes} atletas · cerrada {s.end}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm">Ver archivo</button>
                </div>
              ))}
              <div style={{ marginTop:16 }}>
                <button className="btn btn-primary btn-full">
                  + Crear nueva temporada 2025-26
                </button>
              </div>
            </>
          )}

          {/* ── REQUESTS ── */}
          {tab === 'requests' && (
            <>
              {requests.length === 0 ? (
                <EmptyState icon={<Icon.Check/>} title="Todo al día" text="No hay solicitudes pendientes"/>
              ) : ['coach','family'].map(type => {
                const filtered = requests.filter(r => r.type===type);
                if (!filtered.length) return null;
                return (
                  <div key={type}>
                    <div className="section-label">{type==='coach'?'Entrenadores':'Familias'}</div>
                    {filtered.map(r => {
                      const sport = SPORTS.find(s=>s.id===r.sportId);
                      return (
                        <div key={r.id} className="approval-card">
                          <div className="approval-header">
                            <div className="avatar avatar-md" style={{ background:'#dbeafe', color:'#2563eb' }}>{r.avatar}</div>
                            <div className="approval-info">
                              <div className="approval-name">{r.name}</div>
                              <div className="approval-email">{r.email}</div>
                            </div>
                            <span className="badge badge-rol">{type==='family'?'Familia':'Entrenador'}</span>
                          </div>
                          {type==='family' && (
                            <div className="approval-details">
                              <strong>Atleta:</strong> {r.athleteName} · {r.athleteCourse}<br/>
                              <strong>Grupo:</strong> {groups[r.groupId]?.name}
                            </div>
                          )}
                          <div className="approval-actions">
                            <button className="btn btn-success btn-sm" style={{ flex:1 }} onClick={() => handleApprove(r.id)}>Aprobar</button>
                            <button className="btn btn-danger btn-sm"  style={{ flex:1 }} onClick={() => handleReject(r.id)}>Rechazar</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}

          {/* ── MESSAGES ── */}
          {tab === 'messages' && (
            <Messaging myId="u0" myRole="coordinator"/>
          )}

          {/* ── CALENDAR ── */}
          {tab === 'calendar' && <CenterCalendar/>}

          {/* ── FINANZAS ── */}
          {tab === 'finanzas' && <FinanzasTab/>}

          {/* ── DOCUMENTS ── */}
          {tab === 'documents' && (
            <>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                <input className="form-input" style={{ flex:1 }} placeholder="Buscar documento…"
                  value={docSearch} onChange={e => setDocSearch(e.target.value)}/>
                <button className="btn btn-primary btn-sm">
                  <svg width="13" height="13"><Icon.Plus/></svg> Subir
                </button>
              </div>

              {/* Centro docs */}
              {[['rgpd','RGPD'],['inscripcion','Inscripción'],['reglamento','Reglamento'],['seguridad','Seguridad']].map(([cat,label]) => {
                const catDocs = docs.filter(d => d.cat===cat && (!docSearch || d.name.toLowerCase().includes(docSearch.toLowerCase())));
                if (!catDocs.length) return null;
                return (
                  <div key={cat}>
                    <div className="section-label">{label}</div>
                    {catDocs.map(doc => (
                      <div key={doc.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
                        background:'var(--surface)', borderRadius:'var(--r-md)', marginBottom:6, border:'1px solid var(--border)' }}>
                        <div style={{ width:36, height:36, background:'#fee2e2', borderRadius:'var(--r-sm)',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <svg width="18" height="18" style={{ color:'#dc2626' }}><Icon.File/></svg>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{doc.name}</div>
                          <div style={{ fontSize:11, color:'var(--muted)' }}>{doc.size} · {timeAgo(doc.uploadedAt)}</div>
                        </div>
                        <button className="btn btn-ghost btn-sm">Descargar</button>
                        <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--light)', padding:4 }}
                          onClick={() => setDocs(d => d.filter(x => x.id!==doc.id))}>
                          <svg width="14" height="14"><Icon.X/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Recursos para entrenadores */}
              <ResourcesSection sports={sports} docSearch={docSearch}/>
            </>
          )}

          {/* ── INCIDENTS ── */}
          {tab === 'incidents' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div>
                  {unresolvedIncidents > 0 && (
                    <div style={{ fontSize:12, color:'var(--tarde)', fontWeight:600 }}>
                      {unresolvedIncidents} incidencia{unresolvedIncidents>1?'s':''} sin resolver
                    </div>
                  )}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowIncidentForm(s=>!s)}>
                  <svg width="13" height="13"><Icon.Plus/></svg> Registrar
                </button>
              </div>

              {showIncidentForm && (
                <div className="card" style={{ marginBottom:16 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:12 }}>Nueva incidencia</div>
                  <div className="form-group">
                    <label className="form-label">Atleta</label>
                    <select className="form-input form-select" value={newIncident.athleteId}
                      onChange={e => setNewIncident(p=>({...p,athleteId:e.target.value}))}>
                      <option value="">Seleccionar atleta</option>
                      {ATHLETES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Tipo</label>
                      <select className="form-input form-select" value={newIncident.type}
                        onChange={e => setNewIncident(p=>({...p,type:e.target.value}))}>
                        <option value="lesion">Lesión</option>
                        <option value="comportamiento">Comportamiento</option>
                        <option value="instalacion">Instalación</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gravedad</label>
                      <select className="form-input form-select" value={newIncident.severity}
                        onChange={e => setNewIncident(p=>({...p,severity:e.target.value}))}>
                        <option value="leve">Leve</option>
                        <option value="medio">Medio</option>
                        <option value="grave">Grave</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-input form-textarea" rows={3}
                      value={newIncident.description}
                      onChange={e => setNewIncident(p=>({...p,description:e.target.value}))}
                      placeholder="Describe qué ocurrió, cómo se actuó y si se comunicó a la familia…"/>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={() => setShowIncidentForm(false)}>Cancelar</button>
                    <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={saveIncident}
                      disabled={!newIncident.athleteId || !newIncident.description}>
                      Guardar incidencia
                    </button>
                  </div>
                </div>
              )}

              {incidents.map(inc => {
                const athlete = ATHLETES.find(a => a.id === inc.athleteId);
                const sport = getSportByGroupId(inc.groupId);
                const sev = { leve:'#16a34a', medio:'#d97706', grave:'#dc2626' }[inc.severity];
                const sevLabel = { leve:'Leve', medio:'Medio', grave:'Grave' }[inc.severity];
                const typeLabel = { lesion:'Lesión', comportamiento:'Comportamiento', instalacion:'Instalación', otro:'Otro' }[inc.type];
                return (
                  <div key={inc.id} style={{ background:'var(--surface)', borderRadius:'var(--r-md)',
                    border:`1px solid ${inc.resolved?'var(--border)':sev+'40'}`, padding:'12px 14px', marginBottom:8,
                    opacity:inc.resolved?.7:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <div className="avatar avatar-sm" style={{ background:`${sport?.color}20`, color:sport?.color }}>
                        {athlete?.avatar}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{athlete?.name}</div>
                        <div style={{ fontSize:11, color:'var(--muted)' }}>{inc.date}</div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99,
                        background:sev+'15', color:sev }}>{sevLabel}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99,
                        background:'var(--bg)', color:'var(--muted)' }}>{typeLabel}</span>
                    </div>
                    <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.5, marginBottom:8 }}>{inc.description}</div>
                    {!inc.resolved && (
                      <button className="btn btn-success btn-sm"
                        onClick={() => setIncidents(prev => prev.map(x => x.id===inc.id?{...x,resolved:true}:x))}>
                        Marcar como resuelta
                      </button>
                    )}
                    {inc.resolved && (
                      <span style={{ fontSize:11, color:'var(--presente)', fontWeight:600 }}>✓ Resuelta</span>
                    )}
                  </div>
                );
              })}
            </>
          )}
          {/* ── SETTINGS ── */}
          {tab === 'settings' && (
            <div className="card">
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:12 }}>Cuenta</div>
              <div style={{ fontSize:13, color:'var(--muted)', marginBottom:12 }}>
                <strong style={{ color:'var(--text)' }}>Email:</strong> {user?.email}
              </div>
              <button className="logout-btn" onClick={logout}>
                <svg width="15" height="15"><Icon.Logout/></svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        <nav className="bottom-nav mobile-only">
          {ALL_TABS.slice(0,5).map(t => (
            <button key={t.id} className={`nav-item ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
              {t.id==='requests' && pendingCount>0 && <span className="nav-badge"/>}
              <svg>{t.icon}</svg>
              <span style={{ fontSize:9 }}>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
