import React, { useCallback } from 'react';
import { FiDownload } from "react-icons/fi";
import CoverPage from './CoverPage';
import IdentificationSummary from './IdentificationSummary';
import OperationalProfile from './OperationalProfile';
import ScaleStructure from './ScaleStructure';
import ExecutiveSummary from './ExecutiveSummary';
import ScoreBreakdown from './ScoreBreakdown';
import ManagementRatings from './ManagementRatings';
import ShareholdingPattern from './ShareholdingPattern';
import Charges from './Charges';
import ComplianceBehavioral from './ComplianceBehavioral';
import FullFinancialStatements from './FullFinancialStatements';
import PredictiveRatios from './PredictiveRatios';
import FinancialPerformance from './FinancialPerformance';
import LiquidityAnalysis from './LiquidityAnalysis';
import RiskAnalysis from './RiskAnalysis';
import CreditLimitMethodology from './CreditLimitMethodology';
import RiskFactors from './RiskFactors';
import Strengths from './Strengths';
import FutureOutlook from './FutureOutlook';
import MethodologyDisclaimers from './MethodologyDisclaimers';
import Disclaimer from './Disclaimer';
import FinalConclusion from './FinalConclusion';

const TOTAL_PAGES = 26;

export default function ReportViewer({ data: reportData }) {
  // If no data is provided, show a fallback message
  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">
        <div className="text-lg font-medium">No report data available</div>
      </div>
    );
  }

  const scrollToPage = useCallback((pageNum) => {
    const element = document.getElementById(`page-${pageNum}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <>
      {/* Download button (print) */}
      <div className="print-hide" style={{ position: "fixed", right: "24px", bottom: "24px", zIndex: 9999, pointerEvents: "none" }}>
        <button
          onClick={() => window.print()}
          style={{
            pointerEvents: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            borderRadius: "9999px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "var(--color-secondary)",
            color: "white",
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          <FiDownload size={18} />
          Download PDF
        </button>
      </div>

      <div className="report-viewer-shell">
        <CoverPage data={reportData} total={TOTAL_PAGES} onNavigate={scrollToPage} />
        <IdentificationSummary data={reportData} page={3} total={TOTAL_PAGES} id="page-03" />
        <OperationalProfile data={reportData} page={4} total={TOTAL_PAGES} id="page-04" />
        <ScaleStructure data={reportData} page={5} total={TOTAL_PAGES} id="page-05" />
        <ExecutiveSummary data={reportData} page={6} total={TOTAL_PAGES} id="page-06" />
        <ScoreBreakdown data={reportData} page={7} total={TOTAL_PAGES} id="page-07" />
        <ManagementRatings data={reportData} page={8} total={TOTAL_PAGES} id="page-08" />
        <ShareholdingPattern data={reportData} page={9} total={TOTAL_PAGES} id="page-09" />
        <Charges data={reportData} page={10} total={TOTAL_PAGES} id="page-10" />
        <ComplianceBehavioral data={reportData} page={11} total={TOTAL_PAGES} id="page-11" />
        <FullFinancialStatements data={reportData} page={12} total={TOTAL_PAGES} id="page-12" />
        <PredictiveRatios data={reportData} page={15} total={TOTAL_PAGES} id="page-15" />
        <FinancialPerformance data={reportData} page={16} total={TOTAL_PAGES} id="page-16" />
        <LiquidityAnalysis data={reportData} page={18} total={TOTAL_PAGES} id="page-18" />
        <RiskAnalysis data={reportData} page={19} total={TOTAL_PAGES} id="page-19" />
        <CreditLimitMethodology data={reportData} page={20} total={TOTAL_PAGES} id="page-20" />
        <RiskFactors data={reportData} page={21} total={TOTAL_PAGES} id="page-21" />
        <Strengths data={reportData} page={22} total={TOTAL_PAGES} id="page-22" />
        <FutureOutlook data={reportData} page={23} total={TOTAL_PAGES} id="page-23" />
        <MethodologyDisclaimers data={reportData} page={24} total={TOTAL_PAGES} id="page-24" />
        <Disclaimer data={reportData} page={25} total={TOTAL_PAGES} id="page-25" />
        <FinalConclusion data={reportData} page={26} total={TOTAL_PAGES} id="page-26" />
      </div>
    </>
  );
}