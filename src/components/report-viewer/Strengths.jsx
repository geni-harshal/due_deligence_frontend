import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

export default function Strengths({ data, page, total = 26 ,id}) {
  const st = data?.strengths || {};
  const items = st.items || [];

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 22</div>
            <div className="a4-header-title">Strengths</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {items.map((item, i) => {
                let factor = item;
                let detail = '';
                if (typeof item === 'string') {
                  const parts = item.split(':');
                  factor = parts[0];
                  detail = parts.slice(1).join(':').trim();
                } else {
                  factor = item.factor;
                  detail = item.detail;
                }
                return (
                  <div key={i} style={{ background: '#eaf7f0', borderRadius: 8, padding: 14, border: '1px solid #a8d5c2', borderLeft: '4px solid #006a6a', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#006a6a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ color: '#fff', fontSize: '9pt', fontWeight: 900 }}>{i + 1}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '8pt', fontWeight: 800, color: '#002147', marginBottom: 4 }}>{fmt(factor)}</div>
                      <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.6 }}>{fmt(detail)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 24, color: '#73777f', fontSize: '9pt' }}>No strength data available</div>
          )}

          {st.summary && (
            <div style={{ background: 'linear-gradient(135deg, #006a6a, #004d4d)', borderRadius: 8, padding: 14, marginTop: 4 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Strengths Summary</div>
              <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.9)', lineHeight: 1.7 }}>{st.summary}</div>
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