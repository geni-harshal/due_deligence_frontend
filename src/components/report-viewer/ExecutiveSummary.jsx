import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

const GRADE_BG = {
  A: '#006a6a', B: '#2e7d32', C: '#f9a825', D: '#e65100', E: '#ba1a1a',
};

const WF_KEY_LABELS = {
  base_financial_score: 'Base Score',
  peer_adjustment_log_odds: 'Peer Adj.',
  compliance_adjustment_log_odds: 'Compliance Adj.',
};

const SC_KEY_LABELS = {
  financial_health: 'Financial Health',
  compliance: 'Compliance',
  behavioral: 'Behavioral',
  peer_comparison: 'Peer Comparison',
};

export default function ExecutiveSummary({ data, page,id, total = 26 }) {
  const ed      = data?.executive_dashboard || {};
  const snap    = ed.entity_snapshot || {};
  const wf      = ed.score_waterfall || {};
  const flags   = ed.key_risk_flags || {};
  const sc      = ed.score_components || {};
  const rating  = snap.latest_rating || {};

  const score     = ed.risk_score ?? 0;
  const grade     = ed.risk_grade ?? 'E';
  const riskLabel = ed.risk_label ?? fmt(ed.risk_grade);
  const gradeBg   = GRADE_BG[grade] || '#73777f';

  const angle   = (score / 100) * 180 - 90;
  const rad     = (a) => (a * Math.PI) / 180;
  const cx      = 100, cy = 100, r = 75;
  const needleX = cx + r * Math.cos(rad(angle - 90));
  const needleY = cy + r * Math.sin(rad(angle - 90));

  const FlagBadge = ({ active, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 12, background: active ? '#ffeef0' : '#eaf7f0', border: `1px solid ${active ? '#ba1a1a' : '#006a6a'}` }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#ba1a1a' : '#006a6a' }} />
      <span style={{ fontSize: '7pt', fontWeight: 700, color: active ? '#ba1a1a' : '#006a6a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );

  const wfKeys = ['base_financial_score', 'peer_adjustment_log_odds', 'compliance_adjustment_log_odds'];
  const wfItems = wfKeys
    .filter(k => wf[k] !== undefined)
    .map(k => ({
      label: WF_KEY_LABELS[k] || k.replace(/_/g, ' '),
      value: wf[k] ?? 0,
      color: k === 'base_financial_score' ? '#002147' : (wf[k] ?? 0) >= 0 ? '#006a6a' : '#ba1a1a',
      sign: k !== 'base_financial_score' && (wf[k] ?? 0) >= 0 ? '+' : '',
    }));

  const scItems = Object.entries(sc).map(([k, v]) => ({
    label: SC_KEY_LABELS[k] || k.replace(/_/g, ' '),
    value: Number(v) || 0,
  }));

  // Parse rating string like "A- (Stable/Reaffirmed)"
  let displayRating = rating.rating || '';
  let displayOutlook = rating.outlook || '';
  if (displayRating.includes('(')) {
    const parts = displayRating.split('(');
    displayRating = parts[0].trim();
    displayOutlook = parts[1]?.replace(')', '').trim() || displayOutlook;
  }

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 06</div>
            <div className="a4-header-title">Executive Risk Dashboard</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Entity Snapshot */}
          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12, display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Subject Entity</div>
              <div style={{ fontSize: '13pt', fontWeight: 900, color: '#002147', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{fmt(snap.name)}</div>
              <div style={{ fontSize: '8pt', color: '#73777f', marginTop: 3 }}>
                CIN: {fmt(snap.cin)}  |  Industry: {fmt(snap.industry)}  |  Listing: {fmt(snap.listing)}
              </div>
            </div>
            {(rating.rating || displayRating) && (
              <div style={{ background: '#002147', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '6.5pt', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{fmt(rating.agency)}</div>
                <div style={{ fontSize: '15pt', fontWeight: 900, color: '#93f2f2' }}>{fmt(displayRating)}</div>
                <div style={{ fontSize: '7pt', color: 'rgba(255,255,255,0.7)' }}>{fmt(displayOutlook)}</div>
              </div>
            )}
          </div>

          {/* Score Gauge + Waterfall + Credit Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12 }}>
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Composite Risk Score</div>
              <svg viewBox="0 0 200 120" style={{ width: 160 }}>
                <path d="M25,100 A75,75 0 0,1 175,100" fill="none" stroke="#ba1a1a" strokeWidth="14" />
                <path d="M25,100 A75,75 0 0,1 100,25"  fill="none" stroke="#f9a825" strokeWidth="14" />
                <path d="M100,25 A75,75 0 0,1 175,100" fill="none" stroke="#006a6a" strokeWidth="14" />
                <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1a1c20" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r="5" fill="#1a1c20" />
                <text x={cx} y={cy + 22} textAnchor="middle" fontSize="18" fontWeight="900" fill="#002147">{score.toFixed(1)}</text>
                <text x={cx} y={cy + 34} textAnchor="middle" fontSize="7" fontWeight="700" fill={gradeBg}>{grade} — {riskLabel}</text>
              </svg>

              <div style={{ width: '100%', marginTop: 8, background: '#fff', borderRadius: 6, padding: '8px 10px', border: '1px solid #e8eaf0' }}>
                <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Score Waterfall</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${wfItems.length}, 1fr)`, gap: 6 }}>
                  {wfItems.map((item, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '6pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: '9pt', fontWeight: 800, color: item.color }}>{item.sign}{Number(item.value).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#002147', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: '6.5pt', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Recommended Credit Limit</div>
                <div style={{ fontSize: '22pt', fontWeight: 900, color: '#93f2f2', letterSpacing: '-0.02em' }}>{fmt(ed.credit_limit_fmt)}</div>
              </div>
              <div style={{ background: '#006a6a', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: '6.5pt', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Standard Credit Period</div>
                <div style={{ fontSize: '22pt', fontWeight: 900, color: '#fff' }}>{fmt(ed.credit_days)} Days</div>
              </div>
              <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Probability of Default</div>
                  <div style={{ fontSize: '14pt', fontWeight: 800, color: '#ba1a1a' }}>{fmt(ed.probability_of_default)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3, textAlign: 'right' }}>Recommended Action</div>
                  <div style={{ fontSize: '8pt', fontWeight: 700, color: '#002147', textAlign: 'right' }}>{fmt(ed.recommended_action)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Components */}
          {scItems.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Score Component Breakdown</div>
              {scItems.map((item, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: '7.5pt', fontWeight: 600, color: '#43474e' }}>{item.label}</span>
                    <span style={{ fontSize: '7.5pt', fontWeight: 800, color: '#002147' }}>{item.value.toFixed(1)}</span>
                  </div>
                  <div style={{ height: 6, background: '#e8eaf0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, item.value)}%`, background: item.value >= 60 ? '#006a6a' : item.value >= 40 ? '#f9a825' : '#ba1a1a', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Risk Flags */}
          {Object.keys(flags).length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Key Risk Flags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(flags).map(([key, val], i) => (
                  <FlagBadge key={i} active={!!val} label={key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} />
                ))}
              </div>
            </div>
          )}

          {/* AI Summaries */}
          {ed.sys_executive_summary && (
            <div style={{ background: 'linear-gradient(135deg, #002147, #003d6b)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System Intelligence — Executive Assessment</div>
              <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{ed.sys_executive_summary}</div>
            </div>
          )}
          {ed.sys_score_rationale && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12, borderLeft: '3px solid #006a6a' }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Score Rationale</div>
              <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.7 }}>{ed.sys_score_rationale}</div>
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