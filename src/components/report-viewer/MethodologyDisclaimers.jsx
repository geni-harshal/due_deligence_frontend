import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

const GRADE_COLOR = { A: '#006a6a', B: '#2e7d32', C: '#f9a825', D: '#e65100', E: '#ba1a1a' };

export default function MethodologyDisclaimers({ data, page, total = 26 ,id}) {
  const m = data?.methodology || {};
  const gradeScale = m.grade_scale || [];
  const formulas = m.formulas || [];
  const dataSources = m.data_sources || [];
  const weights = m.risk_weights || {};

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 24</div>
            <div className="a4-header-title">Methodology</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#002147', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scoring Engine</div>
            <div style={{ fontSize: '9pt', fontWeight: 700, color: '#fff' }}>{fmt(m.scoring_engine)}</div>
          </div>

          {gradeScale.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Risk Grade Scale</div>
              <table className="a4-table">
                <thead>
                  <tr><th>Grade</th><th>Score Range</th><th>Risk Level</th><th className="text-right">Risk Multiplier</th></tr>
                </thead>
                <tbody>
                  {gradeScale.map((g, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ padding: '4px 8px' }}>
                        <span style={{ background: GRADE_COLOR[g.grade] || '#73777f', color: '#fff', padding: '2px 10px', borderRadius: 10, fontSize: '7.5pt', fontWeight: 800 }}>{g.grade}</span>
                      </td>
                      <td style={{ fontSize: '7.5pt', padding: '4px 8px', fontWeight: 600 }}>{fmt(g.range)}</td>
                      <td style={{ fontSize: '7.5pt', padding: '4px 8px', color: GRADE_COLOR[g.grade] || '#73777f', fontWeight: 700 }}>{fmt(g.risk)}</td>
                      <td style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px' }}>{g.multiplier != null ? `${(g.multiplier * 100).toFixed(0)}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {Object.keys(weights).length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Scoring Weight Distribution</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {Object.entries(weights).map(([k, v], i) => (
                  <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 6, padding: '8px 12px', border: '1px solid #e8eaf0', textAlign: 'center' }}>
                    <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{k.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: '12pt', fontWeight: 900, color: '#002147' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formulas.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Scoring Formulas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {formulas.map((f, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, padding: '5px 8px', background: '#fff', borderRadius: 6, border: '1px solid #e8eaf0' }}>
                    <span style={{ fontSize: '7.5pt', fontWeight: 800, color: '#006a6a' }}>{fmt(f.name)}</span>
                    <span style={{ fontSize: '7.5pt', color: '#43474e' }}>{fmt(f.description)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dataSources.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Data Sources</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dataSources.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: '7.5pt', color: '#43474e', padding: '3px 0', borderBottom: i < dataSources.length - 1 ? '1px solid #e8eaf0' : 'none' }}>
                    <span style={{ color: '#006a6a', fontWeight: 700 }}>▸</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="a4-footer">
          <span>Geni Intelligence — Confidential</span>
          <span>{`Page ${String(page || 0).padStart(2, '0')} of ${total}`}</span>
        </div>
      </div>
    </div>
  );
}