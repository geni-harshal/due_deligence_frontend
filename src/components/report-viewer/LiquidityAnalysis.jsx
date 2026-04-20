import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

export default function LiquidityAnalysis({ data, page, total = 26,id }) {
  const la = data?.liquidity_analysis || {};
  const years = la.years || [];
  const latest = la.latest || {};

  return (
    <div className="a4-page" id={id} style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 18</div>
            <div className="a4-header-title">Liquidity Analysis</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Current Ratio', value: latest.current_ratio_fmt },
              { label: 'Quick Ratio', value: latest.quick_ratio_fmt },
              { label: 'Operating Cash Flow', value: latest.ocf_fmt },
              { label: 'Closing Cash', value: latest.closing_cash_fmt },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f8f9fc', borderRadius: 8, padding: '10px 12px', border: '1px solid #e8eaf0', textAlign: 'center' }}>
                <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '11pt', fontWeight: 800, color: '#002147' }}>{fmt(item.value)}</div>
              </div>
            ))}
          </div>

          {la.liquidity_quality_risk && (
            <div style={{ background: '#ffeef0', border: '1px solid #ba1a1a', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#ba1a1a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>⚠ Liquidity Quality Risk Detected</div>
              <div style={{ fontSize: '7.5pt', color: '#ba1a1a' }}>{fmt(la.liquidity_quality_note)}</div>
            </div>
          )}

          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Liquidity Trend</div>
            <table className="a4-table">
              <thead>
                <tr><th style={{ width: '35%' }}>Metric</th>{years.map((y) => <th key={y} className="text-right">{y}</th>)}</tr>
              </thead>
              <tbody>
                {[
                  { label: 'Current Ratio (x)', data: la.current_ratio },
                  { label: 'Quick Ratio (x)', data: la.quick_ratio },
                  { label: 'Operating Cash Flow', data: la.ocf, isCr: true },
                  { label: 'Closing Cash Balance', data: la.closing_cash, isCr: true },
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                    <td style={{ fontSize: '7.5pt', padding: '4px 8px', fontWeight: 600 }}>{row.label}</td>
                    {years.map((y) => {
                      const v = row.data?.[y];
                      const neg = v != null && v < 0;
                      let display = '—';
                      if (v != null) {
                        if (row.isCr) {
                          const cr = Math.abs(v) / 10000000;
                          display = `${neg ? '-' : ''}INR ${cr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
                        } else {
                          display = `${Number(v).toFixed(2)}x`;
                        }
                      }
                      return <td key={y} style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px', fontFamily: 'monospace', color: neg ? '#ba1a1a' : '#1a1c20' }}>{display}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>OCF vs Closing Cash (Latest Year)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Cash & Bank Balance', value: latest.cash_and_bank_fmt, raw: latest.cash_and_bank, color: '#006a6a' },
                { label: 'Operating Cash Flow', value: latest.ocf_fmt, raw: latest.ocf, color: latest.ocf < 0 ? '#ba1a1a' : '#006a6a' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 6, padding: '10px 14px', border: `1px solid ${item.color}` }}>
                  <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: '12pt', fontWeight: 800, color: item.color }}>{fmt(item.value)}</div>
                </div>
              ))}
            </div>
          </div>

          {la.summary && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12, borderLeft: '3px solid #006a6a' }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Liquidity Assessment</div>
              <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.7 }}>{la.summary}</div>
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