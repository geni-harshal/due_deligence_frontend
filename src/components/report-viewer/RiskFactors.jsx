import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

const LEVEL_COLOR = {
  Critical: { bg: '#ba1a1a', color: '#fff' },
  Severe:   { bg: '#c62828', color: '#fff' },
  High:     { bg: '#e65100', color: '#fff' },
  Medium:   { bg: '#f9a825', color: '#fff' },
  Low:      { bg: '#006a6a', color: '#fff' },
};

export default function RiskFactors({ data, page,id, total = 26 }) {
  const rf = data?.risk_factors || {};
  const items = rf.items || [];

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 21</div>
            <div className="a4-header-title">Risk Factors</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.length > 0 ? items.map((item, i) => {
            // If items are strings, parse them into title/description
            let title = item;
            let description = '';
            let level = 'Medium';
            let mitigation = '';
            if (typeof item === 'string') {
              const parts = item.split(':');
              title = parts[0];
              description = parts.slice(1).join(':').trim();
            } else {
              title = item.title || item.factor;
              description = item.description || item.detail;
              level = item.level || item.impact;
              mitigation = item.mitigation;
            }
            const lc = LEVEL_COLOR[level] || { bg: '#73777f', color: '#fff' };
            return (
              <div key={i} style={{ background: '#f8f9fc', borderRadius: 8, padding: 14, borderLeft: `4px solid ${lc.bg}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: lc.bg, color: lc.color, fontSize: '6.5pt', fontWeight: 700, padding: '2px 10px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{fmt(level)}</span>
                  <span style={{ fontSize: '8.5pt', fontWeight: 800, color: '#002147' }}>{fmt(title)}</span>
                </div>
                <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.7, marginBottom: 8 }}>{fmt(description)}</div>
                {mitigation && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, background: '#fff', borderRadius: 6, padding: '6px 10px', border: '1px solid #e8eaf0' }}>
                    <span style={{ color: '#006a6a', fontWeight: 700, fontSize: '8pt', marginTop: 1 }}>→</span>
                    <div>
                      <span style={{ fontSize: '6.5pt', fontWeight: 700, color: '#006a6a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mitigation: </span>
                      <span style={{ fontSize: '7.5pt', color: '#43474e' }}>{mitigation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: 24, color: '#73777f', fontSize: '9pt' }}>No risk factors identified</div>
          )}

          {rf.summary && (
            <div style={{ background: 'linear-gradient(135deg, #002147, #003d6b)', borderRadius: 8, padding: 14, marginTop: 4 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Risk Summary</div>
              <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{rf.summary}</div>
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