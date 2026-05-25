// ============================================================
// KLUP — Login
// ============================================================
import { useState } from 'react';
import { useAuth, useTheme } from '../../contexts/AuthContext';
import { Icon } from '../../components/ui/index';

export default function Login({ onGoRegister }) {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPwd, setShowPwd]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role) => {
    setLoading(true);
    const creds = {
      coordinator: ['coordinador@klup.es', 'klup2025'],
      coach:       ['entrenador@klup.es',  'klup2025'],
      family:      ['familia@klup.es',     'klup2025'],
    }[role];
    try { await login(creds[0], creds[1]); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-screen">
      {/* Theme toggle */}
      <div style={{ position:'absolute', top:16, right:16 }}>
        <button className="theme-toggle" onClick={toggle} aria-label="Cambiar tema">
          <svg width="18" height="18">{theme==='dark' ? <Icon.Sun/> : <Icon.Moon/>}</svg>
        </button>
      </div>

      {/* Hero */}
      <div className="auth-hero">
        <div className="auth-logo">Klup</div>
        <div className="auth-tagline">Tu centro deportivo, en tu bolsillo</div>
        {/* Decorative dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:20 }}>
          {['#ffffff55','#ffffff33','#ffffff22'].map((c,i) => (
            <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:c }}/>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="auth-card">
        <h1 className="auth-title">Bienvenido</h1>
        <p className="auth-subtitle">Accede a tu centro deportivo</p>

        {error && (
          <div style={{ background:'var(--ausente-bg)', color:'var(--ausente)', borderRadius:'var(--r-md)',
            padding:'10px 14px', fontSize:13, fontWeight:600, marginBottom:16, display:'flex', gap:8, alignItems:'flex-start' }}>
            <svg width="16" height="16" style={{ flexShrink:0, marginTop:1 }}><Icon.Alert/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="tu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position:'relative' }}>
              <input className="form-input" type={showPwd ? 'text' : 'password'}
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password" style={{ paddingRight:44 }}/>
              <button type="button" onClick={() => setShowPwd(s => !s)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  color:'var(--light)', background:'none', border:'none', padding:4 }}>
                <svg width="18" height="18"><Icon.Eye/></svg>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}
            style={{ marginBottom:12, height:48, fontSize:15 }}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign:'center', fontSize:13, color:'var(--muted)', marginBottom:16 }}>
          <span>¿No tienes cuenta? </span>
          <button onClick={onGoRegister}
            style={{ color:'var(--blue)', fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>
            Regístrate
          </button>
        </div>

        {/* Demo access */}
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
          <div style={{ fontSize:12, color:'var(--light)', textAlign:'center', marginBottom:10, fontWeight:600 }}>
            ACCESO DEMO
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { label:'Coordinador', role:'coordinator', color:'#2563eb' },
              { label:'Entrenador',  role:'coach',       color:'#16a34a' },
              { label:'Familia',     role:'family',      color:'#9333ea' },
            ].map(d => (
              <button key={d.role} onClick={() => demoLogin(d.role)} disabled={loading}
                style={{ padding:'9px 6px', borderRadius:'var(--r-md)', border:`1.5px solid ${d.color}30`,
                  background:`${d.color}10`, color:d.color, fontSize:12, fontWeight:700, cursor:'pointer',
                  transition:'all .15s' }}>
                {d.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize:11, color:'var(--light)', textAlign:'center', marginTop:8 }}>
            Contraseña demo: klup2025
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing Eye icon
Icon.Eye = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
