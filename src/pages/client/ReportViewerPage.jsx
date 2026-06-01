// src/pages/client/ReportViewerPage.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import { ArrowLeft, Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui-shared";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const getHighResScale = () => Math.max(2.0, window.devicePixelRatio || 1);

export default function ReportViewerPage() {
  const { orderId } = useParams();
  const [, navigate] = useLocation();

  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [waitingForPdf, setWaitingForPdf] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  // Retry control
  const MAX_RETRIES = 5;
  const BASE_RETRY_DELAY = 4000; // 4 seconds
  let retryCount = 0;
  let retryTimer = null;

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    let removeScrollListener = null;

    // Reset on new orderId
    retryCount = 0;
    if (retryTimer) clearTimeout(retryTimer);
    setErrorMessage(null);
    setWaitingForPdf(false);
    setLoading(true);

    async function loadPDF() {
      try {
        const token = localStorage.getItem("token");
        const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8080";
        const res = await fetch(
          `${apiBase}/api/client/orders/${orderId}/pdf/preview`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: controller.signal,
          }
        );

        // Handle HTTP errors
        if (!res.ok) {
          const errorText = await res.text();
          // Permanent failure: 404 with PDF not found message
          if (res.status === 404 && errorText.includes("PDF not found")) {
            if (mounted) {
              setLoading(false);
              setWaitingForPdf(false);
              setErrorMessage("PDF could not be generated. Please contact support.");
            }
            return;
          }

          // Transient error – retry with exponential backoff
          if (retryCount < MAX_RETRIES) {
            const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount);
            setWaitingForPdf(true);
            retryTimer = setTimeout(() => {
              retryCount++;
              if (mounted) loadPDF();
            }, delay);
          } else {
            if (mounted) {
              setLoading(false);
              setWaitingForPdf(false);
              setErrorMessage(
                "PDF is taking too long to generate. You can retry manually."
              );
            }
          }
          return;
        }

        // Success – reset retry counter and render PDF
        retryCount = 0;
        setWaitingForPdf(false);
        setErrorMessage(null);

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const pdf = await pdfjsLib.getDocument(url).promise;

        setTotalPages(pdf.numPages);
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";

        const scale = getHighResScale();

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx, viewport }).promise;

          canvas.style.display = "block";
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.borderRadius = "8px";
          canvas.style.imageRendering = "crisp-edges";

          const wrapper = document.createElement("div");
          wrapper.style.background = "#ffffff";
          wrapper.style.padding = "0";
          wrapper.style.margin = "0 auto 32px auto";
          wrapper.style.width = "100%";
          wrapper.style.maxWidth = "900px";
          wrapper.style.borderRadius = "8px";
          wrapper.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
          wrapper.appendChild(canvas);
          container.appendChild(wrapper);
        }

        URL.revokeObjectURL(url);

        const handleScroll = () => {
          const wrappers = containerRef.current?.children;
          if (!wrappers) return;
          let closest = 0;
          let minDiff = Infinity;
          for (let i = 0; i < wrappers.length; i++) {
            const rect = wrappers[i].getBoundingClientRect();
            const diff = Math.abs(rect.top);
            if (diff < minDiff) {
              minDiff = diff;
              closest = i;
            }
          }
          setCurrentPage(closest + 1);
        };

        window.addEventListener("scroll", handleScroll);
        removeScrollListener = () => window.removeEventListener("scroll", handleScroll);
        setLoading(false);
      } catch (err) {
        if (err.name !== "AbortError" && mounted) {
          console.error("PDF load error:", err);
          if (retryCount < MAX_RETRIES) {
            const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount);
            setWaitingForPdf(true);
            retryTimer = setTimeout(() => {
              retryCount++;
              if (mounted) loadPDF();
            }, delay);
          } else {
            setLoading(false);
            setWaitingForPdf(false);
            setErrorMessage("Network error. Please retry later.");
          }
        }
      }
    }

    loadPDF();

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
      if (removeScrollListener) removeScrollListener();
      controller.abort();
    };
  }, [orderId]);

  const handleBack = () => navigate("/client/orders");

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8080";
      const res = await fetch(
        `${apiBase}/api/client/orders/${orderId}/pdf/download`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const disposition = res.headers.get("content-disposition");
      let filename = `OMNIFI_${orderId}.pdf`;
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) filename = match[1].replace(/['"]/g, "");
      }
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setLoading(true);
    setWaitingForPdf(false);
    retryCount = 0;
    // Force re-run effect by triggering a location change? Better: re-mount effect.
    // We'll just reload the component state and let useEffect run again.
    // But useEffect depends on orderId, so we can trigger a fake key?
    // Simpler: call loadPDF directly, but we need access to the function.
    // We'll re-run the effect by incrementing a dummy key? For simplicity,
    // we'll force a reload of the page. Alternatively, we can extract loadPDF
    // to a useCallback and call it. To keep code clean, we'll just reload:
    window.location.reload();
  };

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh" }}>
      {/* Sticky Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "12px 20px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <div>
          <Button onClick={handleBack} size="sm" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div style={{ textAlign: "center", fontWeight: 500 }}>
          {currentPage} / {totalPages}
        </div>

        <div style={{ textAlign: "right" }}>
          <Button onClick={handleDownload} size="sm" disabled={downloading}>
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download
          </Button>
        </div>
      </div>

      {/* Loading / Error States */}
      {loading && (
        <div
          style={{
            height: "calc(100vh - 60px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
          {waitingForPdf && (
            <div style={{ fontSize: "14px", color: "#64748b" }}>
              PDF is being generated... auto-refreshing
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            height: "calc(100vh - 60px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ color: "#dc2626", fontSize: "16px", fontWeight: 500 }}>
            {errorMessage}
          </div>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry Now
          </Button>
        </div>
      )}

      <div ref={containerRef} style={{ padding: "32px 0" }} />
    </div>
  );
}
