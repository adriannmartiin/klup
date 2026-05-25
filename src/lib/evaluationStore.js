// ============================================================
// KLUP — Evaluation Store (compartido coach ↔ familia)
// Módulo con estado global en memoria durante la sesión.
// En producción esto iría a Supabase.
// ============================================================

export const DEFAULT_TEMPLATE = [
  {
    id:'cat1', name:'Comportamiento', color:'#9333ea',
    criteria:[
      { id:'cr1', name:'Respeta a los compañeros' },
      { id:'cr2', name:'Se porta bien en entrenamiento' },
      { id:'cr3', name:'Hace caso al entrenador' },
    ]
  },
  {
    id:'cat2', name:'Táctica', color:'#2563eb',
    criteria:[
      { id:'cr4', name:'Se posiciona bien en el campo' },
      { id:'cr5', name:'Toma decisiones rápidas' },
      { id:'cr6', name:'Lee el juego' },
    ]
  },
  {
    id:'cat3', name:'Técnica', color:'#16a34a',
    criteria:[
      { id:'cr7', name:'Pisa bien la pelota' },
      { id:'cr8', name:'Pases precisos' },
      { id:'cr9', name:'Controla con las dos piernas' },
      { id:'cr10', name:'Disparo a portería' },
    ]
  },
];

// Pre-loaded evaluation history per athlete (demo)
const _history = {
  a1: [
    {
      id:'ev1', date: new Date(Date.now() - 7*86400000),
      label:'Evaluación mayo 2025',
      coachName:'Juan Martínez',
      template: DEFAULT_TEMPLATE,
      scores:{ cr1:8, cr2:9, cr3:7, cr4:6, cr5:7, cr6:6, cr7:8, cr8:8, cr9:7, cr10:6 },
    },
    {
      id:'ev2', date: new Date(Date.now() - 60*86400000),
      label:'Evaluación marzo 2025',
      coachName:'Juan Martínez',
      template: DEFAULT_TEMPLATE,
      scores:{ cr1:7, cr2:7, cr3:6, cr4:5, cr5:5, cr6:5, cr7:6, cr8:7, cr9:6, cr10:5 },
    },
  ],
  a3: [
    {
      id:'ev3', date: new Date(Date.now() - 7*86400000),
      label:'Evaluación mayo 2025',
      coachName:'Juan Martínez',
      template: DEFAULT_TEMPLATE,
      scores:{ cr1:6, cr2:5, cr3:6, cr4:7, cr5:6, cr6:5, cr7:5, cr8:5, cr9:4, cr10:4 },
    },
  ],
};

// Template per group (starts with DEFAULT_TEMPLATE)
const _templates = {};

// ── Public API ────────────────────────────────────────────────

export function getTemplate(groupId) {
  return _templates[groupId] || DEFAULT_TEMPLATE;
}

export function saveTemplate(groupId, template) {
  _templates[groupId] = template;
}

export function getHistory(athleteId) {
  return _history[athleteId] || [];
}

export function getLatestEvaluation(athleteId) {
  const h = getHistory(athleteId);
  return h.length > 0 ? h[0] : null;
}

export function addEvaluation({ athleteId, scores, template, coachName, label }) {
  if (!_history[athleteId]) _history[athleteId] = [];
  const entry = {
    id: 'ev' + Date.now(),
    date: new Date(),
    label: label || `Evaluación ${new Date().toLocaleDateString('es-ES', { month:'long', year:'numeric' })}`,
    coachName: coachName || 'Entrenador',
    template: JSON.parse(JSON.stringify(template)),
    scores: { ...scores },
  };
  _history[athleteId].unshift(entry);
  return entry;
}

// ── Helpers ───────────────────────────────────────────────────

export function calcAvg(scores, template) {
  const allCriteria = template.flatMap(cat => cat.criteria);
  const vals = allCriteria.map(cr => scores[cr.id]).filter(v => v !== undefined && v !== null);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a,b) => a+b, 0) / vals.length) * 10) / 10;
}

export function calcCatAvg(scores, cat) {
  const vals = cat.criteria.map(cr => scores[cr.id]).filter(v => v !== undefined && v !== null);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a,b) => a+b, 0) / vals.length) * 10) / 10;
}

export function scoreColor(v) {
  if (v === null || v === undefined) return 'var(--light)';
  if (v >= 8) return '#16a34a';
  if (v >= 6) return '#2563eb';
  if (v >= 4) return '#d97706';
  return '#dc2626';
}
