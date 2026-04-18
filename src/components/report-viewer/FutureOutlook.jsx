import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

const STATUS_COLOR = {
  Positive: '#006a6a', Mixed: '#f9a825', Negative: '#ba1a1a', Neutral: '#73777f',
};

export default function FutureOutlook({ data, page,id, total = 26 }) {
  const fo = data?.future_outlook || {};
  const indicators = fo.indicators || [];
  const watchPoints = fo.watch_points || [];
  const triggers = fo.decision_triggers || [];

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 23</div>
            <div className="a4-header-title">Future Outlook</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#002147', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '6.5pt', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Overall Outlook Rating</div>
              <div style={{ fontSize: '18pt', fontWeight: 900, color: '#93f2f2' }}>{fmt(fo.outlook_rating)}</div>
            </div>
            <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.75)', maxWidth: '55%', lineHeight: 1.6 }}>{fmt(fo.summary)}</div>
          </div>

          {indicators.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Forward-Looking Indicators</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {indicators.map((ind, i) => {
                  const sc = STATUS_COLOR[ind.status] || '#73777f';
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 80px 1fr', gap: 10, alignItems: 'center', padding: '6px 10px', background: '#fff', borderRadius: 6, border: '1px solid #e8eaf0' }}>
                      <span style={{ fontSize: '7.5pt', fontWeight: 700, color: '#1a1c20' }}>{fmt(ind.label)}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 10, background: sc, color: '#fff', fontSize: '6.5pt', fontWeight: 700, textAlign: 'center' }}>{fmt(ind.status)}</span>
                      <span style={{ fontSize: '7.5pt', color: '#43474e' }}>{fmt(ind.note)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {watchPoints.length > 0 && (
              <div style={{ background: '#fffde7', border: '1px solid #f9a825', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '7pt', fontWeight: 700, color: '#e65100', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Watch Points</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {watchPoints.map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, fontSize: '7.5pt', color: '#43474e', paddingBottom: 5, borderBottom: i < watchPoints.length - 1 ? '1px solid #f9e08a' : 'none' }}>
                      <span style={{ color: '#f9a825', fontWeight: 700, flexShrink: 0 }}>◀</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {triggers.length > 0 && (
              <div style={{ background: '#eaf7f0', border: '1px solid #006a6a', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '7pt', fontWeight: 700, color: '#006a6a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Decision Triggers (Review)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {triggers.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, fontSize: '7.5pt', color: '#43474e', paddingBottom: 5, borderBottom: i < triggers.length - 1 ? '1px solid #a8d5c2' : 'none' }}>
                      <span style={{ color: '#006a6a', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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