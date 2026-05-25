// ============================================================
// KLUP — Mock data (replace with real Supabase calls)
// ============================================================

export const SPORTS = [
  { id: 's1', name: 'Fútbol',   color: '#16a34a', bg: '#dcfce7', groups: ['g1','g2','g3'] },
  { id: 's2', name: 'Voley',    color: '#ea580c', bg: '#ffedd5', groups: ['g4','g5'] },
  { id: 's3', name: 'Rítmica',  color: '#db2777', bg: '#fce7f3', groups: ['g6','g7'] },
  { id: 's4', name: 'FitKids',  color: '#9333ea', bg: '#f3e8ff', groups: ['g8'] },
  { id: 's5', name: 'Karate',   color: '#dc2626', bg: '#fee2e2', groups: ['g9','g10'] },
  { id: 's6', name: 'Patinaje', color: '#0284c7', bg: '#e0f2fe', groups: ['g11'] },
];

export const GROUPS = {
  g1:  { id:'g1',  sportId:'s1', name:'Iniciación 1', count:15, maxCapacity:16, coachId:'c1' },
  g2:  { id:'g2',  sportId:'s1', name:'Iniciación 2', count:14, maxCapacity:16, coachId:'c2' },
  g3:  { id:'g3',  sportId:'s1', name:'Alevín A',     count:16, maxCapacity:16, coachId:'c1' },
  g4:  { id:'g4',  sportId:'s2', name:'Alevín A',     count:13, maxCapacity:14, coachId:'c1' },
  g5:  { id:'g5',  sportId:'s2', name:'Benjamín A',   count:15, maxCapacity:16, coachId:'c3' },
  g6:  { id:'g6',  sportId:'s3', name:'Benjamín A',   count:12, maxCapacity:14, coachId:'c4' },
  g7:  { id:'g7',  sportId:'s3', name:'Alevín A',     count:12, maxCapacity:14, coachId:'c4' },
  g8:  { id:'g8',  sportId:'s4', name:'Primaria',     count:15, maxCapacity:20, coachId:'c5' },
  g9:  { id:'g9',  sportId:'s5', name:'Cinturón Blanco', count:11, maxCapacity:16, coachId:'c6' },
  g10: { id:'g10', sportId:'s5', name:'Cinturón Amarillo', count:11, maxCapacity:16, coachId:'c6' },
  g11: { id:'g11', sportId:'s6', name:'Principiantes', count:13, maxCapacity:14, coachId:'c7' },
};

export const COACHES = [
  { id:'c1', name:'Juan Martínez',  email:'j.martinez@escolapias.es', groups:['g1','g4'], avatar:'JM' },
  { id:'c2', name:'Pedro López',    email:'p.lopez@escolapias.es',    groups:['g2'],      avatar:'PL' },
  { id:'c3', name:'Sara Gómez',     email:'s.gomez@escolapias.es',    groups:['g5'],      avatar:'SG' },
  { id:'c4', name:'Ana López',      email:'a.lopez@escolapias.es',    groups:['g6','g7'], avatar:'AL' },
  { id:'c5', name:'María Sánchez',  email:'m.sanchez@escolapias.es',  groups:['g8'],      avatar:'MS' },
  { id:'c6', name:'Tomás Ruiz',     email:'t.ruiz@escolapias.es',     groups:['g9','g10'],avatar:'TR' },
  { id:'c7', name:'Laura Navarro',  email:'l.navarro@escolapias.es',  groups:['g11'],     avatar:'LN' },
];

export const ATHLETES = [
  { id:'a1',  name:'Carlos García',  groupId:'g1', course:'4º Primaria', avatar:'CG', familyId:'f1' },
  { id:'a2',  name:'Luis Moreno',    groupId:'g1', course:'3º Primaria', avatar:'LM', familyId:'f2' },
  { id:'a3',  name:'Pablo Ruiz',     groupId:'g1', course:'4º Primaria', avatar:'PR', familyId:'f3' },
  { id:'a4',  name:'Adrián Soto',    groupId:'g1', course:'5º Primaria', avatar:'AS', familyId:'f4' },
  { id:'a5',  name:'Diego Torres',   groupId:'g1', course:'3º Primaria', avatar:'DT', familyId:'f5' },
  { id:'a6',  name:'Marcos Vidal',   groupId:'g1', course:'4º Primaria', avatar:'MV', familyId:'f6' },
  { id:'a7',  name:'Álvaro Pérez',   groupId:'g1', course:'5º Primaria', avatar:'AP', familyId:'f7' },
  { id:'a8',  name:'Samuel Blanco',  groupId:'g1', course:'4º Primaria', avatar:'SB', familyId:'f8' },
  { id:'a9',  name:'Nicolás Ramos',  groupId:'g1', course:'3º Primaria', avatar:'NR', familyId:'f9' },
  { id:'a10', name:'Héctor Martín',  groupId:'g1', course:'4º Primaria', avatar:'HM', familyId:'f10' },
  { id:'a11', name:'Rubén Castro',   groupId:'g1', course:'5º Primaria', avatar:'RC', familyId:'f11' },
  { id:'a12', name:'Sergio Gil',     groupId:'g1', course:'3º Primaria', avatar:'SG', familyId:'f12' },
  { id:'a13', name:'Jaime Ortiz',    groupId:'g1', course:'4º Primaria', avatar:'JO', familyId:'f13' },
  { id:'a14', name:'Mario Molina',   groupId:'g1', course:'4º Primaria', avatar:'MM', familyId:'f14' },
  { id:'a15', name:'Iván Cabrera',   groupId:'g1', course:'5º Primaria', avatar:'IC', familyId:'f15' },
  { id:'a16', name:'María Velasco',  groupId:'g4', course:'4º Primaria', avatar:'MV', familyId:'f16' },
  { id:'a17', name:'Sara Reyes',     groupId:'g4', course:'3º Primaria', avatar:'SR', familyId:'f17' },
  { id:'a18', name:'Irene Fuentes',  groupId:'g4', course:'4º Primaria', avatar:'IF', familyId:'f18' },
];

export const HEALTH_RECORDS = {
  a1: { allergies:'Polen', conditions:'Asma leve (inhalador)', medication:'Ventolin (bajo demanda)', emergencyName:'Ana García', emergencyPhone:'612 345 678', photoConsent:true },
  a3: { allergies:'Ninguna', conditions:'', medication:'', emergencyName:'Rosa Ruiz', emergencyPhone:'634 789 012', photoConsent:false },
};

export const POSTS = [
  { id:'p1', groupId:'g1', coachId:'c1', type:'evento', title:'Torneo Iniciación — Delicias', content:'Primer torneo de la temporada. Todos los jugadores deben llegar 30 min antes con equipación completa y botella de agua.', eventDate:'Sábado 7 jun · 10:00h', createdAt: new Date(Date.now()-2*3600000) },
  { id:'p2', groupId:'g1', coachId:'c1', type:'foto', title:'Entrenamiento del martes', content:'Gran sesión de técnica individual. Los chicos están progresando muy bien esta semana.', imageColor:'#bbf7d0', createdAt: new Date(Date.now()-5*86400000) },
  { id:'p3', groupId:'g1', coachId:'c1', type:'noticia', title:'Cambio de horario — junio', content:'Durante junio los entrenamientos serán los martes y jueves a las 18:00h en lugar de las 17:30h habituales.', createdAt: new Date(Date.now()-8*86400000) },
  { id:'p4', groupId:'g1', coachId:'c1', type:'resultado', title:'Partido amistoso vs Marist Brothers', content:'Partido muy bien jugado. Todos los jugadores tuvieron minutos.', score:'4–2', result:'Victoria', createdAt: new Date(Date.now()-14*86400000) },
  { id:'p5', groupId:'g6', coachId:'c4', type:'foto', title:'Fotos del entrenamiento especial', content:'Sesión con coreografía nueva para la exhibición de fin de curso.', imageColor:'#fce7f3', createdAt: new Date(Date.now()-5*3600000) },
  { id:'p6', groupId:'g8', coachId:'c5', type:'resultado', title:'Circuito de habilidades FitKids', content:'Resultados del circuito mensual de evaluación física.', createdAt: new Date(Date.now()-86400000) },
];

export const ATTENDANCE_TODAY = {
  g1: {
    date: new Date().toISOString().split('T')[0],
    records: {
      a1:'P', a2:'P', a3:'A', a4:'P', a5:'T', a6:'P',
      a7:'P', a8:'P', a9:'A', a10:'P', a11:'P', a12:'P',
      a13:'P', a14:'P', a15:'J',
    }
  }
};

export const PENDING_REQUESTS = [
  { id:'r1', type:'family', name:'Rosa Martínez',  email:'r.martinez@gmail.com', athleteName:'Pablo Martínez', athleteCourse:'4º Primaria', groupId:'g1', avatar:'RM' },
  { id:'r2', type:'family', name:'Laura Fernández',email:'l.fernandez@gmail.com', athleteName:'Elena Fernández', athleteCourse:'3º Primaria', groupId:'g4', avatar:'LF' },
  { id:'r3', type:'coach',  name:'Rubén Torres',   email:'r.torres@gmail.com',   groupId:'g2', sportId:'s1', avatar:'RT' },
];

export const WAITLIST = [
  { id:'w1', athleteName:'Pablo Martínez', groupId:'g3', familyName:'Rosa Martínez', position:1, requestedAt: new Date(Date.now()-3*86400000) },
  { id:'w2', athleteName:'Ana López',      groupId:'g11', familyName:'Marta López', position:1, requestedAt: new Date(Date.now()-86400000) },
];

export const OBSERVATIONS = [
  { id:'o1', athleteId:'a1', coachId:'c1', type:'tecnica',      content:'Muy buen trabajo en el control del balón. Mejorar el pie izquierdo.', isPrivate:false, createdAt: new Date(Date.now()-7*86400000) },
  { id:'o2', athleteId:'a1', coachId:'c1', type:'comportamiento',content:'Excelente actitud en los entrenamientos. Buen liderazgo.', isPrivate:false, createdAt: new Date(Date.now()-14*86400000) },
  { id:'o3', athleteId:'a1', coachId:'c1', type:'general',      content:'Nota privada: el niño parece tener problemas en casa, muestra distracción.', isPrivate:true, createdAt: new Date(Date.now()-2*86400000) },
  { id:'o4', athleteId:'a3', coachId:'c1', type:'tecnica',      content:'Necesita trabajar el disparo. Buen posicionamiento defensivo.', isPrivate:false, createdAt: new Date(Date.now()-10*86400000) },
];

export const NOTIFICATIONS = [
  { id:'n1', type:'post',      title:'Nuevo evento en Fútbol · Iniciación 1', text:'Torneo Iniciación — Delicias', read:false, createdAt: new Date(Date.now()-2*3600000) },
  { id:'n2', type:'approved',  title:'Solicitud aprobada', text:'Carlos García ya puede acceder al grupo', read:false, createdAt: new Date(Date.now()-5*86400000) },
  { id:'n3', type:'absence',   title:'Ausencia registrada', text:'Pablo Ruiz marcado como ausente hoy', read:true,  createdAt: new Date(Date.now()-86400000) },
];

export const SKILL_DOMAINS = {
  s1: ['Control', 'Pase', 'Disparo', 'Regate', 'Defensa', 'Físico'],
  s2: ['Saque',   'Remate', 'Bloqueo', 'Recepción', 'Colocación', 'Físico'],
  s3: ['Flexibilidad', 'Coordinación', 'Ritmo', 'Expresión', 'Técnica', 'Artístico'],
  s4: ['Fuerza', 'Resistencia', 'Coordinación', 'Velocidad', 'Equilibrio', 'Flexibilidad'],
  s5: ['Técnica', 'Potencia', 'Velocidad', 'Guardia', 'Kata', 'Disciplina'],
  s6: ['Equilibrio', 'Velocidad', 'Giros', 'Saltos', 'Técnica', 'Artístico'],
};

export const SKILL_ASSESSMENTS = {
  a1: { Control:72, Pase:85, Disparo:60, Regate:78, Defensa:65, Físico:80 }
};

export const CENTER = {
  id: 'centro1',
  name: 'Escolapias Calasanz',
  totalAthletes: 127,
  totalCoaches: 8,
  pendingRequests: 3,
  season: { name:'Temporada 2024-25', startDate:'Sep 2024', endDate:'Jun 2025' },
};

// Helpers
export function getSport(id) { return SPORTS.find(s => s.id === id); }
export function getSportByGroupId(groupId) {
  const g = GROUPS[groupId];
  if (!g) return null;
  return SPORTS.find(s => s.id === g.sportId);
}

export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  const w = Math.floor(diff / (7*86400000));
  if (h < 1)  return 'hace un momento';
  if (h < 24) return `hace ${h}h`;
  if (d < 7)  return `hace ${d} día${d>1?'s':''}`;
  if (w < 4)  return `hace ${w} semana${w>1?'s':''}`;
  return `hace más de un mes`;
}

export function countAttendance(records) {
  const counts = { P:0, A:0, T:0, J:0 };
  Object.values(records).forEach(s => counts[s]++);
  return counts;
}
