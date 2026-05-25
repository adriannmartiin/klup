// ============================================================
// KLUP — Generador de Documentos con IA
// ============================================================
import { useState } from 'react';
import { SPORTS, GROUPS, ATHLETES, COACHES, CENTER } from '../../lib/mockData';
import { Icon } from '../../components/ui/index';

// ── Document type definitions ─────────────────────────────────

const DOC_TYPES = [
  {
    id: 'baja_voluntaria',
    label: 'Baja voluntaria',
    emoji: '📋',
    desc: 'Solicitud de baja de un atleta del centro',
    color: '#dc2626', bg: '#fee2e2',
    fields: [
      { id:'athlete',     label:'Atleta',         type:'athlete_select' },
      { id:'fecha_baja',  label:'Fecha de baja',  type:'date' },
      { id:'motivo',      label:'Motivo de la baja', type:'textarea', placeholder:'Ej: Cambio de residencia, incompatibilidad horaria…' },
      { id:'firmante',    label:'Firmado por',    type:'text', placeholder:'Nombre del padre/madre/tutor' },
    ]
  },
  {
    id: 'certificado_ausencia',
    label: 'Certificado de ausencia',
    emoji: '📄',
    desc: 'Justificante de falta a entrenamiento/actividad',
    color: '#2563eb', bg: '#dbeafe',
    fields: [
      { id:'athlete',     label:'Atleta',         type:'athlete_select' },
      { id:'fecha',       label:'Fecha de ausencia', type:'date' },
      { id:'motivo',      label:'Motivo',         type:'select', options:['Motivo laboral del progenitor','Cita médica','Viaje familiar','Enfermedad','Otro'] },
      { id:'detalle',     label:'Detalle (opcional)', type:'text', placeholder:'Ej: nombre de la empresa, tipo de cita…' },
      { id:'firmante',    label:'Firmado por',    type:'text', placeholder:'Nombre del padre/madre/tutor' },
    ]
  },
  {
    id: 'certificado_participacion',
    label: 'Certificado de participación',
    emoji: '🏅',
    desc: 'Acredita la participación de un atleta en el centro',
    color: '#16a34a', bg: '#dcfce7',
    fields: [
      { id:'athlete',     label:'Atleta',         type:'athlete_select' },
      { id:'desde',       label:'Desde',          type:'date' },
      { id:'hasta',       label:'Hasta',          type:'date' },
      { id:'logros',      label:'Logros o menciones (opcional)', type:'text', placeholder:'Ej: participación en torneo, mejor compañero…' },
    ]
  },
  {
    id: 'certificado_inscripcion',
    label: 'Certificado de inscripción',
    emoji: '📝',
    desc: 'Confirma la inscripción de un atleta en el centro',
    color: '#9333ea', bg: '#f3e8ff',
    fields: [
      { id:'athlete',     label:'Atleta',         type:'athlete_select' },
      { id:'fecha_inscripcion', label:'Fecha de inscripción', type:'date' },
      { id:'cuota',       label:'Cuota mensual (€)', type:'number', placeholder:'26' },
    ]
  },
  {
    id: 'comunicado_familias',
    label: 'Comunicado a familias',
    emoji: '📢',
    desc: 'Carta formal dirigida a las familias',
    color: '#ea580c', bg: '#ffedd5',
    fields: [
      { id:'destinatario', label:'Destinatarios', type:'select', options:['Todas las familias','Familias de Fútbol','Familias de Voley','Familias de Rítmica','Familias de FitKids','Familias de Karate','Familias de Patinaje'] },
      { id:'asunto',      label:'Asunto',         type:'text', placeholder:'Ej: Cambio de horarios para junio' },
      { id:'contenido',   label:'Contenido principal', type:'textarea', placeholder:'Explica brevemente el mensaje…' },
    ]
  },
  {
    id: 'recibo_pago',
    label: 'Recibo de pago',
    emoji: '🧾',
    desc: 'Justificante de cobro de cuota mensual',
    color: '#0284c7', bg: '#e0f2fe',
    fields: [
      { id:'athlete',     label:'Atleta',         type:'athlete_select' },
      { id:'mes',         label:'Mes y año',      type:'month' },
      { id:'concepto',    label:'Concepto',       type:'select', options:['Cuota mensual','Cuota mensual + ficha federativa','Cuota mensual + equipación','Inscripción','Pago único'] },
      { id:'importe',     label:'Importe (€)',    type:'number', placeholder:'26' },
      { id:'forma_pago',  label:'Forma de pago',  type:'select', options:['Efectivo','Transferencia bancaria','Domiciliación bancaria','Bizum'] },
    ]
  },
  {
    id: 'informe_incidencia',
    label: 'Informe de incidencia',
    emoji: '⚠️',
    desc: 'Registro formal de una incidencia o lesión',
    color: '#d97706', bg: '#fef3c7',
    fields: [
      { id:'athlete',     label:'Atleta afectado', type:'athlete_select' },
      { id:'fecha',       label:'Fecha',           type:'date' },
      { id:'tipo',        label:'Tipo',            type:'select', options:['Lesión física','Accidente','Conflicto entre compañeros','Conducta inapropiada','Otro'] },
      { id:'descripcion', label:'Descripción detallada', type:'textarea', placeholder:'Qué ocurrió, cómo, dónde…' },
      { id:'medidas',     label:'Medidas tomadas', type:'textarea', placeholder:'Cómo se actuó, si se comunicó a la familia…' },
      { id:'firmante',    label:'Entrenador responsable', type:'coach_select' },
    ]
  },
  {
    id: 'autorizacion_salida',
    label: 'Autorización de salida',
    emoji: '🚌',
    desc: 'Permiso parental para actividad fuera del centro',
    color: '#64748b', bg: '#f1f5f9',
    fields: [
      { id:'actividad',   label:'Actividad',      type:'text', placeholder:'Ej: Torneo en Delicias, visita al polideportivo…' },
      { id:'fecha',       label:'Fecha',           type:'date' },
      { id:'hora_salida', label:'Hora de salida',  type:'time' },
      { id:'hora_regreso',label:'Hora de regreso', type:'time' },
      { id:'transporte',  label:'Transporte',      type:'select', options:['Autobús escolar','Transporte público','Vehículo particular','A pie'] },
      { id:'deporte',     label:'Deporte',         type:'sport_select' },
    ]
  },
];

// ── Component ──────────────────────────────────────────────────

export default function DocumentGenerator() {
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData]         = useState({});
  const [generating, setGenerating]     = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [error, setError]               = useState('');
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const docType = DOC_TYPES.find(d => d.id === selectedType);

  const setField = (id, val) => setFormData(p => ({ ...p, [id]: val }));

  const isComplete = () => {
    if (!docType) return false;
    return docType.fields.every(f => {
      if (f.type === 'textarea' && f.placeholder?.includes('opcional')) return true;
      if (f.id === 'detalle' || f.id === 'logros') return true;
      return !!formData[f.id];
    });
  };

  // Resolve athlete info from id
  const resolveAthleteInfo = (athleteId) => {
    const a = ATHLETES.find(x => x.id === athleteId);
    if (!a) return athleteId;
    const sport = SPORTS.find(s => s.groups.includes(a.groupId));
    const group = GROUPS[a.groupId];
    return `${a.name} (${sport?.name || ''} – ${group?.name || ''}, ${a.course})`;
  };

  // Resolve coach info
  const resolveCoachInfo = (coachId) => {
    const c = COACHES.find(x => x.id === coachId);
    return c ? c.name : coachId;
  };

  // Build context string for AI
  const buildContext = () => {
    const fields = { ...formData };
    if (fields.athlete) fields.athlete = resolveAthleteInfo(fields.athlete);
    if (fields.firmante_coach) fields.firmante = resolveCoachInfo(fields.firmante_coach);

    const fieldLines = docType.fields
      .map(f => {
        const val = fields[f.id];
        if (!val) return null;
        return `- ${f.label}: ${val}`;
      })
      .filter(Boolean)
      .join('\n');

    return fieldLines;
  };

  const generateDocument = async () => {
    setGenerating(true);
    setError('');
    setGeneratedDoc(null);
    setApiKeyMissing(false);

    const today = new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });

    const systemPrompt = `Eres un asistente que genera documentos oficiales formales para ${CENTER.name}, un centro deportivo escolar de Zaragoza.
Genera documentos completos, profesionales y con el formato correcto: membrete del centro, fecha, cuerpo del documento y espacio para firma.
Usa un lenguaje formal en español. Incluye todos los datos proporcionados de forma natural en el texto.
Responde ÚNICAMENTE con el texto del documento, sin explicaciones adicionales ni comentarios.
Hoy es ${today}.`;

    const userMessage = `Genera un documento de tipo "${docType.label}" con los siguientes datos:

${buildContext()}

Centro: ${CENTER.name}, Escolapias Calasanz, Zaragoza
Temporada: ${CENTER.season.name}

El documento debe incluir:
1. Membrete del centro (nombre, ciudad)
2. Fecha actual
3. Cuerpo formal del documento con todos los datos
4. Línea de firma al final

Genera el documento completo y listo para imprimir.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes('ANTHROPIC_API_KEY')) {
          setApiKeyMissing(true);
        } else {
          setError(data.error || 'Error generando el documento');
        }
        return;
      }

      setGeneratedDoc(data.content);
    } catch (err) {
      setError('No se pudo conectar con el servidor. Comprueba la conexión.');
    } finally {
      setGenerating(false);
    }
  };

  const printDocument = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head>
        <meta charset="UTF-8">
        <title>${docType?.label} — ${CENTER.name}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.7;
            max-width: 700px; margin: 40px auto; color: #111; }
          pre { white-space: pre-wrap; font-family: inherit; font-size: 12pt; }
          @media print { body { margin: 20mm; } }
        </style>
      </head><body>
        <pre>${generatedDoc}</pre>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDoc);
  };

  return (
    <div>
      {!selectedType ? (
        /* ── Document type selector ── */
        <>
          <div style={{ fontSize:13, color:'var(--muted)', marginBottom:18, lineHeight:1.6 }}>
            Selecciona el tipo de documento. Rellena los datos y la IA generará el documento completo y formal listo para imprimir.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
            {DOC_TYPES.map(doc => (
              <div key={doc.id} onClick={() => { setSelectedType(doc.id); setFormData({}); setGeneratedDoc(null); }}
                style={{ padding:'14px', borderRadius:'var(--r-md)', cursor:'pointer', transition:'all .15s',
                  border:`1.5px solid ${doc.color}30`, background:doc.bg,
                  display:'flex', flexDirection:'column', gap:6 }}>
                <div style={{ fontSize:24 }}>{doc.emoji}</div>
                <div style={{ fontSize:14, fontWeight:700, color:doc.color }}>{doc.label}</div>
                <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.4 }}>{doc.desc}</div>
              </div>
            ))}
          </div>
        </>
      ) : !generatedDoc ? (
        /* ── Form ── */
        <>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <button onClick={() => { setSelectedType(null); setError(''); }}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)',
                display:'flex', alignItems:'center', gap:4, fontSize:13, fontWeight:600 }}>
              ← Volver
            </button>
            <div style={{ width:32, height:32, borderRadius:'var(--r-md)', background:docType.bg,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
              {docType.emoji}
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:docType.color }}>{docType.label}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>{docType.desc}</div>
            </div>
          </div>

          {error && (
            <div style={{ background:'var(--ausente-bg)', color:'var(--ausente)', borderRadius:'var(--r-md)',
              padding:'10px 14px', fontSize:13, fontWeight:600, marginBottom:14 }}>
              {error}
            </div>
          )}

          {apiKeyMissing && (
            <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'var(--r-md)',
              padding:'12px 14px', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#92400e', marginBottom:4 }}>
                ⚙️ Configura la API key de Claude
              </div>
              <div style={{ fontSize:12, color:'#b45309', lineHeight:1.6 }}>
                Para generar documentos con IA necesitas añadir tu API key:<br/>
                <strong>Vercel → Settings → Environment Variables</strong><br/>
                Nombre: <code style={{ background:'#fef9c3', padding:'1px 4px', borderRadius:3 }}>ANTHROPIC_API_KEY</code><br/>
                Valor: tu clave de <a href="https://console.anthropic.com" target="_blank" style={{ color:'#2563eb' }}>console.anthropic.com</a><br/>
                Después haz Redeploy en Vercel.
              </div>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {docType.fields.map(field => (
              <div key={field.id} className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">{field.label}</label>

                {field.type === 'athlete_select' && (
                  <select className="form-input form-select"
                    value={formData[field.id]||''} onChange={e => setField(field.id, e.target.value)}>
                    <option value="">Seleccionar atleta…</option>
                    {SPORTS.map(s => (
                      <optgroup key={s.id} label={s.name}>
                        {ATHLETES.filter(a => s.groups.includes(a.groupId)).map(a => (
                          <option key={a.id} value={a.id}>{a.name} — {GROUPS[a.groupId]?.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}

                {field.type === 'coach_select' && (
                  <select className="form-input form-select"
                    value={formData[field.id]||''} onChange={e => setField(field.id, e.target.value)}>
                    <option value="">Seleccionar entrenador…</option>
                    {COACHES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}

                {field.type === 'sport_select' && (
                  <select className="form-input form-select"
                    value={formData[field.id]||''} onChange={e => setField(field.id, e.target.value)}>
                    <option value="">Seleccionar deporte…</option>
                    {SPORTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}

                {field.type === 'select' && (
                  <select className="form-input form-select"
                    value={formData[field.id]||''} onChange={e => setField(field.id, e.target.value)}>
                    <option value="">Seleccionar…</option>
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}

                {field.type === 'text' && (
                  <input className="form-input" type="text" placeholder={field.placeholder||''}
                    value={formData[field.id]||''} onChange={e => setField(field.id, e.target.value)}/>
                )}

                {field.type === 'number' && (
                  <input className="form-input" type="number" placeholder={field.placeholder||''}
                    value={formData[field.id]||''} onChange={e => setField(field.id, e.target.value)}/>
                )}

                {field.type === 'date' && (
                  <input className="form-input" type="date"
                    value={formData[field.id]||''} onChange={e => setField(field.id, e.target.value)}/>
                )}

                {field.type === 'month' && (
                  <input className="form-input" type="month"
                    value={formData[field.id]||''} onChange={e => setField(field.id, e.target.value)}/>
                )}

                {field.type === 'time' && (
                  <input className="form-input" type="time"
                    value={formData[field.id]||''} onChange={e => setField(field.id, e.target.value)}/>
                )}

                {field.type === 'textarea' && (
                  <textarea className="form-input form-textarea" rows={3}
                    placeholder={field.placeholder||''}
                    value={formData[field.id]||''} onChange={e => setField(field.id, e.target.value)}/>
                )}
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-full" style={{ marginTop:20, height:50, fontSize:15 }}
            onClick={generateDocument} disabled={!isComplete() || generating}>
            {generating ? (
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ display:'inline-block', width:16, height:16, border:'2px solid white',
                  borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
                Generando documento…
              </span>
            ) : (
              <span>✨ Generar documento</span>
            )}
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </>
      ) : (
        /* ── Generated document preview ── */
        <>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <button onClick={() => setGeneratedDoc(null)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)',
                display:'flex', alignItems:'center', gap:4, fontSize:13, fontWeight:600 }}>
              ← Editar datos
            </button>
            <div style={{ flex:1 }}/>
            <button className="btn btn-ghost btn-sm" onClick={copyToClipboard}>
              📋 Copiar texto
            </button>
            <button className="btn btn-primary btn-sm" onClick={printDocument}>
              🖨 Imprimir / PDF
            </button>
          </div>

          {/* Document preview */}
          <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-md)',
            padding:'28px 32px', fontFamily:'Arial, sans-serif', fontSize:13, lineHeight:1.8,
            color:'#111', whiteSpace:'pre-wrap', boxShadow:'0 2px 8px rgba(0,0,0,.06)',
            minHeight:400 }}>
            {generatedDoc}
          </div>

          <div style={{ display:'flex', gap:10, marginTop:14 }}>
            <button className="btn btn-ghost" style={{ flex:1 }}
              onClick={() => { setGeneratedDoc(null); generateDocument(); }}>
              ↻ Regenerar
            </button>
            <button className="btn btn-primary" style={{ flex:2, height:46 }} onClick={printDocument}>
              🖨 Descargar como PDF
            </button>
          </div>

          <div style={{ textAlign:'center', fontSize:11, color:'var(--light)', marginTop:10 }}>
            Para guardar como PDF: en el diálogo de impresión selecciona "Guardar como PDF"
          </div>
        </>
      )}
    </div>
  );
}
