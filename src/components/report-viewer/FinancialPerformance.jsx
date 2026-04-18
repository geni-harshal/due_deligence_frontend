import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;
const crFmt = (v) => {
  if (v == null) return '—';
  const cr = v / 10000000;
  const abs = Math.abs(cr).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `INR ${v < 0 ? '-' : ''}${abs} Cr`;
};

export default function FinancialPerformance({ data, page, total = 26, id }) {
  const pt = data?.performance_trends || {};
  const wc = data?.working_capital_analysis || {};
  const years = pt.years || [];
  const cycleYears = wc.years || [];

  const revArr = years.map((y) => ({ y, v: pt.revenue?.[y] || 0 }));
  const patArr = years.map((y) => ({ y, v: pt.pat?.[y] || 0 }));
  const ebitdaArr = years.map((y) => ({ y, v: pt.ebitda?.[y] || 0 }));
  const maxRev = Math.max(...revArr.map((d) => Math.abs(d.v)), 1);


  return (
    <>
      {/* PAGE 16 — Performance Trends */}
      <div className="a4-page" id={id} style={{ background: '#fff' }}>
        <div className="a4-page-inner">
          <div className="a4-header">
            <div>
              <div className="a4-section-label">Section 16</div>
              <div className="a4-header-title">Performance Trends</div>
            </div>
            <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Revenue', value: pt.latest?.revenue_fmt },
                { label: 'EBITDA', value: pt.latest?.ebitda_fmt },
                { label: 'PAT', value: pt.latest?.pat_fmt },
                { label: 'Revenue Growth', value: pt.latest?.revenue_growth_fmt },
                { label: 'EBITDA Margin', value: pt.latest?.ebitda_margin_fmt },
                { label: 'Net Margin', value: pt.latest?.net_margin_fmt },
              ].map((item, i) => (
                <div key={i} style={{ background: '#f8f9fc', borderRadius: 8, padding: '10px 12px', border: '1px solid #e8eaf0', textAlign: 'center' }}>
                  <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: '10pt', fontWeight: 800, color: '#002147' }}>{fmt(item.value)}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Revenue, PAT &amp; EBITDA Trend</div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', height: 100 }}>
                {years.map((y, i) => {
                  const rev   = pt.revenue?.[y] || 0;
                  const pat   = pt.pat?.[y] || 0;
                  const ebitda = pt.ebitda?.[y] || 0;
                  const revH  = (Math.abs(rev) / maxRev) * 90;
                  const patH  = (Math.abs(pat) / maxRev) * 90;
                  const ebitdaH = (Math.abs(ebitda) / maxRev) * 90;
                  return (
                    <div key={y} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 90 }}>
                        <div style={{ width: 18, height: revH, background: '#002147', borderRadius: '2px 2px 0 0' }} title={crFmt(rev)} />
                        <div style={{ width: 18, height: Math.max(patH, 1), background: '#006a6a', borderRadius: '2px 2px 0 0' }} title={crFmt(pat)} />
                        <div style={{ width: 18, height: Math.max(ebitdaH, 1), background: ebitda < 0 ? '#ba1a1a' : '#f9a825', borderRadius: '2px 2px 0 0' }} title={crFmt(ebitda)} />
                      </div>
                      <div style={{ fontSize: '6.5pt', color: '#73777f', textAlign: 'center', marginTop: 4 }}>{y.replace('FY ', '')}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                {[{ color: '#002147', label: 'Revenue' }, { color: '#006a6a', label: 'PAT' }, { color: '#f9a825', label: 'EBITDA' }]
                  .map((l, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2 }} />
                      <span style={{ fontSize: '7pt', color: '#73777f' }}>{l.label}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Year-over-Year Performance Table</div>
              <table className="a4-table">
                <thead>
                  <tr><th>Metric</th>{years.map((y) => <th key={y} className="text-right">{y}</th>)}</tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Revenue', data: pt.revenue },
                    { label: 'EBITDA', data: pt.ebitda },
                    { label: 'PAT', data: pt.pat },
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ fontSize: '7.5pt', padding: '4px 8px', fontWeight: 600 }}>{row.label}</td>
                      {years.map((y) => {
                        const v = row.data?.[y];
                        return <td key={y} style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px', color: v != null && v < 0 ? '#ba1a1a' : '#1a1c20', fontFamily: 'monospace' }}>{v != null ? crFmt(v) : '—'}</td>;
                      })}
                    </tr>
                  ))}
                  {[
                    { label: 'Revenue Growth %', data: pt.revenue_growth },
                    { label: 'EBITDA Margin %', data: pt.ebitda_margin },
                    { label: 'Net Margin %', data: pt.net_margin },
                  ].map((row, i) => (
                    <tr key={`r${i}`} style={{ background: (i + 3) % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ fontSize: '7.5pt', padding: '4px 8px', fontWeight: 600 }}>{row.label}</td>
                      {years.map((y) => {
                        const v = row.data?.[y];
                        return <td key={y} style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px', color: v != null && v < 0 ? '#ba1a1a' : '#006a6a' }}>{v != null ? `${Number(v).toFixed(2)}%` : '—'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pt.sys_financial_trend && (
              <div style={{ background: 'linear-gradient(135deg, #002147, #003d6b)', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: '7pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System Intelligence — Financial Trend</div>
                <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{pt.sys_financial_trend}</div>
              </div>
            )}
          </div>

          <div className="a4-footer">
            <span>Geni Intelligence — Confidential</span>
            <span>{`Page ${String(page || 0).padStart(2, '0')} of ${total}`}</span>
          </div>
        </div>
      </div>

      {/* PAGE 17 — Working Capital */}
      <div className="a4-page" id={id} style={{ background: '#fff' }}>
        <div className="a4-page-inner">
          <div className="a4-header">
            <div>
              <div className="a4-section-label">Section 17</div>
              <div className="a4-header-title">Working Capital Analysis</div>
            </div>
            <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Net Working Capital', value: wc.latest?.net_working_capital_fmt },
                { label: 'Current Ratio', value: wc.latest?.current_ratio != null ? `${wc.latest.current_ratio}x` : '—' },
                { label: 'Cash Conv. Cycle', value: wc.latest?.cash_conversion_cycle != null ? `${wc.latest.cash_conversion_cycle} days` : '—' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#f8f9fc', borderRadius: 8, padding: '10px 12px', border: '1px solid #e8eaf0', textAlign: 'center' }}>
                  <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: '11pt', fontWeight: 800, color: '#002147' }}>{fmt(item.value)}</div>
                </div>
              ))}
            </div>

            {wc.analysis && (
              <div style={{ background: wc.analysis.ccc_severe ? '#ffeef0' : '#eaf7f0', border: `1px solid ${wc.analysis.ccc_severe ? '#ba1a1a' : '#006a6a'}`, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '7pt', fontWeight: 700, color: wc.analysis.ccc_severe ? '#ba1a1a' : '#006a6a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                  Working Capital Status — CCC Risk Tier: {fmt(wc.analysis.ccc_risk_tier)}
                </div>
                <div style={{ fontSize: '7.5pt', color: '#43474e' }}>
                  NWC: {fmt(wc.analysis.nwc_amount)} | NWC Positive: {wc.analysis.nwc_positive ? 'Yes' : 'No'}
                </div>
              </div>
            )}

            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <table className="a4-table">
                <thead>
                  <tr><th style={{ width: '40%' }}>Particulars</th>{cycleYears.map((y) => <th key={y} className="text-right">{y}</th>)}</tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Inventories', data: wc.inventories },
                    { label: 'Trade Receivables', data: wc.trade_receivables },
                    { label: 'Cash & Bank', data: wc.cash_and_bank },
                    { label: 'Total Current Assets', data: wc.total_current_assets },
                    { label: 'ST Borrowings', data: wc.st_borrowings },
                    { label: 'Trade Payables', data: wc.trade_payables },
                    { label: 'Total Current Liabilities', data: wc.total_current_liabilities },
                    { label: 'Net Working Capital', data: wc.net_working_capital },
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ fontSize: '7.5pt', padding: '4px 8px', fontWeight: 600 }}>{row.label}</td>
                      {cycleYears.map((y) => {
                        const v = row.data?.[y];
                        return <td key={y} style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px', fontFamily: 'monospace' }}>{v != null ? crFmt(v) : '—'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Working Capital Cycle Days</div>
              <table className="a4-table">
                <thead>
                  <tr><th>Days</th>{cycleYears.map((y) => <th key={y} className="text-right">{y}</th>)}</tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Inventory Days', data: wc.cycle_days?.inventory_days },
                    { label: 'Debtor Days', data: wc.cycle_days?.debtor_days },
                    { label: 'Payable Days', data: wc.cycle_days?.payable_days },
                    { label: 'Cash Conversion Cycle', data: wc.cycle_days?.cash_conversion },
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ fontSize: '7.5pt', padding: '4px 8px', fontWeight: 600 }}>{row.label}</td>
                      {cycleYears.map((y) => {
                        const v = row.data?.[y];
                        return <td key={y} style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px', fontFamily: 'monospace', color: row.label.includes('Cycle') && v > 365 ? '#ba1a1a' : '#1a1c20' }}>{v != null ? `${Number(v).toFixed(1)}` : '—'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="a4-footer">
            <span>Geni Intelligence — Confidential</span>
            <span>{`Page ${String((page || 0) + 1).padStart(2, '0')} of ${total}`}</span>
          </div>
        </div>
      </div>
    </>
  );
}