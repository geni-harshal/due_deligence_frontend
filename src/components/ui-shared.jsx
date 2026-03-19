import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, X, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
function Card({ className, children, ...props }) {
  return <div
    className={cn(
      "bg-white rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] overflow-hidden",
      className
    )}
    {...props}
  >
      {children}
    </div>;
}
function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  children,
  disabled,
  ...props
}) {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 focus:ring-blue-600",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500",
    outline: "bg-transparent border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20 hover:-translate-y-0.5 focus:ring-red-500",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 focus:ring-emerald-600"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  return <button
    className={cn(base, variants[variant], sizes[size], className)}
    disabled={disabled || isLoading}
    {...props}
  >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>;
}
function Input({ className, ...props }) {
  return <input
    className={cn(
      "flex w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 disabled:bg-slate-50",
      className
    )}
    {...props}
  />;
}
function Select({ className, children, ...props }) {
  return <select
    className={cn(
      "flex w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-900 transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 appearance-none cursor-pointer",
      className
    )}
    {...props}
  >
      {children}
    </select>;
}
function Textarea({ className, ...props }) {
  return <textarea
    className={cn(
      "flex w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 min-h-[100px] resize-y",
      className
    )}
    {...props}
  />;
}
function Label({ className, children, ...props }) {
  return <label className={cn("block text-sm font-semibold text-slate-700 mb-1.5", className)} {...props}>
      {children}
    </label>;
}
function Badge({
  children,
  variant = "neutral",
  dot,
  className
}) {
  const variants = {
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
    orange: "bg-orange-50 text-orange-700 border border-orange-200"
  };
  const dotColors = {
    neutral: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500"
  };
  return <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColors[variant])} />}
      {children}
    </span>;
}
function StatusBadge({ status }) {
  const map = {
    order_placed: { label: "Order Placed", variant: "info" },
    pending_data_fetch: { label: "Fetching Data", variant: "warning" },
    data_fetched: { label: "Data Fetched", variant: "orange" },
    submitted: { label: "Submitted", variant: "info" },
    under_review: { label: "Under Review", variant: "warning" },
    in_progress: { label: "In Progress", variant: "warning" },
    model_executed: { label: "Models Run", variant: "purple" },
    pdf_generated: { label: "PDF Ready", variant: "purple" },
    pending_review: { label: "Pending Review", variant: "purple" },
    completed: { label: "Completed", variant: "success" },
    failed: { label: "Failed", variant: "danger" },
    cancelled: { label: "Cancelled", variant: "neutral" },
    active: { label: "Active", variant: "success" },
    inactive: { label: "Inactive", variant: "neutral" },
    suspended: { label: "Suspended", variant: "danger" }
  };
  const config = map[status] || { label: status.replace(/_/g, " "), variant: "neutral" };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
function PriorityBadge({ priority }) {
  const map = {
    normal: { label: "Normal", variant: "neutral" },
    high: { label: "High", variant: "warning" },
    urgent: { label: "Urgent", variant: "danger" }
  };
  const config = map[priority] || { label: priority, variant: "neutral" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (isOpen === false) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className={cn("bg-white rounded-2xl shadow-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200", sizes[size])}>
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>;
}
function Drawer({ isOpen, onClose, title, children, width = "lg" }) {
  const widths = { md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-white w-full shadow-2xl flex flex-col h-full", widths[width])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>;
}
function FormField({ label, required, children, hint, error }) {
  return <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>}
      {!error && hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>;
}
function SectionTitle({ children, className }) {
  return <div className={cn("flex items-center gap-2 pb-2 border-b border-slate-100 mb-4", className)}>
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{children}</h3>
    </div>;
}
function DetailRow({ label, value }) {
  return <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-slate-800">{value || <span className="text-slate-400 italic">—</span>}</span>
    </div>;
}
function PageHeader({ title, subtitle, description, action, children }) {
  return <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {(subtitle || description) && <p className="mt-1 text-slate-500">{subtitle || description}</p>}
      </div>
      {(action || children) && <div className="flex gap-2 flex-shrink-0">{action}{children}</div>}
    </div>;
}
function StatCard({
  title,
  value,
  icon,
  trend,
  trendColor = "emerald",
  isLoading,
  iconBg = "blue"
}) {
  const iconBgs = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600"
  };
  const trendColors = {
    emerald: "text-emerald-600",
    red: "text-red-500",
    amber: "text-amber-600",
    blue: "text-blue-600"
  };
  return <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          {isLoading ? <div className="h-9 w-20 bg-slate-100 rounded-lg animate-pulse mt-1" /> : <h3 className="text-3xl font-bold text-slate-900">{value}</h3>}
          {trend && !isLoading && <p className={cn("mt-2 text-sm font-medium", trendColors[trendColor])}>{trend}</p>}
        </div>
        <div className={cn("p-3 rounded-xl flex-shrink-0", iconBgs[iconBg])}>
          {icon}
        </div>
      </div>
    </Card>;
}
function EmptyState({ icon, title, description, action }) {
  return <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-slate-100 rounded-2xl text-slate-300 mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs mb-4">{description}</p>}
      {action}
    </div>;
}
function ErrorAlert({ message, title = "Error" }) {
  return <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold">{title}: </span>
        <span>{message}</span>
      </div>
    </div>;
}
function SuccessAlert({ message, title = "Success" }) {
  return <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-start gap-2.5">
      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold">{title}: </span>
        <span>{message}</span>
      </div>
    </div>;
}
function InfoAlert({ message, title }) {
  return <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 flex items-start gap-2.5">
      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>
        {title && <span className="font-semibold">{title}: </span>}
        <span>{message}</span>
      </div>
    </div>;
}
function WarningAlert({ message, title }) {
  return <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 flex items-start gap-2.5">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>
        {title && <span className="font-semibold">{title}: </span>}
        <span>{message}</span>
      </div>
    </div>;
}
function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-100", className)} />;
}
function TableSkeleton({ rows = 5, cols = 5 }) {
  return <>
      {Array.from({ length: rows }).map((_, i) => <tr key={i} className="border-b border-slate-100">
          {Array.from({ length: cols }).map((_2, j) => <td key={j} className="px-5 py-4">
              <Skeleton className={cn("h-4", j === 0 ? "w-24" : j === cols - 1 ? "w-16" : "w-full")} />
            </td>)}
        </tr>)}
    </>;
}
function LoadingPage({ message = "Loading..." }) {
  return <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>;
}
function StepProgress({ steps, currentStep }) {
  return <div className="flex items-center gap-0">
      {steps.map((step, i) => <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div className={cn(
    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
    i < currentStep ? "bg-emerald-500 border-emerald-500 text-white" : i === currentStep ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400"
  )}>
              {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn("text-xs mt-1 whitespace-nowrap hidden sm:block", i <= currentStep ? "text-slate-700 font-medium" : "text-slate-400")}>{step}</span>
          </div>
          {i < steps.length - 1 && <div className={cn("h-0.5 flex-1 mx-1 min-w-[20px]", i < currentStep ? "bg-emerald-400" : "bg-slate-200")} />}
        </React.Fragment>)}
    </div>;
}
export {
  Badge,
  Button,
  Card,
  DetailRow,
  Drawer,
  EmptyState,
  ErrorAlert,
  FormField,
  InfoAlert,
  Input,
  Label,
  LoadingPage,
  Modal,
  PageHeader,
  PriorityBadge,
  SectionTitle,
  Select,
  Skeleton,
  StatCard,
  StatusBadge,
  StepProgress,
  SuccessAlert,
  TableSkeleton,
  Textarea,
  WarningAlert
};
