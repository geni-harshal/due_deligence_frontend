import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

export default function Disclaimer({ data,id, page, total = 26 }) {
  const d = data?.disclaimer || {};

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 25</div>
            <div className="a4-header-title">Disclaimer</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#002147', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ba1a1a', flexShrink: 0 }} />
            <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {fmt(d.confidentiality, 'Strictly Confidential — For Internal Use Only')}
            </div>
          </div>

          <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 20, flex: 1, border: '1px solid #e8eaf0' }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, borderBottom: '1px solid #e8eaf0', paddingBottom: 8 }}>
              Important Legal Disclaimer
            </div>
            <div style={{ fontSize: '8pt', color: '#43474e', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
              {fmt(d.text, 'Disclaimer text not available.')}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Report Date', value: d.report_date },
              { label: 'Report ID', value: d.report_id },
              { label: 'Prepared By', value: d.prepared_by },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f8f9fc', borderRadius: 8, padding: '8px 12px', border: '1px solid #e8eaf0' }}>
                <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: '8pt', fontWeight: 700, color: '#002147' }}>{fmt(item.value)}</div>
              </div>
            ))}
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