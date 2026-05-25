// ============================================================
// KLUP — Calendario del centro (Aragón 2024-25)
// ============================================================
import { useState } from 'react';
import { SPORTS, GROUPS, POSTS } from '../lib/mockData';

// Vacaciones escolares Aragón 2024-25
const HOLIDAYS = {
  '2024-10-31':'Todos los Santos',
  '2024-11-01':'Todos los Santos',
  '2024-12-06':'Constitución',
  '2024-12-09':'Puente',
  '2024-12-23':'Navidad','2024-12-24':'Navidad','2024-12-25':'Navidad',
  '2024-12-26':'Navidad','2024-12-27':'Navidad','2024-12-28':'Navidad',
  '2024-12-30':'Navidad','2024-12-31':'Navidad',
  '2025-01-01':'Año Nuevo','2025-01-02':'Navidad','2025-01-03':'Navidad',
  '2025-01-06':'Reyes',
  '2025-02-03':'Carnaval','2025-02-04':'Carnaval','2025-02-05':'Carnaval',
  '2025-04-14':'Semana Santa','2025-04-15':'Semana Santa','2025-04-16':'Semana Santa',
  '2025-04-17':'Jueves Santo','2025-04-18':'Viernes Santo',
  '2025-04-21':'Lunes Pascua','2025-04-22':'Semana Santa',
  '2025-04-23':'San Jorge (Aragón)',
  '2025-05-01':'Día del Trabajo','2025-05-02':'Puente',
  '2025-06-19':'Fin de curso',
};

const SPORT_COLORS = {
  s1:'#16a34a',s2:'#ea580c',s3:'#db2777',s4:'#9333ea',s5:'#dc2626',s6:'#0284c7'
};

function isoDate(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['L','M','X','J','V','S','D'];

export default function CenterCalendar() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(null);
  const [centerEvents, setCenterEvents] = useState([
    { date:'2025-05-31', title:'Exhibición fin de curso', type:'event', sports:['s1','s2','s3','s4','s5','s6'] },
    { date:'2025-06-07', title:'Torneo Iniciación Fútbol', type:'tournament', sports:['s1'] },
    { date:'2025-04-05', title:'Jornada de puertas abiertas', type:'event', sports:[] },
  ]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ date:'', title:'', type:'event', sports:[] });

  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const prev = () => { if (month===0) { setYear(y=>y-1); setMonth(11); } else setMonth(m=>m-1); };
  const next = () => { if (month===11) { setYear(y=>y+1); setMonth(0); } else setMonth(m=>m+1); };

  const getEventsForDate = (iso) => {
    const posts = POSTS.filter(p => p.type==='evento' &&
      new Date(p.createdAt).toISOString().slice(0,10) === iso);
    const center = centerEvents.filter(e => e.date === iso);
    return { posts, center };
  };

  const addEvent = () => {
    if (!newEvent.date || !newEvent.title) return;
    setCenterEvents(prev => [...prev, { ...newEvent }]);
    setNewEvent({ date:'', title:'', type:'event', sports:[] });
    setShowAddEvent(false);
  };

  const selectedDate = selected ? isoDate(year, month, selected) : null;
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : null;
  const isToday = (d) => {
    const t = new Date();
    return d === t.getDate() && month === t.getMonth() && year === t.getFullYear();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={prev}>
          <svg width="16" height="16"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <div style={{ flex:1, textAlign:'center', fontSize:16, fontWeight:700, color:'var(--text)' }}>
          {MONTHS_ES[month]} {year}
        </div>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={next}>
          <svg width="16" height="16"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddEvent(true)}>
          + Evento
        </button>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:12, fontSize:11 }}>
        {[['#fee2e2','Vacaciones'],['#dbeafe','Eventos centro'],['#dcfce7','Publicaciones grupo']].map(([bg,label])=>(
          <div key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:bg, border:'0.5px solid #00000015' }}/>
            <span style={{ color:'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Day headers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
        {DAYS_ES.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700,
            color:'var(--muted)', padding:'4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {/* Empty cells */}
        {Array.from({ length:firstDow }).map((_,i) => <div key={'e'+i}/>)}

        {/* Day cells */}
        {Array.from({ length:daysInMonth }).map((_,i) => {
          const day  = i + 1;
          const iso  = isoDate(year, month, day);
          const holiday = HOLIDAYS[iso];
          const { posts, center } = getEventsForDate(iso);
          const hasEvents = posts.length > 0 || center.length > 0;
          const isSelected = selected === day;
          const isWeekend = ((firstDow + i) % 7) >= 5;

          return (
            <div key={day} onClick={() => setSelected(selected===day ? null : day)}
              style={{ aspectRatio:'1', display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'flex-start', padding:'4px 2px', cursor:'pointer',
                borderRadius:8, transition:'background .1s',
                background: isSelected ? 'var(--blue)' :
                  holiday ? '#fee2e2' :
                  isToday(day) ? '#dbeafe' : 'transparent',
                border: isToday(day) && !isSelected ? '1.5px solid var(--blue)' : '1.5px solid transparent' }}>
              <div style={{ fontSize:13, fontWeight: isToday(day)||isSelected ? 700 : 400,
                color: isSelected ? 'white' :
                  holiday ? '#dc2626' :
                  isWeekend ? 'var(--muted)' : 'var(--text)',
                lineHeight:1.4 }}>
                {day}
              </div>
              {/* Event dots */}
              <div style={{ display:'flex', gap:2, marginTop:2 }}>
                {center.slice(0,2).map((e,j) => (
                  <div key={j} style={{ width:5, height:5, borderRadius:'50%',
                    background: isSelected ? 'white' : '#2563eb' }}/>
                ))}
                {posts.slice(0,1).map((p,j) => (
                  <div key={'p'+j} style={{ width:5, height:5, borderRadius:'50%',
                    background: isSelected ? 'white' : '#16a34a' }}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day details */}
      {selected && selectedDate && (
        <div style={{ marginTop:16, background:'var(--surface)', borderRadius:'var(--r-md)',
          border:'1px solid var(--border)', padding:'12px 14px' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:10 }}>
            {selected} de {MONTHS_ES[month]}
          </div>
          {HOLIDAYS[selectedDate] && (
            <div style={{ display:'flex', gap:8, alignItems:'center', padding:'7px 10px',
              background:'#fee2e2', borderRadius:'var(--r-sm)', marginBottom:6, fontSize:13,
              color:'#dc2626', fontWeight:600 }}>
              🎌 {HOLIDAYS[selectedDate]}
            </div>
          )}
          {selectedEvents?.center.map((e,i) => (
            <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'7px 10px',
              background:'#dbeafe', borderRadius:'var(--r-sm)', marginBottom:6 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#1e40af', flex:1 }}>{e.title}</span>
              <span style={{ fontSize:10, color:'#3b82f6', fontWeight:600, textTransform:'uppercase' }}>
                {e.type==='tournament'?'Torneo':'Evento'}
              </span>
            </div>
          ))}
          {selectedEvents?.posts.map((p,i) => {
            const sport = SPORTS.find(s => s.groups.includes(p.groupId));
            return (
              <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'7px 10px',
                background:'#dcfce7', borderRadius:'var(--r-sm)', marginBottom:6 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:sport?.color, marginTop:3, flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#166534' }}>{p.title}</div>
                  <div style={{ fontSize:11, color:'#16a34a' }}>{sport?.name}</div>
                </div>
              </div>
            );
          })}
          {!HOLIDAYS[selectedDate] && selectedEvents?.center.length===0 && selectedEvents?.posts.length===0 && (
            <div style={{ fontSize:13, color:'var(--light)', textAlign:'center', padding:'8px 0' }}>
              Sin eventos este día
            </div>
          )}
        </div>
      )}

      {/* Upcoming events list */}
      <div style={{ marginTop:16 }}>
        <div className="section-label">Próximos eventos del centro</div>
        {centerEvents
          .filter(e => new Date(e.date) >= new Date())
          .sort((a,b) => new Date(a.date)-new Date(b.date))
          .slice(0,5)
          .map((e,i) => {
            const d = new Date(e.date);
            return (
              <div key={i} className="agenda-item">
                <div className="agenda-date-box">
                  <div className="agenda-date-day">{d.getDate()}</div>
                  <div className="agenda-date-month">{MONTHS_ES[d.getMonth()].slice(0,3).toLowerCase()}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{e.title}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>
                    {e.sports.length > 0
                      ? e.sports.map(sid => SPORTS.find(s=>s.id===sid)?.name).filter(Boolean).join(', ')
                      : 'Todos los deportes'}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Add event modal */}
      {showAddEvent && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:200,
          display:'flex', alignItems:'flex-end' }} onClick={() => setShowAddEvent(false)}>
          <div style={{ background:'var(--surface)', borderRadius:'16px 16px 0 0', padding:'20px',
            width:'100%', maxHeight:'80vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Añadir evento</div>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input className="form-input" type="date" value={newEvent.date}
                onChange={e => setNewEvent(p=>({...p,date:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Título</label>
              <input className="form-input" placeholder="Ej: Torneo interclubes"
                value={newEvent.title} onChange={e => setNewEvent(p=>({...p,title:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-input form-select" value={newEvent.type}
                onChange={e => setNewEvent(p=>({...p,type:e.target.value}))}>
                <option value="event">Evento general</option>
                <option value="tournament">Torneo</option>
                <option value="closure">Cierre del centro</option>
                <option value="meeting">Reunión</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deportes afectados</label>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {SPORTS.map(s => {
                  const sel = newEvent.sports.includes(s.id);
                  return (
                    <div key={s.id} onClick={() => setNewEvent(p=>({
                      ...p, sports: sel ? p.sports.filter(x=>x!==s.id) : [...p.sports, s.id]
                    }))} style={{ padding:'5px 12px', borderRadius:99, fontSize:12, fontWeight:600,
                      cursor:'pointer', border:`1.5px solid ${sel?s.color:'var(--border)'}`,
                      background:sel?s.bg:'var(--surface)', color:sel?s.color:'var(--muted)' }}>
                      {s.name}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setShowAddEvent(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={addEvent}
                disabled={!newEvent.date || !newEvent.title}>Guardar evento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
