// src/pages/operations/orders.jsx
import { useState } from "react";
import { useListOperationsOrders, useGetOperationsClientCompanies } from "@/lib/api";
import { Link } from "wouter";
import {
  PageHeader,
  Card,
  StatusBadge,
  PriorityBadge,
  Input,
  Select,
  Button,
  TableSkeleton,
  EmptyState,
} from "@/components/ui-shared";
import { formatDate } from "@/lib/utils";
import { Search, Filter, RefreshCw, Clock, Building2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "order_placed", label: "Order Placed" },
  { value: "pending_data_fetch", label: "Fetching Data" },
  { value: "data_fetched", label: "Data Fetched" },
  { value: "in_progress", label: "In Progress" },
  { value: "model_executed", label: "Models Run" },
  { value: "pdf_generated", label: "PDF Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

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

function OpsOrders() {
  const [status, setStatus] = useState("all");
  const [clientCompanyId, setClientCompanyId] = useState("");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = {};
  if (status !== "all") params.status = status;
  if (clientCompanyId) params.clientCompanyId = Number(clientCompanyId);
  if (q) params.q = q;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;

  const { data: orders, isLoading, refetch } = useListOperationsOrders(params);
  const { data: clientCompanies } = useGetOperationsClientCompanies();

  const handleSearch = () => setQ(qInput);
  const handleClear = () => {
    setStatus("all");
    setClientCompanyId("");
    setQ("");
    setQInput("");
    setDateFrom("");
    setDateTo("");
  };

  const pendingCount =
    orders?.filter((o) =>
      ["order_placed", "pending_data_fetch", "data_fetched"].includes(o.status)
    ).length || 0;
  const inProgressCount =
    orders?.filter((o) =>
      ["in_progress", "model_executed", "pdf_generated"].includes(o.status)
    ).length || 0;
  const completedCount =
    orders?.filter((o) => o.status === "completed").length || 0;

  return (
    <div className="pb-12">
      <div className="flex items-start justify-between mb-8">
        <PageHeader
          title="Order Queue"
          description="Manage and process all incoming due diligence orders"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-1"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Pending / New",
            value: pendingCount,
            color: "text-amber-600 bg-amber-50 border-amber-200",
          },
          {
            label: "In Progress",
            value: inProgressCount,
            color: "text-blue-600 bg-blue-50 border-blue-200",
          },
          {
            label: "Completed",
            value: completedCount,
            color: "text-emerald-600 bg-emerald-50 border-emerald-200",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border px-6 py-4 ${s.color}`}
          >
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-0.5 opacity-80">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6 p-5">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
          <Filter className="w-4 h-4 text-slate-400" /> Filters
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search company..."
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>

          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>

          <Select
            value={clientCompanyId}
            onChange={(e) => setClientCompanyId(e.target.value)}
          >
            <option value="">All Clients</option>
            {clientCompanies?.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </Select>

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleSearch}
              className="flex-1"
            >
              Search
            </Button>
            <Button variant="outline" size="md" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1 font-medium">
              From
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1 font-medium">
              To
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">
            {isLoading ? "Loading..." : `${orders?.length || 0} orders`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">
                  Client
                </th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">
                  Subject Company
                </th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">
                  Age
                </th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableSkeleton rows={6} cols={8} />
              ) : orders?.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={<Building2 className="w-10 h-10" />}
                      title="No orders found"
                      description="Try adjusting your filters or check back later for new orders."
                    />
                  </td>
                </tr>
              ) : (
                orders?.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-sm">
                      {order.clientCompanyName || "\u2014"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {order.subjectName}
                      </div>
                      {order.subjectDetails?.cin && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {order.subjectDetails.cin}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={order.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <AgingBadge days={order.agingDays ?? 0} />
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {/* ✅ FIX: use ~ prefix for absolute path in wouter v3 nested context */}
                      <Link
                        href={`~/operations/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-white hover:bg-blue-600 font-semibold text-xs px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-600 transition-all duration-200 group-hover:scale-105"
                      >
                        Process →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default OpsOrders;