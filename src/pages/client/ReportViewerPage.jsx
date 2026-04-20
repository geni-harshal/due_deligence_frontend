// src/pages/client/ReportViewerPage.jsx
import { useParams, useLocation } from "wouter";
import { useGetCreditReport } from "@/lib/api";
import ReportViewer from "@/components/report-viewer/ReportViewer";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui-shared";

export default function ReportViewerPage() {
  const { orderId } = useParams();
  const [, navigate] = useLocation();
  const { data, isLoading, error } = useGetCreditReport(orderId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data?.reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-amber-600">
        <div className="text-center">
          <p className="text-lg font-medium">Report Not Ready</p>
          <p className="text-sm mt-2 text-gray-500">
            The credit report is still being generated. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // The API returns { reportData: { report: {...} } }
  // Extract the inner report object
  const actualReport = data.reportData.report || data.reportData;

  const handleBack = () => {
    navigate("/client/orders");
  };

  return (
    <div>
      {/* Back Button - Hidden when printing */}
      <div className="print-hide" style={{ position: "fixed", left: "24px", top: "24px", zIndex: 9999 }}>
        <Button
          onClick={handleBack}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      <ReportViewer data={actualReport} />
    </div>
  );
}