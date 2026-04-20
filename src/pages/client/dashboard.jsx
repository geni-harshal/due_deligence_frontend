import { useState } from "react";
import { useGetClientStats, useListClientOrders } from "@/lib/api";
import {
  PageHeader,
  StatCard,
  Card,
  Button,
  StatusBadge,
  TableSkeleton,
  EmptyState,
  Badge,
} from "@/components/ui-shared";
import {
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Download,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import NewOrderModal from "./new-order-modal";


function DownloadButton({ orderId, orderNumber }) {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("auth_token"); // or "token" if you switched to JWT

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/client/orders/${orderId}/download-pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DDR_${orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="success" isLoading={loading} onClick={handleDownload}>
      <Download className="w-3.5 h-3.5 mr-1.5" /> Download
    </Button>
  );
}

function ClientDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetClientStats();
  const { data: orders, isLoading: ordersLoading } = useListClientOrders();
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  const recentOrders = orders?.slice(0, 5) ?? [];
  const completedOrders = orders?.filter((o) => o.status === "completed") ?? [];

  return (
    <div>
      <PageHeader
        title="Welcome Back"
        description="Track your due diligence orders and download completed reports"
        action={
          <Button onClick={() => setIsNewOrderOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Report Request
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={statsLoading ? "—" : stats?.totalOrders ?? 0}
          icon={<FileText className="w-5 h-5" />}
          isLoading={statsLoading}
          iconBg="blue"
        />
        <StatCard
          title="In Progress"
          value={statsLoading ? "—" : stats?.pendingOrders ?? 0}
          icon={<Clock className="w-5 h-5" />}
          isLoading={statsLoading}
          iconBg="amber"
          trend={stats?.pendingOrders ? "Being processed" : "All clear"}
          trendColor={stats?.pendingOrders ? "amber" : "emerald"}
        />
        <StatCard
          title="Reports Ready"
          value={statsLoading ? "—" : stats?.completedOrders ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          isLoading={statsLoading}
          iconBg="emerald"
          trend={stats?.completedOrders ? "Available to download" : void 0}
          trendColor="emerald"
        />
        <StatCard
          title="This Month"
          value={statsLoading ? "—" : stats?.ordersThisMonth ?? 0}
          icon={<CalendarDays className="w-5 h-5" />}
          isLoading={statsLoading}
          iconBg="purple"
        />
      </div>

      {completedOrders.length > 0 && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/30">
          <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-slate-900">Reports Ready for Download</h2>
              <Badge variant="success">{completedOrders.length}</Badge>
            </div>
            {/* FIX: Removed inner <a> – className applied directly to Link */}
            <Link
              href="/client/orders"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-emerald-100">
            {completedOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{order.subjectName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <span className="font-mono text-blue-600">{order.orderNumber}</span>
                    {" · "}
                    {order.productName}
                    {" · "}
                    {formatDate(order.completedAt || order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`~/report/${order.id}`}>
                    <Button size="sm" variant="outline" title="View Credit Report">
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                  </Link>
                  <DownloadButton orderId={order.id} orderNumber={order.orderNumber} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent Requests</h2>
          {/* FIX: Removed inner <a> */}
          <Link
            href="/client/orders"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Order #</th>
                <th className="px-6 py-3 font-medium">Subject Company</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Product</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Date</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            {/* FIX: Wrap skeleton in <tbody> to avoid direct <tr> child of <table> */}
            {ordersLoading ? (
              <tbody>
                <TableSkeleton rows={4} cols={6} />
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={<FileText className="w-10 h-10" />}
                        title="No orders yet"
                        description="Place your first due diligence report request to get started."
                        action={
                          <Button size="sm" onClick={() => setIsNewOrderOpen(true)}>
                            <Plus className="w-4 h-4 mr-1.5" /> New Request
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-blue-600 text-xs">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 leading-snug">{order.subjectName}</p>
                        {order.subjectDetails?.cin && (
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {order.subjectDetails.cin}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {order.productName}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`~/report/${order.id}`}>
                          <Button size="sm" variant="ghost" title="View Credit Report">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </Card>

      <div className="mt-6 bg-blue-600 rounded-2xl p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-200" />
            <span className="text-blue-200 text-sm font-medium">48-hour standard turnaround</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Need a new investigation?</h2>
          <p className="text-blue-100 mb-5 text-sm">
            Our operations team delivers comprehensive due diligence reports including company profile,
            directors, financials, charges, and a credit assessment.
          </p>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-700 transition-colors"
            onClick={() => setIsNewOrderOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Place a New Order
          </Button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
          <FileText className="w-64 h-64" />
        </div>
      </div>

      <NewOrderModal isOpen={isNewOrderOpen} onClose={() => setIsNewOrderOpen(false)} />
    </div>
  );
}

export { ClientDashboard as default };