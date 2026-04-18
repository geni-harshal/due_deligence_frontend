import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

export default function OperationalProfile({ data, page, total = 26 ,id}) {
  const op = data?.operational_profile || {};
  const contact = op.contact || {};
  const pba = op.principal_business_activity || {};
  const gst = op.gst_registrations || {};
  const gstList = gst.list || [];

  const statusColor = (s) => s === 'Active' ? '#006a6a' : '#ba1a1a';

  // Extract primary email/phone from arrays
  const primaryEmail = contact.all_emails?.[0]?.emailId || contact.primary_email;
  const primaryPhone = contact.all_phones?.[0]?.phoneNumber || contact.primary_phone;
  const emailCount = (contact.all_emails?.length || 0) - 1;
  const phoneCount = (contact.all_phones?.length || 0) - 1;

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 04</div>
            <div className="a4-header-title">Operational Profile</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Contact & Address */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Registered Address</div>
              <div style={{ fontSize: '8pt', color: '#1a1c20', lineHeight: 1.7 }}>{fmt(op.registered_address?.full || op.registered_address?.full_address)}</div>
              <div style={{ marginTop: 10, fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Business Address</div>
              <div style={{ fontSize: '8pt', color: '#1a1c20', lineHeight: 1.7 }}>{fmt(op.business_address?.full || op.business_address?.full_address)}</div>
            </div>
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Contact Information</div>
              <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.9 }}>
                <div>🌐 <a href={fmt(contact.website)} style={{ color: '#006a6a' }}>{fmt(contact.website)}</a></div>
                {primaryEmail && <div>📧 {primaryEmail}</div>}
                {emailCount > 0 && <div style={{ fontSize: '6.5pt', color: '#73777f', marginLeft: 20 }}>+{emailCount} more email(s)</div>}
                {primaryPhone && <div>📞 {primaryPhone}</div>}
                {phoneCount > 0 && <div style={{ fontSize: '6.5pt', color: '#73777f', marginLeft: 20 }}>+{phoneCount} more phone(s)</div>}
              </div>
            </div>
          </div>

          {/* Principal Business Activity */}
          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Principal Business Activity</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>NIC Code</div>
                <div style={{ fontSize: '9pt', fontWeight: 700, color: '#002147' }}>{fmt(pba.code)}</div>
              </div>
              <div>
                <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Description</div>
                <div style={{ fontSize: '8pt', fontWeight: 600, color: '#1a1c20' }}>{fmt(pba.description)}</div>
              </div>
              <div>
                <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Turnover Contribution</div>
                <div style={{ fontSize: '9pt', fontWeight: 700, color: '#006a6a' }}>{pba.turnover_percentage != null ? `${pba.turnover_percentage}%` : '—'}</div>
              </div>
            </div>
          </div>

          {/* GST Summary */}
          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em' }}>GST Registrations</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: '7pt', fontWeight: 700, color: '#006a6a' }}>✓ Active: {fmt(gst.active)}</span>
                <span style={{ fontSize: '7pt', fontWeight: 700, color: '#ba1a1a' }}>✗ Cancelled: {fmt(gst.cancelled)}</span>
                <span style={{ fontSize: '7pt', fontWeight: 700, color: '#002147' }}>Total: {fmt(gst.total)}</span>
              </div>
            </div>
            {gstList.length > 0 ? (
              <table className="a4-table">
                <thead>
                  <tr><th>GSTIN</th><th>State</th><th>Status</th><th>Registration Date</th></tr>
                </thead>
                <tbody>
                  {gstList.slice(0, 10).map((g, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ fontFamily: 'monospace', fontSize: '7pt', padding: '3px 8px' }}>{fmt(g.gstin)}</td>
                      <td style={{ fontSize: '7.5pt', padding: '3px 8px' }}>{fmt(g.state)}</td>
                      <td style={{ padding: '3px 8px' }}>
                        <span style={{ color: statusColor(g.status), fontWeight: 700, fontSize: '7pt' }}>{fmt(g.status)}</span>
                      </td>
                      <td style={{ fontSize: '7.5pt', padding: '3px 8px', color: '#73777f' }}>
                        {fmt(g.reg_date || g.registration_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontSize: '8pt', color: '#73777f' }}>No GST registration data available</div>
            )}
            {gstList.length > 10 && <div style={{ fontSize: '7pt', color: '#73777f', marginTop: 6 }}>+{gstList.length - 10} more registrations</div>}
          </div>

          {/* EPFO */}
          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>EPFO Establishments</div>
            <div style={{ fontSize: '9pt', fontWeight: 700, color: op.epfo_establishments > 0 ? '#006a6a' : '#73777f' }}>
              {op.epfo_establishments != null ? op.epfo_establishments : '—'} establishment(s) registered
            </div>
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