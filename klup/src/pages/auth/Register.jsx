// ============================================================
// KLUP — Register
// ============================================================
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../../components/ui/index';
import { SPORTS, GROUPS } from '../../lib/mockData';

const STEPS = ['Rol', 'Datos', 'Centro', 'RGPD'];

export default function Register({ onGoLogin }) {
  const { register } = useAuth();
  const [step, setStep]         = useState(0);
  const [role, setRole]         = useState('');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [sportId, setSportId]   = useState('');
  const [groupId, setGroupId]   = useState('');
  const [athleteName, setAthleteName]     = useState('');
  const [athleteCourse, setAthleteCourse] = useState('');
  const [rgpd, setRgpd]   = useState(false);
  const [photos, setPhotos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const filteredGroups = GROUPS
    ? Object.values(GROUPS).filter(g => g.sportId === sportId)
    : [];

  const canNext = () => {
    if (step === 0) return !!role;
    if (step === 1) return name.length > 1 && email.includes('@') && password.length >= 6;
    if (step === 2) return !!sportId && !!groupId && (role !== 'family' || (athleteName && athleteCourse));
    if (step === 3) return rgpd;
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await register({ role, name, email, password, sportId, groupId, athleteName, athleteCourse, photos });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      {/* Hero */}
      <div className="auth-hero" style={{ paddingTop:40, paddingBottom:28 }}>
        <div className="auth-logo">Klup</div>
        {/* Progress dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:16 }}>
          {STEPS.map((s,i) => (
            <div key={i} className={`onboarding-dot ${i<=step?'active':''}`}
              style={{ width: i===step ? 20 : 6 }}/>
          ))}
        </div>
        <div style={{ color:'rgba(255,255,255,.7)', fontSize:13, marginTop:8 }}>
          Paso {step+1} de {STEPS.length} · {STEPS[step]}
        </div>
      </div>

      {/* Card */}
      <div className="auth-card">
        {error && (
          <div style={{ background:'var(--ausente-bg)', color:'var(--ausente)', borderRadius:'var(--r-md)',
            padding:'10px 14px', fontSize:13, fontWeight:600, marginBottom:16 }}>
            {error}
          </div>
        )}

        {/* Step 0: Role */}
        {step === 0 && (
          <>
            <h2 className="auth-title">¿Cuál es tu rol?</h2>
            <p className="auth-subtitle">Selecciona cómo vas a usar Klup</p>
            <div className="role-grid">
              {[
                { id:'family',      label:'Familia',      desc:'Padre/madre de un atleta', icon:'👨‍👩‍👧' },
                { id:'coach',       label:'Entrenador',   desc:'Gestiono un grupo',         icon:'🏋️' },
                { id:'coordinator', label:'Coordinador',  desc:'Gestiono el centro',        icon:'🎯' },
              ].map(r => (
                <div key={r.id} className={`role-card ${role===r.id?'selected':''}`}
                  onClick={() => setRole(r.id)}>
                  <div className="role-card-icon">{r.icon}</div>
                  <div className="role-card-label">{r.label}</div>
                  <div className="role-card-desc">{r.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 1: Personal data */}
        {step === 1 && (
          <>
            <h2 className="auth-title">Tus datos</h2>
            <p className="auth-subtitle">Cómo quieres que te veamos en Klup</p>
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input className="form-input" placeholder="Ej: Juan Martínez"
                value={name} onChange={e => setName(e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="tu@email.com"
                value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" placeholder="Mínimo 6 caracteres"
                value={password} onChange={e => setPassword(e.target.value)}/>
              {password && (
                <div style={{ marginTop:6, display:'flex', gap:4 }}>
                  {[...Array(4)].map((_,i) => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:99,
                      background: i < Math.min(Math.floor(password.length/2),4)
                        ? ['#dc2626','#d97706','#f59e0b','#16a34a'][Math.min(Math.floor(password.length/2),4)-1]
                        : 'var(--border)' }}/>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Step 2: Center / Group */}
        {step === 2 && (
          <>
            <h2 className="auth-title">
              {role === 'family' ? 'Datos del atleta' : role === 'coach' ? 'Tu grupo' : 'Tu centro'}
            </h2>
            <p className="auth-subtitle">
              {role === 'family' ? 'A qué grupo pertenece tu hijo/a'
               : role === 'coach' ? 'Selecciona el grupo que vas a gestionar'
               : 'Selecciona tu centro deportivo'}
            </p>

            {role === 'family' && (
              <>
                <div className="form-group">
                  <label className="form-label">Nombre del atleta</label>
                  <input className="form-input" placeholder="Nombre de tu hijo/a"
                    value={athleteName} onChange={e => setAthleteName(e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Curso</label>
                  <select className="form-input form-select" value={athleteCourse}
                    onChange={e => setAthleteCourse(e.target.value)}>
                    <option value="">Seleccionar curso</option>
                    {['1º Primaria','2º Primaria','3º Primaria','4º Primaria','5º Primaria','6º Primaria'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Deporte</label>
              <div className="grid-2" style={{ marginBottom:0 }}>
                {SPORTS.map(s => (
                  <div key={s.id}
                    onClick={() => { setSportId(s.id); setGroupId(''); }}
                    style={{ padding:'10px 12px', borderRadius:'var(--r-md)',
                      border:`1.5px solid ${sportId===s.id ? s.color : 'var(--border)'}`,
                      background: sportId===s.id ? s.bg : 'var(--surface)',
                      cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                    <span className="sport-dot" style={{ background:s.color, width:10, height:10 }}/>
                    <span style={{ fontSize:13, fontWeight:700, color: sportId===s.id ? s.color : 'var(--text)' }}>
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {sportId && filteredGroups.length > 0 && (
              <div className="form-group">
                <label className="form-label">Grupo</label>
                <select className="form-input form-select" value={groupId} onChange={e => setGroupId(e.target.value)}>
                  <option value="">Seleccionar grupo</option>
                  {filteredGroups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} {g.count >= g.maxCapacity ? '(lista de espera)' : `(${g.maxCapacity - g.count} plazas)`}
                    </option>
                  ))}
                </select>
                {groupId && GROUPS[groupId]?.count >= GROUPS[groupId]?.maxCapacity && (
                  <div className="warning-banner" style={{ marginTop:8, marginBottom:0 }}>
                    <svg width="15" height="15"><Icon.Alert/></svg>
                    El grupo está lleno. Entrarás en lista de espera.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 3: RGPD */}
        {step === 3 && (
          <>
            <h2 className="auth-title">Privacidad y datos</h2>
            <p className="auth-subtitle">Por favor lee y acepta antes de continuar</p>

            <div style={{ background:'var(--bg)', borderRadius:'var(--r-md)', padding:'12px 14px',
              marginBottom:16, maxHeight:180, overflowY:'auto', fontSize:13, color:'var(--muted)', lineHeight:1.6 }}>
              <strong style={{ color:'var(--text)' }}>Política de privacidad (RGPD)</strong><br/><br/>
              Klup trata tus datos personales con el único propósito de gestionar la plataforma deportiva del centro.
              Tus datos no serán cedidos a terceros sin tu consentimiento explícito.<br/><br/>
              <strong style={{ color:'var(--text)' }}>Datos recogidos:</strong> nombre, email, datos del atleta (menores).<br/>
              <strong style={{ color:'var(--text)' }}>Responsable:</strong> Escolapias Calasanz.<br/>
              <strong style={{ color:'var(--text)' }}>Derechos:</strong> acceso, rectificación y eliminación de datos a través de la plataforma.<br/>
              Puedes revocar tu consentimiento en cualquier momento desde Configuración.
            </div>

            <div onClick={() => setRgpd(r => !r)} style={{ display:'flex', alignItems:'flex-start',
              gap:10, cursor:'pointer', marginBottom:16 }}>
              <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${rgpd ? 'var(--blue)' : 'var(--border)'}`,
                background: rgpd ? 'var(--blue)' : 'transparent', display:'flex', alignItems:'center',
                justifyContent:'center', flexShrink:0, marginTop:1, transition:'all .15s' }}>
                {rgpd && <svg width="12" height="12" style={{ color:'white' }}><Icon.Check/></svg>}
              </div>
              <span style={{ fontSize:13, color:'var(--text)', lineHeight:1.5 }}>
                He leído y acepto la <strong>política de privacidad</strong> y el tratamiento de mis datos personales.
              </span>
            </div>

            {role === 'family' && (
              <div onClick={() => setPhotos(p => !p)} style={{ display:'flex', alignItems:'flex-start',
                gap:10, cursor:'pointer', marginBottom:16 }}>
                <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${photos ? 'var(--blue)' : 'var(--border)'}`,
                  background: photos ? 'var(--blue)' : 'transparent', display:'flex', alignItems:'center',
                  justifyContent:'center', flexShrink:0, marginTop:1, transition:'all .15s' }}>
                  {photos && <svg width="12" height="12" style={{ color:'white' }}><Icon.Check/></svg>}
                </div>
                <span style={{ fontSize:13, color:'var(--text)', lineHeight:1.5 }}>
                  <strong>(Opcional)</strong> Autorizo la publicación de fotos y vídeos de mi hijo/a en los comunicados del grupo.
                </span>
              </div>
            )}

            <div style={{ background:'var(--presente-bg)', borderRadius:'var(--r-md)', padding:'10px 14px',
              fontSize:12, color:'#166534', marginBottom:4, display:'flex', gap:8, alignItems:'flex-start' }}>
              <svg width="14" height="14" style={{ flexShrink:0, marginTop:1 }}><Icon.Lock/></svg>
              Tu cuenta quedará pendiente de aprobación del{role==='family'?' entrenador':' coordinador'}.
              Recibirás una notificación cuando sea activada.
            </div>
          </>
        )}

        {/* Navigation */}
        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(s => s-1)} style={{ flex:1, height:48 }}>
              Atrás
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" style={{ flex:2, height:48, fontSize:15 }}
              onClick={() => setStep(s => s+1)} disabled={!canNext()}>
              Continuar
            </button>
          ) : (
            <button className="btn btn-primary" style={{ flex:2, height:48, fontSize:15 }}
              onClick={handleSubmit} disabled={!canNext() || loading}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--muted)' }}>
          <span>¿Ya tienes cuenta? </span>
          <button onClick={onGoLogin}
            style={{ color:'var(--blue)', fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
