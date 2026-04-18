import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

const LIGHT_COLOR = { Red: '#ba1a1a', Yellow: '#f9a825', Green: '#006a6a', RED: '#ba1a1a', AMBER: '#f9a825', GREEN: '#006a6a' };
const LIGHT_BG    = { Red: '#ffeef0', Yellow: '#fffde7', Green: '#eaf7f0', RED: '#ffeef0', AMBER: '#fffde7', GREEN: '#eaf7f0' };

export default function ComplianceBehavioral({ data, page, total = 26 ,id}) {
  const cb = data?.compliance_behavior || {};
  const lights = cb.traffic_lights || {};
  const msmeTrend = cb.msme_payment_trend || [];
  const gstDetail = cb.gst_compliance_detail || [];
  const externalRatings = cb.external_ratings || [];

  const maxMsme = Math.max(...msmeTrend.map(m => m.amount_raw || m.amount || 0), 1);

  return (
    <div className="a4-page" id={id} style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 11</div>
            <div className="a4-header-title">Compliance &amp; Behavioral Risk</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Traffic Lights */}
          {Object.keys(lights).length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Compliance Traffic Lights</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(lights).map(([key, val], i) => {
                  const color = LIGHT_COLOR[val] || '#73777f';
                  const bg    = LIGHT_BG[val] || '#f8f9fc';
                  return (
                    <div key={i} style={{ background: bg, border: `1.5px solid ${color}`, borderRadius: 8, padding: '8px 16px', textAlign: 'center', minWidth: 90 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, margin: '0 auto 5px' }} />
                      <div style={{ fontSize: '6.5pt', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{key.toUpperCase()}</div>
                      <div style={{ fontSize: '7pt', fontWeight: 600, color, marginTop: 2 }}>{val}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GST Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Active GST Registrations', value: cb.gst_registrations_active ?? fmt(null) },
              { label: 'Total GST Registrations', value: cb.gst_total ?? fmt(null) },
              { label: 'GST Filing Delay', value: cb.gst_filing_delay ? 'YES' : 'NO', bad: !!cb.gst_filing_delay },
              { label: 'MSME Payment Delay', value: cb.msme_payment_delays ? 'YES' : 'NO', bad: !!cb.msme_payment_delays },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f8f9fc', borderRadius: 8, padding: 10, border: '1px solid #e8eaf0', textAlign: 'center' }}>
                <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '13pt', fontWeight: 900, color: item.bad ? '#ba1a1a' : '#002147' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* GST Compliance Detail */}
          {gstDetail.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>GST Compliance Detail</div>
              <table className="a4-table">
                <thead>
                  <tr><th>GSTIN</th><th>State</th><th>Status</th><th className="text-right">Total Filings</th><th className="text-right">Delayed</th><th className="text-right">Compliance %</th></tr>
                </thead>
                <tbody>
                  {gstDetail.slice(0, 10).map((g, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ fontFamily: 'monospace', fontSize: '7pt', padding: '3px 8px' }}>{fmt(g.gstin)}</td>
                      <td style={{ fontSize: '7.5pt', padding: '3px 8px' }}>{fmt(g.state)}</td>
                      <td style={{ padding: '3px 8px' }}>
                        <span style={{ fontSize: '7pt', fontWeight: 700, color: g.status === 'Active' ? '#006a6a' : '#ba1a1a' }}>{fmt(g.status)}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '7.5pt', padding: '3px 8px' }}>{fmt(g.total_filings)}</td>
                      <td style={{ textAlign: 'right', fontSize: '7.5pt', padding: '3px 8px', color: g.delayed_filings > 0 ? '#ba1a1a' : '#006a6a', fontWeight: 700 }}>{fmt(g.delayed_filings)}</td>
                      <td style={{ textAlign: 'right', fontSize: '7.5pt', padding: '3px 8px', fontWeight: 700 }}>{g.compliance_pct != null ? `${g.compliance_pct}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {gstDetail.length > 10 && <div style={{ fontSize: '7pt', color: '#73777f', marginTop: 6 }}>+{gstDetail.length - 10} more registrations</div>}
            </div>
          )}

          {/* MSME Payment Trend */}
          {msmeTrend.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                MSME Delayed Payment Trend (Total Latest: {fmt(cb.msme_total_delayed_fmt)})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {msmeTrend.map((m, i) => {
                  const w = ((m.amount_raw || m.amount || 0) / maxMsme) * 100;
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: '7pt', color: '#43474e' }}>{fmt(m.period)}</span>
                      <div style={{ height: 8, background: '#e8eaf0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${w}%`, background: '#e65100', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', whiteSpace: 'nowrap' }}>{fmt(m.amount_fmt || m.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* External Ratings (from compliance_behavior) */}
          {externalRatings.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>External Credit Ratings</div>
              {externalRatings.map((r, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 6, padding: '8px 12px', marginBottom: 6, border: '1px solid #e8eaf0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '7.5pt', fontWeight: 700, color: '#002147' }}>{fmt(r.agency)}</span>
                    <span style={{ fontSize: '7pt', color: '#ba1a1a', fontWeight: 600 }}>{fmt(r.status)}</span>
                  </div>
                  <div style={{ fontSize: '7pt', color: '#73777f', marginTop: 2 }}>
                    Long Term: {fmt(r.long_term_rating)} | Short Term: {fmt(r.short_term_rating)} | Outlook: {fmt(r.outlook)}
                  </div>
                  <div style={{ fontSize: '7pt', color: '#73777f' }}>Date: {fmt(r.rating_date)}</div>
                  {r.note && <div style={{ fontSize: '6.5pt', color: '#73777f', marginTop: 4 }}>{r.note}</div>}
                </div>
              ))}
            </div>
          )}

          {/* AI Summary */}
          {cb.sys_compliance_summary && (
            <div style={{ background: 'linear-gradient(135deg, #002147, #003d6b)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System Intelligence — Compliance Assessment</div>
              <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{cb.sys_compliance_summary}</div>
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