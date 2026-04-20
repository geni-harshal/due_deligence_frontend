import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

const ratingBg = (r) => {
  const g = (r || '').toUpperCase();
  if (g.includes('AAA') || g.includes('AA+') || g.includes('AA')) return '#006a6a';
  if (g.includes('A1+') || g.includes('A1') || g.includes('A-')) return '#002147';
  if (g.includes('BB') || g.includes('B+') || g.includes('B')) return '#e65100';
  return '#ba1a1a';
};

export default function Charges({ data, page, total = 26 ,id }) {
  const le = data?.legal_exposure || {};
  const charges = le.charges || [];
  const disputes = le.legal_disputes || [];
  const hist = le.legal_history_summary || {};
  const distress = le.distress_flags || le || {}; // fallback
  const ratings = le.full_credit_ratings || [];

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 10</div>
            <div className="a4-header-title">Legal Exposure &amp; Credit Ratings</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Distress Flags */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'BIFR Cases', value: distress.bifr_cases?.length ?? 0 },
              { label: 'CDR Cases', value: distress.cdr_cases?.length ?? 0 },
              { label: 'Defaulter List', value: distress.defaulter_list?.length ?? 0 },
              { label: 'Bureau Defaults', value: distress.bureau_defaults ? 'YES' : 'NO' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f8f9fc', borderRadius: 8, padding: 10, border: '1px solid #e8eaf0', textAlign: 'center' }}>
                <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '13pt', fontWeight: 900, color: (item.value !== 0 && item.value !== 'NO') ? '#ba1a1a' : '#006a6a' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Legal History Summary */}
          {Object.keys(hist).length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Legal History Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {[
                  { label: 'Total Cases', value: hist.total_cases, color: '#002147' },
                  { label: 'Pending', value: hist.pending, color: '#e65100' },
                  { label: 'Disposed', value: hist.disposed, color: '#006a6a' },
                  { label: 'High Severity', value: hist.high_severity, color: '#ba1a1a' },
                  { label: 'Medium Severity', value: hist.medium_severity, color: '#f9a825' },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 6, padding: '8px 10px', border: '1px solid #e8eaf0', textAlign: 'center' }}>
                    <div style={{ fontSize: '6pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: '12pt', fontWeight: 800, color: item.color }}>{fmt(item.value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open Charges */}
          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Open Charges / Encumbrances</div>
              <span style={{ fontSize: '7pt', fontWeight: 700, color: '#ba1a1a' }}>Total: {fmt(le.total_charge_fmt)}</span>
            </div>
            {charges.length > 0 ? (
              <table className="a4-table">
                <thead>
                  <tr><th>Charge ID</th><th>Holder</th><th className="text-right">Amount</th><th>Status</th><th>Date</th><th>Interest</th></tr>
                </thead>
                <tbody>
                  {charges.slice(0, 10).map((c, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ fontFamily: 'monospace', fontSize: '7pt', padding: '3px 8px', color: '#73777f' }}>{fmt(c.charge_id)}</td>
                      <td style={{ fontSize: '7.5pt', padding: '3px 8px', fontWeight: 600 }}>{fmt(c.holder)}</td>
                      <td style={{ textAlign: 'right', fontSize: '7.5pt', padding: '3px 8px', fontWeight: 700 }}>{fmt(c.amount_fmt)}</td>
                      <td style={{ fontSize: '7pt', padding: '3px 8px', color: '#73777f' }}>{fmt(c.status)}</td>
                      <td style={{ fontSize: '7pt', padding: '3px 8px', color: '#73777f' }}>{fmt(c.date_created)}</td>
                      <td style={{ fontSize: '7pt', padding: '3px 8px' }}>{fmt(c.rate_of_interest)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div style={{ fontSize: '8pt', color: '#73777f' }}>No open charges on record</div>}
            {charges.length > 10 && <div style={{ fontSize: '7pt', color: '#73777f', marginTop: 6 }}>+{charges.length - 10} more charges</div>}
          </div>

          {/* Active Legal Disputes */}
          {disputes.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Active Legal Disputes</div>
              {disputes.map((d, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 6, padding: '8px 12px', marginBottom: 6, border: '1px solid #e8eaf0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '7.5pt', fontWeight: 700, color: '#002147' }}>{fmt(d.case_title)}</span>
                    <span style={{ fontSize: '7pt', color: '#ba1a1a', fontWeight: 600 }}>{fmt(d.status)}</span>
                  </div>
                  <div style={{ fontSize: '7pt', color: '#73777f', marginTop: 2 }}>{fmt(d.court)}  |  {fmt(d.case_no)}  |  {fmt(d.amount_fmt)}</div>
                </div>
              ))}
            </div>
          )}

          {/* External Credit Ratings */}
          {ratings.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>External Credit Ratings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ratings.slice(0, 10).map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto auto auto', gap: 8, alignItems: 'center', padding: '5px 8px', background: '#fff', borderRadius: 6, border: '1px solid #e8eaf0', fontSize: '7.5pt' }}>
                    <span style={{ fontWeight: 700, color: '#002147', textTransform: 'uppercase' }}>{(r.agency || '').substring(0, 6)}</span>
                    <span style={{ color: '#43474e', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{fmt(r.type_of_loan || r.type)}</span>
                    <span style={{ color: '#73777f', whiteSpace: 'nowrap' }}>{fmt(r.amount_fmt || r.amount)}</span>
                    <span style={{ color: '#73777f', whiteSpace: 'nowrap', fontSize: '7pt' }}>{fmt(r.outlook || r.rating_details?.[0]?.outlook)}</span>
                    <span style={{ background: ratingBg(r.rating), color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 700, fontSize: '6.5pt', whiteSpace: 'nowrap' }}>
                      {fmt(r.rating)}
                    </span>
                  </div>
                ))}
              </div>
              {ratings.length > 10 && <div style={{ fontSize: '7pt', color: '#73777f', marginTop: 6 }}>+{ratings.length - 10} more ratings</div>}
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