import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

export default function IdentificationSummary({ data, page, total = 26, id }) {
  const eo      = data?.entity_overview || {};
  const addr    = eo.registered_address || {};
  const history = eo.name_history || [];
  const lei     = eo.lei || {};

  const Row = ({ label, value }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, padding: '5px 0', borderBottom: '1px solid #f1f3f7' }}>
      <span style={{ fontSize: '7.5pt', fontWeight: 700, color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: '8pt', color: '#1a1c20', fontWeight: 500 }}>{fmt(value)}</span>
    </div>
  );

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 03</div>
            <div className="a4-header-title">Entity Overview &amp; Statutory Profile</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Primary Info */}
          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Registered Entity Details</div>
            <Row label="Legal Name" value={eo.legal_name} />
            <Row label="CIN" value={eo.cin} />
            <Row label="PAN" value={eo.pan} />
            <Row label="Status" value={eo.status} />
            <Row label="Company Type" value={eo.company_type} />
            <Row label="Incorporation Date" value={eo.incorporation_date} />
            <Row label="Age" value={eo.age} />
            <Row label="Industry" value={eo.industry} />
            <Row label="Industry Segment" value={eo.industry_segment} />
          </div>

          {/* LEI Information */}
          {lei.number && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Legal Entity Identifier (LEI)</div>
              <Row label="LEI Number" value={lei.number} />
              <Row label="LEI Status" value={lei.status} />
              <Row label="Registration Date" value={lei.registration_date} />
            </div>
          )}

          {/* Capital & Filing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Capital &amp; Filings</div>
              <Row label="Authorised Capital" value={eo.authorised_capital_fmt} />
              <Row label="Paid-up Capital" value={eo.paid_up_capital_fmt} />
              <Row label="ROC" value={eo.roc} />
              <Row label="Last AGM Date" value={eo.last_agm_date} />
              <Row label="Last ROC Filing" value={eo.last_roc_filing} />
              <Row label="CIRP Status" value={eo.cirp_status} />
            </div>
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Registered Address</div>
              <div style={{ fontSize: '8pt', color: '#1a1c20', lineHeight: 1.8 }}>
                {typeof addr === 'string'
                  ? addr
                  : <>{fmt(addr.full_address)}<br/>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.pincode || ''}</>}
              </div>
              <div style={{ marginTop: 8, fontSize: '7.5pt', color: '#43474e', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {eo.email    && <div>📧 {eo.email}</div>}
                {eo.phone    && <div>📞 {eo.phone}</div>}
                {eo.website  && <div>🌐 {eo.website}</div>}
              </div>
            </div>
          </div>

          {/* Name History */}
          {history.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Previous Names</div>
              {history.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e8eaf0', fontSize: '7.5pt' }}>
                  <span style={{ color: '#1a1c20', fontWeight: 500 }}>{fmt(h.name)}</span>
                  <span style={{ color: '#73777f' }}>{fmt(h.date || h.effective_date)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Full Business Description */}
          {eo.full_business_description && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Business Description</div>
              <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.7 }}>{eo.full_business_description}</div>
            </div>
          )}

          {/* AI Narrative */}
          {eo.sys_identification_summary && (
            <div style={{ background: 'linear-gradient(135deg, #002147, #003d6b)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System Intelligence — Entity Profile</div>
              <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{eo.sys_identification_summary}</div>
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