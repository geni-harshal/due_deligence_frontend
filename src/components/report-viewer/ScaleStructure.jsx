import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

export default function ScaleStructure({ data,id, page, total = 26 }) {
  const ss = data?.scale_structure || {};
  const bs = ss.business_scale || {};
  const cap = ss.capital_structure || {};
  const chargesSummary = ss.charges_summary || {};
  const charges = ss.open_charges || [];

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 05</div>
            <div className="a4-header-title">Scale &amp; Structure</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Business Scale */}
          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Business Scale</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Revenue Range', value: bs.revenue_range },
                { label: 'Profit Range', value: bs.profit_range },
                { label: 'Employee Count', value: bs.employee_count },
                { label: 'Size Classification', value: bs.size_classification },
              ].map((item, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 6, padding: 10, border: '1px solid #e8eaf0' }}>
                  <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: '8.5pt', fontWeight: 700, color: '#002147' }}>{fmt(item.value)}</div>
                </div>
              ))}
            </div>
            {bs.csr_expenditure && (
              <div style={{ marginTop: 10, padding: '6px 10px', background: '#e8f5f0', borderRadius: 6, fontSize: '7.5pt', color: '#006a6a', fontWeight: 600 }}>
                CSR Expenditure: {fmt(bs.csr_expenditure)}
              </div>
            )}
            {bs.employee_benefit_expense && (
              <div style={{ marginTop: 5, fontSize: '7pt', color: '#73777f' }}>
                Employee Benefit Expense: {fmt(bs.employee_benefit_expense)}
              </div>
            )}
          </div>

          {/* Capital Structure */}
          {cap.authorized_capital && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Capital Structure</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#fff', borderRadius: 6, padding: 10, border: '1px solid #e8eaf0' }}>
                  <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Authorized Capital</div>
                  <div style={{ fontSize: '11pt', fontWeight: 800, color: '#002147' }}>{fmt(cap.authorized_capital)}</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 6, padding: 10, border: '1px solid #e8eaf0' }}>
                  <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Paid-up Capital</div>
                  <div style={{ fontSize: '11pt', fontWeight: 800, color: '#002147' }}>{fmt(cap.paid_up_capital)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Charges Summary */}
          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Open Charges &amp; Encumbrances</div>
              <div style={{ background: chargesSummary.open_charges_count > 0 ? '#ba1a1a' : '#006a6a', color: '#fff', borderRadius: 12, padding: '3px 10px', fontSize: '7pt', fontWeight: 700 }}>
                {fmt(chargesSummary.open_charges_count)} Open Charges | {fmt(chargesSummary.total_charge_amount || chargesSummary.total_charge_fmt)}
              </div>
            </div>
            {charges.length > 0 ? (
              <table className="a4-table">
                <thead>
                  <tr>
                    <th>Charge ID</th>
                    <th>Holder</th>
                    <th className="text-right">Amount</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Interest</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.slice(0, 10).map((c, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ fontFamily: 'monospace', fontSize: '7pt', padding: '3px 8px', color: '#73777f' }}>{fmt(c.charge_id)}</td>
                      <td style={{ fontSize: '7.5pt', padding: '3px 8px', fontWeight: 600 }}>{fmt(c.holder)}</td>
                      <td style={{ textAlign: 'right', fontSize: '7.5pt', padding: '3px 8px', fontWeight: 700, color: '#002147' }}>{fmt(c.amount_fmt || c.amount)}</td>
                      <td style={{ fontSize: '7pt', padding: '3px 8px', color: '#73777f' }}>{fmt(c.type)}</td>
                      <td style={{ fontSize: '7pt', padding: '3px 8px', color: '#73777f' }}>{fmt(c.date)}</td>
                      <td style={{ fontSize: '7pt', padding: '3px 8px', color: '#43474e' }}>{fmt(c.rate_of_interest)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontSize: '8pt', color: '#73777f' }}>No open charges on record</div>
            )}
            {charges.length > 10 && <div style={{ fontSize: '7pt', color: '#73777f', marginTop: 6 }}>+{charges.length - 10} more charges</div>}
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