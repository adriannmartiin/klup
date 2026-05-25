// ============================================================
// KLUP — Coordinator Panel (responsive, comprehensive)
// ============================================================
import { useState } from 'react';
import { useAuth, useTheme, useOnlineStatus } from '../../contexts/AuthContext';
import { Icon, Avatar, OfflineBanner, EmptyState, ProgressRing } from '../../components/ui/index';
import { SPORTS, GROUPS, COACHES, ATHLETES, POSTS, PENDING_REQUESTS, WAITLIST,
         NOTIFICATIONS, CENTER, getSport, getSportByGroupId, timeAgo, countAttendance,
         ATTENDANCE_TODAY } from '../../lib/mockData';

const TABS = [
  { id:'dashboard',  label:'Inicio',      icon:<Icon.Home/> },
  { id:'groups',     label:'Grupos',      icon:<Icon.Grid/> },
  { id:'requests',   label:'Solicitudes', icon:<Icon.Bell/> },
  { id:'messages',   label:'Mensajes',    icon:<Icon.Megaphone/> },
  { id:'stats',      label:'Stats',       icon:<Icon.Chart/> },
  { id:'settings',   label:'Ajustes',     icon:<Icon.Settings/> },
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
  const [newSportName, setNewSportName] = useState('');
  const [addingSport, setAddingSport]   = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const handleApprove = (id) => { setRequests(r => r.filter(x => x.id !== id)); showToast('Aprobado — usuario notificado'); };
  const handleReject  = (id) => { setRequests(r => r.filter(x => x.id !== id)); showToast('Solicitud rechazada'); };

  const pendingCount   = requests.length;
  const totalAthletes  = Object.values(groups).reduce((acc,g) => acc+(g.count||0), 0);
  const recentPosts    = [...POSTS].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,8);

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
          {TABS.map(t => (
            <button key={t.id} className={`sidebar-nav-item ${tab===t.id?'active':''}`}
              onClick={() => setTab(t.id)}>
              <svg>{t.icon}</svg>
              {t.label}
              {t.id==='requests' && pendingCount>0 && <span className="s-badge">{pendingCount}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize:11, color:'var(--light)', marginBottom:8, fontWeight:600 }}>
            {CENTER.season.name}
          </div>
          <div className="sidebar-user">
            <div className="avatar avatar-md" style={{ background:'#dbeafe', color:'#2563eb' }}>
              {user?.avatar||'AC'}
            </div>
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
        {/* Mobile header */}
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
            <span className="header-pill">{COACHES.length} entrenadores</span>
            {pendingCount>0 && <span className="header-pill warning">{pendingCount} solicitudes</span>}
          </div>
        </header>

        {/* Desktop header */}
        <div className="desktop-header">
          <span className="desktop-header-title">
            {TABS.find(t=>t.id===tab)?.label}
          </span>
          <span className="desktop-header-sub">{CENTER.name} · {CENTER.season.name}</span>
        </div>

        {/* Mobile tab bar */}
        <div className="tab-bar mobile-only">
          {TABS.map(t => (
            <button key={t.id} className={`tab-item ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
              {t.label}
              {t.id==='requests' && pendingCount>0 && (
                <span style={{ background:'#dc2626',color:'white',borderRadius:99,
                  padding:'1px 5px',fontSize:9,fontWeight:800,marginLeft:4 }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="page-content">
          {toast && <div className="toast-success"><svg width="15" height="15"><Icon.Check/></svg>{toast}</div>}

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <>
              {/* Stats grid */}
              <div className="desktop-grid-4 grid-2" style={{ marginBottom:16 }}>
                <div className="stat-big"><div className="stat-big-num">{totalAthletes}</div><div className="stat-big-label">Atletas</div></div>
                <div className="stat-big"><div className="stat-big-num">{Object.keys(groups).length}</div><div className="stat-big-label">Grupos</div></div>
                <div className="stat-big"><div className="stat-big-num">{COACHES.length}</div><div className="stat-big-label">Entrenadores</div></div>
                <div className="stat-big" style={{ background:pendingCount>0?'var(--pendiente-bg)':undefined }}>
                  <div className="stat-big-num" style={{ color:pendingCount>0?'var(--tarde)':undefined }}>{pendingCount}</div>
                  <div className="stat-big-label">Pendientes</div>
                </div>
              </div>

              {WAITLIST.length > 0 && (
                <div className="warning-banner" style={{ marginBottom:14 }}>
                  <svg width="15" height="15"><Icon.Alert/></svg>
                  {WAITLIST.length} atleta{WAITLIST.length>1?'s':''} en lista de espera
                </div>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }}>
                {/* Sports summary */}
                <div>
                  <div className="section-label">Deportes activos</div>
                  <div className="desktop-grid-3 grid-2">
                    {sports.map((s,i) => {
                      const gc = s.groups.length;
                      const ac = s.groups.reduce((acc,gid)=>acc+(groups[gid]?.count||0),0);
                      const pct = [82,75,88,91,69,84][i];
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
                          <div className="sport-card-info">{gc} grupo{gc!==1?'s':''} · {ac} atletas</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent posts */}
                <div>
                  <div className="section-label">Últimas publicaciones</div>
                  <div style={{ background:'var(--surface)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>
                    {recentPosts.map((post,i) => {
                      const sport = getSportByGroupId(post.groupId);
                      const group = groups[post.groupId];
                      const coach = COACHES.find(c => c.id === post.coachId);
                      const badgeClass = { noticia:'badge-noticia',foto:'badge-foto',evento:'badge-evento',resultado:'badge-resultado' }[post.type];
                      return (
                        <div key={post.id} style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:10,
                          borderBottom: i<recentPosts.length-1 ? '1px solid var(--bg)' : undefined }}>
                          <span className="sport-dot" style={{ background:sport?.color||'#64748b', flexShrink:0 }}/>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span className={`badge ${badgeClass}`}>{post.type}</span>
                              <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', flex:1 }} className="truncate">
                                {post.title}
                              </span>
                            </div>
                            <div style={{ fontSize:11, color:'var(--light)', marginTop:1 }}>
                              {sport?.name} · {group?.name} · {coach?.name}
                            </div>
                          </div>
                          <span style={{ fontSize:11, color:'var(--light)', flexShrink:0 }}>{timeAgo(post.createdAt)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── GROUPS ── */}
          {tab === 'groups' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div className="section-label" style={{ marginBottom:0 }}>{sports.length} deportes · {Object.keys(groups).length} grupos</div>
                <button className="btn btn-info btn-sm" onClick={() => setAddingSport(s=>!s)}>
                  <svg width="13" height="13"><Icon.Plus/></svg> Deporte
                </button>
              </div>

              {addingSport && (
                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  <input className="form-input" style={{ flex:1 }} placeholder="Nombre del deporte"
                    value={newSportName} onChange={e => setNewSportName(e.target.value)}/>
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    if (!newSportName.trim()) return;
                    setSports(s => [...s, { id:'s'+Date.now(), name:newSportName.trim(), color:'#64748b', bg:'#f1f5f9', groups:[] }]);
                    setNewSportName(''); setAddingSport(false);
                    showToast(`Deporte "${newSportName}" creado`);
                  }}>Añadir</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAddingSport(false)}>
                    <svg width="12" height="12"><Icon.X/></svg>
                  </button>
                </div>
              )}

              {sports.map(sport => {
                const isExp = expandedSport === sport.id;
                const sportGroups = sport.groups.map(gid => groups[gid]).filter(Boolean);
                return (
                  <div key={sport.id} className="card" style={{ padding:0, marginBottom:10, border:`1.5px solid ${sport.color}25` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', cursor:'pointer' }}
                      onClick={() => setExpandedSport(isExp ? null : sport.id)}>
                      <span className="sport-dot-lg" style={{ background:sport.color }}/>
                      <span style={{ fontSize:15, fontWeight:800, color:sport.color, flex:1 }}>{sport.name}</span>
                      <span style={{ fontSize:12, color:'var(--muted)' }}>{sportGroups.length} grupos · {sportGroups.reduce((a,g)=>a+(g.count||0),0)} atletas</span>
                      <svg width="15" height="15" style={{ color:'var(--muted)', transform:isExp?'rotate(180deg)':'none', transition:'transform .2s' }}>
                        <Icon.ChevronDown/>
                      </svg>
                    </div>
                    {isExp && (
                      <div style={{ borderTop:'1px solid var(--border)' }}>
                        {/* Groups table */}
                        <div style={{ overflowX:'auto' }}>
                          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                            <thead>
                              <tr style={{ background:'var(--bg)' }}>
                                {['Grupo','Entrenador','Atletas','Asistencia',''].map(h => (
                                  <th key={h} style={{ padding:'8px 14px', textAlign:'left',
                                    fontSize:11, fontWeight:700, color:'var(--muted)', whiteSpace:'nowrap' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sportGroups.map((g,i) => {
                                const coach = COACHES.find(c => c.id === g.coachId);
                                const pct = Math.round(70 + Math.random()*25);
                                return (
                                  <tr key={g.id} style={{ borderTop:'1px solid var(--bg)' }}>
                                    <td style={{ padding:'9px 14px', fontWeight:600, color:'var(--text)' }}>{g.name}</td>
                                    <td style={{ padding:'9px 14px', color:'var(--muted)' }}>{coach?.name || '—'}</td>
                                    <td style={{ padding:'9px 14px', color:'var(--text)', fontWeight:600 }}>
                                      {g.count}/{g.maxCapacity}
                                      {g.count>=g.maxCapacity && <span style={{ color:'var(--ausente)', fontSize:10, marginLeft:4 }}>LLENO</span>}
                                    </td>
                                    <td style={{ padding:'9px 14px' }}>
                                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                        <div style={{ width:60, height:5, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                                          <div style={{ height:'100%', width:`${pct}%`, background:sport.color, borderRadius:99 }}/>
                                        </div>
                                        <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{pct}%</span>
                                      </div>
                                    </td>
                                    <td style={{ padding:'9px 14px' }}>
                                      <button style={{ fontSize:11, color:'var(--blue)', fontWeight:700,
                                        background:'none', border:'none', cursor:'pointer' }}>Ver</button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {/* Coaches for this sport */}
                        <div style={{ padding:'10px 14px', borderTop:'1px solid var(--bg)' }}>
                          <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:8 }}>ENTRENADORES</div>
                          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                            {sportGroups.map(g => {
                              const c = COACHES.find(coach => coach.id === g.coachId);
                              return c ? (
                                <div key={c.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px',
                                  background:'var(--bg)', borderRadius:99, fontSize:12, fontWeight:600, color:'var(--text)' }}>
                                  <div className="avatar avatar-sm" style={{ background:'#dbeafe', color:'#2563eb' }}>{c.avatar}</div>
                                  {c.name.split(' ')[0]}
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                        {/* Families for this sport */}
                        <div style={{ padding:'10px 14px', borderTop:'1px solid var(--bg)' }}>
                          <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:8 }}>
                            FAMILIAS · {ATHLETES.filter(a => sportGroups.some(g=>g.id===a.groupId)).length} atletas
                          </div>
                          <div style={{ display:'flex', gap:0, flexWrap:'wrap' }}>
                            {ATHLETES.filter(a => sportGroups.some(g=>g.id===a.groupId)).slice(0,8).map((a,i) => (
                              <div key={a.id} className="avatar avatar-sm"
                                style={{ background:`${sport.color}20`, color:sport.color,
                                  border:'2px solid var(--surface)', marginLeft: i>0 ? -6 : 0 }}>
                                {a.avatar}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── REQUESTS ── */}
          {tab === 'requests' && (
            <>
              {requests.length === 0 ? (
                <EmptyState icon={<Icon.Check/>} title="Todo al día" text="No hay solicitudes pendientes"/>
              ) : (
                <>
                  {['coach','family'].map(type => {
                    const filtered = requests.filter(r => r.type === type);
                    if (!filtered.length) return null;
                    return (
                      <div key={type}>
                        <div className="section-label">{type==='coach' ? 'Entrenadores' : 'Familias'}</div>
                        {filtered.map(r => {
                          const sport = SPORTS.find(s => s.id === r.sportId);
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
                              {type==='coach' && (
                                <div className="approval-details">
                                  <strong>Deporte:</strong> {sport?.name}<br/>
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
            </>
          )}

          {/* ── MESSAGES ── */}
          {tab === 'messages' && (
            <>
              <div className="info-banner">
                <svg width="15" height="15"><Icon.Megaphone/></svg>
                Los comunicados se envían a las familias y entrenadores seleccionados.
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
                <textarea className="form-input form-textarea" rows={5} placeholder="Escribe el comunicado…"/>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-ghost" style={{ flex:1 }}>Programar</button>
                <button className="btn btn-primary" style={{ flex:2 }}>
                  <svg width="13" height="13"><Icon.Megaphone/></svg> Enviar
                </button>
              </div>

              <div className="section-label" style={{ marginTop:20 }}>Historial</div>
              {[
                { title:'Cambio horarios junio', dest:'Todas las familias', date:'15 may', readers:89 },
                { title:'Torneo Iniciación 2025', dest:'Fútbol', date:'10 may', readers:45 },
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

          {/* ── STATS ── */}
          {tab === 'stats' && (
            <>
              <div className="section-label">Asistencia por deporte (últ. mes)</div>
              {sports.map((s,i) => {
                const pct = [82,75,88,91,69,84][i];
                return (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                    <span style={{ width:80, fontSize:13, fontWeight:700, color:s.color, flexShrink:0 }}>{s.name}</span>
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
                const count = [12,8,15,6,10,7,9][i]||5;
                return (
                  <div key={c.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <div className="avatar avatar-sm" style={{ background:'#dbeafe', color:'#2563eb' }}>{c.avatar}</div>
                    <span style={{ flex:1, fontSize:13, color:'var(--text)' }}>{c.name}</span>
                    <div style={{ width:80, height:6, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(count/15)*100}%`, background:'var(--blue)', borderRadius:99 }}/>
                    </div>
                    <span style={{ fontSize:12, color:'var(--muted)', width:24, textAlign:'right' }}>{count}</span>
                  </div>
                );
              })}

              <div className="section-label" style={{ marginTop:16 }}>Crecimiento de atletas</div>
              <div className="card">
                <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:80 }}>
                  {[60,75,82,80,88,95,totalAthletes].map((v,i) => {
                    const months=['Sep','Oct','Nov','Dic','Ene','Feb','Mar'];
                    return (
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <div style={{ background:'var(--blue)', borderRadius:'4px 4px 0 0',
                          height:`${(v/totalAthletes)*100}%`, width:'100%', minHeight:6, opacity:.7+i*.04 }}/>
                        <div style={{ fontSize:9, color:'var(--light)', marginTop:4 }}>{months[i]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && (
            <>
              <div className="card" style={{ marginBottom:12 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:12 }}>Centro</div>
                <div className="form-group">
                  <label className="form-label">Nombre del centro</label>
                  <input className="form-input" defaultValue={CENTER.name}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Temporada activa</label>
                  <input className="form-input" defaultValue={CENTER.season.name}/>
                </div>
                <button className="btn btn-primary">Guardar cambios</button>
              </div>

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
            </>
          )}
        </div>

        {/* Mobile bottom nav */}
        <nav className="bottom-nav mobile-only">
          {TABS.map(t => (
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

Icon.Megaphone = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>);
