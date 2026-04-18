import React from 'react';

const fmt = (v, fallback = '—') => (v !== null && v !== undefined && v !== '') ? v : fallback;

const HEATMAP_COLOR = {
  'Low Risk': '#006a6a', 'Minimal Risk': '#006a6a',
  'Moderate Risk': '#f9a825', 'Mixed Risk': '#f9a825',
  'High Risk': '#e65100', 'Elevated Risk': '#e65100',
  'Severe Risk': '#ba1a1a', 'Critical': '#ba1a1a',
};

const WF_DISPLAY = {
  base_financial_score: 'Base Financial Score',
  peer_adjustment_log_odds: 'Peer Adjustment (Log-Odds)',
  compliance_adjustment_log_odds: 'Compliance Adjustment',
  final_score: 'Final Composite Score',
};

export default function ScoreBreakdown({ data, page,id, total = 26 }) {
  const ed      = data?.executive_dashboard || {};
  const ra      = data?.risk_analysis || {};
  const fc      = data?.final_conclusion || {};
  const sc      = ed.score_components || {};
  const wf      = ed.score_waterfall || {};
  const heatmap = fc.risk_heatmap || {};
  const peerComp = ra.peer_comparison?.benchmarks || {};

  const SC_DISPLAY = {
    financial_health: 'Financial Health',
    compliance: 'Compliance',
    behavioral: 'Behavioral',
    peer_comparison: 'Peer Comparison',
  };
  const scItems = Object.entries(sc).map(([k, v]) => ({
    label: SC_DISPLAY[k] || k.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value: Number(v) || 0,
  }));

  const wfCardKeys = ['base_financial_score', 'peer_adjustment_log_odds', 'compliance_adjustment_log_odds', 'final_score'];
  const wfCards = wfCardKeys
    .filter(k => wf[k] !== undefined)
    .map(k => ({
      key: k,
      label: WF_DISPLAY[k] || k.replace(/_/g, ' '),
      value: wf[k],
      color: k === 'base_financial_score' ? '#002147'
           : k === 'final_score' ? '#ba1a1a'
           : (wf[k] ?? 0) >= 0 ? '#006a6a' : '#ba1a1a',
      display: k === 'base_financial_score' || k === 'final_score'
        ? (wf[k] ?? 0).toFixed(1)
        : ((wf[k] ?? 0) >= 0 ? '+' : '') + (wf[k] ?? 0).toFixed(4),
    }));

  return (
    <div className="a4-page" id={id}  style={{ background: '#fff' }}>
      <div className="a4-page-inner">
        <div className="a4-header">
          <div>
            <div className="a4-section-label">Section 07</div>
            <div className="a4-header-title">Risk Composition &amp; Heatmap</div>
          </div>
          <div className="a4-header-meta">Report ID: {fmt(data?._meta?.report_id)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scItems.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Score Component Breakdown</div>
              {scItems.map((item, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: '7.5pt', fontWeight: 600, color: '#43474e' }}>{item.label}</span>
                    <span style={{ fontSize: '7.5pt', fontWeight: 800, color: '#002147' }}>{item.value.toFixed(1)}</span>
                  </div>
                  <div style={{ height: 6, background: '#e8eaf0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, item.value)}%`, background: item.value >= 60 ? '#006a6a' : item.value >= 40 ? '#f9a825' : '#ba1a1a', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {wfCards.length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Score Waterfall Detail</div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${wfCards.length}, 1fr)`, gap: 10 }}>
                {wfCards.map((item, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 6, padding: '10px 12px', border: '1px solid #e8eaf0', textAlign: 'center' }}>
                    <div style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{item.label}</div>
                    <div style={{ fontSize: '13pt', fontWeight: 900, color: item.color }}>{item.display}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(heatmap).length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Risk Heatmap</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {Object.entries(heatmap).map(([key, val], i) => (
                  <div key={i} style={{ borderRadius: 6, padding: '8px 10px', background: HEATMAP_COLOR[val] || '#73777f', color: '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: '6.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3, opacity: 0.8 }}>
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '7.5pt', fontWeight: 800 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(peerComp).length > 0 && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#002147', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Peer Benchmarking — {fmt(ra.peer_comparison?.industry)} &nbsp;
                <span style={{ fontSize: '6.5pt', color: '#73777f', textTransform: 'none', fontWeight: 400 }}>Source: {fmt(ra.peer_comparison?.peer_data_source)}</span>
              </div>
              <table className="a4-table">
                <thead>
                  <tr><th>Metric</th><th className="text-right">Entity</th><th className="text-right">Peer Avg</th><th>Verdict</th></tr>
                </thead>
                <tbody>
                  {Object.entries(peerComp).map(([key, v], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fc' }}>
                      <td style={{ fontSize: '7.5pt', padding: '4px 8px', fontWeight: 600, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</td>
                      <td style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px' }}>{fmt(v.entity)}</td>
                      <td style={{ textAlign: 'right', fontSize: '7.5pt', padding: '4px 8px', color: '#73777f' }}>{fmt(v.peer_avg)}</td>
                      <td style={{ padding: '4px 8px' }}>
                        <span style={{ fontSize: '7pt', fontWeight: 700, color: v.verdict?.includes('Above') ? '#006a6a' : '#ba1a1a' }}>{fmt(v.verdict)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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