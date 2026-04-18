import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

const HEATMAP_COLOR = {
  'Low Risk': '#006a6a', 'Minimal Risk': '#006a6a',
  'Moderate Risk': '#f9a825', 'Mixed Risk': '#f9a825',
  'High Risk': '#e65100', 'Elevated Risk': '#e65100',
  'Severe Risk': '#ba1a1a', 'Critical': '#ba1a1a',
};

export default function FinalConclusion({ data,id, page, total = 26 }) {
  const fc = data?.final_conclusion || {};
  const intel = fc.intelligence_summary || {};
  const heatmap = fc.risk_heatmap || {};
  const dq = fc.data_quality || {};
  const limitations = dq.limitations || [];

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 26</div>
            <div className="a4-header-title">Final Conclusion</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#002147', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: '7pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Final Credit Decision</div>
            <div style={{ fontSize: '8pt', color: '#fff', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{fmt(fc.final_verdict)}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>GENI Risk Score</div>
              <div style={{ fontSize: '24pt', fontWeight: 900, color: '#002147' }}>{fmt(fc.risk_score)}<span style={{ fontSize: '10pt', color: '#73777f' }}>/100</span></div>
              <div style={{ fontSize: '8pt', fontWeight: 700, color: '#ba1a1a', marginTop: 4 }}>Grade {fmt(fc.risk_grade)}</div>
            </div>
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Decision Confidence</div>
              <div style={{ fontSize: '24pt', fontWeight: 900, color: '#006a6a' }}>{fmt(fc.decision_confidence_score)}%</div>
              <div style={{ fontSize: '8pt', fontWeight: 700, color: '#006a6a', marginTop: 4 }}>{fmt(fc.decision_confidence_label)}</div>
            </div>
          </div>

          {Object.keys(heatmap).length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Risk Heatmap</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {Object.entries(heatmap).map(([key, val], i) => (
                  <div key={i} style={{ borderRadius: 6, padding: '8px 10px', background: HEATMAP_COLOR[val] || '#73777f', color: '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: '6.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3, opacity: 0.8 }}>{key.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: '7.5pt', fontWeight: 800 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fc.financial_review && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 12, borderLeft: '3px solid #002147' }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Financial Review</div>
              <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.7 }}>{fc.financial_review}</div>
            </div>
          )}

          {fc.risk_observations && (
            <div style={{ background: '#ffeef0', borderRadius: 8, padding: 12, borderLeft: '3px solid #ba1a1a' }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#ba1a1a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Risk Observations</div>
              <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.7 }}>{fc.risk_observations}</div>
            </div>
          )}

          {fc.sensitivity_analysis && (
            <div style={{ background: '#fffde7', borderRadius: 8, padding: 12, borderLeft: '3px solid #f9a825' }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#e65100', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Sensitivity Analysis</div>
              <div style={{ fontSize: '7.5pt', color: '#43474e', lineHeight: 1.7 }}>{fc.sensitivity_analysis}</div>
            </div>
          )}

          {intel.analyst_verdict && (
            <div style={{ background: 'linear-gradient(135deg, #002147, #003d6b)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#93f2f2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Analyst Intelligence Verdict</div>
              <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{intel.analyst_verdict}</div>
            </div>
          )}

          {dq.confidence_level && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: '7.5pt', color: '#43474e' }}><b>Data Source:</b> {fmt(dq.financials_source)}</span>
              <span style={{ fontSize: '7.5pt', color: '#43474e' }}><b>Confidence:</b> {fmt(dq.confidence_level)}</span>
              {limitations.length > 0 && (
                <span style={{ fontSize: '7pt', color: '#73777f', width: '100%' }}>
                  <b>Limitations:</b> {limitations.join(' | ')}
                </span>
              )}
            </div>
          )}

          {fc.mandatory_disclaimer && (
            <div style={{ fontSize: '6.5pt', color: '#73777f', lineHeight: 1.6, padding: '8px 0', borderTop: '1px solid #e8eaf0' }}>
              {fc.mandatory_disclaimer}
            </div>
          )}
        </div>

        <div className="a4-footer">
          <span>Geni Intelligence — Confidential  |  End of Report</span>
          <span>{`Page ${String(page || 0).padStart(2, '0')} of ${total}`}</span>
        </div>
      </div>
    </div>
  );
}