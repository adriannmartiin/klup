// ============================================================
// KLUP — App Router
// ============================================================
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login     from './pages/auth/Login';
import Register  from './pages/auth/Register';
import CoordinatorApp from './pages/coordinator/CoordinatorApp';
import CoachApp       from './pages/coach/CoachApp';
import FamilyApp      from './pages/family/FamilyApp';

export default function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('login');

  if (loading) return <LoadingSplash/>;
  if (!user) {
    if (screen === 'register') return <Register onGoLogin={() => setScreen('login')}/>;
    return <Login onGoRegister={() => setScreen('register')}/>;
  }
  if (user.status === 'pending') return <PendingApproval user={user}/>;
  if (user.role === 'coordinator') return <CoordinatorApp/>;
  if (user.role === 'coach')       return <CoachApp/>;
  if (user.role === 'family')      return <FamilyApp/>;
  return <div style={{ padding:32 }}>Rol desconocido: {user.role}</div>;
}

function LoadingSplash() {
  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)' }}>
      <div style={{ fontSize:44, fontWeight:900, color:'white', letterSpacing:-1.5, marginBottom:16 }}>
        Klup
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'rgba(255,255,255,.5)',
            animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}`}</style>
    </div>
  );
}

function PendingApproval({ user }) {
  const { logout } = useAuth();
  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding:32, background:'var(--bg)', textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>⏳</div>
      <div style={{ fontSize:22, fontWeight:800, color:'var(--text)', marginBottom:8 }}>Pendiente de aprobación</div>
      <div style={{ fontSize:14, color:'var(--muted)', maxWidth:280, lineHeight:1.6, marginBottom:24 }}>
        Tu cuenta está pendiente de aprobación. Recibirás una notificación cuando sea activada.
      </div>
      <button onClick={logout} style={{ background:'none', border:'none', color:'var(--muted)',
        fontSize:13, cursor:'pointer', textDecoration:'underline' }}>Cerrar sesión</button>
    </div>
  );
}
