import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;
const pct = (v) => v != null ? `${Number(v).toFixed(2)}%` : '—';

export default function ShareholdingPattern({ data,id, page, total = 26 }) {
  const os = data?.ownership_structure || {};
  const trend = os.shareholding_trend || [];
  const cats = os.shareholder_categories || {};
  const major = os.major_shareholders_above_5pct || [];
  const group = os.group_structure || {};
  const holding = group.holding_company || {};

  const pieData = [
    { label: 'Promoters', value: cats.promoter ?? 0, color: '#002147' },
    { label: 'DII', value: cats.dii ?? 0, color: '#006a6a' },
    { label: 'FII', value: cats.fii ?? 0, color: '#93f2f2' },
    { label: 'Mutual Funds', value: cats.mutual_funds ?? 0, color: '#f9a825' },
    { label: 'Others', value: cats.others ?? 0, color: '#73777f' },
  ].filter(d => d.value > 0);

  const total_pct = pieData.reduce((s, d) => s + d.value, 0) || 100;
  let cumulative = 0;
  const slices = pieData.map(d => {
    const start = (cumulative / total_pct) * 360;
    cumulative += d.value;
    const end = (cumulative / total_pct) * 360;
    return { ...d, start, end };
  });

  const toRad = (deg) => (deg - 90) * (Math.PI / 180);
  const arc = (cx, cy, r, startDeg, endDeg) => {
    const s = toRad(startDeg), e = toRad(endDeg);
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="a4-page" id={id} style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 09</div>
            <div className="a4-header-title">Ownership Structure</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Promoter Holding', value: pct(os.promoter_holding_pct) },
              { label: 'Public Holding', value: pct(os.public_holding_pct) },
              { label: 'As of', value: fmt(os.shareholding_as_of) },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f8f9fc', borderRadius: 8, padding: 12, border: '1px solid #e8eaf0', textAlign: 'center' }}>
                <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '14pt', fontWeight: 900, color: '#002147' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12, background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {pieData.length > 0 ? (
                <svg viewBox="0 0 100 100" style={{ width: 140, height: 140 }}>
                  {slices.map((s, i) => (
                    <path key={i} d={arc(50, 50, 45, s.start, s.end)} fill={s.color} stroke="#fff" strokeWidth="0.5" />
                  ))}
                </svg>
              ) : <div style={{ color: '#73777f', fontSize: '8pt' }}>No data</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '8pt', color: '#43474e' }}>{d.label}</span>
                  </div>
                  <span style={{ fontSize: '8pt', fontWeight: 700, color: '#002147' }}>{pct(d.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {trend.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Shareholding Trend</div>
              <table className="a4-table">
                <thead>
                  <tr><th>Year</th><th className="text-right">Promoter %</th><th className="text-right">Public %</th></tr>
                </thead>
                <tbody>
                  {trend.map((t, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ fontSize: '7.5pt', padding: '4px 8px', fontWeight: 600 }}>{fmt(t.year)}</td>
                      <td style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px' }}>{pct(t.promoter_pct)}</td>
                      <td style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px' }}>{pct(t.public_pct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {major.length > 0 && (
              <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Major Shareholders (&gt;5%)</div>
                {major.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e8eaf0', fontSize: '7.5pt' }}>
                    <span style={{ fontWeight: 600 }}>{fmt(s.name)}</span>
                    <span style={{ color: '#006a6a', fontWeight: 700 }}>{pct(s.percentage)}</span>
                  </div>
                ))}
              </div>
            )}
            {group.holding_company && (
              <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Group Structure</div>
                <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.8 }}>
                  <div><b>Holding Company:</b> {fmt(holding.name)}</div>
                  <div><b>CIN:</b> {fmt(holding.cin)}</div>
                  <div><b>Holding %:</b> {pct(holding.holding_percentage)}</div>
                  <div><b>Subsidiaries:</b> {fmt(group.subsidiary_count)}</div>
                  <div><b>Associates:</b> {fmt(group.associate_count)}</div>
                  <div><b>Joint Ventures:</b> {fmt(group.joint_venture_count)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="a4-footer">
          <span>Geni Intelligence — Confidential</span>
          <span>{`Page ${String(page || 0).padStart(2, '0')} of ${total}`}</span>
        </div>
      </div>
    </div>
  );
}