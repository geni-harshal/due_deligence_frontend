import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

const crFmt = (raw) => {
  if (raw == null) return '—';
  const cr = raw / 10000000;
  return `INR ${Math.abs(cr).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr${raw < 0 ? ' (-)' : ''}`;
};

const YearRow = ({ label, data, years }) => (
  <tr>
    <td style={{ fontSize: '7.5pt', padding: '4px 8px', fontWeight: 600, color: '#1a1c20' }}>{label}</td>
    {years.map((y) => {
      const v = data?.[y];
      const neg = v != null && v < 0;
      return (
        <td key={y} style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px', color: neg ? '#ba1a1a' : '#1a1c20', fontFamily: 'monospace' }}>
          {v != null ? crFmt(v) : '—'}
        </td>
      );
    })}
  </tr>
);

export default function FullFinancialStatements({ data,id, page, total = 26 }) {
  const fs = data?.financial_statements || {};
  const pl = fs.profit_loss || {};
  const bs = fs.balance_sheet || {};
  const cf = fs.cash_flow || {};
  const years = fs.years || [];
  const assets = bs.assets || {};
  const liabilities = bs.liabilities || {};
  const metaId = fmt(data?._meta?.report_id);

  return (
    <>
      {/* PAGE 12 — P&L */}
      <div className="a4-page" id={id}  style={{ background: '#fff' }}>
        <div className="a4-page-inner">
          <div className="a4-header">
            <div>
              <div className="a4-section-label">Section 12</div>
              <div className="a4-header-title">Financial Statements — Profit &amp; Loss</div>
            </div>
            <div className="a4-header-meta">Report ID: {metaId}</div>
          </div>
          <div style={{ flex: 1 }}>
            <table className="a4-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Particulars</th>
                  {years.map((y) => <th key={y} className="text-right">{y}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: '#f1f3f7' }}>
                  <td colSpan={years.length + 1} style={{ fontSize: '7pt', fontWeight: 800, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 8px' }}>Revenue</td>
                </tr>
                <YearRow label="Net Revenue / Net Sales" data={pl.net_revenue} years={years} />
                <YearRow label="Other Income" data={pl.other_income} years={years} />
                <YearRow label="Total Income" data={pl.total_income} years={years} />
                <tr style={{ background: '#f1f3f7' }}>
                  <td colSpan={years.length + 1} style={{ fontSize: '7pt', fontWeight: 800, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 8px' }}>Profitability</td>
                </tr>
                <YearRow label="EBITDA" data={pl.ebitda} years={years} />
                <YearRow label="Depreciation" data={pl.depreciation} years={years} />
                <YearRow label="Interest / Finance Costs" data={pl.interest} years={years} />
                <YearRow label="Profit Before Tax" data={pl.profit_before_tax} years={years} />
                <YearRow label="Income Tax" data={pl.income_tax} years={years} />
                <YearRow label="Profit After Tax (PAT)" data={pl.profit_after_tax} years={years} />
              </tbody>
            </table>
            {fs.sys_financial_summary && (
              <div style={{ marginTop: 12, background: 'linear-gradient(135deg, #002147, #003d6b)', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: '7pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System Intelligence — Financial Overview</div>
                <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{fs.sys_financial_summary}</div>
              </div>
            )}
          </div>
          <div className="a4-footer">
            <span>Geni Intelligence — Confidential</span>
            <span>{`Page ${String(page || 0).padStart(2, '0')} of ${total}`}</span>
          </div>
        </div>
      </div>

      {/* PAGE 13 — Balance Sheet */}
      <div className="a4-page" style={{ background: '#fff' }}>
        <div className="a4-page-inner">
          <div className="a4-header">
            <div>
              <div className="a4-section-label">Section 13</div>
              <div className="a4-header-title">Financial Statements — Balance Sheet</div>
            </div>
            <div className="a4-header-meta">Report ID: {metaId}</div>
          </div>
          <div style={{ flex: 1 }}>
            <table className="a4-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Particulars</th>
                  {years.map((y) => <th key={y} className="text-right">{y}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: '#f1f3f7' }}>
                  <td colSpan={years.length + 1} style={{ fontSize: '7pt', fontWeight: 800, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 8px' }}>Assets</td>
                </tr>
                <YearRow label="Net Fixed Assets" data={assets.net_fixed_assets} years={years} />
                <YearRow label="Non-current Investments" data={assets.noncurrent_investments} years={years} />
                <YearRow label="Inventories" data={assets.inventories} years={years} />
                <YearRow label="Trade Receivables" data={assets.trade_receivables} years={years} />
                <YearRow label="Cash &amp; Bank Balances" data={assets.cash_and_bank} years={years} />
                <YearRow label="Total Current Assets" data={assets.total_current_assets} years={years} />
                <YearRow label="Total Assets" data={assets.total_assets} years={years} />
                <tr style={{ background: '#f1f3f7' }}>
                  <td colSpan={years.length + 1} style={{ fontSize: '7pt', fontWeight: 800, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 8px' }}>Liabilities &amp; Equity</td>
                </tr>
                <YearRow label="Share Capital" data={liabilities.share_capital} years={years} />
                <YearRow label="Reserves &amp; Surplus" data={liabilities.reserves_surplus} years={years} />
                <YearRow label="Total Equity" data={liabilities.total_equity} years={years} />
                <YearRow label="Long-term Borrowings" data={liabilities.lt_borrowings} years={years} />
                <YearRow label="Short-term Borrowings" data={liabilities.st_borrowings} years={years} />
                <YearRow label="Trade Payables" data={liabilities.trade_payables} years={years} />
                <YearRow label="Total Current Liabilities" data={liabilities.total_current_liab || liabilities.total_current_liabilities} years={years} />
                <YearRow label="Total Debt" data={liabilities.total_debt} years={years} />
              </tbody>
            </table>
          </div>
          <div className="a4-footer">
            <span>Geni Intelligence — Confidential</span>
            <span>{`Page ${String((page || 0) + 1).padStart(2, '0')} of ${total}`}</span>
          </div>
        </div>
      </div>

      {/* PAGE 14 — Cash Flow */}
      <div className="a4-page" style={{ background: '#fff' }}>
        <div className="a4-page-inner">
          <div className="a4-header">
            <div>
              <div className="a4-section-label">Section 14</div>
              <div className="a4-header-title">Financial Statements — Cash Flow</div>
            </div>
            <div className="a4-header-meta">Report ID: {metaId}</div>
          </div>
          <div style={{ flex: 1 }}>
            <table className="a4-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Particulars</th>
                  {years.map((y) => <th key={y} className="text-right">{y}</th>)}
                </tr>
              </thead>
              <tbody>
                <YearRow label="Cash Flow from Operations (OCF)" data={cf.operating} years={years} />
                <YearRow label="Cash Flow from Investing (ICF)" data={cf.investing} years={years} />
                <YearRow label="Cash Flow from Financing (FCF)" data={cf.financing} years={years} />
                <YearRow label="Net Change in Cash" data={cf.net_change} years={years} />
                <YearRow label="Closing Cash Balance" data={cf.closing_cash} years={years} />
              </tbody>
            </table>

            {cf.ocf_analysis && (
              <div style={{ marginTop: 12, background: cf.ocf_analysis.is_negative ? '#ffeef0' : '#eaf7f0', border: `1px solid ${cf.ocf_analysis.is_negative ? '#ba1a1a' : '#006a6a'}`, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '7pt', fontWeight: 700, color: cf.ocf_analysis.is_negative ? '#ba1a1a' : '#006a6a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                  OCF Analysis — {cf.ocf_analysis.is_negative ? '⚠ Negative Operating Cash Flow Detected' : '✓ Positive Operating Cash Flow'}
                </div>
                {cf.ocf_analysis.is_negative && (
                  <div style={{ fontSize: '7.5pt', color: '#ba1a1a' }}>
                    Negative OCF of {crFmt(cf.ocf_analysis.latest_ocf)} triggers credit constraints. Internal cash generation is insufficient.
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="a4-footer">
            <span>Geni Intelligence — Confidential</span>
            <span>{`Page ${String((page || 0) + 2).padStart(2, '0')} of ${total}`}</span>
          </div>
        </div>
      </div>
    </>
  );
}