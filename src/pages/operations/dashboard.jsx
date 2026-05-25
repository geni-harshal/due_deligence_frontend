// src/pages/operations/dashboard.jsx
import { useGetOperationsStats, useListOperationsOrders } from "@/lib/api";
import { Link } from "wouter";
import {
  PageHeader,
  StatCard,
  Card,
  StatusBadge,
  PriorityBadge,
  TableSkeleton,
  EmptyState,
} from "@/components/ui-shared";
import {
  FileSearch,
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
  AlertTriangle,
  Inbox,
} from "lucide-react";

function AgingBadge({ days }) {
  const cls =
    days <= 1
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : days <= 3
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-700 border-red-200";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}
    >
      <Clock className="w-3 h-3" />
      {days}d
    </span>
  );
}

function OpsDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetOperationsStats();
  const { data: allOrders, isLoading: ordersLoading } =
    useListOperationsOrders({});
  const now = Date.now();

  const actionableOrders =
    allOrders
      ?.filter((o) => !["completed", "cancelled"].includes(o.status))
      .sort((a, b) => {
        const agingA = Math.floor(
          (now - new Date(a.createdAt).getTime()) / 864e5
        );
        const agingB = Math.floor(
          (now - new Date(b.createdAt).getTime()) / 864e5
        );
        return agingB - agingA;
      })
      .slice(0, 8) ?? [];

  const urgentCount =
    allOrders?.filter((o) => {
      const days = Math.floor(
        (now - new Date(o.createdAt).getTime()) / 864e5
      );
      return days > 3 && !["completed", "cancelled"].includes(o.status);
    }).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Operations Workspace"
        description="Process orders, conduct analysis, and generate reports"
      />

      {urgentCount > 0 && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {urgentCount} order{urgentCount > 1 ? "s are" : " is"} overdue
            (aging &gt; 3 days) and require immediate attention.
          </p>
          <Link
            href="~/operations/orders"
            className="ml-auto text-xs font-semibold text-red-600 hover:text-red-800 whitespace-nowrap flex items-center gap-1"
          >
            View Queue <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pending / New"
          value={statsLoading ? "-" : stats?.pendingOrders ?? 0}
          icon={<Inbox className="w-5 h-5" />}
          isLoading={statsLoading}
          iconBg="amber"
          trend={
            stats?.pendingOrders ? "Awaiting processing" : "Queue clear"
          }
          trendColor={stats?.pendingOrders ? "amber" : "emerald"}
        />
        <StatCard
          title="In Progress"
          value={statsLoading ? "-" : stats?.inProgressOrders ?? 0}
          icon={<Activity className="w-5 h-5" />}
          isLoading={statsLoading}
          iconBg="blue"
          trend="Active processing"
        />
        <StatCard
          title="Completed Today"
          value={statsLoading ? "-" : stats?.completedToday ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          isLoading={statsLoading}
          iconBg="emerald"
          trendColor="emerald"
        />
      </div>

      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-900">Active Orders</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Orders requiring action, sorted by aging
            </p>
          </div>
          <Link
            href="~/operations/orders"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Full Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium whitespace-nowrap">
                  Order #
                </th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Subject Company</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Age</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ordersLoading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : actionableOrders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<CheckCircle2 className="w-10 h-10" />}
                      title="All caught up!"
                      description="No active orders in the queue. New orders will appear here."
                    />
                  </td>
                </tr>
              ) : (
                actionableOrders.map((order) => {
                  const agingDays = Math.floor(
                    (now - new Date(order.createdAt).getTime()) / 864e5
                  );
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono font-semibold text-blue-600 text-xs whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {order.clientCompanyName || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900 leading-snug">
                          {order.subjectName}
                        </p>
                        {order.subjectDetails?.cin && (
                          <p className="text-xs text-slate-400 font-mono">
                            {order.subjectDetails.cin}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4">
                        <PriorityBadge priority={order.priority} />
                      </td>
                      <td className="px-5 py-4">
                        <AgingBadge days={agingDays} />
                      </td>
                      <td className="px-5 py-4">
                        {/* ✅ FIX: use ~ prefix for absolute path in wouter v3 nested context */}
                        <Link
                          href={`~/operations/orders/${order.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 whitespace-nowrap"
                        >
                          Process <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default OpsDashboard;