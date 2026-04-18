import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

export default function CoverPage({ data, total = 26, onNavigate }) {
  const meta = data?._meta || {};
  const eo   = data?.entity_overview || {};

  const reportDate = meta.generated_at
    ? new Date(meta.generated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const tocItems = [
    { num: '03', title: 'Entity Overview & Statutory Profile' },
    { num: '04', title: 'Operational Profile' },
    { num: '05', title: 'Scale & Structure' },
    { num: '06', title: 'Executive Risk Dashboard' },
    { num: '07', title: 'Risk Composition & Heatmap' },
    { num: '08', title: 'Management & Governance' },
    { num: '09', title: 'Ownership Structure' },
    { num: '10', title: 'Legal Exposure & Credit Ratings' },
    { num: '11', title: 'Compliance & Behavioral Risk' },
    { num: '12', title: 'Financial Statements — P&L' },
    { num: '13', title: 'Financial Statements — Balance Sheet' },
    { num: '14', title: 'Financial Statements — Cash Flow' },
    { num: '15', title: 'Financial Ratios' },
    { num: '16', title: 'Performance Trends' },
    { num: '17', title: 'Working Capital Analysis' },
    { num: '18', title: 'Liquidity Analysis' },
    { num: '19', title: 'Risk Interpretation' },
    { num: '20', title: 'Credit Recommendation' },
    { num: '21', title: 'Risk Factors' },
    { num: '22', title: 'Strengths' },
    { num: '23', title: 'Future Outlook' },
    { num: '24', title: 'Methodology' },
    { num: '25', title: 'Disclaimer' },
    { num: '26', title: 'Final Conclusion' },
  ];

  const handleTocClick = (pageNum) => {
    if (onNavigate) {
      onNavigate(pageNum);
    }
  };

  return (
    <>
      {/* PAGE 1 — COVER */}
      <div className="a4-page" style={{ background: '#002147', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #002147 0%, #003d6b 50%, #006a6a 100%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(0,106,106,0.3)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: 60, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '16mm 18mm', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <img src="/geniwhite.svg" alt="Geni Logo" style={{ height: 28, width: 'auto', display: 'block' }} />
              <div style={{ color: '#93f2f2', fontWeight: 700, fontSize: '7pt', letterSpacing: '0.2em', textTransform: 'uppercase' }}>INTELLIGENCE</div>
            </div>
            <div style={{ background: '#ba1a1a', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '7pt', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {fmt(meta.confidentiality, 'STRICTLY CONFIDENTIAL')}
            </div>
          </div>

          {/* Main title */}
          <div>
            <div style={{ color: '#93f2f2', fontSize: '7.5pt', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
              ▸ {fmt(meta.report_type, 'CREDIT DECISION INTELLIGENCE REPORT')}
            </div>
            <div style={{ color: '#fff', fontSize: '36pt', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>Business Intelligence</div>
            <div style={{ color: '#fff', fontSize: '36pt', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>&amp; Risk Assessment</div>
            <div style={{ color: '#93f2f2', fontSize: '36pt', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>Report</div>
          </div>

          {/* Entity info row */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '6.5pt', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Subject Entity</div>
              <div style={{ color: '#fff', fontSize: '11pt', fontWeight: 700, lineHeight: 1.2 }}>{fmt(eo.legal_name || meta.entity_name)}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '6.5pt', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>CIN / Identifier</div>
              <div style={{ color: '#fff', fontSize: '10pt', fontWeight: 700, letterSpacing: '0.05em' }}>{fmt(eo.cin || meta.entity_cin)}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '6.5pt', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Report Date</div>
              <div style={{ color: '#fff', fontSize: '10pt', fontWeight: 700 }}>{reportDate}</div>
            </div>
          </div>

          {/* Report ID + platform row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8, color: 'rgba(255,255,255,0.4)', fontSize: '6pt', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span>© {new Date().getFullYear()} Geni Intelligence</span>
            <span>Report ID: {fmt(meta.report_id)}  |  Page 01 of {total}</span>
          </div>
        </div>
      </div>

      {/* PAGE 2 — TABLE OF CONTENTS */}
      <div className="a4-page" style={{ background: '#fff' }}>
        <div className="a4-page-inner">
          <div className="a4-header print-hide">
            <div>
              <div className="a4-section-label">Index</div>
              <div className="a4-header-title">Table of Contents</div>
            </div>
            <div className="a4-header-meta">Report ID: {fmt(meta.report_id)}</div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
            {tocItems.map((item, i) => (
              <div
                key={i}
                onClick={() => handleTocClick(item.num)}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: i < tocItems.length - 1 ? '1px solid #f1f3f7' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flex: 1 }}>
                  <span style={{ fontSize: '10pt', fontWeight: 600, color: '#002147' }}>{item.title}</span>
                  <div style={{ flex: 1, borderBottom: '1px dotted #c3c6cf', marginBottom: 3, marginLeft: 8 }} />
                </div>
                <span style={{ fontSize: '9pt', fontWeight: 800, color: '#006a6a', marginLeft: 12 }}>Page {item.num}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#f1f3f7', borderRadius: 6, padding: '10px 14px', marginTop: 10 }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Information Integrity Notice</div>
            <div style={{ fontSize: '7pt', color: '#43474e', lineHeight: 1.6 }}>
              {meta.data_source || 'Multi-source data aggregation — regulatory filings, credit bureau, alternative data.'}
            </div>
          </div>

          <div className="a4-footer">
            <span>© {new Date().getFullYear()} Geni Intelligence — Proprietary</span>
            <span>Page 02 of {total}</span>
          </div>
        </div>
      </div>
    </>
  );
}