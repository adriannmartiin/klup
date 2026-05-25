// ============================================================
// KLUP — Family Panel (feed, gallery, reports, profile)
// ============================================================
import { useState } from 'react';
import { useAuth, useTheme, useOnlineStatus } from '../../contexts/AuthContext';
import { Icon, Avatar, OfflineBanner, EmptyState, RadarChart, ProgressRing } from '../../components/ui/index';
import { SPORTS, GROUPS, ATHLETES, POSTS, OBSERVATIONS, NOTIFICATIONS, HEALTH_RECORDS,
         SKILL_ASSESSMENTS, getSport, timeAgo } from '../../lib/mockData';

const VIEWS = [
  { id:'feed',     label:'Feed',    icon:<Icon.Home/> },
  { id:'gallery',  label:'Galería', icon:<Icon.Image/> },
  { id:'reports',  label:'Informes',icon:<Icon.File/> },
  { id:'alerts',   label:'Alertas', icon:<Icon.Bell/> },
  { id:'profile',  label:'Perfil',  icon:<Icon.User/> },
];

// Mock family athlete
const MY_ATHLETES = [
  { id:'a1', name:'Carlos García', groupId:'g1', course:'4º Primaria', avatar:'CG' },
];

export default function FamilyApp() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const online = useOnlineStatus();
  const [view, setView] = useState('feed');
  const [activeAthlete, setActiveAthlete] = useState(MY_ATHLETES[0]);
  const [obsFilter, setObsFilter] = useState('all');
  const [unreadNotifs] = useState(NOTIFICATIONS.filter(n => !n.read).length);
  const [showHealthDetails, setShowHealthDetails] = useState(false);

  const athlete = MY_ATHLETES.find(a => a.id === activeAthlete.id) || MY_ATHLETES[0];
  const sport   = getSport(GROUPS[athlete.groupId]?.sportId);
  const group   = GROUPS[athlete.groupId];

  const feedPosts = POSTS.filter(p => p.groupId === athlete.groupId)
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const myObservations = OBSERVATIONS
    .filter(o => o.athleteId === athlete.id && !o.isPrivate)
    .filter(o => obsFilter === 'all' || o.type === obsFilter);

  const healthRecord = HEALTH_RECORDS[athlete.id];
  const skills = SKILL_ASSESSMENTS[athlete.id];

  // Attendance % mock
  const attPct = 87;

  return (
    <div className="app-shell">
      {!online && <OfflineBanner/>}

      {/* Header */}
      <header className="page-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div className="header-klup-tag">KLUP</div>
            <div className="header-title">Portal Familiar</div>
          </div>
          <button className="theme-toggle" onClick={toggle} aria-label="Tema">
            <svg width="16" height="16">{theme==='dark'?<Icon.Sun/>:<Icon.Moon/>}</svg>
          </button>
        </div>
        {/* Athlete chips */}
        <div style={{ display:'flex', gap:8, marginTop:10, overflowX:'auto', paddingBottom:2 }}>
          {MY_ATHLETES.map(a => {
            const s = getSport(GROUPS[a.groupId]?.sportId);
            return (
              <button key={a.id} onClick={() => setActiveAthlete(a)}
                style={{ display:'inline-flex', alignItems:'center', gap:8, flexShrink:0, cursor:'pointer', border:'none',
                  background: activeAthlete.id===a.id ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.13)',
                  borderRadius:'var(--r-full)', padding:'5px 14px 5px 6px',
                  outline: activeAthlete.id===a.id ? '1.5px solid rgba(255,255,255,.5)' : '1px solid rgba(255,255,255,.22)' }}>
                <div className="avatar avatar-sm" style={{ background:s?.color, color:'white', fontSize:10 }}>
                  {a.avatar}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'white', lineHeight:1.2 }}>{a.name}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.65)' }}>{s?.name} · {group?.name}</div>
                </div>
              </button>
            );
          })}
          {/* Add athlete button */}
          <button style={{ display:'inline-flex', alignItems:'center', gap:5, flexShrink:0,
            background:'rgba(255,255,255,.12)', border:'1px dashed rgba(255,255,255,.3)',
            borderRadius:'var(--r-full)', padding:'5px 14px 5px 10px', color:'rgba(255,255,255,.7)',
            fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <svg width="14" height="14"><Icon.Plus/></svg>
            Añadir atleta
          </button>
        </div>
      </header>

      <main className="page-content">

        {/* ── FEED ── */}
        {view === 'feed' && (
          <>
            <div className="section-label">Novedades del grupo</div>
            {feedPosts.length === 0 ? (
              <EmptyState icon={<Icon.Home/>} title="Sin novedades"
                text="Aquí aparecerán las publicaciones del entrenador"/>
            ) : feedPosts.map(post => (
              <FeedPost key={post.id} post={post} sport={sport}/>
            ))}
          </>
        )}

        {/* ── GALLERY ── */}
        {view === 'gallery' && (
          <>
            {/* Filter chips */}
            <div className="chip-group" style={{ marginBottom:12 }}>
              {['Todos', 'Fotos', 'Vídeos'].map(f => (
                <span key={f} className={`chip ${f==='Todos'?'selected':''}`}>{f}</span>
              ))}
            </div>

            <div className="gallery-grid">
              {[...Array(12)].map((_,i) => {
                const colors = ['#bbf7d0','#fce7f3','#dbeafe','#fef3c7','#f3e8ff','#ffedd5',
                                '#dcfce7','#fce7f3','#e0f2fe','#fff7ed','#f3e8ff','#bbf7d0'];
                return (
                  <div key={i} className="gallery-item"
                    style={{ background:`linear-gradient(135deg, ${colors[i]}, ${colors[i]}88)`,
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="20" height="20" style={{ color:'rgba(0,0,0,.2)' }}><Icon.Image/></svg>
                  </div>
                );
              })}
            </div>

            <button className="btn btn-ghost btn-full" style={{ marginTop:14 }}>
              <svg width="15" height="15"><Icon.File/></svg>
              Descargar todo como ZIP
            </button>
          </>
        )}

        {/* ── REPORTS / OBSERVATIONS ── */}
        {view === 'reports' && (
          <>
            {/* Athlete header */}
            <div className="card" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div className="avatar avatar-lg" style={{ background:`${sport?.color}20`, color:sport?.color }}>
                {athlete.avatar}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:800, color:'var(--text)' }}>{athlete.name}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>{sport?.name} · {group?.name} · {athlete.course}</div>
              </div>
              <ProgressRing value={attPct} max={100} color={sport?.color||'#2563eb'}
                size={52} label={`${attPct}%`}/>
            </div>

            {/* Attendance stats */}
            <div className="section-label">Asistencia esta temporada</div>
            <div className="grid-2" style={{ marginBottom:16 }}>
              <div className="stat-big"><div className="stat-big-num">{attPct}%</div><div className="stat-big-label">Asistencia total</div></div>
              <div className="stat-big"><div className="stat-big-num">7</div><div className="stat-big-label">Racha actual (días)</div></div>
            </div>

            {/* Skills radar */}
            {skills && (
              <>
                <div className="section-label">Progreso técnico</div>
                <div className="card" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
                  <RadarChart skills={skills} color={sport?.color}/>
                  <div>
                    {Object.entries(skills).map(([k,v]) => (
                      <div key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <span style={{ width:80, fontSize:12, color:'var(--muted)', fontWeight:600 }}>{k}</span>
                        <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${v}%`, background:sport?.color, borderRadius:99 }}/>
                        </div>
                        <span style={{ fontSize:12, fontWeight:800, color:'var(--text)', width:28, textAlign:'right' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Health record */}
            {healthRecord && (
              <>
                <div className="section-label">Información médica</div>
                <div className="health-card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <svg width="15" height="15" style={{ color:'#ea580c' }}><Icon.Heart/></svg>
                      <span style={{ fontSize:13, fontWeight:700, color:'#c2410c' }}>Ficha médica</span>
                    </div>
                    <button onClick={() => setShowHealthDetails(s => !s)}
                      style={{ fontSize:12, color:'#c2410c', fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>
                      {showHealthDetails ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                  {showHealthDetails && (
                    <>
                      {healthRecord.allergies && (
                        <div style={{ fontSize:12, color:'#92400e', marginBottom:4 }}>
                          <strong>Alergias:</strong> {healthRecord.allergies}
                        </div>
                      )}
                      {healthRecord.conditions && (
                        <div style={{ fontSize:12, color:'#92400e', marginBottom:4 }}>
                          <strong>Condiciones:</strong> {healthRecord.conditions}
                        </div>
                      )}
                      {healthRecord.medication && (
                        <div style={{ fontSize:12, color:'#92400e', marginBottom:4 }}>
                          <strong>Medicación:</strong> {healthRecord.medication}
                        </div>
                      )}
                      <div style={{ fontSize:12, color:'#92400e', marginTop:8, borderTop:'1px solid #fed7aa', paddingTop:8 }}>
                        <strong>Contacto de emergencia:</strong><br/>
                        {healthRecord.emergencyName} — {healthRecord.emergencyPhone}
                      </div>
                    </>
                  )}
                  <div style={{ fontSize:11, color:'#b45309', marginTop:6, display:'flex', gap:4 }}>
                    <svg width="12" height="12"><Icon.Lock/></svg>
                    Solo visible para el entrenador y la familia
                  </div>
                </div>
              </>
            )}

            {/* Observations filter */}
            <div className="section-label">Observaciones del entrenador</div>
            <div className="chip-group" style={{ marginBottom:12 }}>
              {[['all','Todas'],['tecnica','Técnica'],['comportamiento','Comportam.'],['general','General']].map(([id,label]) => (
                <span key={id} className={`chip ${obsFilter===id?'selected':''}`}
                  onClick={() => setObsFilter(id)}>{label}</span>
              ))}
            </div>

            {myObservations.length === 0 ? (
              <EmptyState icon={<Icon.File/>} title="Sin observaciones"
                text="El entrenador todavía no ha añadido observaciones sobre este atleta"/>
            ) : myObservations.map(obs => {
              const typeColor = { tecnica:'#2563eb', comportamiento:'#9333ea', general:'#64748b' }[obs.type];
              const typeLabel = { tecnica:'Técnica', comportamiento:'Comportamiento', general:'General' }[obs.type];
              return (
                <div key={obs.id} className="obs-card">
                  <div className="obs-type" style={{ color:typeColor }}>{typeLabel}</div>
                  <div className="obs-text">{obs.content}</div>
                  <div className="obs-meta">{timeAgo(obs.createdAt)}</div>
                </div>
              );
            })}
          </>
        )}

        {/* ── ALERTS / NOTIFICATIONS ── */}
        {view === 'alerts' && (
          <>
            {NOTIFICATIONS.length === 0 ? (
              <EmptyState icon={<Icon.Bell/>} title="Sin notificaciones" text="Todo al día"/>
            ) : NOTIFICATIONS.map(n => {
              const icons = { post:<Icon.Edit/>, approved:<Icon.Check/>, absence:<Icon.Alert/> };
              const colors = { post:'#2563eb', approved:'#16a34a', absence:'#dc2626' };
              return (
                <div key={n.id} style={{ display:'flex', gap:10, padding:'12px 14px',
                  background:'var(--surface)', borderRadius:'var(--r-md)', marginBottom:8,
                  border:`1px solid ${n.read ? 'var(--border)' : colors[n.type]+'40'}`,
                  opacity: n.read ? .7 : 1 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', flexShrink:0,
                    background:`${colors[n.type]}15`, display:'flex', alignItems:'center', justifyContent:'center',
                    color:colors[n.type] }}>
                    <svg width="16" height="16">{icons[n.type]}</svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight: n.read ? 500 : 700, color:'var(--text)' }}>{n.title}</div>
                    <div style={{ fontSize:12, color:'var(--muted)' }}>{n.text}</div>
                    <div style={{ fontSize:11, color:'var(--light)', marginTop:3 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.read && (
                    <div style={{ width:8, height:8, borderRadius:'50%', background:colors[n.type],
                      flexShrink:0, marginTop:4 }}/>
                  )}
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
                {user?.avatar || 'AG'}
              </div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-role">Familia · Escolapias Calasanz</div>
            </div>

            {/* Athletes */}
            <div className="section-label">Mis atletas</div>
            {MY_ATHLETES.map(a => {
              const s = getSport(GROUPS[a.groupId]?.sportId);
              const g = GROUPS[a.groupId];
              return (
                <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                  background:'var(--surface)', borderRadius:'var(--r-md)', marginBottom:8,
                  border:`1.5px solid ${s?.color}30` }}>
                  <div className="avatar avatar-md" style={{ background:`${s?.color}20`, color:s?.color }}>
                    {a.avatar}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:800, color:'var(--text)' }}>{a.name}</div>
                    <div style={{ fontSize:12, color:'var(--muted)' }}>{s?.name} · {g?.name} · {a.course}</div>
                  </div>
                  <span style={{ background:'var(--presente-bg)', color:'var(--presente)', fontSize:11,
                    fontWeight:700, padding:'3px 8px', borderRadius:99 }}>Activo</span>
                </div>
              );
            })}

            {/* Account */}
            <div className="section-label" style={{ marginTop:12 }}>Cuenta</div>
            <div className="card">
              <div style={{ fontSize:13, color:'var(--muted)', marginBottom:8 }}>
                <strong style={{ color:'var(--text)' }}>Email:</strong> {user?.email || 'familia@klup.es'}
              </div>
              <div style={{ fontSize:13, color:'var(--muted)', marginBottom:8 }}>
                <strong style={{ color:'var(--text)' }}>Consentimiento de imagen:</strong>{' '}
                <span style={{ color:'var(--presente)', fontWeight:700 }}>Autorizado</span>
              </div>
              <div style={{ fontSize:13, color:'var(--muted)' }}>
                <strong style={{ color:'var(--text)' }}>Datos personales:</strong>{' '}
                <span style={{ color:'var(--blue)', cursor:'pointer', fontWeight:600 }}>Exportar mis datos (RGPD)</span>
              </div>
            </div>

            {/* iCal export */}
            <button className="btn btn-ghost btn-full" style={{ marginBottom:8 }}>
              <svg width="15" height="15"><Icon.Calendar/></svg>
              Suscribirse al calendario del grupo (iCal)
            </button>

            <button className="logout-btn" onClick={logout}>
              <svg width="16" height="16"><Icon.Logout/></svg>
              Cerrar sesión
            </button>

            <div style={{ textAlign:'center', marginTop:16, fontSize:11, color:'var(--light)' }}>
              Klup v1.0 · Escolapias Calasanz · Temporada 2024-25
            </div>
          </>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {VIEWS.map(v => (
          <button key={v.id} className={`nav-item ${view===v.id?'active':''}`}
            onClick={() => setView(v.id)} aria-label={v.label}>
            {v.id==='alerts' && unreadNotifs>0 && <span className="nav-badge"/>}
            <svg>{v.icon}</svg>
            <span>{v.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── Feed Post ─────────────────────────────────────────────────

function FeedPost({ post, sport }) {
  const group = GROUPS[post.groupId];
  return (
    <div className="post-card">
      <div className="post-header">
        <span className="sport-dot" style={{ background:sport?.color }}/>
        <div className="post-meta">
          <div className="post-group" style={{ color:sport?.color }}>
            {sport?.name} · {group?.name}
          </div>
        </div>
        <span className="post-time">{timeAgo(post.createdAt)}</span>
      </div>
      <div className="post-body">
        <span className={`badge badge-${post.type}`} style={{ marginBottom:7, display:'inline-block' }}>
          {post.type.charAt(0).toUpperCase()+post.type.slice(1)}
        </span>
        <div className="post-title">{post.title}</div>
        {post.type === 'foto' && (
          <div className="post-image-placeholder"
            style={{ background:`linear-gradient(135deg, ${post.imageColor||'#e2e8f0'}, ${post.imageColor||'#e2e8f0'}88)`,
              marginBottom:8 }}>
            <svg width="32" height="32" style={{ color:'rgba(255,255,255,.5)' }}><Icon.Image/></svg>
          </div>
        )}
        <div className="post-text">{post.content}</div>
        {post.type === 'resultado' && (
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
            <span style={{ fontSize:30, fontWeight:900, color:'var(--text)', letterSpacing:-1 }}>{post.score}</span>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--presente)' }}>{post.result}</span>
          </div>
        )}
        {post.type === 'evento' && post.eventDate && (
          <div className="post-event-date">
            <svg width="14" height="14"><Icon.Calendar/></svg>
            {post.eventDate}
          </div>
        )}
      </div>
    </div>
  );
}
