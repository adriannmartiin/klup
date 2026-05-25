// ============================================================
// KLUP — Shared UI Components
// ============================================================

// ── Icons ────────────────────────────────────────────────────

export const Icon = {
  Home: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Bell: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>),
  Users: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  User: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
  Grid: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>),
  Chart: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>),
  Check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>),
  Edit: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  File: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
  Calendar: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
  Plus: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  X: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  ChevronRight: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>),
  ChevronDown: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>),
  Moon: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>),
  Sun: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>),
  Logout: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
  Settings: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>),
  Lock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
  Alert: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>),
  Wifi: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>),
  Heart: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
  Megaphone: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>),
  Image: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>),
  Star: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
  QR: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="16" y="16" width="3" height="3" fill="currentColor" stroke="none"/><rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/></svg>),
};

// ── Avatar ────────────────────────────────────────────────────

export function Avatar({ initials, size = 'md', color = '#2563eb', bg, style = {} }) {
  const sizes = { sm:'avatar-sm', md:'avatar-md', lg:'avatar-lg', xl:'avatar-xl' };
  return (
    <div className={`avatar ${sizes[size]}`}
      style={{ background: bg || color + '20', color, ...style }}>
      {initials}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display:'flex', gap:10, marginBottom:12 }}>
        <div className="skeleton skeleton-avatar" style={{ width:36, height:36, flexShrink:0 }}/>
        <div style={{ flex:1 }}>
          <div className="skeleton skeleton-text" style={{ width:'60%' }}/>
          <div className="skeleton skeleton-text-sm" style={{ width:'40%' }}/>
        </div>
      </div>
      <div className="skeleton skeleton-text" style={{ width:'90%' }}/>
      <div className="skeleton skeleton-text" style={{ width:'75%' }}/>
      <div className="skeleton skeleton-text-sm" style={{ width:'50%' }}/>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return <>{Array.from({ length: count }).map((_, i) => <SkeletonCard key={i}/>)}</>;
}

// ── Offline Banner ────────────────────────────────────────────

export function OfflineBanner() {
  return (
    <div className="offline-banner">
      <svg style={{ width:14, height:14 }}><Icon.Wifi/></svg>
      Sin conexión — los cambios se guardarán al recuperar la red
    </div>
  );
}

// ── Bottom Navigation ─────────────────────────────────────────

export function BottomNav({ items, active, onChange }) {
  return (
    <nav className="bottom-nav" role="navigation">
      {items.map(item => (
        <button key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => onChange(item.id)} aria-label={item.label}>
          {item.badge && <span className="nav-badge" aria-hidden="true"/>}
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── Sport Badge ───────────────────────────────────────────────

export function SportBadge({ name, color }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, color }}>
      <span className="sport-dot" style={{ background:color }}/>
      {name}
    </span>
  );
}

// ── Toggle ────────────────────────────────────────────────────

export function Toggle({ on, onChange, label }) {
  return (
    <div className="toggle-wrapper" onClick={() => onChange(!on)} style={{ cursor:'pointer' }}>
      <span className="toggle-label">{label}</span>
      <div className={`toggle ${on ? 'on' : ''}`}>
        <div className="toggle-knob"/>
      </div>
    </div>
  );
}

// ── Modal Sheet ───────────────────────────────────────────────

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"/>
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

// ── Attendance State Button ───────────────────────────────────

const ATT_CYCLE = ['P', 'A', 'T', 'J'];
const ATT_LABEL = { P:'P', A:'A', T:'T', J:'J' };

export function AttBtn({ state, onChange }) {
  const next = () => {
    const idx = ATT_CYCLE.indexOf(state);
    onChange(ATT_CYCLE[(idx + 1) % ATT_CYCLE.length]);
  };
  return (
    <button className={`att-btn att-${state}`} onClick={next} title="Cambiar estado">
      {ATT_LABEL[state]}
    </button>
  );
}

// ── Approval Card ─────────────────────────────────────────────

export function ApprovalCard({ request, onApprove, onReject }) {
  return (
    <div className="approval-card">
      <div className="approval-header">
        <Avatar initials={request.avatar} size="md" color="#2563eb"/>
        <div className="approval-info">
          <div className="approval-name">{request.name}</div>
          <div className="approval-email">{request.email}</div>
        </div>
        <span className="badge badge-rol">{request.type === 'family' ? 'Familia' : 'Entrenador'}</span>
      </div>
      {request.type === 'family' && (
        <div className="approval-details">
          <strong>Atleta:</strong> {request.athleteName} · {request.athleteCourse}<br/>
          <strong>Grupo:</strong> {request.groupName || request.groupId}
        </div>
      )}
      {request.type === 'coach' && (
        <div className="approval-details">
          <strong>Deporte:</strong> {request.sportName}<br/>
          <strong>Grupo:</strong> {request.groupName || request.groupId}
        </div>
      )}
      <div className="approval-actions">
        <button className="btn btn-success btn-sm" style={{ flex:1 }} onClick={() => onApprove(request.id)}>Aprobar</button>
        <button className="btn btn-danger btn-sm"  style={{ flex:1 }} onClick={() => onReject(request.id)}>Rechazar</button>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────

export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg width="28" height="28" style={{ color:'var(--light)' }}>{icon}</svg>
      </div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-text">{text}</div>
      {action && <button className="btn btn-primary" style={{ marginTop:16 }} onClick={action.fn}>{action.label}</button>}
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────

export function PostCard({ post, sportColor, sportName }) {
  function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (h < 1) return 'hace un momento';
    if (h < 24) return `hace ${h}h`;
    if (d < 7) return `hace ${d} día${d > 1 ? 's' : ''}`;
    return `hace más de una semana`;
  }
  const badgeClass = {
    noticia:'badge-noticia', foto:'badge-foto', evento:'badge-evento', resultado:'badge-resultado'
  }[post.type] || 'badge-noticia';

  return (
    <div className="post-card">
      <div className="post-header">
        <span className="sport-dot" style={{ background:sportColor }}/>
        <div className="post-meta">
          <div className="post-group" style={{ color:sportColor }}>{sportName}</div>
        </div>
        <span className="post-time">{timeAgo(post.createdAt)}</span>
      </div>
      <div className="post-body">
        <span className={`badge ${badgeClass}`} style={{ marginBottom:7, display:'inline-block' }}>
          {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
        </span>
        <div className="post-title">{post.title}</div>
        {post.type === 'foto' && (
          <div className="post-image-placeholder" style={{ background: `linear-gradient(135deg, ${post.imageColor || '#e2e8f0'}, ${post.imageColor || '#e2e8f0'}88)` }}>
            <svg width="32" height="32" style={{ color:'rgba(255,255,255,.5)' }}><Icon.Image/></svg>
          </div>
        )}
        <div className="post-text" style={{ marginTop: post.type === 'foto' ? 8 : 0 }}>{post.content}</div>
        {post.type === 'resultado' && (
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
            <span style={{ fontSize:28, fontWeight:900, color:'var(--text)', letterSpacing:-1 }}>{post.score}</span>
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

// ── Progress Ring ─────────────────────────────────────────────

export function ProgressRing({ value, max, color, size = 48, label }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - value / max);
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="4"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset .5s ease' }}/>
      </svg>
      {label && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:11, fontWeight:800, color:'var(--text)' }}>
          {label}
        </div>
      )}
    </div>
  );
}

// ── Radar Chart (skills) ──────────────────────────────────────

export function RadarChart({ skills, color = '#2563eb' }) {
  const entries = Object.entries(skills);
  const n = entries.length;
  if (!n) return null;
  const cx = 80, cy = 80, r = 60;
  const pts = entries.map(([, v], i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const scale = v / 100;
    return { x: cx + r * scale * Math.cos(angle), y: cy + r * scale * Math.sin(angle), fx: cx + r * Math.cos(angle), fy: cy + r * Math.sin(angle), label: entries[i][0], val: v };
  });
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const outerline = pts.map(p => `${p.fx},${p.fy}`).join(' ');
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <polygon points={outerline} fill="none" stroke="var(--border)" strokeWidth="1"/>
      <polygon points={outerline.split(' ').map(pt => { const [x,y]=pt.split(',').map(Number); return `${cx+(x-cx)*.66},${cy+(y-cy)*.66}`; }).join(' ')} fill="none" stroke="var(--border)" strokeWidth=".5"/>
      <polygon points={outerline.split(' ').map(pt => { const [x,y]=pt.split(',').map(Number); return `${cx+(x-cx)*.33},${cy+(y-cy)*.33}`; }).join(' ')} fill="none" stroke="var(--border)" strokeWidth=".5"/>
      {pts.map((p,i) => <line key={i} x1={cx} y1={cy} x2={p.fx} y2={p.fy} stroke="var(--border)" strokeWidth=".5"/>)}
      <polygon points={polyline} fill={color + '22'} stroke={color} strokeWidth="1.5"/>
      {pts.map((p,i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={color}/>
          <text x={p.fx + (p.fx-cx)*0.22} y={p.fy + (p.fy-cy)*0.22} textAnchor="middle" dominantBaseline="central"
            style={{ fontSize:9, fill:'var(--muted)', fontWeight:600 }}>{p.label}</text>
        </g>
      ))}
    </svg>
  );
}
