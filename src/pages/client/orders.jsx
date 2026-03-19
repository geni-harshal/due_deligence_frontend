// src/pages/client/orders.jsx
import { useState } from "react";
import { useListClientOrders } from "@/lib/api";
import {
  PageHeader,
  Card,
  Button,
  StatusBadge,
  TableSkeleton,
  EmptyState,
} from "@/components/ui-shared";
import { formatDate } from "@/lib/utils";
import { Plus, Download, FileText, Hash, MapPin, Loader2 } from "lucide-react";
import NewOrderModal from "./new-order-modal";

function CINBadge({ cin }) {
  if (!cin) return <span className="text-slate-300 text-xs">-</span>;
  return (
    <span className="font-mono text-xs text-slate-500 flex items-center gap-1">
      <Hash className="w-3 h-3" />
      {cin}
    </span>
  );
}

function DownloadButton({ orderId, orderNumber }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/client/orders/${orderId}/download-pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DDR-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      title="Download Report"
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? (
        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5 mr-1" />
      )}
      Download
    </Button>
  );
}

function ClientOrders() {
  const { data: orders, isLoading } = useListClientOrders();
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="My Orders"
        description="View and track your due diligence report requests"
        action={
          <Button onClick={() => setIsNewOrderOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Request
          </Button>
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium whitespace-nowrap">
                  Order #
                </th>
                <th className="px-5 py-4 font-medium whitespace-nowrap">
                  Product
                </th>
                <th className="px-5 py-4 font-medium">Company</th>
                <th className="px-5 py-4 font-medium whitespace-nowrap">
                  CIN / ID
                </th>
                <th className="px-5 py-4 font-medium whitespace-nowrap">
                  Requested
                </th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium whitespace-nowrap">
                  Last Updated
                </th>
                <th className="px-5 py-4 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableSkeleton rows={5} cols={8} />
              ) : orders?.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={<FileText className="w-10 h-10" />}
                      title="No orders yet"
                      description="Place your first due diligence report request to get started."
                      action={
                        <Button
                          size="sm"
                          onClick={() => setIsNewOrderOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-1.5" /> New Request
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                orders?.map((order) => {
                  const details = order.subjectDetails;
                  const cin = details?.cin;
                  const location = [details?.city, details?.state]
                    .filter(Boolean)
                    .join(", ");
                  const isCompleted = order.status === "completed";
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono font-semibold text-blue-600 text-sm">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {order.productName}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900 leading-snug">
                          {order.subjectName}
                        </p>
                        {location && (
                          <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {location}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <CINBadge cin={cin} />
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                        {formatDate(order.updatedAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isCompleted && (
                          <DownloadButton
                            orderId={order.id}
                            orderNumber={order.orderNumber}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
      />
    </div>
  );
}

export default ClientOrders;
