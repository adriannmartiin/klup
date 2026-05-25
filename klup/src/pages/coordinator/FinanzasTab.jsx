// ============================================================
// KLUP — Finanzas (jerarquía deporte → grupo → atleta)
// ============================================================
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { SPORTS, GROUPS, ATHLETES, COACHES } from '../../lib/mockData';
import { Icon } from '../../components/ui/index';

// ── Precio efectivo con herencia ─────────────────────────────
// null = heredar del nivel superior

function initPrices() {
  const p = {};
  SPORTS.forEach(s => { p[s.id] = 26; });  // sport default
  Object.values(GROUPS).forEach(g => { p[g.id] = null; });    // inherit sport
  ATHLETES.forEach(a => { p[a.id] = null; });                 // inherit group
  // Demo: un atleta con precio individual
  p['a3'] = 13;
  return p;
}

function effectivePrice(prices, entityId, groupId, sportId) {
  if (prices[entityId] !== null && prices[entityId] !== undefined) return prices[entityId];
  if (groupId && prices[groupId] !== null && prices[groupId] !== undefined) return prices[groupId];
  if (sportId) return prices[sportId] || 0;
  return 0;
}

function isOverridden(prices, entityId) {
  return prices[entityId] !== null && prices[entityId] !== undefined;
}

function scoreColor(v) {
  return v >= 8 ? '#16a34a' : v >= 5 ? '#2563eb' : '#dc2626';
}

export default function FinanzasTab() {
  const [prices, setPrices] = useState(initPrices);
  const [expandedSport, setExpandedSport] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [view, setView] = useState('grupos'); // grupos | exportar

  const setPrice = (id, val) => {
    setPrices(p => ({ ...p, [id]: val === '' ? null : Number(val) }));
  };

  const resetToInherit = (id) => {
    setPrices(p => ({ ...p, [id]: null }));
  };

  // Revenue calculations
  const athletePrice = (a) => effectivePrice(prices, a.id, a.groupId, GROUPS[a.groupId]?.sportId);
  const groupRevenue = (g) => ATHLETES.filter(a => a.groupId === g.id).reduce((acc,a) => acc + athletePrice(a), 0);
  const sportRevenue = (s) => s.groups.reduce((acc,gid) => {
    const g = GROUPS[gid]; return g ? acc + groupRevenue(g) : acc;
  }, 0);
  const totalRevenue = SPORTS.reduce((acc,s) => acc + sportRevenue(s), 0);
  const totalAthletes = ATHLETES.length;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    // Summary sheet
    const sumRows = [['Deporte','Atletas','Precio base','Ingresos/mes']];
    SPORTS.forEach(s => {
      const ac = s.groups.reduce((acc,gid)=>acc+(GROUPS[gid]?.count||0),0);
      sumRows.push([s.name, ac, prices[s.id]||0, sportRevenue(s)]);
    });
    sumRows.push([]); sumRows.push(['TOTAL','',totalAthletes,totalRevenue]);
    const ws1 = XLSX.utils.aoa_to_sheet(sumRows);
    ws1['!cols'] = [{wch:14},{wch:10},{wch:14},{wch:16}];
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');
    // Detail sheet
    const detRows = [['Deporte','Grupo','Atleta','Curso','Precio €/mes','Origen precio']];
    SPORTS.forEach(s => s.groups.forEach(gid => {
      const g = GROUPS[gid]; if (!g) return;
      ATHLETES.filter(a=>a.groupId===gid).forEach(a => {
        const origin = isOverridden(prices,a.id) ? 'Individual'
          : isOverridden(prices,g.id) ? 'Grupo'
          : 'Deporte';
        detRows.push([s.name, g.name, a.name, a.course, athletePrice(a), origin]);
      });
    }));
    const ws2 = XLSX.utils.aoa_to_sheet(detRows);
    ws2['!cols'] = [{wch:12},{wch:16},{wch:22},{wch:14},{wch:14},{wch:14}];
    XLSX.utils.book_append_sheet(wb, ws2, 'Detalle');
    XLSX.writeFile(wb, `klup-finanzas-${new Date().toISOString().slice(0,7)}.xlsx`);
  };

  return (
    <div>
      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:20 }}>
        <div className="stat-big" style={{ background:'#dcfce7' }}>
          <div className="stat-big-num" style={{ color:'var(--presente)', fontSize:20 }}>
            {totalRevenue.toLocaleString('es-ES')} €
          </div>
          <div className="stat-big-label">Ingresos / mes</div>
        </div>
        <div className="stat-big">
          <div className="stat-big-num">{totalAthletes}</div>
          <div className="stat-big-label">Atletas</div>
        </div>
        <div className="stat-big">
          <div className="stat-big-num">{Math.round(totalRevenue/totalAthletes)||0} €</div>
          <div className="stat-big-label">Media / atleta</div>
        </div>
        <div className="stat-big" style={{ background:'#f0f7ff' }}>
          <div className="stat-big-num" style={{ color:'var(--blue)', fontSize:20 }}>
            {(totalRevenue*10).toLocaleString('es-ES')} €
          </div>
          <div className="stat-big-label">Proyección anual</div>
        </div>
      </div>

      {/* View selector */}
      <div style={{ display:'flex', gap:4, marginBottom:18, borderBottom:'1px solid var(--border)' }}>
        {[['grupos','Por grupos'],['exportar','Exportar']].map(([id,label]) => (
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
            Edita el precio a nivel de deporte, grupo o atleta. Si no modificas un nivel, hereda el precio del nivel superior.
          </div>

          {SPORTS.map(sport => {
            const sportPrice = prices[sport.id] || 0;
            const sRev       = sportRevenue(sport);
            const isExpSport = expandedSport === sport.id;
            const sportGroups = sport.groups.map(gid => GROUPS[gid]).filter(Boolean);

            return (
              <div key={sport.id} style={{ marginBottom:12 }}>
                {/* Sport row */}
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
                  background:`${sport.color}10`, borderRadius: isExpSport ? 'var(--r-md) var(--r-md) 0 0' : 'var(--r-md)',
                  border:`1.5px solid ${sport.color}40`, cursor:'pointer' }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:sport.color, flexShrink:0 }}
                    onClick={() => setExpandedSport(isExpSport?null:sport.id)}/>
                  <span style={{ fontSize:15, fontWeight:800, color:sport.color, flex:1 }}
                    onClick={() => setExpandedSport(isExpSport?null:sport.id)}>
                    {sport.name}
                  </span>
                  <span style={{ fontSize:12, color:'var(--muted)', marginRight:4 }}
                    onClick={() => setExpandedSport(isExpSport?null:sport.id)}>
                    {sRev.toLocaleString('es-ES')} €/mes
                  </span>
                  {/* Sport price input */}
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <input type="number" min="0" value={sportPrice}
                      onChange={e => setPrice(sport.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{ width:64, padding:'5px 8px', borderRadius:'var(--r-sm)',
                        border:`1.5px solid ${sport.color}60`, background:'var(--surface)',
                        color:'var(--text)', fontSize:14, fontWeight:800, textAlign:'right' }}/>
                    <span style={{ fontSize:12, color:'var(--muted)' }}>€</span>
                  </div>
                  <svg width="14" height="14" style={{ color:'var(--muted)', flexShrink:0,
                    transform:isExpSport?'rotate(180deg)':'none', transition:'transform .2s' }}
                    onClick={() => setExpandedSport(isExpSport?null:sport.id)}>
                    <Icon.ChevronDown/>
                  </svg>
                </div>

                {/* Groups */}
                {isExpSport && (
                  <div style={{ border:`1.5px solid ${sport.color}30`, borderTop:'none',
                    borderRadius:'0 0 var(--r-md) var(--r-md)', overflow:'hidden' }}>
                    {sportGroups.map((g, gi) => {
                      const gEffective  = isOverridden(prices,g.id) ? prices[g.id] : sportPrice;
                      const gIsCustom   = isOverridden(prices,g.id);
                      const isExpGroup  = expandedGroup === g.id;
                      const gAthletes   = ATHLETES.filter(a => a.groupId === g.id);
                      const gRev        = groupRevenue(g);
                      const coach       = COACHES.find(c => c.id === g.coachId);

                      return (
                        <div key={g.id} style={{ borderBottom: gi<sportGroups.length-1 ? '1px solid var(--bg)' : undefined }}>
                          {/* Group row */}
                          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px 10px 28px',
                            background:isExpGroup?'var(--bg)':undefined, cursor:'pointer' }}>
                            <div style={{ width:7, height:7, borderRadius:'50%', background:`${sport.color}60`, flexShrink:0 }}
                              onClick={() => setExpandedGroup(isExpGroup?null:g.id)}/>
                            <div style={{ flex:1, minWidth:0 }} onClick={() => setExpandedGroup(isExpGroup?null:g.id)}>
                              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{g.name}</div>
                              <div style={{ fontSize:11, color:'var(--muted)' }}>
                                {coach?.name||'—'} · {gAthletes.length} atletas · {gRev} €/mes
                              </div>
                            </div>
                            {/* Group price */}
                            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                              {gIsCustom && (
                                <button title="Volver a heredar del deporte"
                                  onClick={() => resetToInherit(g.id)}
                                  style={{ fontSize:10, color:'var(--tarde)', background:'var(--tarde-bg)',
                                    border:'none', borderRadius:99, padding:'1px 6px', cursor:'pointer', fontWeight:700 }}>
                                  custom ✕
                                </button>
                              )}
                              {!gIsCustom && (
                                <span style={{ fontSize:10, color:'var(--muted)', background:'var(--bg)',
                                  borderRadius:99, padding:'1px 6px', fontWeight:600 }}>
                                  hereda
                                </span>
                              )}
                              <input type="number" min="0" value={gEffective}
                                onChange={e => setPrice(g.id, e.target.value)}
                                onClick={e => e.stopPropagation()}
                                style={{ width:60, padding:'4px 7px', borderRadius:'var(--r-sm)',
                                  border:`1.5px solid ${gIsCustom?sport.color:'var(--border)'}`,
                                  background:'var(--surface)', color:'var(--text)',
                                  fontSize:13, fontWeight:700, textAlign:'right' }}/>
                              <span style={{ fontSize:11, color:'var(--muted)' }}>€</span>
                            </div>
                            <svg width="13" height="13" style={{ color:'var(--light)', flexShrink:0,
                              transform:isExpGroup?'rotate(180deg)':'none', transition:'transform .2s' }}
                              onClick={() => setExpandedGroup(isExpGroup?null:g.id)}>
                              <Icon.ChevronDown/>
                            </svg>
                          </div>

                          {/* Athletes */}
                          {isExpGroup && (
                            <div style={{ background:'var(--surface)', borderTop:'1px solid var(--border)' }}>
                              {gAthletes.map((a, ai) => {
                                const aEffective = athletePrice(a);
                                const aIsCustom  = isOverridden(prices, a.id);
                                return (
                                  <div key={a.id} style={{ display:'flex', alignItems:'center', gap:10,
                                    padding:'8px 16px 8px 44px',
                                    borderBottom:ai<gAthletes.length-1?'1px solid var(--bg)':undefined }}>
                                    <div className="avatar avatar-sm"
                                      style={{ background:`${sport.color}15`, color:sport.color, flexShrink:0 }}>
                                      {a.avatar}
                                    </div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <div style={{ fontSize:13, color:'var(--text)', fontWeight:500 }} className="truncate">
                                        {a.name}
                                      </div>
                                      <div style={{ fontSize:10, color:'var(--light)' }}>{a.course}</div>
                                    </div>
                                    {/* Athlete price */}
                                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                      {aIsCustom && (
                                        <button title="Volver a heredar del grupo"
                                          onClick={() => resetToInherit(a.id)}
                                          style={{ fontSize:10, color:'var(--tarde)', background:'var(--tarde-bg)',
                                            border:'none', borderRadius:99, padding:'1px 6px', cursor:'pointer', fontWeight:700 }}>
                                          custom ✕
                                        </button>
                                      )}
                                      {!aIsCustom && (
                                        <span style={{ fontSize:10, color:'var(--muted)', background:'var(--bg)',
                                          borderRadius:99, padding:'1px 6px', fontWeight:600 }}>
                                          hereda
                                        </span>
                                      )}
                                      <input type="number" min="0" value={aEffective}
                                        onChange={e => setPrice(a.id, e.target.value)}
                                        style={{ width:56, padding:'4px 7px', borderRadius:'var(--r-sm)',
                                          border:`1.5px solid ${aIsCustom?'var(--tarde)':'var(--border)'}`,
                                          background: aIsCustom ? 'var(--tarde-bg)' : 'var(--surface)',
                                          color:'var(--text)', fontSize:13, fontWeight:700, textAlign:'right' }}/>
                                      <span style={{ fontSize:11, color:'var(--muted)' }}>€</span>
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
                )}
              </div>
            );
          })}
        </>
      )}

      {/* ── EXPORTAR ── */}
      {view === 'exportar' && (
        <>
          {/* Preview table */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:'var(--r-md)', overflow:'hidden', marginBottom:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px 80px',
              padding:'8px 14px', background:'var(--bg)', borderBottom:'1px solid var(--border)',
              fontSize:11, fontWeight:700, color:'var(--muted)' }}>
              <span>Deporte / Grupo / Atleta</span>
              <span style={{ textAlign:'right' }}>Precio</span>
              <span style={{ textAlign:'right' }}>Origen</span>
              <span style={{ textAlign:'right' }}>Total/mes</span>
            </div>
            {SPORTS.map(sport => {
              const sRev = sportRevenue(sport);
              return (
                <div key={sport.id}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px 80px',
                    padding:'9px 14px', background:`${sport.color}08`,
                    borderBottom:'1px solid var(--border)', fontWeight:700 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:8,height:8,borderRadius:'50%',background:sport.color,flexShrink:0 }}/>
                      <span style={{ color:sport.color, fontSize:13 }}>{sport.name}</span>
                    </div>
                    <span style={{ textAlign:'right', fontSize:13, color:'var(--text)' }}>{prices[sport.id]}€</span>
                    <span style={{ textAlign:'right', fontSize:10, color:'var(--muted)' }}>base</span>
                    <span style={{ textAlign:'right', fontSize:13, fontWeight:800, color:'var(--text)' }}>{sRev}€</span>
                  </div>
                  {sport.groups.map(gid => {
                    const g = GROUPS[gid]; if (!g) return null;
                    const gA = ATHLETES.filter(a=>a.groupId===gid);
                    const gRev = groupRevenue(g);
                    const gIsCustom = isOverridden(prices,g.id);
                    return (
                      <div key={gid}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px 80px',
                          padding:'7px 14px 7px 26px', borderBottom:'1px solid var(--bg)',
                          background:'var(--surface)' }}>
                          <span style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{g.name}</span>
                          <span style={{ textAlign:'right', fontSize:12, color: gIsCustom?'var(--tarde)':'var(--muted)' }}>
                            {effectivePrice(prices,g.id,null,sport.id)}€
                          </span>
                          <span style={{ textAlign:'right', fontSize:10, color:'var(--light)' }}>
                            {gIsCustom?'custom':'hereda'}
                          </span>
                          <span style={{ textAlign:'right', fontSize:12, fontWeight:600, color:'var(--text)' }}>{gRev}€</span>
                        </div>
                        {gA.map(a => {
                          const aIsCustom = isOverridden(prices,a.id);
                          if (!aIsCustom) return null; // only show athletes with custom price
                          return (
                            <div key={a.id} style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px 80px',
                              padding:'5px 14px 5px 40px', background:'var(--tarde-bg)',
                              borderBottom:'1px solid var(--bg)' }}>
                              <span style={{ fontSize:11, color:'var(--text)' }}>{a.name}</span>
                              <span style={{ textAlign:'right', fontSize:11, fontWeight:800, color:'var(--tarde)' }}>
                                {athletePrice(a)}€
                              </span>
                              <span style={{ textAlign:'right', fontSize:10, color:'var(--tarde)' }}>individual</span>
                              <span style={{ textAlign:'right', fontSize:11, color:'var(--tarde)' }}>{athletePrice(a)}€</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px 80px',
              padding:'10px 14px', borderTop:'2px solid var(--border)', fontWeight:800 }}>
              <span style={{ fontSize:13, color:'var(--text)' }}>TOTAL</span>
              <span/><span/>
              <span style={{ textAlign:'right', fontSize:15, color:'var(--presente)' }}>
                {totalRevenue}€
              </span>
            </div>
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-primary" style={{ flex:1 }} onClick={exportExcel}>
              📊 Descargar Excel
            </button>
            <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => window.print()}>
              🖨 Imprimir PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
