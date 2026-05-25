// ============================================================
// KLUP — Finanzas Tab
// Individual pricing · Payment concepts · Excel/PDF export
// ============================================================
import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { SPORTS, GROUPS, ATHLETES, COACHES } from '../../lib/mockData';
import { Icon } from '../../components/ui/index';

// ── Default concept definitions ───────────────────────────────
const CONCEPT_DEFS = [
  { id:'mensualidad', label:'Mensualidad',       type:'monthly', icon:'📅', defaultAmount:26 },
  { id:'ficha',       label:'Ficha federativa',  type:'annual',  icon:'🪪', defaultAmount:15 },
  { id:'inscripcion', label:'Inscripción',        type:'once',    icon:'📝', defaultAmount:30 },
  { id:'equipacion',  label:'Equipación',         type:'once',    icon:'👕', defaultAmount:45 },
  { id:'custom1',     label:'Otro concepto',      type:'once',    icon:'➕', defaultAmount:0, custom:true },
];

const TYPE_LABEL = { monthly:'mensual', annual:'anual', once:'pago único' };

// ── Initial group config (which concepts active + amounts) ────
function initGroupConfig() {
  const cfg = {};
  Object.values(GROUPS).forEach(g => {
    cfg[g.id] = {
      mensualidad: { active:true,  amount:26 },
      ficha:       { active:true,  amount:15 },
      inscripcion: { active:false, amount:30 },
      equipacion:  { active:false, amount:45 },
      custom1:     { active:false, amount:0, label:'Otro concepto' },
    };
  });
  return cfg;
}

export default function FinanzasTab() {
  const [subTab, setSubTab] = useState('resumen');

  // Group config: concepts active + amounts per group
  const [groupConfig, setGroupConfig] = useState(initGroupConfig);

  // Individual overrides per athlete
  const [overrides, setOverrides] = useState({
    // example pre-loaded override
    a3: { mensualidad:{ active:true, amount:13, reason:'Solo 1 día/semana' } }
  });

  // Which athlete row is expanded
  const [expandedAthlete, setExpandedAthlete] = useState(null);
  const [editOverride, setEditOverride]       = useState({});

  // Group concept editor
  const [expandedGroup, setExpandedGroup] = useState(null);

  // Export state
  const [exporting, setExporting] = useState(false);

  // ── Computed: revenue per athlete ────────────────────────────

  const athleteMonthly = (athlete) => {
    const cfg = groupConfig[athlete.groupId] || {};
    const ov  = overrides[athlete.id] || {};
    let total = 0;
    CONCEPT_DEFS.filter(c => c.type === 'monthly').forEach(c => {
      const groupActive = cfg[c.id]?.active;
      if (!groupActive) return;
      const groupAmt = cfg[c.id]?.amount || 0;
      const ovEntry  = ov[c.id];
      total += ovEntry ? ovEntry.amount : groupAmt;
    });
    return total;
  };

  const athleteAnnualExtras = (athlete) => {
    const cfg = groupConfig[athlete.groupId] || {};
    let total = 0;
    CONCEPT_DEFS.filter(c => c.type !== 'monthly').forEach(c => {
      if (!cfg[c.id]?.active) return;
      total += cfg[c.id]?.amount || 0;
    });
    return total;
  };

  const groupMonthlyRevenue = (group) => {
    return ATHLETES.filter(a => a.groupId === group.id)
      .reduce((acc, a) => acc + athleteMonthly(a), 0);
  };

  const sportMonthlyRevenue = (sport) => {
    return sport.groups.reduce((acc, gid) => {
      const g = GROUPS[gid];
      return g ? acc + groupMonthlyRevenue(g) : acc;
    }, 0);
  };

  const totalMonthly = SPORTS.reduce((acc, s) => acc + sportMonthlyRevenue(s), 0);

  // ── Update group concept ──────────────────────────────────────

  const updateGroupConcept = (groupId, conceptId, field, value) => {
    setGroupConfig(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [conceptId]: { ...prev[groupId]?.[conceptId], [field]: value }
      }
    }));
  };

  // ── Save individual override ──────────────────────────────────

  const saveOverride = (athleteId) => {
    if (!editOverride[athleteId]) return;
    setOverrides(prev => ({
      ...prev,
      [athleteId]: { ...(prev[athleteId]||{}), ...editOverride[athleteId] }
    }));
    setEditOverride(prev => { const n={...prev}; delete n[athleteId]; return n; });
    setExpandedAthlete(null);
  };

  const removeOverride = (athleteId, conceptId) => {
    setOverrides(prev => {
      const updated = { ...(prev[athleteId]||{}) };
      delete updated[conceptId];
      return { ...prev, [athleteId]: updated };
    });
  };

  // ── Excel export ──────────────────────────────────────────────

  const exportExcel = () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // ── Sheet 1: Resumen por deporte ──
      const resumenRows = [
        ['Deporte', 'Grupos', 'Atletas', 'Ingreso mensual (€)', 'Ingreso anual est. (€)', '% del total']
      ];
      SPORTS.forEach(s => {
        const athletes = ATHLETES.filter(a => s.groups.includes(a.groupId));
        const monthly  = sportMonthlyRevenue(s);
        resumenRows.push([
          s.name,
          s.groups.length,
          athletes.length,
          monthly,
          monthly * 10,
          totalMonthly > 0 ? `${Math.round((monthly / totalMonthly) * 100)}%` : '0%'
        ]);
      });
      resumenRows.push(['', '', '', '', '', '']);
      resumenRows.push(['TOTAL', '', ATHLETES.length, totalMonthly, totalMonthly * 10, '100%']);
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
      wsResumen['!cols'] = [{ wch:16 },{ wch:8 },{ wch:10 },{ wch:20 },{ wch:22 },{ wch:12 }];
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // ── Sheet 2: Detalle por atleta ──
      const detalleRows = [
        ['Deporte', 'Grupo', 'Entrenador', 'Atleta', 'Curso',
         'Mensualidad (€)', 'Extras anuales (€)', 'Total mensual (€)', 'Total anual est. (€)', 'Precio personalizado']
      ];
      SPORTS.forEach(sport => {
        sport.groups.forEach(gid => {
          const g = GROUPS[gid]; if (!g) return;
          const coach = COACHES.find(c => c.id === g.coachId);
          ATHLETES.filter(a => a.groupId === gid).forEach(a => {
            const monthly  = athleteMonthly(a);
            const extras   = athleteAnnualExtras(a);
            const hasOv    = overrides[a.id] && Object.keys(overrides[a.id]).length > 0;
            detalleRows.push([
              sport.name, g.name, coach?.name || '—', a.name, a.course,
              monthly, extras, monthly, monthly * 10 + extras,
              hasOv ? 'Sí' : 'No'
            ]);
          });
        });
      });
      const wsDetalle = XLSX.utils.aoa_to_sheet(detalleRows);
      wsDetalle['!cols'] = [
        { wch:12 },{ wch:14 },{ wch:16 },{ wch:20 },{ wch:14 },
        { wch:18 },{ wch:18 },{ wch:18 },{ wch:20 },{ wch:20 }
      ];
      XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle atletas');

      // ── Sheet 3: Una hoja por deporte ──
      SPORTS.forEach(sport => {
        const rows = [
          [`${sport.name} — ${new Date().toLocaleDateString('es-ES', { month:'long', year:'numeric' })}`],
          [],
          ['Grupo', 'Atleta', 'Curso', 'Mensualidad (€)', 'Precio personalizado', 'Motivo']
        ];
        let sportTotal = 0;
        sport.groups.forEach(gid => {
          const g = GROUPS[gid]; if (!g) return;
          rows.push([g.name, '', '', '', '', '']);
          ATHLETES.filter(a => a.groupId === gid).forEach(a => {
            const monthly = athleteMonthly(a);
            const ov = overrides[a.id]?.mensualidad;
            sportTotal += monthly;
            rows.push(['', a.name, a.course, monthly, ov ? 'Sí' : 'No', ov?.reason || '']);
          });
        });
        rows.push([]);
        rows.push(['', '', '', `TOTAL: ${sportTotal} €/mes`, '', '']);
        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch:14 },{ wch:20 },{ wch:14 },{ wch:16 },{ wch:18 },{ wch:24 }];
        // Truncate sheet name to 31 chars (Excel limit)
        XLSX.utils.book_append_sheet(wb, ws, sport.name.slice(0, 31));
      });

      XLSX.writeFile(wb, `klup-finanzas-${new Date().toISOString().slice(0,7)}.xlsx`);
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      setExporting(false);
    }
  };

  // ── PDF export (print) ────────────────────────────────────────

  const exportPDF = () => {
    window.print();
  };

  // ── Sub-tab nav ───────────────────────────────────────────────

  const SUB_TABS = [
    { id:'resumen',   label:'Resumen' },
    { id:'conceptos', label:'Conceptos' },
    { id:'atletas',   label:'Atletas' },
    { id:'exportar',  label:'Exportar' },
  ];

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid var(--border)',
        paddingBottom:0, overflowX:'auto' }}>
        {SUB_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            style={{ padding:'8px 16px', fontWeight: subTab===t.id ? 700 : 500,
              fontSize:13, color: subTab===t.id ? 'var(--blue)' : 'var(--muted)',
              background:'none', border:'none', borderBottom: subTab===t.id ? '2.5px solid var(--blue)' : '2.5px solid transparent',
              cursor:'pointer', whiteSpace:'nowrap', marginBottom:-1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── RESUMEN ── */}
      {subTab === 'resumen' && (
        <>
          <div className="desktop-grid-3 grid-2" style={{ marginBottom:20 }}>
            <div className="stat-big" style={{ background:'#dcfce7' }}>
              <div className="stat-big-num" style={{ color:'var(--presente)', fontSize:22 }}>
                {totalMonthly.toLocaleString('es-ES')} €
              </div>
              <div className="stat-big-label">Ingresos mensuales</div>
            </div>
            <div className="stat-big">
              <div className="stat-big-num">{ATHLETES.length}</div>
              <div className="stat-big-label">Atletas activos</div>
            </div>
            <div className="stat-big">
              <div className="stat-big-num">
                {ATHLETES.length > 0 ? Math.round(totalMonthly / ATHLETES.length) : 0} €
              </div>
              <div className="stat-big-label">Media/atleta</div>
            </div>
          </div>

          <div className="section-label">Ingresos por deporte</div>
          <div className="card" style={{ marginBottom:20 }}>
            {SPORTS.map(s => {
              const rev = sportMonthlyRevenue(s);
              const pct = totalMonthly > 0 ? Math.round((rev / totalMonthly) * 100) : 0;
              return (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                  <span style={{ width:80, fontSize:13, fontWeight:700, color:s.color, flexShrink:0 }}>{s.name}</span>
                  <div style={{ flex:1 }}>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width:`${pct}%`, background:s.color }}/>
                    </div>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--muted)', width:32, textAlign:'right' }}>{pct}%</span>
                  <span style={{ fontSize:13, fontWeight:800, color:'var(--text)', width:64, textAlign:'right', flexShrink:0 }}>
                    {rev.toLocaleString('es-ES')} €
                  </span>
                </div>
              );
            })}
            <div style={{ borderTop:'1px solid var(--border)', marginTop:8, paddingTop:10,
              display:'flex', justifyContent:'flex-end', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>Total mensual</span>
              <span style={{ fontSize:16, fontWeight:900, color:'var(--text)' }}>
                {totalMonthly.toLocaleString('es-ES')} €
              </span>
            </div>
          </div>

          <div className="card" style={{ background:'#f0f7ff', border:'1.5px solid #bfdbfe' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#1e40af', marginBottom:4 }}>
              Proyección anual (10 meses lectivos)
            </div>
            <div style={{ fontSize:28, fontWeight:900, color:'#1e40af' }}>
              {(totalMonthly * 10).toLocaleString('es-ES')} €
            </div>
            <div style={{ fontSize:12, color:'#3b82f6', marginTop:4 }}>
              Basado en mensualidades activas · {ATHLETES.length} atletas
            </div>
          </div>
        </>
      )}

      {/* ── CONCEPTOS ── */}
      {subTab === 'conceptos' && (
        <>
          <div style={{ fontSize:13, color:'var(--muted)', marginBottom:16, lineHeight:1.6 }}>
            Configura los conceptos de pago activos por grupo. El precio base aplica a todos los atletas del grupo,
            salvo que tengan un precio individual asignado.
          </div>

          {SPORTS.map(sport => (
            <div key={sport.id} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <span className="sport-dot" style={{ background:sport.color }}/>
                <span style={{ fontSize:14, fontWeight:800, color:sport.color }}>{sport.name}</span>
              </div>

              {sport.groups.map(gid => {
                const g = GROUPS[gid]; if (!g) return null;
                const isExp = expandedGroup === gid;
                const cfg = groupConfig[gid] || {};
                const monthlyTotal = ATHLETES.filter(a=>a.groupId===gid).reduce((acc,a)=>acc+athleteMonthly(a),0);

                return (
                  <div key={gid} style={{ background:'var(--surface)', borderRadius:'var(--r-md)',
                    border:'1px solid var(--border)', marginBottom:8, overflow:'hidden' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', cursor:'pointer' }}
                      onClick={() => setExpandedGroup(isExp ? null : gid)}>
                      <span style={{ flex:1, fontSize:14, fontWeight:600, color:'var(--text)' }}>{g.name}</span>
                      <span style={{ fontSize:12, color:'var(--muted)' }}>
                        {ATHLETES.filter(a=>a.groupId===gid).length} atletas
                      </span>
                      <span style={{ fontSize:13, fontWeight:800, color:'var(--text)', marginLeft:8 }}>
                        {monthlyTotal} €/mes
                      </span>
                      <svg width="14" height="14" style={{ color:'var(--muted)',
                        transform:isExp?'rotate(180deg)':'none', transition:'transform .2s' }}>
                        <Icon.ChevronDown/>
                      </svg>
                    </div>

                    {isExp && (
                      <div style={{ borderTop:'1px solid var(--border)', padding:'12px 14px' }}>
                        {CONCEPT_DEFS.map(concept => {
                          const c = cfg[concept.id] || { active:false, amount:concept.defaultAmount };
                          return (
                            <div key={concept.id} style={{ display:'flex', alignItems:'center', gap:10,
                              padding:'8px 0', borderBottom:'1px solid var(--bg)' }}>
                              <div onClick={() => updateGroupConcept(gid, concept.id, 'active', !c.active)}
                                style={{ width:20, height:20, borderRadius:5, flexShrink:0, cursor:'pointer',
                                  border:`2px solid ${c.active ? 'var(--blue)' : 'var(--border)'}`,
                                  background: c.active ? 'var(--blue)' : 'transparent',
                                  display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>
                                {c.active && <svg width="11" height="11" style={{ color:'white' }}><Icon.Check/></svg>}
                              </div>
                              <span style={{ fontSize:13, flex:1, fontWeight:500, color: c.active ? 'var(--text)' : 'var(--light)' }}>
                                {concept.icon} {concept.id === 'custom1' ? (c.label || concept.label) : concept.label}
                                <span style={{ fontSize:11, color:'var(--light)', marginLeft:6 }}>
                                  ({TYPE_LABEL[concept.type]})
                                </span>
                              </span>
                              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                                <input type="number" min="0" value={c.amount}
                                  disabled={!c.active}
                                  onChange={e => updateGroupConcept(gid, concept.id, 'amount', Number(e.target.value))}
                                  style={{ width:64, padding:'5px 8px', borderRadius:'var(--r-sm)',
                                    border:'1.5px solid var(--border)', background: c.active ? 'var(--surface)' : 'var(--bg)',
                                    color:'var(--text)', fontSize:13, fontWeight:700, textAlign:'right',
                                    opacity: c.active ? 1 : .4 }}/>
                                <span style={{ fontSize:12, color:'var(--muted)' }}>€</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}

      {/* ── ATLETAS ── */}
      {subTab === 'atletas' && (
        <>
          <div style={{ fontSize:13, color:'var(--muted)', marginBottom:16, lineHeight:1.6 }}>
            Precios individuales para atletas con acuerdos especiales (reducción por asistencia parcial,
            becas, descuentos de hermanos, etc.). El precio individual sobreescribe el del grupo.
          </div>

          {/* Overrides summary */}
          {Object.keys(overrides).filter(id => Object.keys(overrides[id]).length > 0).length > 0 && (
            <>
              <div className="section-label">Precios personalizados activos</div>
              <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'var(--r-md)',
                padding:'10px 14px', marginBottom:16, fontSize:13, color:'#92400e' }}>
                {Object.keys(overrides).filter(id => Object.keys(overrides[id]).length > 0).map(aid => {
                  const a = ATHLETES.find(x => x.id === aid); if (!a) return null;
                  const sport = SPORTS.find(s => s.groups.includes(a.groupId));
                  return (
                    <div key={aid} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontWeight:700 }}>{a.name}</span>
                      <span style={{ color:'#b45309' }}>·</span>
                      <span>{sport?.name}</span>
                      <span style={{ marginLeft:'auto', fontWeight:800 }}>{athleteMonthly(a)} €/mes</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {SPORTS.map(sport => (
            <div key={sport.id} style={{ marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <span className="sport-dot-lg" style={{ background:sport.color }}/>
                <span style={{ fontSize:14, fontWeight:800, color:sport.color }}>{sport.name}</span>
              </div>

              {sport.groups.map(gid => {
                const g = GROUPS[gid]; if (!g) return null;
                const athletes = ATHLETES.filter(a => a.groupId === gid);
                const cfg = groupConfig[gid] || {};
                const baseMonthly = CONCEPT_DEFS
                  .filter(c => c.type === 'monthly' && cfg[c.id]?.active)
                  .reduce((acc, c) => acc + (cfg[c.id]?.amount || 0), 0);

                return (
                  <div key={gid} style={{ background:'var(--surface)', borderRadius:'var(--r-md)',
                    border:'1px solid var(--border)', overflow:'hidden', marginBottom:8 }}>
                    <div style={{ padding:'9px 14px', background:'var(--bg)', borderBottom:'1px solid var(--border)',
                      fontSize:12, fontWeight:700, color:'var(--muted)' }}>
                      {g.name} · precio base: {baseMonthly} €/mes
                    </div>

                    {athletes.map((a, i) => {
                      const monthly    = athleteMonthly(a);
                      const hasOv      = overrides[a.id] && Object.keys(overrides[a.id]).length > 0;
                      const isExpanded = expandedAthlete === a.id;

                      return (
                        <div key={a.id} style={{ borderBottom: i<athletes.length-1 ? '1px solid var(--bg)':undefined }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                            background: isExpanded ? 'var(--bg)' : undefined, cursor:'pointer' }}
                            onClick={() => setExpandedAthlete(isExpanded ? null : a.id)}>
                            <div className="avatar avatar-sm"
                              style={{ background:`${sport.color}20`, color:sport.color }}>
                              {a.avatar}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', display:'flex', alignItems:'center', gap:6 }}>
                                {a.name}
                                {hasOv && (
                                  <span style={{ fontSize:10, background:'#fef3c7', color:'#92400e',
                                    fontWeight:800, padding:'1px 5px', borderRadius:4 }}>
                                    PERSONALIZADO
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize:11, color:'var(--light)' }}>{a.course}</div>
                            </div>
                            <span style={{ fontSize:14, fontWeight:800, color: hasOv ? '#d97706' : 'var(--text)' }}>
                              {monthly} €
                            </span>
                            <svg width="14" height="14" style={{ color:'var(--light)',
                              transform:isExpanded?'rotate(180deg)':'none', transition:'transform .2s' }}>
                              <Icon.ChevronDown/>
                            </svg>
                          </div>

                          {isExpanded && (
                            <div style={{ padding:'12px 14px', background:'var(--bg)',
                              borderTop:'1px solid var(--border)' }}>
                              <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:10 }}>
                                Precio individual para {a.name.split(' ')[0]}
                              </div>

                              {CONCEPT_DEFS.filter(c => c.type === 'monthly' && cfg[c.id]?.active).map(concept => {
                                const baseAmt = cfg[concept.id]?.amount || 0;
                                const existing = overrides[a.id]?.[concept.id];
                                const current  = editOverride[a.id]?.[concept.id];

                                return (
                                  <div key={concept.id} style={{ marginBottom:12 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                                      <span style={{ flex:1, fontSize:13, color:'var(--text)', fontWeight:500 }}>
                                        {concept.icon} {concept.label}
                                        <span style={{ fontSize:11, color:'var(--light)', marginLeft:6 }}>
                                          (base: {baseAmt} €)
                                        </span>
                                      </span>
                                      {existing && (
                                        <button onClick={() => removeOverride(a.id, concept.id)}
                                          style={{ fontSize:11, color:'var(--ausente)', fontWeight:700,
                                            background:'none', border:'none', cursor:'pointer' }}>
                                          Quitar
                                        </button>
                                      )}
                                    </div>
                                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                      <input type="number" min="0"
                                        placeholder={`Precio personalizado (base: ${baseAmt} €)`}
                                        defaultValue={existing?.amount ?? ''}
                                        onChange={e => setEditOverride(prev => ({
                                          ...prev,
                                          [a.id]: {
                                            ...(prev[a.id]||{}),
                                            [concept.id]: {
                                              ...(prev[a.id]?.[concept.id]||{}),
                                              amount: Number(e.target.value)
                                            }
                                          }
                                        }))}
                                        style={{ width:100, padding:'7px 10px', borderRadius:'var(--r-sm)',
                                          border:'1.5px solid var(--border)', background:'var(--surface)',
                                          color:'var(--text)', fontSize:14, fontWeight:700 }}/>
                                      <span style={{ fontSize:13, color:'var(--muted)' }}>€/mes</span>
                                      <input type="text"
                                        placeholder="Motivo (ej: 1 día/semana)"
                                        defaultValue={existing?.reason ?? ''}
                                        onChange={e => setEditOverride(prev => ({
                                          ...prev,
                                          [a.id]: {
                                            ...(prev[a.id]||{}),
                                            [concept.id]: {
                                              ...(prev[a.id]?.[concept.id]||{}),
                                              reason: e.target.value
                                            }
                                          }
                                        }))}
                                        style={{ flex:1, padding:'7px 10px', borderRadius:'var(--r-sm)',
                                          border:'1.5px solid var(--border)', background:'var(--surface)',
                                          color:'var(--text)', fontSize:13 }}/>
                                    </div>
                                  </div>
                                );
                              })}

                              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                                <button className="btn btn-ghost btn-sm" style={{ flex:1 }}
                                  onClick={() => { setExpandedAthlete(null); setEditOverride({}); }}>
                                  Cancelar
                                </button>
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
                );
              })}
            </div>
          ))}
        </>
      )}

      {/* ── EXPORTAR ── */}
      {subTab === 'exportar' && (
        <>
          <div style={{ fontSize:13, color:'var(--muted)', marginBottom:20, lineHeight:1.6 }}>
            Genera un informe completo con todos los atletas, grupos, conceptos de pago y totales.
          </div>

          {/* Excel */}
          <div className="card" style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:'var(--r-md)', background:'#dcfce7',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:22 }}>📊</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'var(--text)', marginBottom:4 }}>
                  Excel completo (.xlsx)
                </div>
                <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10, lineHeight:1.6 }}>
                  Incluye 3 hojas:
                  <br/>• <strong>Resumen</strong> — ingresos totales por deporte con porcentajes
                  <br/>• <strong>Detalle atletas</strong> — todos los atletas con sus cobros individuales
                  <br/>• <strong>Una hoja por deporte</strong> — listado completo de cada disciplina
                </div>
                <button className="btn btn-primary" onClick={exportExcel} disabled={exporting}>
                  {exporting ? 'Generando…' : '↓ Descargar Excel'}
                </button>
              </div>
            </div>
          </div>

          {/* PDF */}
          <div className="card" style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:'var(--r-md)', background:'#fee2e2',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:22 }}>📄</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'var(--text)', marginBottom:4 }}>
                  PDF imprimible
                </div>
                <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10, lineHeight:1.6 }}>
                  Abre el diálogo de impresión del navegador. Puedes guardar como PDF desde ahí.
                  El informe incluye resumen de ingresos y listado completo por deporte.
                </div>
                <button className="btn btn-ghost" onClick={exportPDF}>
                  🖨 Imprimir / Guardar PDF
                </button>
              </div>
            </div>
          </div>

          {/* Preview of what will be exported */}
          <div className="section-label" style={{ marginTop:8 }}>Vista previa del informe</div>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:'var(--r-md)', overflow:'hidden' }}>
            <div style={{ padding:'10px 14px', background:'var(--bg)', borderBottom:'1px solid var(--border)',
              fontSize:12, fontWeight:700, color:'var(--muted)', display:'flex', gap:10 }}>
              <span style={{ flex:2 }}>DEPORTE / GRUPO / ATLETA</span>
              <span style={{ width:80, textAlign:'right' }}>MENSUAL</span>
              <span style={{ width:80, textAlign:'right' }}>ANUAL EST.</span>
            </div>
            {SPORTS.map(sport => {
              const rev = sportMonthlyRevenue(sport);
              return (
                <div key={sport.id}>
                  <div style={{ padding:'8px 14px', background:`${sport.color}08`,
                    display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid var(--border)' }}>
                    <span className="sport-dot" style={{ background:sport.color }}/>
                    <span style={{ fontSize:13, fontWeight:800, color:sport.color, flex:1 }}>{sport.name}</span>
                    <span style={{ fontSize:13, fontWeight:800, color:'var(--text)', width:80, textAlign:'right' }}>
                      {rev} €
                    </span>
                    <span style={{ fontSize:12, color:'var(--muted)', width:80, textAlign:'right' }}>
                      {rev*10} €
                    </span>
                  </div>
                  {sport.groups.slice(0,1).map(gid => {
                    const g = GROUPS[gid]; if (!g) return null;
                    const ga = ATHLETES.filter(a => a.groupId === gid);
                    return (
                      <div key={gid}>
                        <div style={{ padding:'6px 14px 6px 28px', fontSize:12, fontWeight:600,
                          color:'var(--muted)', borderBottom:'1px solid var(--bg)', background:'var(--surface)' }}>
                          {g.name} · {ga.length} atletas
                        </div>
                        {ga.slice(0,2).map((a,i) => (
                          <div key={a.id} style={{ padding:'6px 14px 6px 40px', display:'flex',
                            borderBottom: i<ga.slice(0,2).length-1 ? '1px solid var(--bg)':undefined,
                            fontSize:12, color:'var(--text)' }}>
                            <span style={{ flex:1 }}>{a.name}</span>
                            <span style={{ width:80, textAlign:'right', fontWeight:700 }}>{athleteMonthly(a)} €</span>
                            <span style={{ width:80, textAlign:'right', color:'var(--muted)' }}>{athleteMonthly(a)*10} €</span>
                          </div>
                        ))}
                        {ga.length > 2 && (
                          <div style={{ padding:'5px 14px 5px 40px', fontSize:11, color:'var(--light)',
                            borderBottom:'1px solid var(--bg)' }}>
                            +{ga.length-2} atletas más…
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {sport.groups.length > 1 && (
                    <div style={{ padding:'5px 14px', fontSize:11, color:'var(--light)',
                      borderBottom:'1px solid var(--border)' }}>
                      +{sport.groups.length-1} grupo{sport.groups.length>2?'s':''} más en {sport.name}…
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ padding:'10px 14px', borderTop:'1px solid var(--border)',
              display:'flex', justifyContent:'flex-end', gap:16 }}>
              <span style={{ fontSize:13, color:'var(--muted)' }}>Total mensual</span>
              <span style={{ fontSize:14, fontWeight:900, color:'var(--text)' }}>
                {totalMonthly.toLocaleString('es-ES')} €
              </span>
              <span style={{ fontSize:13, color:'var(--muted)' }}>Proyección anual</span>
              <span style={{ fontSize:14, fontWeight:900, color:'var(--presente)' }}>
                {(totalMonthly*10).toLocaleString('es-ES')} €
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
