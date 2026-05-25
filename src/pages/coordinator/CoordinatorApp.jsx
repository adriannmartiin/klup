// ============================================================
// KLUP — Coordinator Panel (all tabs)
// ============================================================
import { useState } from 'react';
import { useAuth, useTheme, useOnlineStatus } from '../../contexts/AuthContext';
import { Icon, Avatar, SkeletonList, OfflineBanner, ApprovalCard, EmptyState, ProgressRing } from '../../components/ui/index';
import { SPORTS, GROUPS, COACHES, POSTS, PENDING_REQUESTS, WAITLIST, CENTER, ATHLETES, getSport, getSportByGroupId, timeAgo } from '../../lib/mockData';

const TABS = [
  { id:'dashboard',    label:'Inicio',     icon:<Icon.Home/> },
  { id:'requests',     label:'Solicitudes',icon:<Icon.Bell/> },
  { id:'management',   label:'Gestión',    icon:<Icon.Grid/> },
  { id:'stats',        label:'Stats',      icon:<Icon.Chart/> },
  { id:'comms',        label:'Comunicados',icon:<Icon.Megaphone/> },
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
  const [newSportName, setNewSportName]   = useState('');
  const [newGroupName, setNewGroupName]   = useState('');
  const [addingSport, setAddingSport]     = useState(false);
  const [addingGroupFor, setAddingGroupFor] = useState(null);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApprove = (id) => {
    setRequests(r => r.filter(x => x.id !== id));
    showToast('Solicitud aprobada — usuario notificado');
  };
  const handleReject = (id) => {
    setRequests(r => r.filter(x => x.id !== id));
    showToast('Solicitud rechazada');
  };

  const addSport = () => {
    if (!newSportName.trim()) return;
    const id = 's' + Date.now();
    setSports(s => [...s, { id, name:newSportName.trim(), color:'#64748b', bg:'#f1f5f9', groups:[] }]);
    setNewSportName('');
    setAddingSport(false);
    showToast(`Deporte "${newSportName}" añadido`);
  };

  const addGroup = (sportId) => {
    if (!newGroupName.trim()) return;
    const id = 'g' + Date.now();
    setGroups(g => ({ ...g, [id]: { id, sportId, name:newGroupName.trim(), count:0, maxCapacity:16, coachId:null } }));
    setSports(s => s.map(sp => sp.id===sportId ? { ...sp, groups:[...sp.groups, id] } : sp));
    setNewGroupName('');
    setAddingGroupFor(null);
    showToast(`Grupo "${newGroupName}" creado`);
  };

  const recentPosts = [...POSTS].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5);
  const pendingCount = requests.length;
  const totalAthletes = Object.values(groups).reduce((acc,g) => acc + (g.count||0), 0);

  return (
    <div className="app-shell">
      {!online && <OfflineBanner/>}
      {toast && <div className="toast-success"><svg width="16" height="16"><Icon.Check/></svg>{toast}</div>}

      {/* Header */}
      <header className="page-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div className="header-klup-tag">KLUP</div>
            <div className="header-title">Coordinador</div>
            <div className="header-subtitle">{CENTER.name}</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button className="theme-toggle" onClick={toggle} aria-label="Tema">
              <svg width="16" height="16">{theme==='dark' ? <Icon.Sun/> : <Icon.Moon/>}</svg>
            </button>
          </div>
        </div>
        <div className="header-pills">
          <span className="header-pill">{totalAthletes} atletas</span>
          <span className="header-pill">{COACHES.length} entrenadores</span>
          {pendingCount > 0 && <span className="header-pill warning">{pendingCount} solicitudes</span>}
          <span className="header-pill success">{CENTER.season.name}</span>
        </div>
      </header>

      {/* Tab bar */}
      <div className="tab-bar" role="tablist">
        {TABS.map(t => (
          <button key={t.id} className={`tab-item ${tab===t.id?'active':''}`}
            role="tab" aria-selected={tab===t.id} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id==='requests' && pendingCount > 0 && (
              <span style={{ background:'#dc2626', color:'white', borderRadius:99, padding:'1px 6px',
                fontSize:10, fontWeight:800, marginLeft:6 }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="page-content">

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <>
            {/* Stats grid */}
            <div className="grid-2" style={{ marginBottom:16 }}>
              <div className="stat-big">
                <div className="stat-big-num">{totalAthletes}</div>
                <div className="stat-big-label">Atletas activos</div>
              </div>
              <div className="stat-big">
                <div className="stat-big-num">{Object.keys(groups).length}</div>
                <div className="stat-big-label">Grupos activos</div>
              </div>
              <div className="stat-big">
                <div className="stat-big-num">{COACHES.length}</div>
                <div className="stat-big-label">Entrenadores</div>
              </div>
              <div className="stat-big" style={{ background: pendingCount>0 ? 'var(--pendiente-bg)':undefined }}>
                <div className="stat-big-num" style={{ color: pendingCount>0 ? 'var(--tarde)':undefined }}>{pendingCount}</div>
                <div className="stat-big-label">Pendientes</div>
              </div>
            </div>

            {/* Sports overview */}
            <div className="section-label">Deportes · {sports.length} activos</div>
            <div className="grid-2" style={{ marginBottom:16 }}>
              {sports.map(s => {
                const groupCount = s.groups.length;
                const athleteCount = s.groups.reduce((acc,gid) => acc + (groups[gid]?.count||0), 0);
                return (
                  <div key={s.id} className="sport-card" style={{ borderColor:s.color }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                      <span className="sport-dot" style={{ background:s.color }}/>
                      <span className="sport-card-name" style={{ color:s.color }}>{s.name}</span>
                    </div>
                    <div className="sport-card-info">{groupCount} grupo{groupCount!==1?'s':''} · {athleteCount} atletas</div>
                  </div>
                );
              })}
            </div>

            {/* Waitlist alerts */}
            {WAITLIST.length > 0 && (
              <>
                <div className="section-label">Lista de espera</div>
                {WAITLIST.map(w => {
                  const sport = getSportByGroupId(w.groupId);
                  return (
                    <div key={w.id} className="warning-banner">
                      <svg width="15" height="15"><Icon.Alert/></svg>
                      <span><strong>{w.athleteName}</strong> espera plaza en {sport?.name} · {groups[w.groupId]?.name}</span>
                    </div>
                  );
                })}
              </>
            )}

            {/* Attendance chart */}
            <div className="section-label">Asistencia esta semana</div>
            <div className="card" style={{ marginBottom:16 }}>
              <div className="bar-chart">
                {sports.map((s,i) => (
                  <div key={s.id} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div className="bar" style={{ background:s.color, height:`${[82,64,73,91,57,77][i]}%`, width:'100%' }}/>
                    <div className="bar-label">{s.name.slice(0,5)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent posts */}
            <div className="section-label">Últimas publicaciones</div>
            <div className="card" style={{ padding:0 }}>
              {recentPosts.map((post, i) => {
                const sport = getSportByGroupId(post.groupId);
                const group = groups[post.groupId];
                const coach = COACHES.find(c => c.id === post.coachId);
                return (
                  <div key={post.id} style={{ padding:'11px 14px', borderBottom: i<recentPosts.length-1 ? '1px solid var(--bg)':undefined }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                      <span className="sport-dot" style={{ background:sport?.color||'#64748b' }}/>
                      <span style={{ fontSize:11, fontWeight:700, color:sport?.color||'#64748b' }}>
                        {sport?.name} · {group?.name}
                      </span>
                      <span style={{ marginLeft:'auto', fontSize:11, color:'var(--light)' }}>{timeAgo(post.createdAt)}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{post.title}</div>
                    <div style={{ fontSize:11, color:'var(--light)', marginTop:2 }}>{coach?.name}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── REQUESTS ── */}
        {tab === 'requests' && (
          <>
            {requests.length === 0 ? (
              <EmptyState icon={<Icon.Check/>} title="Todo al día"
                text="No hay solicitudes pendientes de aprobación"/>
            ) : (
              <>
                {/* Coach requests */}
                {requests.filter(r => r.type==='coach').length > 0 && (
                  <>
                    <div className="section-label">Entrenadores</div>
                    {requests.filter(r => r.type==='coach').map(r => {
                      const sport = SPORTS.find(s => s.id===r.sportId);
                      return <ApprovalCard key={r.id}
                        request={{ ...r, sportName:sport?.name, groupName: groups[r.groupId]?.name }}
                        onApprove={handleApprove} onReject={handleReject}/>;
                    })}
                  </>
                )}
                {/* Family requests */}
                {requests.filter(r => r.type==='family').length > 0 && (
                  <>
                    <div className="section-label" style={{ marginTop:8 }}>Familias</div>
                    {requests.filter(r => r.type==='family').map(r => (
                      <ApprovalCard key={r.id}
                        request={{ ...r, groupName: `${getSportByGroupId(r.groupId)?.name} · ${groups[r.groupId]?.name}` }}
                        onApprove={handleApprove} onReject={handleReject}/>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ── MANAGEMENT ── */}
        {tab === 'management' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div className="section-label" style={{ marginBottom:0 }}>Centro Escolapias Calasanz</div>
              <button className="btn btn-info btn-sm" onClick={() => setAddingSport(s => !s)}>
                <svg width="14" height="14"><Icon.Plus/></svg> Deporte
              </button>
            </div>

            {addingSport && (
              <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <input className="form-input" style={{ flex:1 }} placeholder="Nombre del deporte"
                  value={newSportName} onChange={e => setNewSportName(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && addSport()}/>
                <button className="btn btn-primary btn-sm" onClick={addSport}>Añadir</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setAddingSport(false); setNewSportName(''); }}>
                  <svg width="14" height="14"><Icon.X/></svg>
                </button>
              </div>
            )}

            {sports.map(sport => {
              const isExpanded = expandedSport === sport.id;
              const sportGroups = sport.groups.map(gid => groups[gid]).filter(Boolean);
              return (
                <div key={sport.id} className="card" style={{ padding:0, marginBottom:10, border:`1.5px solid ${sport.color}30` }}>
                  {/* Sport header */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 14px',
                    cursor:'pointer' }} onClick={() => setExpandedSport(isExpanded ? null : sport.id)}>
                    <span className="sport-dot-lg" style={{ background:sport.color }}/>
                    <span style={{ fontSize:15, fontWeight:800, color:sport.color, flex:1 }}>{sport.name}</span>
                    <span style={{ fontSize:12, color:'var(--muted)' }}>{sportGroups.length} grupos</span>
                    <svg width="16" height="16" style={{ color:'var(--muted)', transform: isExpanded?'rotate(180deg)':'none', transition:'transform .2s' }}>
                      <Icon.ChevronDown/>
                    </svg>
                  </div>
                  {isExpanded && (
                    <div style={{ borderTop:'1px solid var(--border)', paddingBottom:10 }}>
                      {sportGroups.map(g => (
                        <div key={g.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px',
                          borderBottom:'1px solid var(--bg)' }}>
                          <span style={{ flex:1, fontSize:14, color:'var(--text)', fontWeight:600 }}>{g.name}</span>
                          <span style={{ fontSize:12, color:'var(--muted)' }}>
                            {g.count}/{g.maxCapacity}
                            {g.count >= g.maxCapacity && <span style={{ color:'var(--ausente)', marginLeft:4 }}>lleno</span>}
                          </span>
                          <div style={{ width:60 }}>
                            <div className="progress-bar-wrap">
                              <div className="progress-bar-fill" style={{ width:`${(g.count/g.maxCapacity)*100}%`,
                                background: g.count>=g.maxCapacity ? 'var(--ausente)' : sport.color }}/>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Add group inline */}
                      {addingGroupFor === sport.id ? (
                        <div style={{ display:'flex', gap:8, padding:'8px 14px' }}>
                          <input className="form-input" style={{ flex:1, height:36 }} placeholder="Nombre del grupo"
                            value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                            onKeyDown={e => e.key==='Enter' && addGroup(sport.id)} autoFocus/>
                          <button className="btn btn-primary btn-sm" onClick={() => addGroup(sport.id)}>OK</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setAddingGroupFor(null); setNewGroupName(''); }}>
                            <svg width="12" height="12"><Icon.X/></svg>
                          </button>
                        </div>
                      ) : (
                        <button style={{ display:'flex', alignItems:'center', gap:6, margin:'8px 14px 0',
                          fontSize:13, color:sport.color, fontWeight:700, background:'none', border:'none',
                          cursor:'pointer' }} onClick={() => setAddingGroupFor(sport.id)}>
                          <svg width="14" height="14"><Icon.Plus/></svg> Añadir grupo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Coaches list */}
            <div className="section-label" style={{ marginTop:16 }}>Entrenadores</div>
            {COACHES.map(coach => (
              <div key={coach.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                background:'var(--surface)', borderRadius:'var(--r-md)', marginBottom:6, border:'1px solid var(--border)' }}>
                <Avatar initials={coach.avatar} size="md" color="#2563eb"/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{coach.name}</div>
                  <div style={{ fontSize:11, color:'var(--light)' }}>{coach.email}</div>
                </div>
                <span style={{ fontSize:11, color:'var(--muted)', background:'var(--bg)', padding:'3px 8px',
                  borderRadius:99, fontWeight:600 }}>{coach.groups.length} grupos</span>
              </div>
            ))}
          </>
        )}

        {/* ── STATS ── */}
        {tab === 'stats' && (
          <>
            <div className="section-label">Asistencia por deporte (últ. 4 semanas)</div>
            {sports.map((s,i) => {
              const pct = [82, 75, 88, 91, 69, 84][i];
              return (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                  <span style={{ width:70, fontSize:13, fontWeight:700, color:s.color, flexShrink:0 }}>{s.name}</span>
                  <div style={{ flex:1 }}>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width:`${pct}%`, background:s.color }}/>
                    </div>
                  </div>
                  <span style={{ width:36, fontSize:13, fontWeight:800, color:'var(--text)', textAlign:'right' }}>{pct}%</span>
                </div>
              );
            })}

            <div className="section-label" style={{ marginTop:16 }}>Publicaciones por entrenador (mes)</div>
            {COACHES.map((c,i) => {
              const count = [12,8,15,6,10,7,9][i] || 5;
              return (
                <div key={c.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <Avatar initials={c.avatar} size="sm" color="#2563eb"/>
                  <span style={{ flex:1, fontSize:13, color:'var(--text)', fontWeight:500 }}>{c.name}</span>
                  <div style={{ display:'flex', gap:2 }}>
                    {[...Array(Math.min(count,10))].map((_,j) => (
                      <div key={j} style={{ width:6, height:16, borderRadius:3, background:'var(--blue)', opacity:.7+j*.03 }}/>
                    ))}
                  </div>
                  <span style={{ fontSize:12, color:'var(--muted)', width:24, textAlign:'right' }}>{count}</span>
                </div>
              );
            })}

            <div className="section-label" style={{ marginTop:16 }}>Crecimiento de atletas</div>
            <div className="card">
              <div className="bar-chart" style={{ alignItems:'flex-end', gap:12 }}>
                {['Sep','Oct','Nov','Dic','Ene','Feb','Mar'].map((m,i) => {
                  const vals = [60,75,82,80,88,95,totalAthletes];
                  return (
                    <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{ background:'var(--blue)', borderRadius:'4px 4px 0 0',
                        height:`${(vals[i]/totalAthletes)*100}%`, width:'100%', minHeight:6 }}/>
                      <div style={{ fontSize:9, color:'var(--light)', marginTop:4 }}>{m}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export */}
            <button className="btn btn-ghost btn-full" style={{ marginTop:8 }}>
              <svg width="15" height="15"><Icon.File/></svg>
              Exportar informe completo (PDF)
            </button>
          </>
        )}

        {/* ── COMUNICADOS ── */}
        {tab === 'comms' && (
          <>
            <div className="info-banner">
              <svg width="15" height="15"><Icon.Megaphone/></svg>
              Los comunicados llegan a todas las familias y entrenadores seleccionados.
            </div>

            <div className="form-group">
              <label className="form-label">Destinatarios</label>
              <select className="form-input form-select">
                <option>Todos (familias + entrenadores)</option>
                <option>Solo familias</option>
                <option>Solo entrenadores</option>
                {sports.map(s => <option key={s.id}>Deporte: {s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Asunto</label>
              <input className="form-input" placeholder="Ej: Cierre por Semana Santa"/>
            </div>
            <div className="form-group">
              <label className="form-label">Mensaje</label>
              <textarea className="form-input form-textarea" rows={4}
                placeholder="Escribe el comunicado aquí…"/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-ghost" style={{ flex:1 }}>Programar envío</button>
              <button className="btn btn-primary" style={{ flex:1 }}>
                <svg width="14" height="14"><Icon.Megaphone/></svg>
                Enviar ahora
              </button>
            </div>

            <div className="section-label" style={{ marginTop:20 }}>Historial de comunicados</div>
            {[
              { title:'Cambio de horarios junio', dest:'Todas las familias', date:'15 may', readers:89 },
              { title:'Torneo de Iniciación 2025', dest:'Fútbol', date:'10 may', readers:45 },
              { title:'Inicio temporada 2024-25', dest:'Todos', date:'1 sep 2024', readers:127 },
            ].map((c,i) => (
              <div key={i} className="card-sm" style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{c.title}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>{c.dest} · {c.date}</div>
                </div>
                <span style={{ fontSize:12, color:'var(--blue)', fontWeight:700 }}>{c.readers} lectores</span>
              </div>
            ))}
          </>
        )}

        {/* Profile link */}
        <div style={{ marginTop:16 }}>
          <button className="logout-btn" onClick={logout}>
            <svg width="16" height="16"><Icon.Logout/></svg>
            Cerrar sesión · {user?.name}
          </button>
        </div>
      </main>
    </div>
  );
}
