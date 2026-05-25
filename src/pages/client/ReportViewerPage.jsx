// src/pages/client/ReportViewerPage.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui-shared";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// High-resolution scale factor: at least 2.0 or device pixel ratio, whichever is larger
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

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    let retryTimer = null;
    let removeScrollListener = null;

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

        if (!res.ok) {
          setWaitingForPdf(true);
          retryTimer = setTimeout(() => {
            if (mounted) loadPDF();
          }, 4000);
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const pdf = await pdfjsLib.getDocument(url).promise;

        setWaitingForPdf(false);
        setTotalPages(pdf.numPages);
        const container = containerRef.current;
        container.innerHTML = "";

        const scale = getHighResScale();

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set canvas buffer size to high‑resolution dimensions
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Render the page
          await page.render({ canvasContext: ctx, viewport }).promise;

          // Style canvas for sharp downscaling
          canvas.style.display = "block";
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.borderRadius = "8px";
          canvas.style.imageRendering = "crisp-edges"; // optional, helps with text

          const wrapper = document.createElement("div");
          wrapper.style.background = "#ffffff";
          wrapper.style.padding = "0";
          wrapper.style.margin = "0 auto 32px auto";
          wrapper.style.width = "100%";
          wrapper.style.maxWidth = "900px"; // optional, keeps pages readable on wide screens
          wrapper.style.borderRadius = "8px";
          wrapper.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";

          wrapper.appendChild(canvas);
          container.appendChild(wrapper);
        }

        URL.revokeObjectURL(url);

        // Scroll listener for page indicator
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
        if (mounted) setLoading(false);
      } catch (err) {
        if (err.name !== "AbortError" && mounted) {
          console.error(err);
          setWaitingForPdf(true);
          retryTimer = setTimeout(() => {
            if (mounted) loadPDF();
          }, 4000);
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
      a.download = `Report-${orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
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

      <div ref={containerRef} style={{ padding: "32px 0" }} />
    </div>
  );
}
