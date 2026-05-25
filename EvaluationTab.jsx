// ============================================================
// KLUP — Evaluación (plantilla personalizable + historial)
// ============================================================
import { useState } from 'react';
import { ATHLETES } from '../lib/mockData';
import { Icon, EmptyState } from './ui/index';
import {
  getTemplate, saveTemplate, getHistory, addEvaluation,
  calcAvg, calcCatAvg, scoreColor, DEFAULT_TEMPLATE
} from '../lib/evaluationStore';

function uid() { return 'id'+Date.now()+Math.random().toString(36).slice(2,5); }

const CAT_COLORS = ['#9333ea','#2563eb','#16a34a','#ea580c','#dc2626','#0284c7','#64748b'];

function ScoreBar({ value, color }) {
  if (value === null || value === undefined) return <span style={{ fontSize:12, color:'var(--light)' }}>—</span>;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ width:50, height:5, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${(value/10)*100}%`, background:color||scoreColor(value), borderRadius:99 }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:800, color:color||scoreColor(value), minWidth:20 }}>{value}</span>
    </div>
  );
}

export default function EvaluationTab({ groupId, sport, coachName }) {
  const [view, setView]   = useState('resultados');
  const [template, setTpl] = useState(() => getTemplate(groupId));
  const [, forceUpdate]   = useState(0);

  // Evaluation flow
  const [evalAthleteId, setEvalAthleteId] = useState('');
  const [draftScores, setDraftScores]     = useState({});
  const [evalLabel, setEvalLabel]         = useState('');
  const [savedToast, setSavedToast]       = useState(false);

  // Template editing
  const [expandedCat, setExpandedCat]     = useState('cat1');
  const [editingCatId, setEditingCatId]   = useState(null);
  const [editingCrId, setEditingCrId]     = useState(null);
  const [addingCrFor, setAddingCrFor]     = useState(null);
  const [newCrName, setNewCrName]         = useState('');
  const [addingCat, setAddingCat]         = useState(false);
  const [newCatName, setNewCatName]       = useState('');

  // Results
  const [expandedHistory, setExpandedHistory] = useState(null); // athleteId
  const [selectedEvalId, setSelectedEvalId]   = useState(null); // specific evaluation id

  const athletes     = ATHLETES.filter(a => a.groupId === groupId);
  const totalCriteria = template.reduce((acc,cat) => acc+cat.criteria.length, 0);

  // ── Template actions ──────────────────────────────────────

  const updateTpl = (newTpl) => {
    setTpl(newTpl);
    saveTemplate(groupId, newTpl);
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const id = uid();
    const next = [...template, { id, name:newCatName.trim(),
      color:CAT_COLORS[template.length % CAT_COLORS.length], criteria:[] }];
    updateTpl(next);
    setNewCatName(''); setAddingCat(false); setExpandedCat(id);
  };

  const deleteCategory = (catId) => updateTpl(template.filter(c => c.id!==catId));

  const renameCat = (catId, name) =>
    updateTpl(template.map(cat => cat.id===catId ? { ...cat, name } : cat));

  const addCriterion = (catId) => {
    if (!newCrName.trim()) return;
    const id = uid();
    updateTpl(template.map(cat => cat.id===catId
      ? { ...cat, criteria:[...cat.criteria, { id, name:newCrName.trim() }] } : cat));
    setNewCrName(''); setAddingCrFor(null);
  };

  const deleteCriterion = (catId, crId) =>
    updateTpl(template.map(cat => cat.id===catId
      ? { ...cat, criteria:cat.criteria.filter(cr => cr.id!==crId) } : cat));

  const renameCr = (catId, crId, name) =>
    updateTpl(template.map(cat => cat.id===catId
      ? { ...cat, criteria:cat.criteria.map(cr => cr.id===crId ? { ...cr, name } : cr) } : cat));

  // ── Evaluation actions ────────────────────────────────────

  const startEval = (athleteId) => {
    const latest = getHistory(athleteId)[0];
    setDraftScores(latest ? { ...latest.scores } : {});
    setEvalAthleteId(athleteId);
    setEvalLabel(`Evaluación ${new Date().toLocaleDateString('es-ES', { month:'long', year:'numeric' })}`);
    setView('evaluar');
  };

  const saveEval = () => {
    addEvaluation({ athleteId:evalAthleteId, scores:draftScores,
      template, coachName:coachName||'Entrenador', label:evalLabel });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
    forceUpdate(n => n+1);
    setView('resultados');
    setEvalAthleteId('');
  };

  return (
    <div>
      {/* View selector */}
      <div style={{ display:'flex', gap:4, marginBottom:18, borderBottom:'1px solid var(--border)' }}>
        {[['resultados','Historial'],['evaluar','Nueva eval.'],['plantilla','Plantilla']].map(([id,label]) => (
          <button key={id} onClick={() => { setView(id); if(id!=='evaluar') setEvalAthleteId(''); }}
            style={{ padding:'8px 16px', fontWeight:view===id?700:500, fontSize:13,
              color:view===id?'var(--blue)':'var(--muted)', background:'none', border:'none',
              borderBottom:view===id?'2.5px solid var(--blue)':'2.5px solid transparent',
              cursor:'pointer', marginBottom:-1 }}>
            {label}
          </button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6,
          fontSize:11, color:'var(--muted)', paddingBottom:8 }}>
          <span style={{ background:'var(--bg)', padding:'2px 8px', borderRadius:99, fontWeight:600 }}>
            {totalCriteria} criterios · {template.length} categorías
          </span>
        </div>
      </div>

      {savedToast && (
        <div className="toast-success">
          <svg width="15" height="15"><Icon.Check/></svg>
          Evaluación guardada — visible para la familia
        </div>
      )}

      {/* ── PLANTILLA ── */}
      {view === 'plantilla' && (
        <>
          <div style={{ fontSize:12, color:'var(--muted)', marginBottom:14, lineHeight:1.6 }}>
            Define tus categorías y criterios. Cada evaluación que guardes usará esta plantilla.
            Puedes modificarla en cualquier momento — las evaluaciones guardadas conservan la plantilla del momento en que se hicieron.
          </div>

          {template.map(cat => {
            const isExp = expandedCat === cat.id;
            return (
              <div key={cat.id} style={{ background:'var(--surface)', borderRadius:'var(--r-md)',
                border:`1.5px solid ${cat.color}30`, marginBottom:10, overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
                  background:`${cat.color}08` }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:cat.color, flexShrink:0, cursor:'pointer' }}
                    onClick={() => setExpandedCat(isExp?null:cat.id)}/>
                  {editingCatId === cat.id ? (
                    <input className="form-input" style={{ flex:1, height:30, fontSize:14, fontWeight:700 }}
                      defaultValue={cat.name} autoFocus
                      onBlur={e => { renameCat(cat.id, e.target.value); setEditingCatId(null); }}
                      onKeyDown={e => e.key==='Enter' && e.target.blur()}/>
                  ) : (
                    <span style={{ fontSize:14, fontWeight:700, color:cat.color, flex:1, cursor:'pointer' }}
                      onClick={() => setExpandedCat(isExp?null:cat.id)}>
                      {cat.name}
                    </span>
                  )}
                  <span style={{ fontSize:11, color:'var(--muted)', cursor:'pointer' }}
                    onClick={() => setExpandedCat(isExp?null:cat.id)}>
                    {cat.criteria.length} criterio{cat.criteria.length!==1?'s':''}
                  </span>
                  <button onClick={() => setEditingCatId(cat.id)}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--light)', padding:'2px 4px' }}>
                    <svg width="14" height="14"><Icon.Edit/></svg>
                  </button>
                  <button onClick={() => deleteCategory(cat.id)}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--light)', padding:'2px 4px' }}>
                    <svg width="14" height="14"><Icon.X/></svg>
                  </button>
                  <svg width="14" height="14" style={{ color:'var(--muted)', cursor:'pointer',
                    transform:isExp?'rotate(180deg)':'none', transition:'transform .2s' }}
                    onClick={() => setExpandedCat(isExp?null:cat.id)}>
                    <Icon.ChevronDown/>
                  </svg>
                </div>

                {isExp && (
                  <div style={{ borderTop:'1px solid var(--border)' }}>
                    {cat.criteria.length === 0 && (
                      <div style={{ padding:'10px 14px', fontSize:12, color:'var(--light)', fontStyle:'italic' }}>
                        Sin criterios — añade el primero abajo
                      </div>
                    )}
                    {cat.criteria.map(cr => (
                      <div key={cr.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px',
                        borderBottom:'1px solid var(--bg)' }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:`${cat.color}60`, flexShrink:0 }}/>
                        {editingCrId === cr.id ? (
                          <input className="form-input" style={{ flex:1, height:30, fontSize:13 }}
                            defaultValue={cr.name} autoFocus
                            onBlur={e => { renameCr(cat.id, cr.id, e.target.value); setEditingCrId(null); }}
                            onKeyDown={e => e.key==='Enter' && e.target.blur()}/>
                        ) : (
                          <span style={{ flex:1, fontSize:13, color:'var(--text)' }}>{cr.name}</span>
                        )}
                        <button onClick={() => setEditingCrId(cr.id)}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--light)', padding:'2px 4px' }}>
                          <svg width="13" height="13"><Icon.Edit/></svg>
                        </button>
                        <button onClick={() => deleteCriterion(cat.id, cr.id)}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--light)', padding:'2px 4px' }}>
                          <svg width="13" height="13"><Icon.X/></svg>
                        </button>
                      </div>
                    ))}
                    {addingCrFor === cat.id ? (
                      <div style={{ display:'flex', gap:8, padding:'8px 14px' }}>
                        <input className="form-input" style={{ flex:1, height:34, fontSize:13 }}
                          placeholder="Nombre del criterio" value={newCrName}
                          onChange={e => setNewCrName(e.target.value)}
                          onKeyDown={e => e.key==='Enter' && addCriterion(cat.id)} autoFocus/>
                        <button className="btn btn-primary btn-sm" onClick={() => addCriterion(cat.id)}>OK</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setAddingCrFor(null); setNewCrName(''); }}>
                          <svg width="12" height="12"><Icon.X/></svg>
                        </button>
                      </div>
                    ) : (
                      <button style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px',
                        fontSize:12, color:cat.color, fontWeight:700, background:'none', border:'none', cursor:'pointer' }}
                        onClick={() => setAddingCrFor(cat.id)}>
                        <svg width="13" height="13"><Icon.Plus/></svg>
                        Añadir criterio
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {addingCat ? (
            <div style={{ display:'flex', gap:8 }}>
              <input className="form-input" style={{ flex:1 }} placeholder="Nombre de la categoría"
                value={newCatName} onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key==='Enter' && addCategory()} autoFocus/>
              <button className="btn btn-primary btn-sm" onClick={addCategory}>Crear</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setAddingCat(false); setNewCatName(''); }}>
                <svg width="12" height="12"><Icon.X/></svg>
              </button>
            </div>
          ) : (
            <button className="btn btn-info btn-full" style={{ marginTop:4 }} onClick={() => setAddingCat(true)}>
              <svg width="14" height="14"><Icon.Plus/></svg>
              Añadir categoría
            </button>
          )}
        </>
      )}

      {/* ── NUEVA EVALUACIÓN ── */}
      {view === 'evaluar' && (
        <>
          {!evalAthleteId ? (
            <>
              <div style={{ fontSize:13, color:'var(--muted)', marginBottom:14 }}>
                Selecciona el atleta. Si ya tiene una evaluación previa, los valores se cargan como punto de partida.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:10 }}>
                {athletes.map(a => {
                  const history = getHistory(a.id);
                  const latest  = history[0];
                  const avg     = latest ? calcAvg(latest.scores, latest.template) : null;
                  return (
                    <div key={a.id} onClick={() => startEval(a.id)}
                      style={{ textAlign:'center', padding:'14px 8px', background:'var(--surface)',
                        borderRadius:'var(--r-md)', cursor:'pointer', transition:'all .15s',
                        border:`1.5px solid ${history.length>0?sport?.color||'var(--blue)':'var(--border)'}` }}>
                      <div className="avatar avatar-md" style={{ background:`${sport?.color}20`, color:sport?.color, margin:'0 auto 8px' }}>
                        {a.avatar}
                      </div>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{a.name.split(' ')[0]}</div>
                      {avg !== null ? (
                        <>
                          <div style={{ fontSize:13, fontWeight:900, color:scoreColor(avg), marginTop:3 }}>{avg}/10</div>
                          <div style={{ fontSize:10, color:'var(--light)', marginTop:1 }}>{history.length} eval.</div>
                        </>
                      ) : (
                        <div style={{ fontSize:11, color:'var(--light)', marginTop:4 }}>Sin evaluar</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (() => {
            const athlete = athletes.find(a => a.id===evalAthleteId);
            return (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14,
                  padding:'12px 14px', background:'var(--bg)', borderRadius:'var(--r-md)' }}>
                  <div className="avatar avatar-md" style={{ background:`${sport?.color}20`, color:sport?.color }}>
                    {athlete?.avatar}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:800, color:'var(--text)' }}>{athlete?.name}</div>
                    <div style={{ fontSize:12, color:'var(--muted)' }}>{totalCriteria} criterios</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEvalAthleteId('')}>← Cambiar</button>
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre de esta evaluación</label>
                  <input className="form-input" value={evalLabel}
                    onChange={e => setEvalLabel(e.target.value)}
                    placeholder="Ej: Evaluación mayo 2025"/>
                </div>

                {template.map(cat => (
                  <div key={cat.id} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:cat.color }}/>
                      <span style={{ fontSize:13, fontWeight:800, color:cat.color }}>{cat.name}</span>
                    </div>
                    <div style={{ background:'var(--surface)', borderRadius:'var(--r-md)',
                      border:`1px solid ${cat.color}25`, overflow:'hidden' }}>
                      {cat.criteria.map((cr, i) => {
                        const val = draftScores[cr.id] ?? null;
                        return (
                          <div key={cr.id} style={{ padding:'11px 14px',
                            borderBottom:i<cat.criteria.length-1?'1px solid var(--bg)':undefined }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                              <span style={{ fontSize:13, color:'var(--text)', fontWeight:500 }}>{cr.name}</span>
                              <span style={{ fontSize:16, fontWeight:900, minWidth:28, textAlign:'right',
                                color:val!==null?scoreColor(val):'var(--light)' }}>
                                {val !== null ? val : '—'}
                              </span>
                            </div>
                            <div style={{ display:'flex', gap:3 }}>
                              {[...Array(11)].map((_,n) => (
                                <button key={n} onClick={() => setDraftScores(p=>({...p,[cr.id]:n}))}
                                  style={{ flex:1, height:28, borderRadius:4, fontSize:11, fontWeight:700,
                                    cursor:'pointer', border:'none', transition:'all .1s',
                                    background: val===n ? scoreColor(n) : 'var(--bg)',
                                    color: val===n ? 'white' : 'var(--muted)',
                                    outline: val===n ? `2px solid ${scoreColor(n)}` : 'none' }}>
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div style={{ display:'flex', gap:8, marginTop:8, position:'sticky', bottom:84,
                  background:'var(--bg)', padding:'10px 0' }}>
                  <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setEvalAthleteId('')}>Cancelar</button>
                  <button className="btn btn-primary" style={{ flex:2, height:48, fontSize:15 }} onClick={saveEval}>
                    <svg width="15" height="15"><Icon.Check/></svg>
                    Guardar y publicar
                  </button>
                </div>
              </>
            );
          })()}
        </>
      )}

      {/* ── HISTORIAL / RESULTADOS ── */}
      {view === 'resultados' && (
        <>
          {athletes.every(a => getHistory(a.id).length === 0) ? (
            <div>
              <EmptyState icon={<Icon.Star/>} title="Sin evaluaciones"
                text="Crea la primera evaluación para que las familias puedan verla"/>
              <button className="btn btn-primary btn-full" style={{ marginTop:16 }}
                onClick={() => setView('evaluar')}>
                Crear primera evaluación
              </button>
            </div>
          ) : (
            <>
              {/* Overview ranking */}
              <div className="section-label">Última evaluación por atleta</div>
              <div style={{ background:'var(--surface)', borderRadius:'var(--r-lg)',
                border:'1px solid var(--border)', overflow:'hidden', marginBottom:16 }}>
                {athletes
                  .map(a => ({ ...a, history:getHistory(a.id) }))
                  .sort((a,b) => {
                    const avgA = a.history[0] ? calcAvg(a.history[0].scores, a.history[0].template) : -1;
                    const avgB = b.history[0] ? calcAvg(b.history[0].scores, b.history[0].template) : -1;
                    return avgB - avgA;
                  })
                  .map((a, rank) => {
                    const latest  = a.history[0];
                    const avg     = latest ? calcAvg(latest.scores, latest.template) : null;
                    const isExp   = expandedHistory === a.id;
                    return (
                      <div key={a.id}>
                        <div onClick={() => setExpandedHistory(isExp?null:a.id)}
                          style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                            borderBottom:isExp?'none':'1px solid var(--bg)', cursor:'pointer',
                            background:isExp?'var(--bg)':undefined }}>
                          <span style={{ width:20, fontSize:12, fontWeight:800, color:'var(--muted)',
                            textAlign:'center', flexShrink:0 }}>
                            {avg !== null ? rank+1 : '—'}
                          </span>
                          <div className="avatar avatar-sm"
                            style={{ background:`${sport?.color}20`, color:sport?.color }}>
                            {a.avatar}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{a.name}</div>
                            <div style={{ fontSize:11, color:'var(--muted)' }}>
                              {a.history.length} evaluación{a.history.length!==1?'es':''}
                              {latest && ` · última: ${new Date(latest.date).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}`}
                            </div>
                          </div>
                          {avg !== null ? (
                            <>
                              <div style={{ width:70, height:5, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                                <div style={{ height:'100%', width:`${(avg/10)*100}%`,
                                  background:scoreColor(avg), borderRadius:99 }}/>
                              </div>
                              <span style={{ fontSize:14, fontWeight:900, color:scoreColor(avg), width:32, textAlign:'right' }}>
                                {avg}
                              </span>
                            </>
                          ) : (
                            <button className="btn btn-ghost btn-sm"
                              onClick={e => { e.stopPropagation(); startEval(a.id); setView('evaluar'); }}>
                              Evaluar
                            </button>
                          )}
                          <svg width="13" height="13" style={{ color:'var(--light)',
                            transform:isExp?'rotate(180deg)':'none', transition:'transform .2s' }}>
                            <Icon.ChevronDown/>
                          </svg>
                        </div>

                        {/* Expanded: evaluation history list */}
                        {isExp && (
                          <div style={{ borderBottom:'1px solid var(--bg)', background:'var(--bg)' }}>
                            {a.history.map(eval_ => {
                              const avg_ = calcAvg(eval_.scores, eval_.template);
                              const isSelEval = selectedEvalId === eval_.id;
                              return (
                                <div key={eval_.id}>
                                  {/* Evaluation entry */}
                                  <div onClick={() => setSelectedEvalId(isSelEval?null:eval_.id)}
                                    style={{ display:'flex', alignItems:'center', gap:10,
                                      padding:'9px 14px 9px 44px', cursor:'pointer',
                                      borderBottom:'1px solid var(--border)',
                                      background:isSelEval?'var(--surface)':undefined }}>
                                    <div style={{ flex:1 }}>
                                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>
                                        {eval_.label}
                                      </div>
                                      <div style={{ fontSize:11, color:'var(--muted)' }}>
                                        {new Date(eval_.date).toLocaleDateString('es-ES',{
                                          weekday:'long', day:'numeric', month:'long', year:'numeric'
                                        })} · {eval_.coachName}
                                      </div>
                                    </div>
                                    <span style={{ fontSize:14, fontWeight:900, color:scoreColor(avg_) }}>
                                      {avg_}/10
                                    </span>
                                    <svg width="13" height="13" style={{ color:'var(--light)',
                                      transform:isSelEval?'rotate(180deg)':'none', transition:'transform .2s' }}>
                                      <Icon.ChevronDown/>
                                    </svg>
                                  </div>

                                  {/* Evaluation detail */}
                                  {isSelEval && (
                                    <div style={{ padding:'12px 14px 12px 44px',
                                      background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
                                      {eval_.template.map(cat => {
                                        const catAvg_ = calcCatAvg(eval_.scores, cat);
                                        return (
                                          <div key={cat.id} style={{ marginBottom:10 }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                                              <div style={{ width:7, height:7, borderRadius:'50%', background:cat.color }}/>
                                              <span style={{ fontSize:12, fontWeight:700, color:cat.color, flex:1 }}>{cat.name}</span>
                                              {catAvg_ !== null && (
                                                <span style={{ fontSize:12, fontWeight:800, color:scoreColor(catAvg_) }}>
                                                  {catAvg_}/10
                                                </span>
                                              )}
                                            </div>
                                            {cat.criteria.map(cr => {
                                              const val = eval_.scores[cr.id] ?? null;
                                              return (
                                                <div key={cr.id} style={{ display:'flex', alignItems:'center',
                                                  gap:8, padding:'4px 0', marginLeft:14 }}>
                                                  <span style={{ flex:1, fontSize:12, color:'var(--muted)' }}>{cr.name}</span>
                                                  <ScoreBar value={val} color={scoreColor(val)}/>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      })}
                                      <button className="btn btn-ghost btn-sm" style={{ marginTop:4 }}
                                        onClick={() => { startEval(a.id); setView('evaluar'); }}>
                                        Re-evaluar con plantilla actual
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {/* New evaluation for this athlete */}
                            <div style={{ padding:'8px 14px 8px 44px' }}>
                              <button style={{ fontSize:12, color:sport?.color||'var(--blue)', fontWeight:700,
                                background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}
                                onClick={() => { startEval(a.id); setView('evaluar'); }}>
                                <svg width="13" height="13"><Icon.Plus/></svg>
                                Nueva evaluación para {a.name.split(' ')[0]}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Category averages */}
              <div className="section-label">Media grupal por categoría (última evaluación)</div>
              <div style={{ background:'var(--surface)', borderRadius:'var(--r-md)',
                border:'1px solid var(--border)', padding:'12px 14px' }}>
                {template.map(cat => {
                  const vals = athletes
                    .map(a => { const h=getHistory(a.id)[0]; return h ? calcCatAvg(h.scores, cat) : null; })
                    .filter(v => v !== null);
                  const avg = vals.length ? Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10 : null;
                  return (
                    <div key={cat.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:cat.color, flexShrink:0 }}/>
                      <span style={{ width:110, fontSize:12, fontWeight:700, color:cat.color, flexShrink:0 }}>{cat.name}</span>
                      <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${((avg||0)/10)*100}%`,
                          background:cat.color, borderRadius:99, transition:'width .5s' }}/>
                      </div>
                      <span style={{ fontSize:13, fontWeight:800, color:scoreColor(avg), width:36, textAlign:'right' }}>
                        {avg !== null ? avg : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
