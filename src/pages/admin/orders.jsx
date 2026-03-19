import { useState } from "react";
import { useListAllOrders } from "@/lib/api";
import { format } from "date-fns";
import { PageHeader, Card, StatusBadge, PriorityBadge } from "@/components/ui-shared";
const STATUS_OPTIONS = ["", "submitted", "under_review", "in_progress", "pending_review", "completed", "cancelled"];
function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: orders = [], isLoading } = useListAllOrders({ status: statusFilter || void 0 });
  return <div>
      <PageHeader title="All Orders" subtitle="Platform-wide order visibility">
        <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </PageHeader>

      {isLoading ? <Card className="p-8 text-center text-slate-500">Loading orders…</Card> : <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Order #</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Client</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Priority</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{o.orderNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{o.clientCompanyName}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono rounded">{o.productCode}</span></td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{o.subjectName}</div>
                      <div className="text-xs text-slate-500 capitalize">{o.subjectType}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={o.priority} /></td>
                    <td className="px-4 py-3 text-slate-500">{format(new Date(o.createdAt), "MMM d, yyyy")}</td>
                  </tr>)}
                {orders.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No orders found</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>}
    </div>;
}
export {
  AdminOrders as default
};
