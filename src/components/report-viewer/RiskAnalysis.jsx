import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

const IMPACT_COLOR = { critical: '#ba1a1a', very_high: '#ba1a1a', high: '#e65100', medium: '#f9a825', low: '#006a6a' };
const DIR_LABEL = { risk_increasing: '↑ Risk Increasing', risk_reducing: '↓ Risk Reducing' };

export default function RiskAnalysis({ data, page, total = 26,id }) {
  const ra = data?.risk_analysis || {};
  const intel = data?.intelligence_flags || {};
  const factors = ra.risk_factors || [];

  const IntFlag = ({ label, active, note }) => (
    <div style={{ background: active ? '#ffeef0' : '#eaf7f0', border: `1px solid ${active ? '#ba1a1a' : '#006a6a'}`, borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: note ? 4 : 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? '#ba1a1a' : '#006a6a' }} />
        <span style={{ fontSize: '7pt', fontWeight: 700, color: active ? '#ba1a1a' : '#006a6a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      {note && <div style={{ fontSize: '7pt', color: '#43474e', lineHeight: 1.5 }}>{note}</div>}
    </div>
  );

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 19</div>
            <div className="a4-header-title">Risk Interpretation</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: '#002147', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: '6.5pt', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>GENI Risk Score</div>
              <div style={{ fontSize: '28pt', fontWeight: 900, color: '#93f2f2' }}>{fmt(ra.risk_score)}<span style={{ fontSize: '12pt' }}>/100</span></div>
              <div style={{ fontSize: '9pt', fontWeight: 700, color: '#fff', marginTop: 4 }}>Grade {fmt(ra.risk_grade)} — {fmt(ra.risk_label)}</div>
            </div>
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Probability of Default</div>
              <div style={{ fontSize: '26pt', fontWeight: 900, color: '#ba1a1a' }}>{fmt(ra.probability_of_default)}%</div>
              <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.6, marginTop: 6 }}>{fmt(ra.pd_interpretation)}</div>
            </div>
          </div>

          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Intelligence Flags</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <IntFlag label="Liquidity Quality Risk" active={!!intel.liquidity_quality_risk} note={ra.operating_stress_note} />
              <IntFlag label="Earnings Quality Risk" active={!!intel.earnings_quality_risk} note={ra.earnings_quality_note} />
              <IntFlag label="Working Capital Structural Risk" active={intel.wc_structural_risk === 'SEVERE'} note={ra.wc_structural_note} />
              <IntFlag label="OCF Credit Constraint" active={!!intel.ocf_credit_constraint} />
              {intel.charge_exposure_high && <IntFlag label="High Charge Exposure" active={true} note={ra.charge_exposure_note} />}
            </div>
          </div>

          {factors.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Risk Factor Signals</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {factors.map((f, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 8, alignItems: 'center', padding: '6px 8px', background: '#fff', borderRadius: 6, border: '1px solid #e8eaf0' }}>
                    <span style={{ fontSize: '6.5pt', fontWeight: 700, color: IMPACT_COLOR[f.impact] || '#73777f', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{fmt(f.impact)}</span>
                    <div>
                      <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#1a1c20' }}>{fmt(f.factor)}</div>
                      <div style={{ fontSize: '7pt', color: '#73777f' }}>{fmt(f.detail)}</div>
                    </div>
                    <span style={{ fontSize: '6.5pt', fontWeight: 600, color: f.direction === 'risk_increasing' ? '#ba1a1a' : '#006a6a', whiteSpace: 'nowrap' }}>
                      {DIR_LABEL[f.direction] || f.direction}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ra.rating_conflict_flag && (
            <div style={{ background: '#fffde7', border: '1px solid #f9a825', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#e65100', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>⚠ Rating Divergence Notice</div>
              <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.6 }}>{fmt(ra.rating_vs_score_note)}</div>
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