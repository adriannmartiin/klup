// ============================================================
// KLUP — Finanzas Tab (v2 — todo expandido, edición directa)
// ============================================================
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { SPORTS, GROUPS, ATHLETES, COACHES } from '../../lib/mockData';
import { Icon } from '../../components/ui/index';

const CONCEPT_DEFS = [
  { id:'mensualidad', label:'Mensualidad',      type:'monthly', emoji:'📅', defaultAmount:26 },
  { id:'ficha',       label:'Ficha federativa', type:'annual',  emoji:'🪪', defaultAmount:15 },
  { id:'inscripcion', label:'Inscripción',       type:'once',    emoji:'📝', defaultAmount:30 },
  { id:'equipacion',  label:'Equipación',        type:'once',    emoji:'👕', defaultAmount:45 },
];

const TYPE_LABEL = { monthly:'mensual', annual:'anual', once:'único' };

function initGroupConfig() {
  const cfg = {};
  Object.values(GROUPS).forEach(g => {
    cfg[g.id] = {
      mensualidad: { active:true,  amount:26 },
      ficha:       { active:true,  amount:15 },
      inscripcion: { active:false, amount:30 },
      equipacion:  { active:false, amount:45 },
    };
  });
  return cfg;
}

export default function FinanzasTab() {
  const [view, setView] = useState('grupos'); // grupos | atletas | exportar
  const [groupConfig, setGroupConfig] = useState(initGroupConfig);
  const [overrides, setOverrides]     = useState({
    a3: { mensualidad:{ amount:13, reason:'Solo 1 día/semana' } }
  });
  const [expandedAthlete, setExpandedAthlete] = useState(null);
  const [editBuffer, setEditBuffer]           = useState({});

  const updateConcept = (gid, cid, field, val) => setGroupConfig(p => ({
    ...p, [gid]: { ...p[gid], [cid]: { ...p[gid]?.[cid], [field]: val } }
  }));

  const athleteMonthly = (a) => {
    const cfg = groupConfig[a.groupId] || {};
    const ov  = overrides[a.id] || {};
    let total = 0;
    CONCEPT_DEFS.filter(c => c.type==='monthly').forEach(c => {
      if (!cfg[c.id]?.active) return;
      total += ov[c.id] ? ov[c.id].amount : (cfg[c.id]?.amount || 0);
    });
    return total;
  };

  const sportMonthly = (sport) =>
    sport.groups.reduce((acc,gid) => {
      const g = GROUPS[gid]; if (!g) return acc;
      return acc + ATHLETES.filter(a=>a.groupId===gid).reduce((s,a)=>s+athleteMonthly(a),0);
    }, 0);

  const totalMonthly = SPORTS.reduce((acc,s) => acc + sportMonthly(s), 0);

  const saveOverride = (aid) => {
    if (!editBuffer[aid]) return;
    setOverrides(p => ({ ...p, [aid]: { ...(p[aid]||{}), ...editBuffer[aid] } }));
    setEditBuffer(p => { const n={...p}; delete n[aid]; return n; });
    setExpandedAthlete(null);
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows = [['Deporte','Grupo','Atleta','Curso','Mensualidad €','Personalizado']];
    SPORTS.forEach(s => s.groups.forEach(gid => {
      const g = GROUPS[gid]; if (!g) return;
      ATHLETES.filter(a=>a.groupId===gid).forEach(a => {
        rows.push([s.name, g.name, a.name, a.course, athleteMonthly(a), overrides[a.id]?'Sí':'No']);
      });
    }));
    rows.push([]); rows.push(['TOTAL MENSUAL','','','',totalMonthly,'']);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{wch:14},{wch:16},{wch:22},{wch:14},{wch:16},{wch:14}];
    XLSX.utils.book_append_sheet(wb, ws, 'Cobros');
    XLSX.writeFile(wb, `klup-cobros-${new Date().toISOString().slice(0,7)}.xlsx`);
  };

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:20 }}>
        <div className="stat-big" style={{ background:'#dcfce7' }}>
          <div className="stat-big-num" style={{ color:'var(--presente)', fontSize:20 }}>
            {totalMonthly.toLocaleString('es-ES')} €
          </div>
          <div className="stat-big-label">Ingresos / mes</div>
        </div>
        <div className="stat-big">
          <div className="stat-big-num">{ATHLETES.length}</div>
          <div className="stat-big-label">Atletas</div>
        </div>
        <div className="stat-big">
          <div className="stat-big-num">{totalMonthly>0?Math.round(totalMonthly/ATHLETES.length):0} €</div>
          <div className="stat-big-label">Media / atleta</div>
        </div>
        <div className="stat-big" style={{ background:'#f0f7ff' }}>
          <div className="stat-big-num" style={{ color:'var(--blue)', fontSize:20 }}>
            {(totalMonthly*10).toLocaleString('es-ES')} €
          </div>
          <div className="stat-big-label">Proyección anual</div>
        </div>
      </div>

      {/* View selector */}
      <div style={{ display:'flex', gap:4, marginBottom:18, borderBottom:'1px solid var(--border)' }}>
        {[['grupos','Por grupos'],['atletas','Por atletas'],['exportar','Exportar']].map(([id,label]) => (
          <button key={id} onClick={() => setView(id)}
            style={{ padding:'8px 16px', fontWeight:view===id?700:500, fontSize:13,
              color:view===id?'var(--blue)':'var(--muted)', background:'none', border:'none',
              borderBottom:view===id?'2.5px solid var(--blue)':'2.5px solid transparent',
              cursor:'pointer', marginBottom:-1 }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── POR GRUPOS ── */}
      {view === 'grupos' && (
        <>
          <div style={{ fontSize:12, color:'var(--muted)', marginBottom:14, lineHeight:1.6 }}>
            Activa/desactiva conceptos por grupo y ajusta importes. Los cambios se reflejan en los totales al instante.
          </div>
          {SPORTS.map(sport => {
            const sportRev = sportMonthly(sport);
            const sportGroups = sport.groups.map(gid=>GROUPS[gid]).filter(Boolean);
            if (!sportGroups.length) return null;
            const sportPct = totalMonthly>0 ? Math.round((sportRev/totalMonthly)*100) : 0;
            return (
              <div key={sport.id} style={{ marginBottom:16 }}>
                {/* Sport header */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8,
                  padding:'10px 14px', background:`${sport.color}08`, borderRadius:'var(--r-md)',
                  border:`1.5px solid ${sport.color}30` }}>
                  <span className="sport-dot-lg" style={{ background:sport.color }}/>
                  <span style={{ fontSize:14, fontWeight:800, color:sport.color, flex:1 }}>{sport.name}</span>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:15, fontWeight:900, color:'var(--text)' }}>
                      {sportRev.toLocaleString('es-ES')} €/mes
                    </div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>{sportPct}% del total</div>
                  </div>
                </div>

                {sportGroups.map(g => {
                  const cfg = groupConfig[g.id] || {};
                  const gAthletes = ATHLETES.filter(a=>a.groupId===g.id);
                  const gRev = gAthletes.reduce((acc,a)=>acc+athleteMonthly(a),0);
                  const coach = COACHES.find(c=>c.id===g.coachId);
                  return (
                    <div key={g.id} style={{ background:'var(--surface)', borderRadius:'var(--r-md)',
                      border:'1px solid var(--border)', marginBottom:8, overflow:'hidden' }}>
                      {/* Group row */}
                      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                        background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{g.name}</div>
                          <div style={{ fontSize:11, color:'var(--muted)' }}>
                            {coach?.name||'Sin entrenador'} · {gAthletes.length} atletas
                          </div>
                        </div>
                        <div style={{ fontSize:14, fontWeight:800, color:sport.color }}>
                          {gRev.toLocaleString('es-ES')} €/mes
                        </div>
                      </div>

                      {/* Concepts */}
                      <div style={{ padding:'10px 14px' }}>
                        {CONCEPT_DEFS.map(concept => {
                          const c = cfg[concept.id] || { active:false, amount:concept.defaultAmount };
                          return (
                            <div key={concept.id} style={{ display:'flex', alignItems:'center', gap:10,
                              padding:'7px 0', borderBottom:'0.5px solid var(--bg)' }}>
                              {/* Toggle */}
                              <div onClick={() => updateConcept(g.id, concept.id, 'active', !c.active)}
                                style={{ width:18, height:18, borderRadius:4, flexShrink:0, cursor:'pointer',
                                  border:`2px solid ${c.active?'var(--blue)':'var(--border)'}`,
                                  background:c.active?'var(--blue)':'transparent', transition:'all .15s',
                                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                                {c.active && <svg width="10" height="10" style={{ color:'white' }}><Icon.Check/></svg>}
                              </div>
                              <span style={{ fontSize:12, flex:1, color:c.active?'var(--text)':'var(--light)', fontWeight:500 }}>
                                {concept.emoji} {concept.label}
                                <span style={{ fontSize:10, color:'var(--light)', marginLeft:5 }}>({TYPE_LABEL[concept.type]})</span>
                              </span>
                              {/* Amount input */}
                              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                                <input type="number" min="0" value={c.amount}
                                  disabled={!c.active}
                                  onChange={e => updateConcept(g.id, concept.id, 'amount', Number(e.target.value))}
                                  style={{ width:60, padding:'4px 8px', borderRadius:'var(--r-sm)',
                                    border:'1.5px solid var(--border)', background:c.active?'var(--surface)':'var(--bg)',
                                    color:'var(--text)', fontSize:13, fontWeight:700, textAlign:'right',
                                    opacity:c.active?1:.4 }}/>
                                <span style={{ fontSize:11, color:'var(--muted)' }}>€</span>
                              </div>
                            </div>
                          );
                        })}
                        {/* Per-group total */}
                        <div style={{ display:'flex', justifyContent:'space-between', paddingTop:8,
                          marginTop:4, borderTop:'1px solid var(--border)' }}>
                          <span style={{ fontSize:12, color:'var(--muted)' }}>
                            Conceptos activos: {CONCEPT_DEFS.filter(c=>cfg[c.id]?.active).map(c=>c.label).join(', ')||'—'}
                          </span>
                          <span style={{ fontSize:13, fontWeight:800, color:'var(--text)' }}>
                            {CONCEPT_DEFS.filter(c=>c.type==='monthly'&&cfg[c.id]?.active).reduce((acc,c)=>acc+(cfg[c.id]?.amount||0),0)} €/mes por atleta
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}

      {/* ── POR ATLETAS ── */}
      {view === 'atletas' && (
        <>
          <div style={{ fontSize:12, color:'var(--muted)', marginBottom:14 }}>
            Los atletas con precio personalizado tienen un importe distinto al de su grupo.
          </div>
          {/* Summary of overrides */}
          {Object.keys(overrides).filter(id=>Object.keys(overrides[id]).length>0).length > 0 && (
            <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'var(--r-md)',
              padding:'10px 14px', marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#92400e', marginBottom:6 }}>PRECIOS PERSONALIZADOS ACTIVOS</div>
              {Object.keys(overrides).filter(id=>Object.keys(overrides[id]).length>0).map(aid => {
                const a = ATHLETES.find(x=>x.id===aid); if (!a) return null;
                const sport = SPORTS.find(s=>s.groups.includes(a.groupId));
                return (
                  <div key={aid} style={{ display:'flex', gap:8, fontSize:12, color:'#92400e', marginBottom:2 }}>
                    <span style={{ fontWeight:700 }}>{a.name}</span>
                    <span>·</span><span>{sport?.name}</span>
                    <span style={{ marginLeft:'auto', fontWeight:800 }}>{athleteMonthly(a)} €/mes</span>
                  </div>
                );
              })}
            </div>
          )}

          {SPORTS.map(sport => {
            const sportGroups = sport.groups.map(gid=>GROUPS[gid]).filter(Boolean);
            return sportGroups.map(g => {
              const gAthletes = ATHLETES.filter(a=>a.groupId===g.id);
              if (!gAthletes.length) return null;
              const cfg = groupConfig[g.id] || {};
              const baseMonthly = CONCEPT_DEFS
                .filter(c=>c.type==='monthly'&&cfg[c.id]?.active)
                .reduce((acc,c)=>acc+(cfg[c.id]?.amount||0),0);
              return (
                <div key={g.id} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:6,
                    display:'flex', gap:8, alignItems:'center' }}>
                    <span className="sport-dot" style={{ background:sport.color }}/>
                    {sport.name} · {g.name}
                    <span style={{ marginLeft:'auto' }}>Base: {baseMonthly} €/mes</span>
                  </div>
                  <div style={{ background:'var(--surface)', borderRadius:'var(--r-md)', border:'1px solid var(--border)', overflow:'hidden' }}>
                    {gAthletes.map((a,i) => {
                      const monthly = athleteMonthly(a);
                      const hasOv   = overrides[a.id] && Object.keys(overrides[a.id]).length>0;
                      const isExp   = expandedAthlete===a.id;
                      return (
                        <div key={a.id} style={{ borderBottom:i<gAthletes.length-1?'1px solid var(--bg)':undefined }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px',
                            background:isExp?'var(--bg)':undefined, cursor:'pointer' }}
                            onClick={() => setExpandedAthlete(isExp?null:a.id)}>
                            <div className="avatar avatar-sm" style={{ background:`${sport.color}20`, color:sport.color }}>
                              {a.avatar}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', display:'flex', alignItems:'center', gap:6 }}>
                                {a.name}
                                {hasOv && <span style={{ fontSize:9, background:'#fef3c7', color:'#92400e',
                                  fontWeight:800, padding:'1px 5px', borderRadius:4 }}>PERSONALIZADO</span>}
                              </div>
                              <div style={{ fontSize:11, color:'var(--light)' }}>{a.course}</div>
                            </div>
                            <span style={{ fontSize:14, fontWeight:800, color:hasOv?'#d97706':'var(--text)' }}>
                              {monthly} €
                            </span>
                            <svg width="13" height="13" style={{ color:'var(--light)', transform:isExp?'rotate(180deg)':'none', transition:'transform .2s' }}>
                              <Icon.ChevronDown/>
                            </svg>
                          </div>
                          {isExp && (
                            <div style={{ padding:'12px 14px', background:'var(--bg)', borderTop:'1px solid var(--border)' }}>
                              {CONCEPT_DEFS.filter(c=>c.type==='monthly'&&cfg[c.id]?.active).map(concept => {
                                const existing = overrides[a.id]?.[concept.id];
                                return (
                                  <div key={concept.id} style={{ marginBottom:10 }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>
                                        {concept.emoji} {concept.label}
                                      </span>
                                      <span style={{ fontSize:11, color:'var(--muted)' }}>
                                        Base del grupo: {cfg[concept.id]?.amount||0} €
                                      </span>
                                    </div>
                                    <div style={{ display:'flex', gap:8 }}>
                                      <input type="number" min="0"
                                        placeholder={`${cfg[concept.id]?.amount||0} (base)`}
                                        defaultValue={existing?.amount??''}
                                        onChange={e => setEditBuffer(p => ({
                                          ...p,
                                          [a.id]: { ...(p[a.id]||{}),
                                            [concept.id]: { ...(p[a.id]?.[concept.id]||{}), amount:Number(e.target.value) }
                                          }
                                        }))}
                                        style={{ width:80, padding:'6px 8px', borderRadius:'var(--r-sm)',
                                          border:'1.5px solid var(--border)', background:'var(--surface)',
                                          color:'var(--text)', fontSize:13, fontWeight:700 }}/>
                                      <span style={{ fontSize:12, color:'var(--muted)', alignSelf:'center' }}>€/mes</span>
                                      <input type="text" placeholder="Motivo (ej: 1 día/semana)"
                                        defaultValue={existing?.reason??''}
                                        onChange={e => setEditBuffer(p => ({
                                          ...p,
                                          [a.id]: { ...(p[a.id]||{}),
                                            [concept.id]: { ...(p[a.id]?.[concept.id]||{}), reason:e.target.value }
                                          }
                                        }))}
                                        style={{ flex:1, padding:'6px 10px', borderRadius:'var(--r-sm)',
                                          border:'1.5px solid var(--border)', background:'var(--surface)',
                                          color:'var(--text)', fontSize:12 }}/>
                                      {existing && (
                                        <button style={{ fontSize:11, color:'var(--ausente)', fontWeight:700,
                                          background:'none', border:'none', cursor:'pointer', whiteSpace:'nowrap' }}
                                          onClick={() => setOverrides(p => {
                                            const u={...(p[a.id]||{})}; delete u[concept.id];
                                            return {...p,[a.id]:u};
                                          })}>
                                          Quitar
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                                <button className="btn btn-ghost btn-sm" style={{ flex:1 }}
                                  onClick={() => { setExpandedAthlete(null); setEditBuffer({}); }}>Cancelar</button>
                                <button className="btn btn-primary btn-sm" style={{ flex:1 }}
                                  onClick={() => saveOverride(a.id)}>
                                  Guardar precio individual
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })}
        </>
      )}

      {/* ── EXPORTAR ── */}
      {view === 'exportar' && (
        <>
          <div className="card" style={{ marginBottom:12 }}>
            <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:44, height:44, background:'#dcfce7', borderRadius:'var(--r-md)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:22 }}>📊</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Excel completo (.xlsx)</div>
                <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10, lineHeight:1.6 }}>
                  Incluye todos los atletas con sus cobros individuales, totales por grupo y deporte.
                </div>
                <button className="btn btn-primary" onClick={exportExcel}>↓ Descargar Excel</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:44, height:44, background:'#fee2e2', borderRadius:'var(--r-md)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:22 }}>📄</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:4 }}>PDF imprimible</div>
                <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10 }}>
                  Abre el diálogo de impresión del navegador para guardar como PDF.
                </div>
                <button className="btn btn-ghost" onClick={() => window.print()}>🖨 Imprimir / PDF</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
