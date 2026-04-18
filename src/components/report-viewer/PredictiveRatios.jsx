import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

export default function PredictiveRatios({ data, page, total = 26,id }) {
  const fr = data?.financial_ratios || {};
  const years = fr.years || [];
  const latest = fr.latest || {};

  const RatioSection = ({ title, rows }) => (
    <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12, marginBottom: 10 }}>
      <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{title}</div>
      <table className="a4-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Ratio</th>
            {years.map((y) => <th key={y} className="text-right">{y}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
              <td style={{ fontSize: '7.5pt', padding: '4px 8px', fontWeight: 600 }}>{row.label}</td>
              {years.map((y) => {
                const v = row.data?.[y];
                return (
                  <td key={y} style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px', fontFamily: 'monospace' }}>
                    {v != null ? `${Number(v).toFixed(2)}${row.suffix || ''}` : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="a4-page" id={id} style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 15</div>
            <div className="a4-header-title">Financial Ratios</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
            {[
              { label: 'Net Margin', value: latest.net_margin_fmt },
              { label: 'EBITDA Margin', value: latest.ebitda_margin_fmt },
              { label: 'ROE', value: latest.roe_fmt },
              { label: 'ROCE', value: latest.roce_fmt },
              { label: 'Debt / Equity', value: latest.debt_by_equity_fmt },
              { label: 'Interest Coverage', value: latest.interest_coverage_fmt },
              { label: 'Current Ratio', value: latest.current_ratio_fmt },
              { label: 'Quick Ratio', value: latest.quick_ratio_fmt },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f8f9fc', borderRadius: 6, padding: '8px 10px', border: '1px solid #e8eaf0', textAlign: 'center' }}>
                <div style={{ fontSize: '6pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: '10pt', fontWeight: 800, color: '#002147' }}>{fmt(item.value)}</div>
              </div>
            ))}
          </div>

          <RatioSection title="Profitability" rows={[
            { label: 'Net Margin (%)', data: fr.profitability?.net_margin || {}, suffix: '%' },
            { label: 'EBITDA Margin (%)', data: fr.profitability?.ebitda_margin || {}, suffix: '%' },
            { label: 'Return on Equity (ROE %)', data: fr.profitability?.return_on_equity || {}, suffix: '%' },
            { label: 'ROCE (%)', data: fr.profitability?.return_on_capital_employed || {}, suffix: '%' },
          ]} />

          <RatioSection title="Leverage" rows={[
            { label: 'Debt Ratio', data: fr.leverage?.debt_ratio || {}, suffix: 'x' },
            { label: 'Debt / Equity', data: fr.leverage?.debt_by_equity || {}, suffix: 'x' },
            { label: 'Interest Coverage Ratio', data: fr.leverage?.interest_coverage || {}, suffix: 'x' },
          ]} />

          <RatioSection title="Liquidity" rows={[
            { label: 'Current Ratio', data: fr.liquidity?.current_ratio || {}, suffix: 'x' },
            { label: 'Quick Ratio', data: fr.liquidity?.quick_ratio || {}, suffix: 'x' },
          ]} />

          <RatioSection title="Efficiency" rows={[
            { label: 'Inventory Days', data: fr.efficiency?.inventory_days || {}, suffix: ' days' },
            { label: 'Debtor Days', data: fr.efficiency?.debtor_days || {}, suffix: ' days' },
            { label: 'Payable Days', data: fr.efficiency?.payable_days || {}, suffix: ' days' },
            { label: 'Cash Conversion Cycle', data: fr.efficiency?.cash_conversion_cycle || {}, suffix: ' days' },
            { label: 'Revenue Growth (%)', data: fr.efficiency?.revenue_growth || {}, suffix: '%' },
          ]} />

          {fr.sys_ratios_summary && (
            <div style={{ background: 'linear-gradient(135deg, #002147, #003d6b)', borderRadius: 8, padding: 14, marginTop: 4 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System Intelligence — Ratio Analysis</div>
              <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{fr.sys_ratios_summary}</div>
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