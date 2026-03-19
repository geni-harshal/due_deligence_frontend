import { useGetAdminStats } from "@/lib/api";
import { PageHeader, StatCard, Card, Skeleton } from "@/components/ui-shared";
import { Building2, Users, FileText, CheckCircle2, Clock, CalendarDays, TrendingUp, Shield, Database, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
function HealthBar({ label, value, color, status }) {
  return <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{status}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-500 ${color.replace("text-", "bg-")}`} style={{ width: `${value}%` }} />
      </div>
    </div>;
}
function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();
  const chartData = [
    { name: "Sep", orders: 28 },
    { name: "Oct", orders: 36 },
    { name: "Nov", orders: 31 },
    { name: "Dec", orders: 44 },
    { name: "Jan", orders: 38 },
    { name: "Now", orders: isLoading ? 0 : stats?.ordersThisMonth ?? 0 }
  ];
  return <div>
      <PageHeader
    title="Admin Overview"
    description="Platform-wide statistics, client activity, and system health"
  />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
    title="Total Clients"
    value={isLoading ? "\u2014" : stats?.totalClients ?? 0}
    icon={<Building2 className="w-5 h-5" />}
    isLoading={isLoading}
    iconBg="blue"
  />
        <StatCard
    title="Active Users"
    value={isLoading ? "\u2014" : stats?.totalUsers ?? 0}
    icon={<Users className="w-5 h-5" />}
    isLoading={isLoading}
    iconBg="purple"
  />
        <StatCard
    title="Total Orders"
    value={isLoading ? "\u2014" : stats?.totalOrders ?? 0}
    icon={<FileText className="w-5 h-5" />}
    isLoading={isLoading}
    iconBg="orange"
  />
        <StatCard
    title="Orders This Month"
    value={isLoading ? "\u2014" : stats?.ordersThisMonth ?? 0}
    icon={<CalendarDays className="w-5 h-5" />}
    isLoading={isLoading}
    iconBg="blue"
    trend={stats?.ordersThisMonth ? `${stats.ordersThisMonth} new this month` : void 0}
    trendColor="blue"
  />
        <StatCard
    title="Pending Review"
    value={isLoading ? "\u2014" : stats?.pendingOrders ?? 0}
    icon={<Clock className="w-5 h-5" />}
    isLoading={isLoading}
    iconBg="amber"
    trend={stats?.pendingOrders ? "Awaiting processing" : "Queue clear"}
    trendColor={stats?.pendingOrders ? "amber" : "emerald"}
  />
        <StatCard
    title="Completed"
    value={isLoading ? "\u2014" : stats?.completedOrders ?? 0}
    icon={<CheckCircle2 className="w-5 h-5" />}
    isLoading={isLoading}
    iconBg="emerald"
    trend={stats?.completedOrders ? "Reports delivered" : void 0}
    trendColor="emerald"
  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Order Volume Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly orders over past 6 months</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          {isLoading ? <div className="h-[260px] flex items-end gap-3 px-4">
              {[60, 80, 70, 90, 75, 85].map((h, i) => <div key={i} className="flex-1 flex flex-col justify-end">
                  <Skeleton className="w-full" style={{ height: `${h}%` }} />
                </div>)}
            </div> : <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
    cursor={{ fill: "#f1f5f9" }}
    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "13px" }}
    formatter={(v) => [v, "Orders"]}
  />
                  <Bar dataKey="orders" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            </div>}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">System Health</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live platform status</p>
            </div>
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-5">
            <HealthBar label="API Uptime" value={100} color="text-emerald-600" status="99.99%" />
            <HealthBar label="Provider Integrations" value={100} color="text-blue-600" status="All Operational" />
            <HealthBar label="Storage Capacity" value={74} color="text-amber-600" status="74% Used" />
            <HealthBar label="PDF Generation Service" value={100} color="text-emerald-600" status="Online" />
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
              <Database className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs font-semibold text-slate-700">Database</p>
                <p className="text-xs text-emerald-600">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs font-semibold text-slate-700">Notifications</p>
                <p className="text-xs text-amber-600">Mocked (dev)</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>;
}
export {
  AdminDashboard as default
};
