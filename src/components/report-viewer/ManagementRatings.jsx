import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

export default function ManagementRatings({ data, page, total = 26 , id}) {
  const mp = data?.management_profile || {};
  const directors = (mp.directors || []).slice(0, 10);
  const kmp = mp.key_management_personnel || [];
  const gender = mp.gender_diversity || {};

  return (
    <div className="a4-page"  id={id} style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 08</div>
            <div className="a4-header-title">Management &amp; Governance</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Total Directors', value: mp.total_directors },
              { label: 'Active Directors', value: mp.active_directors },
              { label: 'Male', value: gender.male },
              { label: 'Female', value: gender.female },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f8f9fc', borderRadius: 8, padding: '10px 12px', border: '1px solid #e8eaf0', textAlign: 'center' }}>
                <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '16pt', fontWeight: 900, color: '#002147' }}>{fmt(item.value)}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Board of Directors / Designated Partners</div>
            <table className="a4-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>DIN</th>
                  <th className="text-right">Age</th>
                  <th>Appointment Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {directors.map((d, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                    <td style={{ fontWeight: 600, color: '#002147', fontSize: '7.5pt', padding: '3px 8px' }}>{fmt(d.name)}</td>
                    <td style={{ color: '#43474e', fontSize: '7.5pt', padding: '3px 8px' }}>{fmt(d.designation)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '7pt', color: '#73777f', padding: '3px 8px' }}>{fmt(d.din)}</td>
                    <td style={{ textAlign: 'right', fontSize: '7.5pt', padding: '3px 8px' }}>{fmt(d.age)}</td>
                    <td style={{ fontSize: '7pt', color: '#73777f', padding: '3px 8px' }}>{fmt(d.date_of_appointment)}</td>
                    <td style={{ padding: '3px 8px' }}>
                      <span style={{ fontSize: '6.5pt', fontWeight: 700, color: d.is_active ? '#006a6a' : '#ba1a1a' }}>{d.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {directors.length === 0 && <div style={{ textAlign: 'center', padding: 12, color: '#73777f', fontSize: '8pt' }}>No management data available</div>}
          </div>

          {kmp.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Key Management Personnel</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {kmp.map((k, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 6, padding: '8px 12px', border: '1px solid #e8eaf0', minWidth: 180 }}>
                    <div style={{ fontSize: '8pt', fontWeight: 700, color: '#002147' }}>{fmt(k.name)}</div>
                    <div style={{ fontSize: '7pt', color: '#73777f' }}>{fmt(k.designation)}</div>
                    {k.since && <div style={{ fontSize: '6.5pt', color: '#73777f', marginTop: 2 }}>Since: {k.since}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {mp.sys_management_summary && (
            <div style={{ background: 'linear-gradient(135deg, #002147, #003d6b)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Ownership &amp; Governance Synthesis</div>
              <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{mp.sys_management_summary}</div>
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