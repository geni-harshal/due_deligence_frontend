import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

const PILLAR_LABELS = {
  net_worth_method:   'Net Worth Method (D&B)',
  turnover_method:    'Turnover / Nayak Method (RBI)',
  cash_flow_method:   'Cash Flow Pool (GENI)',
};
const PILLAR_KEYS = ['net_worth_method', 'turnover_method', 'cash_flow_method'];

export default function CreditLimitMethodology({ data, page, id, total = 26 }) {
  const cr        = data?.credit_recommendation || {};
  const pillar    = cr.three_pillar_breakdown || {};
  const breakdown = cr.limit_breakdown || {};
  const conditions = cr.conditions || [];
  const validity  = cr.assessment_validity || {};

  const constraintMethod = cr.constraining_method || '';

  const isPillarConstrain = (key) => {
    const label = PILLAR_LABELS[key] || '';
    return constraintMethod.toLowerCase().includes(key.replace(/_method$/, '').replace(/_/g, ' ').toLowerCase())
        || constraintMethod.toLowerCase().includes(label.split(' ')[0].toLowerCase());
  };

  // For three_pillar_breakdown, the new JSON may have objects with amount_fmt
  const getPillarValue = (key) => {
    const val = pillar[key];
    if (typeof val === 'object' && val !== null) return val.amount_fmt || fmt(val.amount);
    return fmt(val);
  };

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 20</div>
            <div className="a4-header-title">Credit Recommendation</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ background: '#002147', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: '6.5pt', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Recommended Credit Limit</div>
              <div style={{ fontSize: '18pt', fontWeight: 900, color: '#93f2f2' }}>{fmt(cr.recommended_limit_fmt)}</div>
            </div>
            <div style={{ background: '#006a6a', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: '6.5pt', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Credit Period</div>
              <div style={{ fontSize: '18pt', fontWeight: 900, color: '#fff' }}>{fmt(cr.credit_days)} Days</div>
            </div>
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14, textAlign: 'center', border: '1px solid #e8eaf0' }}>
              <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Recommended Action</div>
              <div style={{ fontSize: '9pt', fontWeight: 700, color: '#002147' }}>{fmt(cr.recommended_action)}</div>
              <div style={{ fontSize: '7pt', color: '#73777f', marginTop: 4 }}>
                Risk Grade: {fmt(cr.risk_grade)} | Multiplier: {cr.risk_multiplier != null ? `${(cr.risk_multiplier * 100).toFixed(0)}%` : '—'}
              </div>
            </div>
          </div>

          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Three-Pillar Credit Limit Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {PILLAR_KEYS.map(key => {
                const value = getPillarValue(key);
                const isConstrain = isPillarConstrain(key);
                return (
                  <div key={key} style={{ background: isConstrain ? '#002147' : '#fff', borderRadius: 8, padding: '12px 14px', border: `1px solid ${isConstrain ? '#002147' : '#e8eaf0'}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '6.5pt', fontWeight: 700, color: isConstrain ? 'rgba(255,255,255,0.7)' : '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      {PILLAR_LABELS[key]}
                    </div>
                    <div style={{ fontSize: '12pt', fontWeight: 900, color: isConstrain ? '#93f2f2' : '#002147' }}>{value}</div>
                    {isConstrain && (
                      <div style={{ fontSize: '6.5pt', color: 'rgba(255,255,255,0.5)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Constraining Factor</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#fff', borderRadius: 6, border: '1px solid #e8eaf0', fontSize: '7.5pt', color: '#43474e' }}>
              <strong>Constraining Factor:</strong> {fmt(cr.constraining_method)} &nbsp;|&nbsp; Size Category: {fmt(cr.size_category)}
            </div>
          </div>

          {cr.ocf_constraint_active && (
            <div style={{ background: '#ffeef0', border: '1px solid #ba1a1a', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#ba1a1a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>⚠ OCF Credit Constraint Active</div>
              <div style={{ fontSize: '7.5pt', color: '#ba1a1a' }}>{fmt(cr.ocf_limit_note)}</div>
            </div>
          )}

          {breakdown && Object.keys(breakdown).length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Limit Calculation Detail</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { label: 'Tangible Net Worth', key: 'tangible_net_worth', isCr: true },
                  { label: 'Base Before Discount', key: 'cl_base_before_discount', isCr: true },
                  { label: 'After Risk Discount', key: 'cl_after_risk_discount', isCr: true },
                  { label: 'Size Cap Applied', key: 'size_cap_applied', isCr: false },
                ].map((item, i) => {
                  const raw = breakdown[item.key];
                  let display = '—';
                  if (raw != null) {
                    if (item.isCr && typeof raw === 'number') {
                      display = `INR ${(raw / 10000000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
                    } else {
                      display = String(raw);
                    }
                  } else if (item.key === 'size_cap_applied') {
                    display = 'None';
                  }
                  return (
                    <div key={i} style={{ background: '#fff', borderRadius: 6, padding: '6px 10px', border: '1px solid #e8eaf0', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '7.5pt', color: '#73777f' }}>{item.label}</span>
                      <span style={{ fontSize: '7.5pt', fontWeight: 700, color: '#002147' }}>{display}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {conditions.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Credit Conditions &amp; Covenants</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {conditions.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid #e8eaf0', fontSize: '7.5pt', color: '#43474e' }}>
                    <span style={{ color: '#006a6a', fontWeight: 700 }}>✓</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {validity.valid_until && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '7.5pt', color: '#73777f' }}><b>Valid Until:</b> {fmt(validity.valid_until)}</span>
              <span style={{ fontSize: '7.5pt', color: '#73777f' }}><b>Reassessment Due:</b> {fmt(validity.reassessment_due)}</span>
            </div>
          )}

          {cr.sys_credit_summary && (
            <div style={{ background: 'linear-gradient(135deg, #002147, #003d6b)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System Intelligence — Credit Assessment</div>
              <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{cr.sys_credit_summary}</div>
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