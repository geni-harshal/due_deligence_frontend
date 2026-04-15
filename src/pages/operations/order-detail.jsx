import { Fragment, useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import {
  useGetOperationsOrder,
  useFetchComprehensiveReportData,
  useSaveAnalystEnrichment,
  useRunDecisionModels,
  useGeneratePdfReport,
  usePublishOrder,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, StatusBadge, PriorityBadge, Label, Textarea, Input } from "@/components/ui-shared";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Users,
  Scale,
  FileText,
  Save,
  Play,
  FileOutput,
  Send,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Shield,
  Loader2,
  RefreshCw,
  Plus,
  X,
  MapPin,
  Landmark,
  Network,
  BarChart3,
  PieChart,
  CreditCard,
  Gavel,
  BookOpen,
  Activity,
  BadgeAlert,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Star,
  Phone,
  Hash,
  FileSearch,
  Layers,
  GitBranch,
  DollarSign,
} from "lucide-react";

/* ═══ Helpers ═══ */
const fmt = (n) => {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-IN");
};
const fmtCr = (n) => {
  if (n == null || n === 0) return "—";
  const a = Math.abs(n);
  if (a >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (a >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${fmt(n)}`;
};
const fmtPct = (n) => (n != null ? `${Number(n).toFixed(2)}%` : "—");
const money2 = (n) =>
  n == null || n === "" || Number.isNaN(Number(n))
    ? "—"
    : Number(n).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const pct2 = (n) =>
  n == null || n === "" || Number.isNaN(Number(n)) ? "—" : Number(n).toFixed(2);

const cr2 = (n) =>
  n == null || n === "" || Number.isNaN(Number(n))
    ? "—"
    : (Number(n) / 1e7).toFixed(2);

const fyEndLabel = (fy) => {
  if (!fy) return "—";
  const v = String(fy).includes("-") ? String(fy) : `${fy}-03-31`;
  return formatDate(v);
};
const monthYearLabel = (v) => {
  if (!v) return "—";
  const s = String(v).trim();
  const m = s.match(/^([A-Za-z]{3})-(\d{2})$/);
  if (m) {
    const mon = `${m[1].slice(0, 1).toUpperCase()}${m[1].slice(1).toLowerCase()}`;
    const yy = Number(m[2]);
    const yyyy = yy >= 70 ? 1900 + yy : 2000 + yy;
    return `${mon}, ${yyyy}`;
  }
  return s;
};
const safe = (obj, ...path) => {
  let v = obj;
  for (const k of path) {
    if (v == null) return null;
    v = v[k];
  }
  return v;
};
const arr = (v) => (Array.isArray(v) ? v : []);
const txt = (v) => (v != null && v !== "" && v !== "null" ? String(v) : "—");
const cleanText = (v) =>
  txt(v)
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function KV({ label, value, mono }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 min-w-[160px] shrink-0 font-medium">{label}</span>
      <span className={`text-sm text-slate-800 break-all ${mono ? "font-mono" : ""}`}>{txt(value)}</span>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function Sec({ id, icon: Icon, title, count, refs }) {
  return (
    <h2
      ref={(el) => {
        if (refs) refs.current[id] = el;
      }}
      className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4 pt-2 scroll-mt-4"
    >
      <Icon className="w-5 h-5 text-blue-600" /> {title}
      {count != null && count > 0 && <span className="text-sm font-normal text-slate-400 ml-1">({count})</span>}
    </h2>
  );
}

function Tbl({ headers, children }) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${h.right ? "text-right" : "text-left"
                  }`}
              >
                {h.label || h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

function Badge({ text, color = "slate" }) {
  const c = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c[color] || c.slate}`}>{text}</span>;
}

function ShowMore({ items, render, n = 10, label = "items" }) {
  const [all, setAll] = useState(false);
  if (!items?.length) return null;
  const vis = all ? items : items.slice(0, n);
  const elements = vis.map(render);
  if (items.length > n) {
    elements.push(
      <tr key="show-more">
        <td colSpan={99} className="text-center py-3">
          <button
            onClick={() => setAll(!all)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {all ? "Show less" : `Show ${items.length - n} more ${label}`}
          </button>
        </td>
      </tr>
    );
  }
  return <>{elements}</>;
}

function Empty({ text = "No data available" }) {
  return <p className="text-slate-400 text-sm py-4">{text}</p>;
}
function prettyKey(key = "") {
  return String(key)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderAutoSection(value) {
  if (value == null) return <Empty />;

  // array table
  if (Array.isArray(value)) {
    if (!value.length) return <Empty />;

    const first = value[0];

    if (typeof first === "object" && first !== null) {
      const cols = Object.keys(first);

      return (
        <Tbl headers={cols.map(prettyKey)}>
          {value.map((row, i) => (
            <tr key={i}>
              {cols.map((col) => (
                <td key={col} className="px-4 py-2">
                  {typeof row[col] === "object"
                    ? JSON.stringify(row[col])
                    : txt(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </Tbl>
      );
    }

    return (
      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="text-sm text-slate-700">
            {txt(v)}
          </div>
        ))}
      </div>
    );
  }

  // object key-value
  if (typeof value === "object") {
    return (
      <div className="space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <KV
            key={k}
            label={prettyKey(k)}
            value={typeof v === "object" ? JSON.stringify(v) : txt(v)}
          />
        ))}
      </div>
    );
  }

  return <KV label="Value" value={txt(value)} />;
}
/* ═══ Nested Sidebar Definition (from PDF ToC) ═══ */
const SECTIONS = [
  { id: "keyStats", label: "Key Statistics", icon: Building2 },
  { id: "about", label: "About The Company", icon: BookOpen },
  { id: "industry", label: "Industry And Segment(s)", icon: Building2 },
  { id: "principal", label: "Principal Business Activities", icon: Building2 },
  { id: "nameHistory", label: "Name History", icon: GitBranch },
  {
    id: "standalone",
    label: "Standalone Financial Data",
    icon: BarChart3,
    children: [
      { id: "standalone-bs", label: "Balance Sheet", icon: BarChart3 },
      { id: "standalone-pl", label: "Profit & Loss", icon: BarChart3 },
      { id: "standalone-pl-schedule", label: "Profit & Loss - Key Schedule", icon: BarChart3 },
      { id: "standalone-cf", label: "Cash Flow", icon: BarChart3 },
      { id: "standalone-ratios", label: "Ratios", icon: BarChart3 },
    ],
  },
  {
    id: "consolidated",
    label: "Consolidated Financial Data",
    icon: BarChart3,
    children: [
      { id: "consolidated-bs", label: "Balance Sheet", icon: BarChart3 },
      { id: "consolidated-pl", label: "Profit & Loss", icon: BarChart3 },
      { id: "consolidated-pl-schedule", label: "Profit & Loss - Key Schedule", icon: BarChart3 },
      { id: "consolidated-cf", label: "Cash Flow", icon: BarChart3 },
      { id: "consolidated-ratios", label: "Ratios", icon: BarChart3 },
    ],
  },
  {
    id: "auditors",
    label: "Auditor(s)",
    icon: Users,
    children: [
      { id: "auditors-standalone", label: "Standalone", icon: Users },
      { id: "auditors-consolidated", label: "Consolidated", icon: Users },
    ],
  },
  { id: "finParams", label: "Financial Parameters", icon: FileSearch },
  { id: "rpt", label: "Related Party Transactions", icon: GitBranch },
  { id: "msme", label: "MSME Supplier Payment Delays", icon: DollarSign },
  { id: "finDisputes", label: "Legal Cases of Financial Dispute - Summary", icon: Gavel },
  {
    id: "structure",
    label: "Structure",
    icon: PieChart,
    children: [
      {
        id: "shareholding-pattern",
        label: "Share Holding Pattern",
        icon: PieChart,
        children: [
          { id: "promoters", label: "Promoters", icon: Users },
          { id: "public", label: "Public / Other Than Promoters", icon: Users },
        ],
      },
      { id: "director-shareholding", label: "Directors Shareholding", icon: Users },
      { id: "shareholding-5", label: "Shareholding more than 5%", icon: PieChart },
      { id: "securities", label: "Securities Allotment", icon: CreditCard },
      {
        id: "related-corporates",
        label: "Related Corporates",
        icon: Layers,
        children: [
          { id: "holding-corp", label: "Holding Corporates", icon: Layers },
          { id: "subsidiary-corp", label: "Subsidiary Corporates", icon: Layers },
          { id: "associate-corp", label: "Associate Corporates", icon: Layers },
          { id: "joint-ventures", label: "Joint Ventures", icon: Layers },
        ],
      },
    ],
  },
  { id: "directors", label: "Directors", icon: Users },
  { id: "director-assoc", label: "Director - Association History", icon: Users },
  { id: "other-directorships", label: "Other Directorships", icon: Network },
  {
    id: "charge-details",
    label: "Charge Details",
    icon: Landmark,
    children: [
      { id: "open-charges", label: "Open Charges Sequence", icon: Landmark },
      { id: "satisfied-charges", label: "Satisfied Charges Sequence", icon: Landmark },
      { id: "open-charges-events", label: "Open Charges Latest Events with Details", icon: Landmark },
    ],
  },
  { id: "peerComparison", label: "Peer Comparison", icon: TrendingUp },
  {
    id: "auditors-comments",
    label: "Auditors' Comments",
    icon: FileText,
    children: [
      { id: "audit-comments-standalone", label: "Standalone", icon: FileText },
      { id: "audit-comments-consolidated", label: "Consolidated", icon: FileText },
    ],
  },
  {
    id: "gst",
    label: "GST",
    icon: Scale,
    children: [{ id: "active-gstins", label: "Active GSTINs", icon: Scale }],
  },
  {
    id: "legal-history",
    label: "Legal History",
    icon: Gavel,
    children: [
      { id: "cases-against", label: "Cases Filed Against this Corporate", icon: Gavel },
      { id: "cases-by", label: "Cases Filed By this Corporate", icon: Gavel },
      { id: "cases-consolidation", label: "Cases for Consolidation of Corporate Affairs", icon: Gavel },
      { id: "probable-cases", label: "Probable Cases", icon: Gavel },
      { id: "unverified-court", label: "Unverified Court Records", icon: Gavel },
    ],
  },
  { id: "creditRatings", label: "Credit Ratings", icon: Star },
  { id: "unacceptedRatings", label: "Unaccepted Ratings", icon: Star },
  {
    id: "compliance",
    label: "Compliance",
    icon: Shield,
    children: [
      { id: "struckOff", label: "Incidents of Name Removal U/S 248(5) by ROC", icon: Shield },
      { id: "bifr", label: "BIFR History", icon: AlertTriangle },
      { id: "cdr", label: "Corporate Debt Restructuring (CDR) History", icon: AlertTriangle },
      { id: "defaulters", label: "Suit Filed Cases as per Bureaus", icon: BadgeAlert },
    ],
  },
  { id: "epfo", label: "Establishments Registered with EPFO", icon: Briefcase },
  {
    id: "annexure",
    label: "Annexure",
    icon: BookOpen,
    children: [
      { id: "annex-standalone-bs", label: "Annexure - Standalone BS", icon: BarChart3 },
      { id: "annex-standalone-pl", label: "Annexure - Standalone P&L", icon: BarChart3 },
      { id: "annex-standalone-pl-schedule", label: "Annexure - Standalone P&L Schedule", icon: BarChart3 },
      { id: "annex-standalone-cf", label: "Annexure - Standalone Cash Flow", icon: BarChart3 },
      { id: "annex-standalone-ratios", label: "Annexure - Standalone Ratios", icon: BarChart3 },
      { id: "annex-consolidated-bs", label: "Annexure - Consolidated BS", icon: BarChart3 },
      { id: "annex-consolidated-pl", label: "Annexure - Consolidated P&L", icon: BarChart3 },
      { id: "annex-consolidated-pl-schedule", label: "Annexure - Consolidated P&L Schedule", icon: BarChart3 },
      { id: "annex-consolidated-cf", label: "Annexure - Consolidated Cash Flow", icon: BarChart3 },
      { id: "annex-consolidated-ratios", label: "Annexure - Consolidated Ratios", icon: BarChart3 },
      { id: "annex-finParams", label: "Annexure - Financial Parameters", icon: FileSearch },
      { id: "annex-rpt", label: "Annexure - Related Party Transactions", icon: GitBranch },
      { id: "annex-finDisputes", label: "Annexure - Financial Dispute", icon: Gavel },
      { id: "annex-shareholding-5", label: "Annexure - Shareholding > 5%", icon: PieChart },
      { id: "annex-related-corporates", label: "Annexure - Related Corporates", icon: Layers },
      { id: "annex-gst-active", label: "Annexure - GST Active Filing Details", icon: Scale },
      { id: "annex-gst-inactive", label: "Annexure - GST Inactive Filing Details", icon: Scale },
      { id: "annex-credit-ratings", label: "Annexure - Credit Ratings", icon: Star },
      { id: "annex-epfo-payment", label: "Annexure - EPFO Payment Details", icon: Briefcase },
    ],
  },
];

/* ═══ Recursive Sidebar Item ═══ */
function SidebarItem({ item, active, onSelect, depth = 0 }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = active === item.id;

  return (
    <div className="w-full">
      <button
        onClick={() => {
          if (hasChildren) {
            setOpen(!open);
            if (item.id === "structure") onSelect(item.id);
            return;
          }
          onSelect(item.id);
        }}
        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${isActive
          ? "bg-blue-600 text-white font-semibold shadow-sm"
          : "text-slate-600 hover:bg-slate-200/60"
          }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <item.icon className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left truncate">{item.label}</span>
        {hasChildren && <span className="text-[10px]">{open ? "▼" : "▶"}</span>}
      </button>
      {hasChildren && open && (
        <div className="mt-0.5">
          {item.children.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              active={active}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══ Company Data Panel with PDF-style sections ═══ */
function CompanyDataPanel({ report: r }) {
  const [active, setActive] = useState("keyStats");
  const refs = useRef({});
  const scrollTo = (id) => {
    setActive(id);
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  if (!r) return null;

  const co = r.company || {};
  const regAddr = co.registered_address || {};
  const busAddr = co.business_address || {};
  const lei = co.lei || {};
  const contact = r.contact_details || {};
  const desc = r.description || {};
  const allFins = arr(r.financials);
  const consFinsFromRoot = arr(r.consolidated_financials);
  const fins = allFins.filter((f) => String(f?.nature || "").toUpperCase() !== "CONSOLIDATED");
  const consFins = consFinsFromRoot.length
    ? consFinsFromRoot
    : allFins.filter((f) => String(f?.nature || "").toUpperCase() === "CONSOLIDATED");
  const finParams = arr(r.financial_parameters).filter(
    (f) => String(f?.nature || "").toUpperCase() !== "CONSOLIDATED"
  );
  const legalHistory = arr(r.legal_history);
  const casesAgainst = legalHistory.filter((c) => c?.case_type === "Cases Filed Against This Corporate");
  const casesBy = legalHistory.filter((c) => c?.case_type === "Cases Filed By This Corporate");
  const standaloneAuditors = fins
    .map((f) => ({
      year: f?.year,
      auditor_name: safe(f, "auditor", "auditor_name"),
      firm_name: safe(f, "auditor", "auditor_firm_name"),
      pan: safe(f, "auditor", "pan"),
      address: safe(f, "auditor", "address"),
    }))
    .filter((a) => a.auditor_name || a.firm_name || a.pan || a.address);
  const consolidatedAuditors = consFins
    .map((f) => ({
      year: f?.year,
      auditor_name: safe(f, "auditor", "auditor_name"),
      firm_name: safe(f, "auditor", "auditor_firm_name"),
      pan: safe(f, "auditor", "pan"),
      address: safe(f, "auditor", "address"),
    }))
    .filter((a) => a.auditor_name || a.firm_name || a.pan || a.address);
  const directorAssocRows = arr(r.authorized_signatories).flatMap((d) =>
    arr(d?.association_history).map((h) => ({
      name: d?.name,
      din: d?.din,
      designation: d?.designation,
      ...h,
    }))
  );

  const joinStatus = (value, status) => {
    if (value == null || value === "" || value === "null") return "—";
    return status && String(status).trim() ? `${value} (${status})` : String(value);
  };

  // ✅ dynamic years from API
  const years = [...new Set(fins.map((f) => String(f.year)))]
    .sort((a, b) => String(a).localeCompare(String(b)));
  const financialYears = years.slice(-3);

  const financialColSpan = financialYears.length + 1;
  const getValAny = (paths) =>
    financialYears.map((y) => {
      const fin = fins.find((f) => String(f.year) === String(y));
      if (!fin) return null;
      for (const p of paths) {
        const v = safe(fin, ...p);
        if (v != null) return v;
      }
      return null;
    });

  // Helper to render a row in the financial tables
  const renderRow = (label, values, format = fmt) => (
    <tr>
      <td className="px-4 py-2">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-2">{v != null ? format(v) : "—"}</td>
      ))}
    </tr>
  );

  const sumSeries = (...seriesList) =>
    financialYears.map((_, i) =>
      seriesList.reduce((sum, s) => {
        const n = Number(s?.[i]);
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0)
    );

  // Balance Sheet items
  const shareCapital = getValAny([["bs", "liabilities", "share_capital"]]);
  const reserves = getValAny([["bs", "liabilities", "reserves_and_surplus"], ["bs", "liabilities", "reserves_surplus"]]);
  const shareApplicationMoney = getValAny([["bs", "liabilities", "share_application_money_pending_allotment"]]);
  const minorityInterest = getValAny([["bs", "liabilities", "minority_interest"]]);
  const moneyReceivedAgainstShareWarrants = getValAny([["bs", "liabilities", "money_received_against_share_warrants"]]);
  const deferredGovernmentGrants = getValAny([["bs", "liabilities", "deferred_government_grants"]]);
  const otherEquity = sumSeries(shareApplicationMoney, minorityInterest, moneyReceivedAgainstShareWarrants, deferredGovernmentGrants);
  const totalEquity = getValAny([["bs", "subTotals", "total_equity"], ["bs", "liabilities", "total_equity"]]);
  const longTermBorrowings = getValAny([["bs", "liabilities", "long_term_borrowings"]]);
  const netDeferredTaxLiabilities = getValAny([["bs", "liabilities", "deferred_tax_liabilities_net"]]);
  const otherLongTermLiabilities = getValAny([["bs", "liabilities", "other_long_term_liabilities"]]);
  const longTermProvisions = getValAny([["bs", "liabilities", "long_term_provisions"]]);
  const totalNonCurrentLiabilities = getValAny([["bs", "subTotals", "total_non_current_liabilities"]]);
  const shortTermBorrowings = getValAny([["bs", "liabilities", "short_term_borrowings"]]);
  const tradePayables = getValAny([["bs", "liabilities", "trade_payables"]]);
  const otherCurrentLiabilities = getValAny([["bs", "liabilities", "other_current_liabilities"]]);
  const shortTermProvisions = getValAny([["bs", "liabilities", "short_term_provisions"]]);
  const totalCurrentLiabilities = getValAny([["bs", "subTotals", "total_current_liabilities"], ["bs", "liabilities", "current_liabilities", "total"]]);
  const totalEquityLiab = getValAny([["bs", "liabilities", "given_liabilities_total"], ["bs", "total"]]);
  const tangibleAssets = getValAny([["bs", "assets", "tangible_assets"]]);
  const intangibleAssets = getValAny([["bs", "assets", "intangible_assets"]]);
  const totalNetFixedAssets = getValAny([["bs", "subTotals", "net_fixed_assets"], ["bs", "assets", "net_fixed_assets", "total"]]);
  const capitalWip = getValAny([["bs", "subTotals", "capital_wip"], ["bs", "assets", "tangible_assets_capital_work_in_progress"]]);
  const nonCurrentInvestments = getValAny([["bs", "assets", "noncurrent_investments"]]);
  const deferredTaxAssetsNet = getValAny([["bs", "assets", "deferred_tax_assets_net"]]);
  const longTermLoansAndAdvances = getValAny([["bs", "assets", "long_term_loans_and_advances"]]);
  const otherNonCurrentAssets = getValAny([["bs", "assets", "other_noncurrent_assets"]]);
  const totalOtherNonCurrentAssets = getValAny([["bs", "subTotals", "total_other_non_current_assets"]]);
  const currentInvestments = getValAny([["bs", "assets", "current_investments"]]);
  const inventories = getValAny([["bs", "assets", "inventories"]]);
  const tradeReceivables = getValAny([["bs", "assets", "trade_receivables"]]);
  const cashAndBankBalances = getValAny([["bs", "assets", "cash_and_bank_balances"]]);
  const shortTermLoansAndAdvances = getValAny([["bs", "assets", "short_term_loans_and_advances"]]);
  const otherCurrentAssets = getValAny([["bs", "assets", "other_current_assets"]]);
  const totalCurrentAssets = getValAny([["bs", "subTotals", "total_current_assets"], ["bs", "assets", "current_assets", "total"]]);
  const totalAssets = getValAny([["bs", "assets", "given_assets_total"], ["bs", "assets", "total"]]);

  // P&L items
  const netRevenue = getValAny([["pnl", "lineItems", "net_revenue"]]);
  const costOfMaterialsConsumed = getValAny([["pnl", "lineItems", "total_cost_of_materials_consumed"]]);
  const purchasesOfStockInTrade = getValAny([["pnl", "lineItems", "total_purchases_of_stock_in_trade"]]);
  const changesInInventories = getValAny([["pnl", "lineItems", "total_changes_in_inventories_or_finished_goods"]]);
  const employeeBenefit = getValAny([["pnl", "lineItems", "total_employee_benefit_expense"], ["pnl", "lineItems", "employee_benefit_expense"]]);
  const otherExpenses = getValAny([["pnl", "lineItems", "total_other_expenses"], ["pnl", "lineItems", "other_expenses"]]);
  const totalOperatingCost = getValAny([["pnl", "subTotals", "total_operating_cost"], ["pnl", "lineItems", "total_operating_cost"]]);
  const operatingProfit = getValAny([["pnl", "lineItems", "operating_profit"]]);
  const depreciationAndAmortization = getValAny([["pnl", "lineItems", "depreciation"]]);
  const otherIncome = getValAny([["pnl", "lineItems", "other_income"]]);
  const profitBeforeInterestAndTax = getValAny([["pnl", "lineItems", "profit_before_interest_and_tax"]]);
  const financeCosts = getValAny([["pnl", "lineItems", "interest"]]);
  const profitBeforeTaxExceptional = getValAny([["pnl", "lineItems", "profit_before_tax_and_exceptional_items_before_tax"]]);
  const exceptionalItemsBeforeTax = getValAny([["pnl", "lineItems", "exceptional_items_before_tax"]]);
  const incomeTax = getValAny([["pnl", "lineItems", "income_tax"]]);
  const profitBeforeTax = getValAny([["pnl", "lineItems", "profit_before_tax"]]);
  const profitContinuingOperations = getValAny([["pnl", "lineItems", "profit_for_period_from_continuing_operations"]]);
  const profitDiscontinuingOperations = getValAny([["pnl", "lineItems", "profit_from_discontinuing_operation_after_tax"]]);
  const minorityInterestAndAssociates = getValAny([["pnl", "lineItems", "minority_interest_and_profit_from_associates_and_joint_ventures"]]);
  const profitAfterTax = getValAny([["pnl", "lineItems", "profit_after_tax"]]);

  // P&L Key Schedule
  const managerialRem = getValAny([["pnl_key_schedule", "managerial_remuneration"]]);
  const paymentAuditors = getValAny([["pnl_key_schedule", "payment_to_auditors"]]);
  const insuranceExpenses = getValAny([["pnl_key_schedule", "insurance_expenses"]]);
  const powerFuel = getValAny([["pnl_key_schedule", "power_and_fuel"]]);

  // Cash Flow
  const cfProfitBeforeTax = getValAny([["cash_flow", "profit_before_tax"]]);
  const cfAdjFinCostDep = getValAny([["cash_flow", "adjustment_for_finance_cost_and_depreciation"]]);
  const cfAdjAssets = getValAny([["cash_flow", "adjustment_for_current_and_non_current_assets"]]);
  const cfAdjLiabilities = getValAny([["cash_flow", "adjustment_for_current_and_non_current_liabilities"]]);
  const cfOtherAdjOperating = getValAny([["cash_flow", "other_adjustments_in_operating_activities"]]);
  const cfOperating = getValAny([["cash_flow", "cash_flows_from_used_in_operating_activities"]]);
  const cfOutflowPurchaseAssets = getValAny([["cash_flow", "cash_outflow_from_purchase_of_assets"]]);
  const cfInflowSaleAssets = getValAny([["cash_flow", "cash_inflow_from_sale_of_assets"]]);
  const cfIncomeFromAssets = getValAny([["cash_flow", "income_from_assets"]]);
  const cfOtherAdjInvesting = getValAny([["cash_flow", "other_adjustments_in_investing_activities"]]);
  const cfInvesting = getValAny([["cash_flow", "cash_flows_from_used_in_investing_activities"]]);
  const cfOutflowRepayment = getValAny([["cash_flow", "cash_outflow_from_repayment_of_capital_and_borrowings"]]);
  const cfInflowRaising = getValAny([["cash_flow", "cash_inflow_from_raisng_capital_and_borrowings"]]);
  const cfInterestDivPaid = getValAny([["cash_flow", "interest_and_dividends_paid"]]);
  const cfOtherAdjFinancing = getValAny([["cash_flow", "other_adjustments_in_financing_activities"]]);
  const cfFinancing = getValAny([["cash_flow", "cash_flows_from_used_in_financing_activities"]]);
  const cfBeforeFx = getValAny([["cash_flow", "incr_decr_in_cash_cash_equv_before_effect_of_excg_rate_changes"]]);
  const cfAdjustmentsToCashEq = getValAny([["cash_flow", "adjustments_to_cash_and_cash_equivalents"]]);
  const cfNetIncreaseDecrease = getValAny([["cash_flow", "incr_decr_in_cash_cash_equv"]]);
  const cfEndCash = getValAny([["cash_flow", "cash_flow_statement_at_end_of_period"], ["cash_flow", "cash_and_cash_equivalents_at_end_of_period"]]);

  // Ratios
  const revGrowth = getValAny([["ratios", "revenue_growth"]]);
  const grossProfitMargin = getValAny([["ratios", "gross_profit_margin"]]);
  const ebitdaMargin = getValAny([["ratios", "ebitda_margin"]]);
  const netMargin = getValAny([["ratios", "net_margin"]]);
  const returnOnEquity = getValAny([["ratios", "return_on_equity"]]);
  const returnOnCapitalEmployed = getValAny([["ratios", "return_on_capital_employed"]]);
  const debtRatio = getValAny([["ratios", "debt_ratio"]]);
  const debtEquity = getValAny([["ratios", "debt_by_equity"], ["ratios", "debt_to_equity"]]);
  const interestCoverageRatio = getValAny([["ratios", "interest_coverage_ratio"]]);
  const currentRatio = getValAny([["ratios", "current_ratio"]]);
  const quickRatio = getValAny([["ratios", "quick_ratio"]]);
  const inventoryBySalesDays = getValAny([["ratios", "inventory_by_sales_days"]]);
  const debtorsBySalesDays = getValAny([["ratios", "debtors_by_sales_days"]]);
  const payablesBySalesDays = getValAny([["ratios", "payables_by_sales_days"]]);
  const cashConversionCycleDays = getValAny([["ratios", "cash_conversion_cycle"]]);
  const salesByNetFixedAssets = getValAny([["ratios", "sales_by_net_fixed_assets"]]);

  /* ── Consolidated data ── */
  const consYears = consFins.map((cf) => cf.year).sort((a, b) => String(a).localeCompare(String(b))).slice(-3);
  const getConsVal = (year, path) => {
    const cf = consFins.find((f) => f.year === year);
    return cf ? safe(cf, ...path) : null;
  };
  const consValAny = (year, paths) => {
    for (const p of paths) {
      const v = getConsVal(year, p);
      if (v != null) return v;
    }
    return null;
  };
  const consRow = (label, path, format = fmt) => (
    <tr>
      <td className="px-4 py-2">{label}</td>
      {consYears.map((yr, i) => (
        <td key={i} className="px-4 py-2">{getConsVal(yr, path) != null ? format(getConsVal(yr, path)) : "—"}</td>
      ))}
    </tr>
  );

  const consRowAny = (label, paths, format = fmt) => (
    <tr>
      <td className="px-4 py-2">{label}</td>
      {consYears.map((yr, i) => {
        const v = consValAny(yr, paths);
        return <td key={i} className="px-4 py-2">{v != null ? format(v) : "—"}</td>;
      })}
    </tr>
  );

  /* ── Render function for each section based on active id ── */
  const renderRelatedPartyTransactions = ({ latestOnly = true } = {}) => {
    const data = arr(r.related_party_transactions);
    if (!data.length) return <Empty />;
    const ordered = data
      .slice()
      .sort((a, b) => String(b?.financial_year || "").localeCompare(String(a?.financial_year || "")));
    const list = latestOnly ? ordered.slice(0, 1) : ordered;

    const buckets = [
      { key: "company", label: "Company" },
      { key: "individual", label: "Individuals" },
      { key: "others", label: "Others" },
    ];

    return (
      <div className="space-y-5">
        {latestOnly && <p className="text-xs text-slate-500">See Annexure for Past Year(s) Related Party Transactions</p>}
        {list.map((fy, idx) => (
          <div key={idx} className="space-y-4">
            {!latestOnly && (
              <h3 className="text-sm font-semibold text-slate-700">FY Ending On {fyEndLabel(fy?.financial_year)}</h3>
            )}
            {buckets.map((b) =>
              arr(fy?.[b.key]).length ? (
                <div key={b.key}>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">{b.label}</h3>
                  <Tbl headers={["Name", "Relationship", "Transaction Type", "Amount (Rs. INR)"]}>
                    {arr(fy?.[b.key])
                      .slice()
                      .sort((a, b) => {
                        const byName = String(a?.legal_name || a?.name || "").localeCompare(String(b?.legal_name || b?.name || ""));
                        if (byName !== 0) return byName;
                        const rank = { Others: 1, Revenue: 2, Expense: 3 };
                        return (rank[a?.type_of_transaction] || 99) - (rank[b?.type_of_transaction] || 99);
                      })
                      .map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">{txt(row?.legal_name || row?.name)}</td>
                        <td className="px-4 py-2">{txt(row?.relationship)}</td>
                        <td className="px-4 py-2">{txt(row?.type_of_transaction)}</td>
                        <td className="px-4 py-2">{row?.amount != null && row?.amount !== "****" ? money2(row.amount) : txt(row?.amount)}</td>
                      </tr>
                    ))}
                  </Tbl>
                </div>
              ) : null
            )}
          </div>
        ))}
      </div>
    );
  };

const renderMsme = () => {
  const latest = r?.msme_supplier_payment_delays?.delays_for_period || {};
  const delays = arr(latest.delays);

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <KV label="Latest Period" value={latest.latest_period} />
        <KV
          label="Total Amount Due (INR)"
          value={latest.total_amount_due_for_period != null ? money2(latest.total_amount_due_for_period) : null}
        />
      </div>

      {delays.length ? (
        <Tbl headers={["Supplier Name", "PAN", "Amount Due (Rs. INR)"]}>
          {delays.map((d, i) => (
            <tr key={i}>
              <td className="px-4 py-2">{txt(d?.supplier_name)}</td>
              <td className="px-4 py-2 font-mono">{txt(d?.supplier_pan)}</td>
              <td className="px-4 py-2">{d?.amount_due != null ? money2(d.amount_due) : "—"}</td>
            </tr>
          ))}
        </Tbl>
      ) : (
        <Empty />
      )}
    </div>
  );
};

  const renderFinancialParameters = () => {
    if (!finParams.length) return <Empty />;

    const extractYear = (v) => {
      if (v == null) return null;
      const m = String(v).match(/\d{4}/);
      return m ? m[0] : null;
    };

    const getRptYearSum = (year) => {
      const rptRow = arr(r.related_party_transactions).find(
        (x) => extractYear(x?.financial_year) === year
      );
      if (!rptRow) return null;
      const buckets = ["company", "llp", "individual", "others"];
      let total = 0;
      let hasNumber = false;
      buckets.forEach((b) => {
        arr(rptRow[b]).forEach((it) => {
          const n = Number(it?.amount);
          if (Number.isFinite(n)) {
            total += n;
            hasNumber = true;
          }
        });
      });
      return hasNumber ? total : null;
    };

    const getParamValues = (key, fallbackFn) =>
      financialYears.map((y) => {
        const year = extractYear(y);
        const row = finParams.find((f) => extractYear(f?.year) === year);
        const direct = row ? row[key] : null;
        if (direct != null && direct !== "" && direct !== "null") return direct;
        return typeof fallbackFn === "function" ? fallbackFn(year) : null;
      });

    const paramRows = [
      { label: "Income in foreign currency", values: getParamValues("earning_fc") },
      { label: "Expense in foreign currency", values: getParamValues("expenditure_fc") },
      { label: "Employee benefit expense", values: getParamValues("employee_benefit_expense") },
      { label: "Number of employees", values: getParamValues("number_of_employees") },
      {
        label: "Gross value of the transaction with the related parties as per AS-18",
        values: getParamValues("transaction_related_parties_as_18", getRptYearSum),
      },
      { label: "Gross fixed assets (including intangible assets)", values: getParamValues("gross_fixed_assets") },
      { label: "Trade receivables exceeding six months", values: getParamValues("trade_receivable_exceeding_six_months") },
      { label: "Proposed dividend", values: getParamValues("proposed_dividend") },
      { label: "Prescribed CSR expenditure", values: getParamValues("prescribed_csr_expenditure") },
      { label: "Total amount spent on CSR for the financial year", values: getParamValues("total_amount_csr_spent_for_financial_year") },
    ];

    const formatParamCell = (v) => {
      if (v == null || v === "" || v === "null") return "—";
      if (typeof v === "number") return fmt(v);
      if (typeof v === "boolean") return v ? "Yes" : "No";
      return String(v);
    };

    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-500">See Annexure for Past Year(s) Financial Parameters</p>
        <Tbl headers={["Parameter (Rs. INR)", ...financialYears]}>
          {paramRows.map((row, i) => (
            <tr key={i}>
              <td className="px-4 py-2">{row.label}</td>
              {row.values.map((v, j) => (
                <td key={j} className="px-4 py-2">{formatParamCell(v)}</td>
              ))}
            </tr>
          ))}
        </Tbl>
      </div>
    );
  };

  const renderFinancialDisputes = () => {
    const receivable = arr(r?.legal_cases_of_financial_disputes?.receivable);

    const grouped = receivable.reduce((acc, row) => {
      const k = String(row?.type_of_financial_dispute || "Others")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      if (!acc[k]) {
        acc[k] = {
          type: k,
          disallowed: 0,
          decided: 0,
          other: 0,
        };
      }
      const verdict = String(row?.verdict || "").toLowerCase();
      if (/disallow|dismiss|reject/.test(verdict)) acc[k].disallowed += 1;
      else if (/allow|decid|dispose|judg/.test(verdict)) acc[k].decided += 1;
      else acc[k].other += 1;
      return acc;
    }, {});

    const rows = Object.values(grouped);
    const total = rows.reduce(
      (t, r0) => ({
        disallowed: t.disallowed + r0.disallowed,
        decided: t.decided + r0.decided,
        other: t.other + r0.other,
      }),
      { disallowed: 0, decided: 0, other: 0 }
    );

    return (
      <div className="space-y-5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Amount Payable</h3>
          <p className="text-sm text-slate-600">
            As per our records, there are no legal cases of financial dispute where amount is payable by this corporate.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Amount Receivable</h3>
          <Tbl headers={["Type of Financial Dispute", "Amount Entitled to Receive", "Disallowed Claims", "Decided Cases", "Other Cases"]}>
            <tr className="bg-slate-100 font-semibold">
              <td className="px-4 py-2">Total</td>
              <td className="px-4 py-2">—</td>
              <td className="px-4 py-2">{total.disallowed || "—"}</td>
              <td className="px-4 py-2">{total.decided || "—"}</td>
              <td className="px-4 py-2">{total.other || "—"}</td>
            </tr>
            {rows.map((x, i) => (
              <tr key={i}>
                <td className="px-4 py-2">{txt(x.type)}</td>
                <td className="px-4 py-2">—</td>
                <td className="px-4 py-2">{x.disallowed || "—"}</td>
                <td className="px-4 py-2">{x.decided || "—"}</td>
                <td className="px-4 py-2">{x.other || "—"}</td>
              </tr>
            ))}
          </Tbl>
        </div>
      </div>
    );
  };

const renderStructureSummary = () => {
  const summary = arr(r.shareholdings_summary)[0] || {};
  const promoterEq = arr(r.shareholdings).find(
    (s) =>
      String(s?.shareholders || "").toLowerCase() === "promoter" &&
      String(s?.category || "").toLowerCase() === "equity"
  );
  const publicEq = arr(r.shareholdings).find(
    (s) =>
      String(s?.shareholders || "").toLowerCase() === "public" &&
      String(s?.category || "").toLowerCase() === "equity"
  );

  return (
    <Tbl
      headers={[
        "Promoter %",
        "Public %",
        "No. of Shareholders",
        "Total Equity Shares",
        "Total Preference Shares",
      ]}
    >
      <tr>
        <td className="px-4 py-2">{pct2(promoterEq?.total_percentage_of_shares)}</td>
        <td className="px-4 py-2">{pct2(publicEq?.total_percentage_of_shares)}</td>
        <td className="px-4 py-2">
          {summary.total != null ? `${summary.total} [Promoter(s) ${summary.promoter ?? summary.total}]` : "—"}
        </td>
        <td className="px-4 py-2">{summary.total_equity_shares != null ? fmt(summary.total_equity_shares) : "—"}</td>
        <td className="px-4 py-2">{summary.total_preference_shares != null ? fmt(summary.total_preference_shares) : "—"}</td>
      </tr>
    </Tbl>
  );
};

const renderShareholdingPatternTable = (equityRow, preferenceRow, title) => {
  const categories = [
    { label: "Individual / Hindu Undivided Family", group: true },
    { label: "(i) Indian", field: "indian_held" },
    { label: "(ii) Non-resident Indian (others)", field: "nri_held" },
    { label: "(iii) Foreign national (other than NRI)", field: "foreign_held_other_than_nri" },
    { label: "Government", group: true },
    { label: "(i) Central Government", field: "central_government_held" },
    { label: "(ii) State Government", field: "state_government_held" },
    { label: "(iii) Government companies", field: "government_company_held" },
    { label: "Insurance companies", field: "insurance_company_held" },
    { label: "Banks", field: "bank_held" },
    { label: "Financial institutions", field: "financial_institutions_held" },
    { label: "Foreign institutional investors", field: "financial_institutions_investors_held" },
    { label: "Mutual funds", field: "mutual_funds_held" },
    { label: "Venture capital", field: "venture_capital_held" },
    { label: "Body corporate (not mentioned above)", field: "body_corporate_held" },
    { label: "Others", field: "others_held" },
    { label: "Total", field: "total", bold: true },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <Tbl
        headers={[
          "Category",
          "Equity Number of Shares",
          "Equity Percentage",
          "Preference Number of Shares",
          "Preference Percentage",
        ]}
      >
        {categories.map((item, i) => {
          if (item.group) {
            return (
              <tr key={`group-${i}`} className="bg-slate-50">
                <td className="px-4 py-2 font-semibold text-slate-700" colSpan={5}>
                  {item.label}
                </td>
              </tr>
            );
          }

          const eqNo = equityRow?.[`${item.field}_no_of_shares`];
          const eqPct = equityRow?.[`${item.field}_percentage_of_shares`];
          const prNo = preferenceRow?.[`${item.field}_no_of_shares`];
          const prPct = preferenceRow?.[`${item.field}_percentage_of_shares`];

          return (
            <tr key={`${item.field}-${i}`} className={item.bold ? "font-semibold" : ""}>
              <td className="px-4 py-2 pl-6">{item.label}</td>
              <td className="px-4 py-2">{eqNo != null ? fmt(eqNo) : "—"}</td>
              <td className="px-4 py-2">{eqPct != null ? pct2(eqPct) : "—"}</td>
              <td className="px-4 py-2">{prNo != null ? fmt(prNo) : "—"}</td>
              <td className="px-4 py-2">{prPct != null ? pct2(prPct) : "—"}</td>
            </tr>
          );
        })}
      </Tbl>
    </div>
  );
};

const renderShareholdingPattern = () => {
  const rows = arr(r.shareholdings);
  const promoterEq = rows.find(
    (s) =>
      String(s?.shareholders || "").toLowerCase() === "promoter" &&
      String(s?.category || "").toLowerCase() === "equity"
  );
  const promoterPref = rows.find(
    (s) =>
      String(s?.shareholders || "").toLowerCase() === "promoter" &&
      String(s?.category || "").toLowerCase() === "preference"
  );
  const publicEq = rows.find(
    (s) =>
      String(s?.shareholders || "").toLowerCase() === "public" &&
      String(s?.category || "").toLowerCase() === "equity"
  );
  const publicPref = rows.find(
    (s) =>
      String(s?.shareholders || "").toLowerCase() === "public" &&
      String(s?.category || "").toLowerCase() === "preference"
  );

  const fyLabel = fyEndLabel(arr(r.shareholdings_summary)[0]?.financial_year || promoterEq?.financial_year || publicEq?.financial_year);

  return (
    <div className="space-y-6">
      {renderStructureSummary()}
      {renderShareholdingPatternTable(promoterEq, promoterPref, `Promoters - ${fyLabel}`)}
      {renderShareholdingPatternTable(publicEq, publicPref, `Public / Other Than Promoters - ${fyLabel}`)}
    </div>
  );
};

const renderDirectorShareholding = () => {
  const order = [
    "SANJIV GARG",
    "PRITHAVI RAJ JINDAL",
    "RITU SHARMA",
    "AJAY BHATIA",
    "ANUPMA KASHYAP",
    "MANDAVI SHARMA",
    "SUNIL KUMAR JAIN",
    "SMINU JINDAL",
  ];
  const rows = arr(r.director_shareholdings)
    .slice()
    .sort((a, b) => {
      const ia = order.indexOf(String(a?.full_name || "").toUpperCase());
      const ib = order.indexOf(String(b?.full_name || "").toUpperCase());
      if (ia === -1 && ib === -1) return String(a?.full_name || "").localeCompare(String(b?.full_name || ""));
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  if (!rows.length) return <Empty />;

  return (
    <Tbl headers={["Name", "Designation", "Shareholding (%)", "Number of Shares", "Cessation Date"]}>
      {rows.map((row, i) => (
        <tr key={i}>
          <td className="px-4 py-2">{txt(row?.full_name)}</td>
          <td className="px-4 py-2">{txt(row?.designation)}</td>
          <td className="px-4 py-2">{row?.percentage_holding != null ? pct2(row.percentage_holding) : "—"}</td>
          <td className="px-4 py-2">{row?.no_of_shares != null ? fmt(row.no_of_shares) : "—"}</td>
          <td className="px-4 py-2">{row?.date_of_cessation ? formatDate(row.date_of_cessation) : "-"}</td>
        </tr>
      ))}
    </Tbl>
  );
};

const renderDirectors = () => {
  const rows = arr(r.authorized_signatories).slice();
  if (!rows.length) return <Empty />;
  rows.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  return (
    <Tbl headers={["Director Name", "Designation", "DIN", "P.D.A.D", "O.A.D", "Cessation Date", "Flags"]}>
      {rows.map((row, i) => (
        <tr key={i}>
          <td className="px-4 py-2">{txt(row?.name)}</td>
          <td className="px-4 py-2">{txt(row?.designation)}</td>
          <td className="px-4 py-2 font-mono">{txt(row?.din)}</td>
          <td className="px-4 py-2">{row?.date_of_appointment_for_current_designation ? formatDate(row.date_of_appointment_for_current_designation) : "-"}</td>
          <td className="px-4 py-2">{row?.date_of_appointment ? formatDate(row.date_of_appointment) : "-"}</td>
          <td className="px-4 py-2">{row?.date_of_cessation ? formatDate(row.date_of_cessation) : "-"}</td>
          <td className="px-4 py-2">-</td>
        </tr>
      ))}
    </Tbl>
  );
};

const renderShareholdingMoreThan5 = () => {
  const latest = arr(r.shareholdings_more_than_five_percent)
    .slice()
    .sort((a, b) => String(b?.financial_year || "").localeCompare(String(a?.financial_year || "")))[0];

  if (!latest) return <Empty />;

  const companyEntities = arr(r?.holding_entities?.company);
  const dinLookup = new Map(
    arr(r.authorized_signatories).map((x) => [String(x?.name || "").trim().toUpperCase(), x?.din || null])
  );

  const companyRows = arr(latest.company).map((x) => {
    const match = companyEntities.find((c) => String(c?.legal_name || "").trim() === String(x?.name || "").trim());
    return { ...x, match };
  });

  const renderCompanyTable = (rows) =>
    rows.length ? (
      <Tbl
        headers={[
          "Corporate Name",
          "*SH (%)",
          "City",
          "*PUC (Rs. Cr.)",
          "*SOC (Rs. Cr.)",
          "*Date of Incorp.",
          "Status",
        ]}
      >
        {rows.map((row, i) => (
          <tr key={i}>
            <td className="px-4 py-2">
              {txt(row?.name)}
              {row?.match?.cin ? <div className="text-xs text-slate-500 font-mono">({row.match.cin})</div> : null}
            </td>
            <td className="px-4 py-2">{row?.shareholding_percentage != null ? pct2(row.shareholding_percentage) : "—"}</td>
            <td className="px-4 py-2">{txt(row?.match?.city)}</td>
            <td className="px-4 py-2">{row?.match?.paid_up_capital != null ? cr2(row.match.paid_up_capital) : "—"}</td>
            <td className="px-4 py-2">{row?.match?.sum_of_charges != null ? cr2(row.match.sum_of_charges) : "—"}</td>
            <td className="px-4 py-2">{row?.match?.incorporation_date ? formatDate(row.match.incorporation_date) : "—"}</td>
            <td className="px-4 py-2">{txt(row?.match?.status)}</td>
          </tr>
        ))}
      </Tbl>
    ) : null;

  const renderPersonTable = (rows) =>
    rows.length ? (
      <Tbl headers={["Name", "Shareholding (%)", "Country", "Remarks"]}>
        {rows.map((row, i) => {
          const hasDin = !!dinLookup.get(String(row?.name || "").trim().toUpperCase());
          return (
            <tr key={i}>
              <td className="px-4 py-2">{txt(row?.name)}</td>
              <td className="px-4 py-2">{row?.shareholding_percentage != null ? pct2(row.shareholding_percentage) : "—"}</td>
              <td className="px-4 py-2">-</td>
              <td className="px-4 py-2">{hasDin ? "Person holding DIN" : "—"}</td>
            </tr>
          );
        })}
      </Tbl>
    ) : null;

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">See Annexure for Past Year(s) Share Holding Data</p>
      <p className="text-xs text-slate-500">
        *SH = Shareholding  *PUC = Paid Up Capital  *SOC = Sum of Charges  *Date of Incorp. = Date of Incorporation
      </p>
      {companyRows.length ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Company</h3>
          {renderCompanyTable(companyRows)}
        </div>
      ) : null}
      {arr(latest.individual).length ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Individuals</h3>
          {renderPersonTable(arr(latest.individual))}
        </div>
      ) : null}
    </div>
  );
};

const renderRelatedCorporateGroup = (group) => {
  const data = group || {};
  const companyRows = arr(data.company);
  const llpRows = arr(data.llp);
  const otherRows = arr(data.others);

  const inferCountry = (row) => {
    const direct = row?.country || row?.country_name;
    if (direct) return direct;
    if (/LLC/i.test(String(row?.legal_name || row?.name || ""))) return "-";
    return "-";
  };

  const renderCompanyTable = (rows) =>
    rows.length ? (
      <Tbl
        headers={[
          "Corporate Name",
          "*SH (%)",
          "City",
          "*PUC (Rs. Cr.)",
          "*SOC (Rs. Cr.)",
          "*Date of Incorp.",
          "Status",
        ]}
      >
        {rows.map((row, i) => (
          <tr key={i}>
            <td className="px-4 py-2">{txt(row?.legal_name)}</td>
            <td className="px-4 py-2">{row?.share_holding_percentage != null ? pct2(row.share_holding_percentage) : "—"}</td>
            <td className="px-4 py-2">{txt(row?.city)}</td>
            <td className="px-4 py-2">{row?.paid_up_capital != null ? cr2(row.paid_up_capital) : "—"}</td>
            <td className="px-4 py-2">{row?.sum_of_charges != null ? cr2(row.sum_of_charges) : "—"}</td>
            <td className="px-4 py-2">{row?.incorporation_date ? formatDate(row.incorporation_date) : "—"}</td>
            <td className="px-4 py-2">{txt(row?.status)}</td>
          </tr>
        ))}
      </Tbl>
    ) : null;

  const renderOtherTable = (rows) =>
    rows.length ? (
      <Tbl headers={["Corporate Name", "Shareholding (%)", "Country", "Remarks"]}>
        {rows.map((row, i) => (
          <tr key={i}>
            <td className="px-4 py-2">{txt(row?.legal_name || row?.name)}</td>
            <td className="px-4 py-2">{row?.share_holding_percentage != null ? pct2(row.share_holding_percentage) : "—"}</td>
            <td className="px-4 py-2">{inferCountry(row)}</td>
            <td className="px-4 py-2">{row?.legal_name ? "A foreign entity" : "—"}</td>
          </tr>
        ))}
      </Tbl>
    ) : null;

  return (
    <div className="space-y-5">
      {renderCompanyTable(companyRows)}
      {renderOtherTable(llpRows)}
      {renderOtherTable(otherRows)}
    </div>
  );
};

  const renderDirectorNetwork = () => {
    const rows = arr(r.director_network).flatMap((d) =>
      arr(d?.network?.companies).map((c) => ({
        director_name: d?.name,
        director_din: d?.din,
        ...c,
      }))
    );
    if (!rows.length) return <Empty />;
    return (
      <Tbl headers={["Director", "DIN", "Company", "CIN", "Designation", "City", "Company Status"]}>
        <ShowMore
          items={rows}
          n={30}
          label="records"
          render={(row, i) => (
            <tr key={i}>
              <td className="px-4 py-2">{txt(row.director_name)}</td>
              <td className="px-4 py-2 font-mono">{txt(row.director_din)}</td>
              <td className="px-4 py-2">{txt(row.legal_name)}</td>
              <td className="px-4 py-2 font-mono">{txt(row.cin)}</td>
              <td className="px-4 py-2">{txt(row.designation)}</td>
              <td className="px-4 py-2">{txt(row.city)}</td>
              <td className="px-4 py-2">{txt(row.company_status)}</td>
            </tr>
          )}
        />
      </Tbl>
    );
  };

  const renderDirectorAssociationHistory = () => {
    const rows = arr(r.authorized_signatories).filter((x) => arr(x?.association_history).length > 0);
    if (!rows.length) return <Empty />;

    return (
      <div className="space-y-6">
        {rows.map((d, idx) => (
          <div key={`${d?.din || d?.name}-${idx}`} className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">
              {txt(d?.name)} {d?.din ? `( DIN : ${d.din} )` : ""}
            </h3>
            <Tbl headers={["Designation", "Appointment Date", "Cessation Date"]}>
              {arr(d.association_history).map((h, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">{txt(h?.designation_after_event || h?.designation)}</td>
                  <td className="px-4 py-2">{h?.event_date ? formatDate(h.event_date) : "-"}</td>
                  <td className="px-4 py-2">-</td>
                </tr>
              ))}
            </Tbl>
          </div>
        ))}
      </div>
    );
  };

  const renderOtherDirectorships = () => {
    const directors = arr(r.director_network).filter((d) => arr(d?.network?.companies).length > 0);
    if (!directors.length) return <Empty />;

    return (
      <div className="space-y-7">
        {directors.map((d, idx) => (
          <div key={`${d?.din || d?.name}-${idx}`} className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">
              {txt(d?.name)} {d?.din ? `( DIN : ${d.din} )` : ""} - Company:
            </h3>
            <Tbl
              headers={[
                "Corporate Name",
                "*PUC (Rs. Cr.)",
                "*SOC (Rs. Cr.)",
                "*Date of Incorp.",
                "Status",
                "Appointment Date",
                "Cessation Date",
              ]}
            >
              {arr(d?.network?.companies).map((c, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">{txt(c?.legal_name)}</td>
                  <td className="px-4 py-2">{c?.paid_up_capital != null ? cr2(c.paid_up_capital) : "—"}</td>
                  <td className="px-4 py-2">{c?.sum_of_charges != null ? cr2(c.sum_of_charges) : "—"}</td>
                  <td className="px-4 py-2">{c?.incorporation_date ? formatDate(c.incorporation_date) : "-"}</td>
                  <td className="px-4 py-2">{txt(c?.active_compliance || c?.company_status)}</td>
                  <td className="px-4 py-2">{c?.date_of_appointment ? formatDate(c.date_of_appointment) : "-"}</td>
                  <td className="px-4 py-2">{c?.date_of_cessation ? formatDate(c.date_of_cessation) : "-"}</td>
                </tr>
              ))}
            </Tbl>
          </div>
        ))}
      </div>
    );
  };

  const byDateDesc = (a, b) => {
    const da = a?.date ? Date.parse(a.date) : 0;
    const db = b?.date ? Date.parse(b.date) : 0;
    return db - da;
  };

  const renderChargeSequence = (rows, { stripPropertyCols = false } = {}) => {
    const data = arr(rows).slice();
    if (!data.length) return <Empty />;
    const groups = new Map();
    data.forEach((row) => {
      const id = String(row?.charge_id || row?.id || "");
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push(row);
    });
    const groupedRows = [...groups.values()].map((rows0) => rows0.slice().sort(byDateDesc));

    return (
      <Tbl
        headers={[
          "Sl. No.",
          "Charge ID",
          "Status",
          "Date",
          "Filing Date",
          "Holder Name",
          "Amount (Rs. INR)",
          ...(stripPropertyCols ? [] : ["Property Type", "No. of Holders"]),
        ]}
      >
        {groupedRows.flatMap((groupRows, groupIdx) =>
          groupRows.map((c, rowIdx) => (
            <tr key={`${groupIdx}-${rowIdx}`}>
              <td className="px-4 py-2">{rowIdx === 0 ? `${groupIdx + 1}.` : ""}</td>
              <td className="px-4 py-2">{rowIdx === 0 ? txt(c?.charge_id || c?.id) : ""}</td>
              <td className="px-4 py-2">{txt(c?.status || c?.type)}</td>
              <td className="px-4 py-2">{c?.date ? formatDate(c.date) : "-"}</td>
              <td className="px-4 py-2">{c?.filing_date ? formatDate(c.filing_date) : "-"}</td>
              <td className="px-4 py-2">{txt(c?.holder_name)}</td>
              <td className="px-4 py-2">{c?.amount != null ? money2(c.amount) : "—"}</td>
              {!stripPropertyCols && <td className="px-4 py-2">{txt(c?.property_type)}</td>}
              {!stripPropertyCols && (
                <td className="px-4 py-2">{txt(c?.number_of_holder || c?.number_of_chargeholder)}</td>
              )}
            </tr>
          ))
        )}
      </Tbl>
    );
  };

  const renderOpenChargesLatestEvents = () => {
    const rows = arr(r.open_charges_latest_event);
    if (!rows.length) return <Empty />;

    const detailRows = [
      ["Property Type", "property_type"],
      ["No. of Holders", "number_of_chargeholder"],
      ["Instrument Description", "instrument_description"],
      ["Rate of Interest", "rate_of_interest"],
      ["Terms of Payment", "terms_of_payment"],
      ["Property Particulars", "property_particulars"],
      ["Extent and Operation", "extent_and_operation"],
      ["Other Terms", "other_terms"],
      ["Modification Particulars", "modification_particulars"],
      ["Joint Holding", "joint_holding"],
      ["Consortium Holding", "consortium_holding"],
    ];

    return (
      <div className="space-y-6">
        {rows.map((c, idx) => (
          <div key={`${c?.id || c?.charge_id}-${idx}`} className="space-y-3">
            {renderChargeSequence([c], { stripPropertyCols: true })}
            <Tbl headers={["Field", "Details"]}>
              {detailRows.map(([label, key]) => (
                <tr key={key}>
                  <td className="px-4 py-2 font-medium">{label}</td>
                  <td className="px-4 py-2">{txt(c?.[key])}</td>
                </tr>
              ))}
            </Tbl>
          </div>
        ))}
      </div>
    );
  };

  const renderGst = () => {
    const gstRows = arr(r.gst_details);
    if (!gstRows.length) return <Empty />;
    const activeRows = gstRows.filter((g) => String(g?.status || "").toLowerCase() === "active");
    const inactiveRows = gstRows.filter((g) => String(g?.status || "").toLowerCase() !== "active");
    const latestFiling = (g) =>
      arr(g?.filings)
        .slice()
        .sort((a, b) => String(b?.date_of_filing || "").localeCompare(String(a?.date_of_filing || "")))[0];
    return (
      <div className="space-y-6">
        <p className="text-xs text-slate-500">
          * Filing after the due date is considered only for GSTR1 and GSTR3B forms.
        </p>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Active GSTINs</h3>
          <Tbl headers={["GSTIN", "State", "Latest Filing(s)", "Financial Year", "Tax Period", ""]}>
            {activeRows.map((g, i) => {
              const f = latestFiling(g);
              return (
                <tr key={i}>
                  <td className="px-4 py-2 font-mono">{txt(g?.gstin)}</td>
                  <td className="px-4 py-2">{txt(g?.state)}</td>
                  <td className="px-4 py-2">
                    {f ? `${txt(f?.return_type)} ${f?.date_of_filing ? formatDate(f.date_of_filing) : ""}`.trim() : "—"}
                  </td>
                  <td className="px-4 py-2">{txt(f?.financial_year)}</td>
                  <td className="px-4 py-2">{txt(f?.tax_period)}</td>
                  <td className="px-4 py-2 text-blue-700 text-xs">See Annexure for Filing Details</td>
                </tr>
              );
            })}
          </Tbl>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Inactive GSTINs</h3>
          <Tbl headers={["GSTIN", "Status", "State", ""]}>
            {inactiveRows.map((g, i) => (
              <tr key={i}>
                <td className="px-4 py-2 font-mono">
                  {txt(g?.gstin)}
                  {String(g?.filing_timeliness || "").toLowerCase().includes("after due")
                    ? " (Filed After Due Date in last 12 months)"
                    : ""}
                </td>
                <td className="px-4 py-2">{txt(g?.status)}</td>
                <td className="px-4 py-2">{txt(g?.state)}</td>
                <td className="px-4 py-2 text-blue-700 text-xs">See Annexure for Filing Details</td>
              </tr>
            ))}
          </Tbl>
        </div>
      </div>
    );
  };

  const renderGstFilingDetails = (status = "active") => {
    const rows = arr(r.gst_details).filter((g) =>
      status === "active"
        ? String(g?.status || "").toLowerCase() === "active"
        : String(g?.status || "").toLowerCase() !== "active"
    );
    if (!rows.length) return <Empty />;

    return (
      <div className="space-y-6">
        {rows.map((g, i) => (
          <div key={`${g?.gstin}-${i}`} className="space-y-3">
            <Tbl headers={["GSTIN", "State", "Latest Filing(s)", "Financial Year", "Tax Period"]}>
              {arr(g?.filings).slice(0, 10).map((f, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 font-mono">{txt(g?.gstin)}</td>
                  <td className="px-4 py-2">{txt(g?.state)}</td>
                  <td className="px-4 py-2">{txt(f?.return_type)}</td>
                  <td className="px-4 py-2">{txt(f?.financial_year)}</td>
                  <td className="px-4 py-2">{txt(f?.tax_period)}</td>
                </tr>
              ))}
            </Tbl>
          </div>
        ))}
      </div>
    );
  };

  const renderEpfo = () => {
    const rows = arr(r.establishments_registered_with_epfo);
    if (!rows.length) return <Empty />;
    return (
      <Tbl
        headers={[
          "Establishment ID",
          "Establishment Name",
          "City",
          "Latest Wage Month",
          "Latest Date of Credit",
          "No. of Employees",
          "Amount (Rs. INR)",
        ]}
      >
        {rows.map((e, i) => (
          <tr key={i}>
            <td className="px-4 py-2 font-mono">
              {txt(e?.establishment_id)}
              {e?.payment_timeliness ? <div className="text-xs text-slate-500 mt-1">({e.payment_timeliness})</div> : null}
            </td>
            <td className="px-4 py-2">{txt(e?.establishment_name)}</td>
            <td className="px-4 py-2">{txt(e?.city)}</td>
            <td className="px-4 py-2">{monthYearLabel(e?.latest_wage_month)}</td>
            <td className="px-4 py-2">{e?.latest_date_of_credit ? formatDate(e.latest_date_of_credit) : "—"}</td>
            <td className="px-4 py-2">{txt(e?.no_of_employees)}</td>
            <td className="px-4 py-2">{e?.amount != null ? money2(e.amount) : "—"}</td>
          </tr>
        ))}
      </Tbl>
    );
  };

  const renderPeerComparison = () => {
    const groups = arr(r.peer_comparison);
    if (!groups.length) return <Empty />;

    return (
      <div className="space-y-8">
        {groups.map((g, idx) => (
          <div key={`${g?.bizIndustry || "industry"}-${idx}`} className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Comparative Metrics</h3>
              <p className="text-xs text-slate-500 mb-2">
                Industry: {txt(g?.bizIndustry)} | Segment(s): {txt(g?.bizSegment)}
              </p>
              {(() => {
                const years = arr(g?.benchMarks)
                  .map((b) => String(b?.year || ""))
                  .filter(Boolean)
                  .sort((a, b) => Number(a) - Number(b));
                const byYear = new Map(arr(g?.benchMarks).map((b) => [String(b?.year), b]));
                const metrics = [
                  ["# of Peers in Sample", "no_of_peers_in_sample", null],
                  ["Revenue (Rs. Crore)", "revenue", "median_revenue"],
                  ["Revenue Growth (%)", "revenue_growth", "median_revenue_growth"],
                  ["EBITDA Margin (%)", "ebitda_margin", "median_ebitda_margin"],
                  ["Net Margin (%)", "net_margin", "median_net_margin"],
                  ["Return on Equity (%)", "return_on_equity", "median_return_on_equity"],
                  ["Debt / Equity", "debt_by_equity", "median_debt_by_equity"],
                  ["Inventory / Sales (Days)", "inventory_holding_period", "median_inventory_holding_period"],
                  ["Debtors / Sales (Days)", "debtor_days_outstanding", "median_debtor_days_outstanding"],
                  ["Payables / Sales (Days)", "trade_payable_days", "median_trade_payable_days"],
                  ["Cash Conversion Cycle (Days)", "cash_conversion_cycle", "median_cash_conversion_cycle"],
                  ["Sales / Net Fixed Assets", "sales_by_net_fixed_assets", "median_sales_by_net_fixed_assets"],
                ];
                const headers = ["Metrics", ...years.flatMap((y) => [`FY ${y} Actual Value`, `FY ${y} Median`])];
                return (
                  <Tbl headers={headers}>
                    {metrics.map(([label, actualKey, medianKey]) => (
                      <tr key={actualKey}>
                        <td className="px-4 py-2">{label}</td>
                        {years.map((y) => {
                          const row = byYear.get(y) || {};
                          const actual = row?.[actualKey];
                          const median = medianKey ? row?.[medianKey] : null;
                          return (
                            <Fragment key={`${actualKey}-${y}`}>
                              <td className="px-4 py-2">{actual != null ? txt(actual) : "—"}</td>
                              <td className="px-4 py-2">{medianKey ? (median != null ? txt(median) : "—") : "—"}</td>
                            </Fragment>
                          );
                        })}
                      </tr>
                    ))}
                  </Tbl>
                );
              })()}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">5 Closest Peers by Revenue</h3>
              <Tbl headers={["Legal Name", "City", "Revenue (Rs. INR)"]}>
                {arr(g?.peers).map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{txt(p?.legalName)}</td>
                    <td className="px-4 py-2">{txt(p?.city)}</td>
                    <td className="px-4 py-2">{p?.revenue != null ? money2(p.revenue) : "—"}</td>
                  </tr>
                ))}
              </Tbl>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAuditComments = (financialRows) => {
    const rows = arr(financialRows)
      .map((f) => ({
        year: f?.year,
        qualified: safe(f, "auditor_comments", "report_has_adverse_remarks"),
      }))
      .filter((x) => x.year)
      .sort((a, b) => String(b.year).localeCompare(String(a.year)))
      .slice(0, 3);

    if (!rows.length) return <Empty />;
    return (
      <Tbl
        headers={[
          "Financial Year",
          "Whether Auditors' Report has been Qualified or has any Reservations or Contains Adverse Remarks",
          "Comments Given By",
        ]}
      >
        {rows.map((x, i) => (
          <tr key={i}>
            <td className="px-4 py-2">{fyEndLabel(x.year)}</td>
            <td className="px-4 py-2">{x.qualified ? "Yes" : "No"}</td>
            <td className="px-4 py-2">-</td>
          </tr>
        ))}
      </Tbl>
    );
  };

  const renderLegalHistory = () => {
    const rows = arr(r.legal_history);
    const byType = (type) => rows.filter((x) => String(x?.case_type || "") === type);
    const against = byType("Cases Filed Against This Corporate");
    const byCorp = byType("Cases Filed By This Corporate");

    const block = (title, blockRows, respondentLabel, partyKey) => {
      const pending = blockRows.filter((x) => String(x?.case_status || "").toLowerCase() === "pending");
      const disposed = blockRows.filter((x) => String(x?.case_status || "").toLowerCase() !== "pending");
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Pending Cases</p>
            {pending.length ? (
              <Tbl headers={["Case Category", "Court", respondentLabel, "Case No.", "Date of Last Hearing"]}>
                {pending.map((x, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{txt(x?.case_category)}</td>
                    <td className="px-4 py-2">{txt(x?.court)}</td>
                    <td className="px-4 py-2">{cleanText(x?.[partyKey])}</td>
                    <td className="px-4 py-2">{txt(x?.case_number)}</td>
                    <td className="px-4 py-2">{x?.date ? formatDate(x.date) : "-"}</td>
                  </tr>
                ))}
              </Tbl>
            ) : (
              <p className="text-sm text-slate-600">There are no Pending Cases as per our records.</p>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Disposed Cases</p>
            {disposed.length ? (
              <Tbl headers={["Case Category", "Court", respondentLabel, "Case No.", "Date of Judgement"]}>
                {disposed.map((x, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{txt(x?.case_category)}</td>
                    <td className="px-4 py-2">{txt(x?.court)}</td>
                    <td className="px-4 py-2">{cleanText(x?.[partyKey])}</td>
                    <td className="px-4 py-2">{txt(x?.case_number)}</td>
                    <td className="px-4 py-2">{x?.date ? formatDate(x.date) : "-"}</td>
                  </tr>
                ))}
              </Tbl>
            ) : (
              <p className="text-sm text-slate-600">There are no Disposed Cases as per our records.</p>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {block("Cases Filed Against this Corporate", against, "Petitioner(s)", "petitioner")}
        {block("Cases Filed By this Corporate", byCorp, "Respondent(s)", "respondent")}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Cases for Consolidation of Corporate Affairs</h3>
          <p className="text-sm text-slate-600">
            There are no cases for consolidation of corporate affairs as per our records.
          </p>
        </div>
      </div>
    );
  };

  const renderCreditRatings = ({ latestOnly = false } = {}) => {
    const rows = arr(r.credit_ratings);
    if (!rows.length) return <Empty />;
    const baseRows = latestOnly
      ? (() => {
          const latestDate = rows
            .map((x) => x?.rating_date)
            .filter(Boolean)
            .sort((a, b) => String(b).localeCompare(String(a)))[0];
          return rows.filter((x) => String(x?.rating_date || "") === String(latestDate || ""));
        })()
      : rows;

    const groups = baseRows.reduce((acc, row) => {
      const key = `${String(row?.rating_agency || "").toUpperCase()}|${row?.rating_date || ""}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        {Object.entries(groups).map(([key, vals]) => {
          const [agency, date] = key.split("|");
          const label = `${agency || "Agency"} - ${date ? formatDate(date) : "—"}`;
          const flatRows = vals.flatMap((row) => {
            const details = arr(row?.rating_details);
            if (!details.length) return [row];
            return details.map((d) => ({ ...row, _detail: d }));
          });
          return (
            <div key={key} className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
              <Tbl headers={["Instrument", "Amount", "Currency", "Rating", "Action", "Outlook", "Remarks"]}>
                {flatRows.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{txt(row?.type_of_loan)}</td>
                    <td className="px-4 py-2">{row?.amount != null ? `${(Number(row.amount) / 1e7).toFixed(2)} INR Crore` : "—"}</td>
                    <td className="px-4 py-2">{txt(row?.currency)}</td>
                    <td className="px-4 py-2">{txt(row?._detail?.rating || row?.rating)}</td>
                    <td className="px-4 py-2">{txt(row?._detail?.action)}</td>
                    <td className="px-4 py-2">{txt(row?._detail?.outlook)}</td>
                    <td className="px-4 py-2">{txt(row?._detail?.remarks)}</td>
                  </tr>
                ))}
              </Tbl>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCompliance = () => (
    <div className="space-y-4 text-sm text-slate-700">
      <div>
        <p className="font-semibold text-slate-800">Incidents of Name Removal U/S 248(5) by ROC</p>
        <p>{txt(r?.struckoff248_details?.struck_off_status || "As per our records, this corporate name was never removed under section 248(5) by ROC.")}.</p>
      </div>
      <div>
        <p className="font-semibold text-slate-800">BIFR History</p>
        <p>This corporate has no BIFR Cases as per our records.</p>
      </div>
      <div>
        <p className="font-semibold text-slate-800">Corporate Debt Restructuring (CDR) History</p>
        <p>This corporate has no CDR History as per our records.</p>
      </div>
      <div>
        <p className="font-semibold text-slate-800">Suit Filed Cases as per Bureaus</p>
        <p>This corporate does not appear to have any Suit Filed Cases with the Bureaus' as per our records.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    const mappedActive =
      {
        "annex-standalone-bs": "standalone-bs",
        "annex-standalone-pl": "standalone-pl",
        "annex-standalone-pl-schedule": "standalone-pl-schedule",
        "annex-standalone-cf": "standalone-cf",
        "annex-standalone-ratios": "standalone-ratios",
        "annex-consolidated-bs": "consolidated-bs",
        "annex-consolidated-pl": "consolidated-pl",
        "annex-consolidated-pl-schedule": "consolidated-pl-schedule",
        "annex-consolidated-cf": "consolidated-cf",
        "annex-consolidated-ratios": "consolidated-ratios",
        "annex-finParams": "finParams",
        "annex-finDisputes": "finDisputes",
        "annex-shareholding-5": "shareholding-5",
        "annex-epfo-payment": "epfo",
      }[active] || active;

    switch (mappedActive) {
      case "keyStats":
        // Build full address strings
        const registeredFull = `${regAddr.address_line1 ? regAddr.address_line1 + ", " : ""}${regAddr.address_line2 ? regAddr.address_line2 + ", " : ""
          }${regAddr.city ? regAddr.city + ", " : ""}${regAddr.state ? regAddr.state + " - " : ""}${regAddr.pincode ? regAddr.pincode : ""
          }`.replace(/, $/, "");
        const businessFull = `${busAddr.address_line1 ? busAddr.address_line1 + ", " : ""}${busAddr.address_line2 ? busAddr.address_line2 + ", " : ""
          }${busAddr.city ? busAddr.city + ", " : ""}${busAddr.state ? busAddr.state + " - " : ""}${busAddr.pincode ? busAddr.pincode : ""
          }`.replace(/, $/, "");
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Registered Address</h3>
              <KV label="Full Address" value={registeredFull} />

              <h3 className="font-semibold text-slate-800 mt-4 mb-3">Business Address</h3>
              <KV label="Full Address" value={businessFull} />

              <h3 className="font-semibold text-slate-800 mt-4 mb-3">Contact Details</h3>
              {arr(contact.email).length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-semibold text-slate-700">Email</p>
                  <div className="space-y-1">
                    {arr(contact.email).map((e, i) => (
                      <div key={i} className="text-sm text-slate-800 font-mono">
                        {joinStatus(e.emailId, e.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {arr(contact.phone).length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700">Phone</p>
                  <div className="space-y-1">
                    {arr(contact.phone).map((p, i) => (
                      <div key={i} className="text-sm text-slate-800 font-mono">
                        {joinStatus(p.phoneNumber, p.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="font-semibold text-slate-800 mt-4 mb-3">LEI Details</h3>
              <KV label="LEI Code" value={lei.number} mono />
              <KV label="LEI Status" value={lei.status} />
              <KV label="Registration Date" value={lei.registration_date} />
              <KV label="Last Updated Date" value={lei.last_updated_date} />
              <KV label="Next Renewal Date" value={lei.next_renewal_date} />

              <h3 className="font-semibold text-slate-800 mt-4 mb-3">Other Statistics</h3>
              <KV label="Company Name" value={co.legal_name} />
              <KV label="CIN" value={co.cin} mono />
              <KV label="PAN" value={co.pan} mono />
              <KV label="Company Status" value={co.efiling_status} />
              <KV label="Active Compliance" value={co.active_compliance} />
              <KV label="Type of Entity" value={co.classification} />
              <KV label="Listing Status" value={co.status} />
              <KV label="Date of Incorporation" value={co.incorporation_date} />
              <KV label="Date of Last AGM" value={co.last_agm_date} />
              <KV label="Authorized Capital (INR)" value={fmt(co.authorized_capital)} />
              <KV label="Paid Up Capital (INR)" value={fmt(co.paid_up_capital)} />
              <KV label="Sum of Charges (INR)" value={fmt(co.sum_of_charges)} />
              <KV label="Website" value={co.website} />
              <KV label="Last Filing with ROC" value={co.last_filing_date} />
            </div>
          </div>
        );

      case "about":
        return (
          <div>
            <Sec id="about" icon={BookOpen} title="About The Company" refs={refs} />
            {desc.desc_thousand_char && (
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {desc.desc_thousand_char}
              </p>
            )}
          </div>
        );

      case "industry":
        return (
          <div>
            <Sec id="industry" icon={Building2} title="Industry And Segment(s)" refs={refs} />
            {arr(r.industry_segments).length > 0 ? (
              <Tbl headers={["Industry", "Segments"]}>
                {arr(r.industry_segments).map((s, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-medium">{txt(s.industry)}</td>
                    <td className="px-4 py-2">{arr(s.segments).join(", ") || "—"}</td>
                  </tr>
                ))}
              </Tbl>
            ) : (
              <Empty />
            )}
          </div>
        );

      case "principal":
        return (
          <div>
            <Sec id="principal" icon={Building2} title="Principal Business Activities" refs={refs} />
            {arr(r.principal_business_activities).length > 0 ? (
              <Tbl headers={["Year", "Activity Group", "Description", "% Turnover"]}>
                {arr(r.principal_business_activities).map((a, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{txt(a.year)}</td>
                    <td className="px-4 py-2">{txt(a.main_activity_group_code)}</td>
                    <td className="px-4 py-2">{txt(a.main_activity_group_description)}</td>
                    <td className="px-4 py-2">{txt(a.percentage_of_turnover)}</td>
                  </tr>
                ))}
              </Tbl>
            ) : (
              <Empty />
            )}
          </div>
        );

      case "nameHistory":
        return (
          <div>
            <Sec id="nameHistory" icon={GitBranch} title="Name History" refs={refs} />
            {arr(r.name_history).length > 0 ? (
              <Tbl headers={["Old Name", "Till Date"]}>
                {arr(r.name_history).map((n, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-medium">{txt(n.name)}</td>
                    <td className="px-4 py-2">{txt(n.date)}</td>
                  </tr>
                ))}
              </Tbl>
            ) : (
              <Empty />
            )}
          </div>
        );

      case "standalone-bs":
        return (
          <div>
            <Sec id="standalone-bs" icon={BarChart3} title="Balance Sheet" refs={refs} />
            <Tbl headers={["Particulars", ...financialYears]}>              {renderRow("Share Capital", shareCapital)}
              {renderRow("Reserves and Surplus", reserves)}
              {renderRow("Other Equity*", otherEquity)}
              {renderRow("Total Equity", totalEquity)}
              <tr className="bg-slate-100 font-semibold"><td colSpan={financialColSpan}>Non-current Liabilities</td></tr>
              {renderRow("Long Term Borrowings", longTermBorrowings)}
              {renderRow("Net Deferred Tax Liabilities", netDeferredTaxLiabilities)}
              {renderRow("Other Long Term Liabilities", otherLongTermLiabilities)}
              {renderRow("Long Term Provisions", longTermProvisions)}
              {renderRow("Total Non-current Liabilities", totalNonCurrentLiabilities)}
              <tr className="bg-slate-100 font-semibold"><td colSpan={financialColSpan}>Current Liabilities</td></tr>
              {renderRow("Short Term Borrowings", shortTermBorrowings)}
              {renderRow("Trade Payables", tradePayables)}
              {renderRow("Other Current Liabilities", otherCurrentLiabilities)}
              {renderRow("Short Term Provisions", shortTermProvisions)}
              {renderRow("Total Current Liabilities", totalCurrentLiabilities)}
              {renderRow("Total Equity and Liabilities", totalEquityLiab)}
              <tr className="bg-slate-100 font-semibold"><td colSpan={financialColSpan}>Non-current Assets</td></tr>
              {renderRow("Tangible Assets", tangibleAssets)}
              {renderRow("Intangible Assets", intangibleAssets)}
              {renderRow("Total Net Fixed Assets", totalNetFixedAssets)}
              {renderRow("Capital Work-in-progress", capitalWip)}
              {renderRow("Non-current Investments", nonCurrentInvestments)}
              {renderRow("Deferred Tax Assets (Net)", deferredTaxAssetsNet)}
              {renderRow("Long Term Loans and Advances", longTermLoansAndAdvances)}
              {renderRow("Other Non-current Assets", otherNonCurrentAssets)}
              {renderRow("Total Other Non-current Assets", totalOtherNonCurrentAssets)}
              <tr className="bg-slate-100 font-semibold"><td colSpan={financialColSpan}>Current Assets</td></tr>
              {renderRow("Current Investments", currentInvestments)}
              {renderRow("Inventories", inventories)}
              {renderRow("Trade Receivables", tradeReceivables)}
              {renderRow("Cash and Bank Balances", cashAndBankBalances)}
              {renderRow("Short Term Loans and Advances", shortTermLoansAndAdvances)}
              {renderRow("Other Current Assets", otherCurrentAssets)}
              {renderRow("Total Current Assets", totalCurrentAssets)}
              {renderRow("Total Assets", totalAssets)}
            </Tbl>
          </div>
        );

      case "standalone-pl":
        return (
          <div>
            <Sec id="standalone-pl" icon={BarChart3} title="Profit & Loss" refs={refs} />
            <Tbl headers={["Particulars", ...financialYears]}>              {renderRow("Net Revenue", netRevenue)}
              {renderRow("Cost of Materials Consumed", costOfMaterialsConsumed)}
              {renderRow("Purchases of Stock-in-trade", purchasesOfStockInTrade)}
              {renderRow("Changes in Inventories / Finished Goods", changesInInventories)}
              {renderRow("Employee Benefit Expense", employeeBenefit)}
              {renderRow("Other Expenses", otherExpenses)}
              {renderRow("Total Operating Cost", totalOperatingCost)}
              {renderRow("Operating Profit (EBITDA)", operatingProfit)}
              {renderRow("Depreciation and Amortization Expense", depreciationAndAmortization)}
              {renderRow("Other Income", otherIncome)}
              {renderRow("Profit Before Interest and Tax", profitBeforeInterestAndTax)}
              {renderRow("Finance Costs", financeCosts)}
              {renderRow("Profit Before Tax and Exceptional Items Before Tax", profitBeforeTaxExceptional)}
              {renderRow("Exceptional Items Before Tax", exceptionalItemsBeforeTax)}
              {renderRow("Income Tax", incomeTax)}
              {renderRow("Profit Before Tax", profitBeforeTax)}
              {renderRow("Profit for the Period from Continuing Operations", profitContinuingOperations)}
              {renderRow("Profit from Discontinuing Operations After Tax", profitDiscontinuingOperations)}
              {renderRow("Minority Interest and Profit from Associates and Joint Ventures", minorityInterestAndAssociates)}
              {renderRow("Profit After Tax", profitAfterTax)}
            </Tbl>
          </div>
        );

      case "standalone-pl-schedule":
        return (
          <div>
            <Sec id="standalone-pl-schedule" icon={BarChart3} title="Profit & Loss - Key Schedule" refs={refs} />
            <Tbl headers={["Particulars", ...financialYears]}>              {renderRow("Managerial Remuneration", managerialRem)}
              {renderRow("Payment to Auditors", paymentAuditors)}
              {renderRow("Insurance Expenses", insuranceExpenses)}
              {renderRow("Power and Fuel", powerFuel)}
            </Tbl>
          </div>
        );

      case "standalone-cf":
        return (
          <div>
            <Sec id="standalone-cf" icon={BarChart3} title="Cash Flow" refs={refs} />
            <Tbl headers={["Particulars", ...financialYears]}>              {renderRow("Profit Before Tax", cfProfitBeforeTax)}
              {renderRow("Adjustment for Finance Cost and Depreciation", cfAdjFinCostDep)}
              {renderRow("Adjustments for Current and Non-Current Assets", cfAdjAssets)}
              {renderRow("Adjustments for Current and Non-Current Liabilities", cfAdjLiabilities)}
              {renderRow("Other Adjustments in Operating Activities", cfOtherAdjOperating)}
              {renderRow("Cash Flows from Operating Activities", cfOperating)}
              {renderRow("Cash Outflow from Purchase of Assets", cfOutflowPurchaseAssets)}
              {renderRow("Cash Inflow from Sale of Assets", cfInflowSaleAssets)}
              {renderRow("Income from Assets", cfIncomeFromAssets)}
              {renderRow("Other Adjustments in Investing Activities", cfOtherAdjInvesting)}
              {renderRow("Cash Flows from Investing Activities", cfInvesting)}
              {renderRow("Cash Outflow from Repayment of Capital and Borrowings", cfOutflowRepayment)}
              {renderRow("Cash Inflow from Raising Capital and Borrowings", cfInflowRaising)}
              {renderRow("Interest and Dividends Paid", cfInterestDivPaid)}
              {renderRow("Other Adjustments in Financing Activities", cfOtherAdjFinancing)}
              {renderRow("Cash Flows from Financing Activities", cfFinancing)}
              {renderRow("Increase / (Decrease) in Cash Before FX", cfBeforeFx)}
              {renderRow("Adjustments to Cash and Cash Equivalents", cfAdjustmentsToCashEq)}
              {renderRow("Net Increase / (Decrease) in Cash and Cash Equivalents", cfNetIncreaseDecrease)}
              {renderRow("Cash and Cash Equivalents at End", cfEndCash)}
            </Tbl>
          </div>
        );

      case "standalone-ratios":
        return (
          <div>
            <Sec id="standalone-ratios" icon={BarChart3} title="Ratios" refs={refs} />
            <Tbl headers={["Ratio", ...financialYears]}>              {renderRow("Revenue Growth (%)", revGrowth, fmtPct)}
              {renderRow("Gross Profit Margin (%)", grossProfitMargin, fmtPct)}
              {renderRow("EBITDA Margin (%)", ebitdaMargin, fmtPct)}
              {renderRow("Net Margin (%)", netMargin, fmtPct)}
              {renderRow("Return on Equity (%)", returnOnEquity, fmtPct)}
              {renderRow("Return on Capital Employed (%)", returnOnCapitalEmployed, fmtPct)}
              {renderRow("Debt Ratio", debtRatio)}
              {renderRow("Debt / Equity", debtEquity)}
              {renderRow("Interest Coverage Ratio", interestCoverageRatio)}
              {renderRow("Current Ratio", currentRatio)}
              {renderRow("Quick Ratio", quickRatio)}
              {renderRow("Inventory / Sales (Days)", inventoryBySalesDays)}
              {renderRow("Debtors / Sales (Days)", debtorsBySalesDays)}
              {renderRow("Payables / Sales (Days)", payablesBySalesDays)}
              {renderRow("Cash Conversion Cycle (Days)", cashConversionCycleDays)}
              {renderRow("Sales / Net Fixed Assets", salesByNetFixedAssets)}
            </Tbl>
          </div>
        );

      case "consolidated-bs":
        if (!consFins.length) return <div><Sec id="consolidated-bs" icon={BarChart3} title="Consolidated Balance Sheet" refs={refs} /><Empty text="No consolidated data available" /></div>;
        return (
          <div>
            <Sec id="consolidated-bs" icon={BarChart3} title="Consolidated Balance Sheet" refs={refs} />
            <Tbl headers={["Particulars", ...consYears]}>
              <tr className="bg-slate-100 font-semibold"><td colSpan={consYears.length + 1}>Equity</td></tr>
              {consRow("Share Capital", ["bs", "liabilities", "share_capital"])}
              {consRowAny("Reserves and Surplus", [["bs", "liabilities", "reserves_and_surplus"], ["bs", "liabilities", "reserves_surplus"]])}
              {consRowAny("Other Equity*", [["bs", "liabilities", "share_application_money_pending_allotment"], ["bs", "liabilities", "minority_interest"], ["bs", "liabilities", "money_received_against_share_warrants"], ["bs", "liabilities", "deferred_government_grants"]])}
              {consRowAny("Total Equity", [["bs", "subTotals", "total_equity"], ["bs", "liabilities", "total_equity"]])}
              <tr className="bg-slate-100 font-semibold"><td colSpan={consYears.length + 1}>Non-current Liabilities</td></tr>
              {consRow("Long Term Borrowings", ["bs", "liabilities", "long_term_borrowings"])}
              {consRow("Net Deferred Tax Liabilities", ["bs", "liabilities", "deferred_tax_liabilities_net"])}
              {consRow("Other Long Term Liabilities", ["bs", "liabilities", "other_long_term_liabilities"])}
              {consRow("Long Term Provisions", ["bs", "liabilities", "long_term_provisions"])}
              {consRowAny("Total Non-current Liabilities", [["bs", "subTotals", "total_non_current_liabilities"]])}
              <tr className="bg-slate-100 font-semibold"><td colSpan={consYears.length + 1}>Current Liabilities</td></tr>
              {consRow("Short Term Borrowings", ["bs", "liabilities", "short_term_borrowings"])}
              {consRow("Trade Payables", ["bs", "liabilities", "trade_payables"])}
              {consRow("Other Current Liabilities", ["bs", "liabilities", "other_current_liabilities"])}
              {consRow("Short Term Provisions", ["bs", "liabilities", "short_term_provisions"])}
              {consRowAny("Total Current Liabilities", [["bs", "subTotals", "total_current_liabilities"]])}
              {consRowAny("Total Equity and Liabilities", [["bs", "liabilities", "given_liabilities_total"], ["bs", "total"]])}
              <tr className="bg-slate-100 font-semibold"><td colSpan={consYears.length + 1}>Net Fixed Assets</td></tr>
              {consRow("Tangible Assets", ["bs", "assets", "tangible_assets"])}
              {consRow("Intangible Assets", ["bs", "assets", "intangible_assets"])}
              {consRowAny("Total Net Fixed Assets", [["bs", "subTotals", "net_fixed_assets"], ["bs", "assets", "net_fixed_assets", "total"]])}
              {consRowAny("Capital Work-in-progress", [["bs", "subTotals", "capital_wip"], ["bs", "assets", "tangible_assets_capital_work_in_progress"]])}
              <tr className="bg-slate-100 font-semibold"><td colSpan={consYears.length + 1}>Other Non-current Assets</td></tr>
              {consRow("Non-current Investments", ["bs", "assets", "noncurrent_investments"])}
              {consRow("Net Deferred Tax Assets", ["bs", "assets", "deferred_tax_assets_net"])}
              {consRow("Long Term Loans and Advances", ["bs", "assets", "long_term_loans_and_advances"])}
              {consRow("Other Non-current Assets", ["bs", "assets", "other_noncurrent_assets"])}
              {consRowAny("Total Other Non-current Assets", [["bs", "subTotals", "total_other_non_current_assets"]])}
              <tr className="bg-slate-100 font-semibold"><td colSpan={consYears.length + 1}>Current Assets</td></tr>
              {consRow("Current Investments", ["bs", "assets", "current_investments"])}
              {consRow("Inventories", ["bs", "assets", "inventories"])}
              {consRow("Trade Receivables", ["bs", "assets", "trade_receivables"])}
              {consRow("Cash and Bank Balances", ["bs", "assets", "cash_and_bank_balances"])}
              {consRow("Short Term Loans and Advances", ["bs", "assets", "short_term_loans_and_advances"])}
              {consRow("Other Current Assets", ["bs", "assets", "other_current_assets"])}
              {consRowAny("Total Current Assets", [["bs", "subTotals", "total_current_assets"]])}
              {consRowAny("Total Assets", [["bs", "assets", "given_assets_total"], ["bs", "assets", "total"]])}
            </Tbl>
          </div>
        );

      case "consolidated-pl":
        if (!consFins.length) return <div><Sec id="consolidated-pl" icon={BarChart3} title="Consolidated Profit & Loss" refs={refs} /><Empty text="No consolidated data available" /></div>;
        return (
          <div>
            <Sec id="consolidated-pl" icon={BarChart3} title="Consolidated Profit & Loss" refs={refs} />
            <Tbl headers={["Particulars", ...consYears]}>
              {consRow("Net Revenue", ["pnl", "lineItems", "net_revenue"])}
              {consRow("Cost of Materials Consumed", ["pnl", "lineItems", "total_cost_of_materials_consumed"])}
              {consRow("Purchases of Stock-in-trade", ["pnl", "lineItems", "total_purchases_of_stock_in_trade"])}
              {consRow("Changes in Inventories / Finished Goods", ["pnl", "lineItems", "total_changes_in_inventories_or_finished_goods"])}
              {consRowAny("Employee Benefit Expense", [["pnl", "lineItems", "total_employee_benefit_expense"], ["pnl", "lineItems", "employee_benefit_expense"]])}
              {consRowAny("Other Expenses", [["pnl", "lineItems", "total_other_expenses"], ["pnl", "lineItems", "other_expenses"]])}
              {consRowAny("Total Operating Cost", [["pnl", "subTotals", "total_operating_cost"], ["pnl", "lineItems", "total_operating_cost"]])}
              {consRow("Operating Profit (EBITDA)", ["pnl", "lineItems", "operating_profit"])}
              {consRow("Depreciation and Amortization Expense", ["pnl", "lineItems", "depreciation"])}
              {consRow("Other Income", ["pnl", "lineItems", "other_income"])}
              {consRow("Profit Before Interest and Tax", ["pnl", "lineItems", "profit_before_interest_and_tax"])}
              {consRow("Finance Costs", ["pnl", "lineItems", "interest"])}
              {consRow("Profit Before Tax and Exceptional Items Before Tax", ["pnl", "lineItems", "profit_before_tax_and_exceptional_items_before_tax"])}
              {consRow("Exceptional Items Before Tax", ["pnl", "lineItems", "exceptional_items_before_tax"])}
              {consRow("Income Tax", ["pnl", "lineItems", "income_tax"])}
              {consRow("Profit Before Tax", ["pnl", "lineItems", "profit_before_tax"])}
              {consRow("Profit for Period from Continuing Operations", ["pnl", "lineItems", "profit_for_period_from_continuing_operations"])}
              {consRow("Profit from Discontinuing Operations After Tax", ["pnl", "lineItems", "profit_from_discontinuing_operation_after_tax"])}
              {consRow("Minority Interest and Profit from Associates and Joint Ventures", ["pnl", "lineItems", "minority_interest_and_profit_from_associates_and_joint_ventures"])}
              {consRow("Profit After Tax", ["pnl", "lineItems", "profit_after_tax"])}
            </Tbl>
          </div>
        );

      case "consolidated-pl-schedule":
        if (!consFins.length) return <div><Sec id="consolidated-pl-schedule" icon={BarChart3} title="Consolidated P&L Key Schedule" refs={refs} /><Empty text="No consolidated data available" /></div>;
        return (
          <div>
            <Sec id="consolidated-pl-schedule" icon={BarChart3} title="Consolidated Profit & Loss - Key Schedule" refs={refs} />
            <Tbl headers={["Particulars", ...consYears]}>
              {consRow("Managerial Remuneration", ["pnl_key_schedule", "managerial_remuneration"])}
              {consRow("Payment to Auditors", ["pnl_key_schedule", "payment_to_auditors"])}
              {consRow("Insurance Expenses", ["pnl_key_schedule", "insurance_expenses"])}
              {consRow("Power and Fuel", ["pnl_key_schedule", "power_and_fuel"])}
            </Tbl>
          </div>
        );

      case "consolidated-cf":
        if (!consFins.length) return <div><Sec id="consolidated-cf" icon={BarChart3} title="Consolidated Cash Flow" refs={refs} /><Empty text="No consolidated data available" /></div>;
        return (
          <div>
            <Sec id="consolidated-cf" icon={BarChart3} title="Consolidated Cash Flow" refs={refs} />
            <Tbl headers={["Particulars", ...consYears]}>
              {consRow("Profit Before Tax", ["cash_flow", "profit_before_tax"])}
              {consRow("Adjustment for Finance Cost and Depreciation", ["cash_flow", "adjustment_for_finance_cost_and_depreciation"])}
              {consRow("Adjustments for Current and Non-Current Assets", ["cash_flow", "adjustment_for_current_and_non_current_assets"])}
              {consRow("Adjustments for Current and Non-Current Liabilities", ["cash_flow", "adjustment_for_current_and_non_current_liabilities"])}
              {consRow("Other Adjustments in Operating Activities", ["cash_flow", "other_adjustments_in_operating_activities"])}
              {consRow("Cash Flows from Operating Activities", ["cash_flow", "cash_flows_from_used_in_operating_activities"])}
              {consRow("Cash Outflow from Purchase of Assets", ["cash_flow", "cash_outflow_from_purchase_of_assets"])}
              {consRow("Cash Inflow from Sale of Assets", ["cash_flow", "cash_inflow_from_sale_of_assets"])}
              {consRow("Income from Assets", ["cash_flow", "income_from_assets"])}
              {consRow("Other Adjustments in Investing Activities", ["cash_flow", "other_adjustments_in_investing_activities"])}
              {consRow("Cash Flows from Investing Activities", ["cash_flow", "cash_flows_from_used_in_investing_activities"])}
              {consRow("Cash Outflow from Repayment of Capital and Borrowings", ["cash_flow", "cash_outflow_from_repayment_of_capital_and_borrowings"])}
              {consRow("Cash Inflow from Raising Capital and Borrowings", ["cash_flow", "cash_inflow_from_raisng_capital_and_borrowings"])}
              {consRow("Interest and Dividends Paid", ["cash_flow", "interest_and_dividends_paid"])}
              {consRow("Other Adjustments in Financing Activities", ["cash_flow", "other_adjustments_in_financing_activities"])}
              {consRow("Cash Flows from Financing Activities", ["cash_flow", "cash_flows_from_used_in_financing_activities"])}
              {consRow("Increase / (Decrease) in Cash Before FX", ["cash_flow", "incr_decr_in_cash_cash_equv_before_effect_of_excg_rate_changes"])}
              {consRow("Adjustments to Cash and Cash Equivalents", ["cash_flow", "adjustments_to_cash_and_cash_equivalents"])}
              {consRow("Net Increase / (Decrease) in Cash and Cash Equivalents", ["cash_flow", "incr_decr_in_cash_cash_equv"])}
              {consRowAny("Cash and Cash Equivalents at End", [["cash_flow", "cash_flow_statement_at_end_of_period"], ["cash_flow", "cash_and_cash_equivalents_at_end_of_period"]])}
            </Tbl>
          </div>
        );

      case "consolidated-ratios":
        if (!consFins.length) return <div><Sec id="consolidated-ratios" icon={BarChart3} title="Consolidated Ratios" refs={refs} /><Empty text="No consolidated data available" /></div>;
        return (
          <div>
            <Sec id="consolidated-ratios" icon={BarChart3} title="Consolidated Ratios" refs={refs} />
            <Tbl headers={["Ratio", ...consYears]}>
              {consRow("Revenue Growth (%)", ["ratios", "revenue_growth"], fmtPct)}
              {consRow("Gross Profit Margin (%)", ["ratios", "gross_profit_margin"], fmtPct)}
              {consRow("EBITDA Margin (%)", ["ratios", "ebitda_margin"], fmtPct)}
              {consRow("Net Margin (%)", ["ratios", "net_margin"], fmtPct)}
              {consRow("Return on Equity (%)", ["ratios", "return_on_equity"], fmtPct)}
              {consRow("Return on Capital Employed (%)", ["ratios", "return_on_capital_employed"], fmtPct)}
              {consRow("Debt Ratio", ["ratios", "debt_ratio"])}
              {consRowAny("Debt / Equity", [["ratios", "debt_by_equity"], ["ratios", "debt_to_equity"]])}
              {consRow("Interest Coverage Ratio", ["ratios", "interest_coverage_ratio"])}
              {consRow("Current Ratio", ["ratios", "current_ratio"])}
              {consRow("Quick Ratio", ["ratios", "quick_ratio"])}
              {consRow("Inventory / Sales (Days)", ["ratios", "inventory_by_sales_days"])}
              {consRow("Debtors / Sales (Days)", ["ratios", "debtors_by_sales_days"])}
              {consRow("Payables / Sales (Days)", ["ratios", "payables_by_sales_days"])}
              {consRow("Cash Conversion Cycle (Days)", ["ratios", "cash_conversion_cycle"])}
              {consRow("Sales / Net Fixed Assets", ["ratios", "sales_by_net_fixed_assets"])}
            </Tbl>
          </div>
        );

      case "auditors-standalone":
        return (
          <div>
            <Sec id="auditors-standalone" icon={Users} title="Auditor(s) - Standalone" refs={refs} />
            {standaloneAuditors.length > 0 ? (
              <Tbl headers={["Year", "Auditor Name", "Firm Name", "PAN", "Address"]}>
                {standaloneAuditors.map((a, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{a.year}</td>
                    <td className="px-4 py-2">{txt(a.auditor_name)}</td>
                    <td className="px-4 py-2">{txt(a.firm_name)}</td>
                    <td className="px-4 py-2 font-mono">{txt(a.pan)}</td>
                    <td className="px-4 py-2 max-w-[200px] truncate">{txt(a.address)}</td>
                  </tr>
                ))}
              </Tbl>
            ) : (
              <Empty />
            )}
          </div>
        );

      case "auditors-consolidated":
        return (
          <div>
            <Sec id="auditors-consolidated" icon={Users} title="Auditor(s) - Consolidated" refs={refs} />
            {consolidatedAuditors.length > 0 ? (
              <Tbl headers={["Year", "Auditor Name", "Firm Name", "PAN", "Address"]}>
                {consolidatedAuditors.map((a, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{a.year}</td>
                    <td className="px-4 py-2">{txt(a.auditor_name)}</td>
                    <td className="px-4 py-2">{txt(a.firm_name)}</td>
                    <td className="px-4 py-2 font-mono">{txt(a.pan)}</td>
                    <td className="px-4 py-2 max-w-[200px] truncate">{txt(a.address)}</td>
                  </tr>
                ))}
              </Tbl>
            ) : (
              <Empty />
            )}
          </div>
        );

      case "rpt": {
        const latestRptFy = arr(r.related_party_transactions)
          .slice()
          .sort((a, b) => String(b?.financial_year || "").localeCompare(String(a?.financial_year || "")))[0]?.financial_year;
        return (
          <div>
            <Sec id="rpt" icon={GitBranch} title={`Related Party Transactions - FY Ending On ${fyEndLabel(latestRptFy)}`} refs={refs} />
            {renderRelatedPartyTransactions()}
          </div>
        );
      }

      case "msme":
        return (
          <div>
            <Sec
              id="msme"
              icon={DollarSign}
              title={`MSME Supplier Payment Delays${
                r?.msme_supplier_payment_delays?.delays_for_period?.latest_period
                  ? ` - ${r.msme_supplier_payment_delays.delays_for_period.latest_period}`
                  : ""
              }`}
              refs={refs}
            />
            {renderMsme()}
          </div>
        );

      case "shareholding-pattern": {
        const fyLabel = fyEndLabel(arr(r.shareholdings_summary)[0]?.financial_year || arr(r.shareholdings)[0]?.financial_year);
        return (
          <div>
            <Sec id="shareholding-pattern" icon={PieChart} title={`Structure - ${fyLabel}`} refs={refs} />
            {renderShareholdingPattern()}
          </div>
        );
      }

      case "structure": {
        const sh = arr(r.shareholdings_summary)[0] || {};
        const promoterEq = arr(r.shareholdings).find(
          (s) => String(s?.shareholders || "").toLowerCase() === "promoter" && String(s?.category || "").toLowerCase() === "equity"
        );
        const publicEq = arr(r.shareholdings).find(
          (s) => String(s?.shareholders || "").toLowerCase() === "public" && String(s?.category || "").toLowerCase() === "equity"
        );
        const fyLabel = fyEndLabel(sh?.financial_year || promoterEq?.financial_year);
        return (
          <div className="space-y-4">
            <Sec id="structure" icon={PieChart} title={`Structure - ${fyLabel}`} refs={refs} />
            <Tbl headers={["Promoter %", "Public %", "No. of Shareholders", "Total Equity Shares", "Total Preference Shares"]}>
              <tr>
                <td className="px-4 py-2">{pct2(promoterEq?.total_percentage_of_shares)}</td>
                <td className="px-4 py-2">{pct2(publicEq?.total_percentage_of_shares)}</td>
                <td className="px-4 py-2">
                  {sh?.total != null ? `${sh.total} [Promoter(s) ${sh.promoter ?? sh.total}]` : "—"}
                </td>
                <td className="px-4 py-2">{sh?.total_equity_shares != null ? fmt(sh.total_equity_shares) : "—"}</td>
                <td className="px-4 py-2">{sh?.total_preference_shares != null ? fmt(sh.total_preference_shares) : "—"}</td>
              </tr>
            </Tbl>
          </div>
        );
      }

      case "promoters": {
        const rows = arr(r.shareholdings);
        const eq = rows.find(
          (s) =>
            String(s?.shareholders || "").toLowerCase() === "promoter" &&
            String(s?.category || "").toLowerCase() === "equity"
        );
        const pr = rows.find(
          (s) =>
            String(s?.shareholders || "").toLowerCase() === "promoter" &&
            String(s?.category || "").toLowerCase() === "preference"
        );
        const fyLabel = fyEndLabel(eq?.financial_year || pr?.financial_year);
        return (
          <div>
            <Sec id="promoters" icon={Users} title={`Promoters - ${fyLabel}`} refs={refs} />
            {renderShareholdingPatternTable(eq, pr, `Promoters - ${fyLabel}`)}
          </div>
        );
      }

      case "public": {
        const rows = arr(r.shareholdings);
        const eq = rows.find(
          (s) =>
            String(s?.shareholders || "").toLowerCase() === "public" &&
            String(s?.category || "").toLowerCase() === "equity"
        );
        const pr = rows.find(
          (s) =>
            String(s?.shareholders || "").toLowerCase() === "public" &&
            String(s?.category || "").toLowerCase() === "preference"
        );
        const fyLabel = fyEndLabel(eq?.financial_year || pr?.financial_year);
        return (
          <div>
            <Sec id="public" icon={Users} title={`Public / Other Than Promoters - ${fyLabel}`} refs={refs} />
            {renderShareholdingPatternTable(eq, pr, `Public / Other Than Promoters - ${fyLabel}`)}
          </div>
        );
      }

      case "director-shareholding": {
        const fyLabel = fyEndLabel(arr(r.director_shareholdings)[0]?.financial_year);
        return (
          <div>
            <Sec id="director-shareholding" icon={Users} title={`Directors Shareholding - ${fyLabel}`} refs={refs} />
            {renderDirectorShareholding()}
          </div>
        );
      }

      case "shareholding-5": {
        const latest = arr(r.shareholdings_more_than_five_percent)
          .slice()
          .sort((a, b) => String(b?.financial_year || "").localeCompare(String(a?.financial_year || "")))[0];
        const fyLabel = fyEndLabel(latest?.financial_year);
        return (
          <div>
            <Sec id="shareholding-5" icon={PieChart} title={`Shareholding more than 5% - FY Ending On ${fyLabel}`} refs={refs} />
            {renderShareholdingMoreThan5()}
          </div>
        );
      }

      case "holding-corp": {
        const fyLabel = fyEndLabel(r.holding_entities?.financial_year);
        return (
          <div>
            <Sec id="holding-corp" icon={Layers} title={`Holding Corporates - FY Ending On ${fyLabel}`} refs={refs} />
            {renderRelatedCorporateGroup(r.holding_entities)}
          </div>
        );
      }

      case "subsidiary-corp": {
        const fyLabel = fyEndLabel(r.subsidiary_entities?.financial_year);
        return (
          <div>
            <Sec id="subsidiary-corp" icon={Layers} title={`Subsidiary Corporates - FY Ending On ${fyLabel}`} refs={refs} />
            {renderRelatedCorporateGroup(r.subsidiary_entities)}
          </div>
        );
      }

      case "associate-corp": {
        const fyLabel = fyEndLabel(r.associate_entities?.financial_year);
        return (
          <div>
            <Sec id="associate-corp" icon={Layers} title={`Associate Corporates - FY Ending On ${fyLabel}`} refs={refs} />
            {renderRelatedCorporateGroup(r.associate_entities)}
          </div>
        );
      }

      case "joint-ventures": {
        const fyLabel = fyEndLabel(r.joint_ventures?.financial_year);
        return (
          <div>
            <Sec id="joint-ventures" icon={Layers} title={`Joint Ventures - FY Ending On ${fyLabel}`} refs={refs} />
            {renderRelatedCorporateGroup(r.joint_ventures)}
          </div>
        );
      }
      case "finParams":
        return (
          <div>
            <Sec id="finParams" icon={FileSearch} title="Financial Parameters" refs={refs} />
            {renderFinancialParameters()}
          </div>
        );

      case "finDisputes":
        return (
          <div>
            <Sec id="finDisputes" icon={Gavel} title="Legal Cases of Financial Dispute - Summary" refs={refs} />
            {renderFinancialDisputes()}
          </div>
        );

      case "directors":
        return (
          <div>
            <Sec id="directors" icon={Users} title="Directors" refs={refs} />
            {renderDirectors()}
          </div>
        );

      case "director-assoc":
        return (
          <div>
            <Sec id="director-assoc" icon={Users} title="Director - Association History" refs={refs} />
            {renderDirectorAssociationHistory()}
          </div>
        );

      case "other-directorships":
        return (
          <div>
            <Sec id="other-directorships" icon={Network} title="Other Directorships" refs={refs} />
            {renderOtherDirectorships()}
          </div>
        );

      case "open-charges": {
        const openIds = new Set(arr(r.open_charges).map((x) => String(x?.id || x?.charge_id || "")));
        const seqRows = arr(r.charge_sequence).filter((x) => openIds.has(String(x?.charge_id || x?.id || "")));
        const latestEventRows = arr(r.open_charges_latest_event)
          .filter((x) => openIds.has(String(x?.id || x?.charge_id || "")))
          .map((x) => ({
            charge_id: x?.id || x?.charge_id,
            status: x?.type || x?.status,
            date: x?.date,
            filing_date: x?.filing_date,
            holder_name: x?.holder_name,
            amount: x?.amount,
            property_type: x?.property_type,
            number_of_holder: x?.number_of_chargeholder,
          }));
        const openRows = arr(r.open_charges).map((x) => ({
          charge_id: x?.id || x?.charge_id,
          status: x?.type || x?.status || "Creation",
          date: x?.date,
          filing_date: null,
          holder_name: x?.holder_name,
          amount: x?.amount,
          property_type: null,
          number_of_holder: null,
        }));

        const dedup = new Map();
        [...seqRows, ...latestEventRows, ...openRows].forEach((row) => {
          const key = [
            String(row?.charge_id || ""),
            String(row?.status || ""),
            String(row?.date || ""),
            String(row?.amount || ""),
          ].join("|");
          if (!dedup.has(key)) dedup.set(key, row);
        });
        const openChargeRows = [...dedup.values()].filter((x) => openIds.has(String(x?.charge_id || x?.id || "")));
        return (
          <div>
            <Sec id="open-charges" icon={Landmark} title="Open Charges Sequence" refs={refs} />
            {renderChargeSequence(openChargeRows)}
          </div>
        );
      }

      case "satisfied-charges": {
        const satisfiedRows = arr(r.charge_sequence).filter(
          (x) => String(x?.status || "").toLowerCase() === "satisfaction"
        );
        const satisfiedIds = new Set(satisfiedRows.map((x) => String(x?.charge_id || x?.id || "")));
        const satisfiedGroupRows = arr(r.charge_sequence).filter((x) =>
          satisfiedIds.has(String(x?.charge_id || x?.id || ""))
        );
        return (
          <div>
            <Sec id="satisfied-charges" icon={Landmark} title="Satisfied Charges Sequence" refs={refs} />
            {renderChargeSequence(satisfiedGroupRows)}
          </div>
        );
      }

      case "open-charges-events":
        return (
          <div>
            <Sec id="open-charges-events" icon={Landmark} title="Open Charges Latest Events with Details" refs={refs} />
            {renderOpenChargesLatestEvents()}
          </div>
        );

      case "active-gstins":
        return (
          <div>
            <Sec id="active-gstins" icon={Scale} title="GST" refs={refs} />
            {renderGst()}
          </div>
        );

      case "epfo":
        return (
          <div>
            <Sec id="epfo" icon={Briefcase} title="Establishments Registered with EPFO" refs={refs} />
            {renderEpfo()}
          </div>
        );

      case "annex-related-corporates":
        return (
          <div className="space-y-6">
            <Sec id="annex-related-corporates" icon={Layers} title="Annexure - Related Corporates" refs={refs} />
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Holding Corporates</h3>
              {renderRelatedCorporateGroup(r.holding_entities)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Subsidiary Corporates</h3>
              {renderRelatedCorporateGroup(r.subsidiary_entities)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Associate Corporates</h3>
              {renderRelatedCorporateGroup(r.associate_entities)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Joint Ventures</h3>
              {renderRelatedCorporateGroup(r.joint_ventures)}
            </div>
          </div>
        );

      case "annex-rpt":
        return (
          <div>
            <Sec id="annex-rpt" icon={GitBranch} title="Annexure - Related Party Transactions" refs={refs} />
            {renderRelatedPartyTransactions({ latestOnly: false })}
          </div>
        );

      case "annex-gst-active":
        return (
          <div>
            <Sec id="annex-gst-active" icon={Scale} title="Annexure - GST - Active GSTINs - Filing Details" refs={refs} />
            {renderGstFilingDetails("active")}
          </div>
        );

      case "annex-gst-inactive":
        return (
          <div>
            <Sec id="annex-gst-inactive" icon={Scale} title="Annexure - GST - Inactive GSTINs - Filing Details" refs={refs} />
            {renderGstFilingDetails("inactive")}
          </div>
        );

      case "annex-credit-ratings":
        return (
          <div>
            <Sec id="annex-credit-ratings" icon={Star} title="Annexure - Credit Ratings" refs={refs} />
            {renderCreditRatings({ latestOnly: false })}
          </div>
        );

      case "peerComparison":
        return (
          <div>
            <Sec id="peerComparison" icon={TrendingUp} title="Peer Comparison" refs={refs} />
            {renderPeerComparison()}
          </div>
        );

      case "audit-comments-standalone":
        return (
          <div>
            <Sec id="audit-comments-standalone" icon={FileText} title="Auditors' Comments - Standalone" refs={refs} />
            {renderAuditComments(fins)}
          </div>
        );

      case "audit-comments-consolidated":
        return (
          <div>
            <Sec id="audit-comments-consolidated" icon={FileText} title="Auditors' Comments - Consolidated" refs={refs} />
            {renderAuditComments(consFins)}
          </div>
        );

      case "cases-against":
      case "cases-by":
      case "cases-consolidation":
      case "probable-cases":
      case "unverified-court":
        return (
          <div>
            <Sec id={active} icon={Gavel} title="Legal History" refs={refs} />
            {renderLegalHistory()}
          </div>
        );

      case "creditRatings":
        return (
          <div>
            <Sec id="creditRatings" icon={Star} title="Credit Ratings" refs={refs} />
            {renderCreditRatings({ latestOnly: true })}
          </div>
        );

      case "unacceptedRatings":
        return (
          <div>
            <Sec id="unacceptedRatings" icon={Star} title="Unaccepted Ratings" refs={refs} />
            <p className="text-sm text-slate-600">
              This corporate or any of its financial instruments do not have an unaccepted rating on or after 2017 as per our records.
            </p>
          </div>
        );

      case "struckOff":
      case "bifr":
      case "cdr":
      case "defaulters":
        return (
          <div>
            <Sec id={active} icon={Shield} title="Compliance" refs={refs} />
            {renderCompliance()}
          </div>
        );

      default: {
        const sectionMap = {
          finParams: r.financial_parameters,
          rpt: r.related_party_transactions,
          msme: r.msme_supplier_payment_delays,
          finDisputes: r.legal_cases_of_financial_disputes,
          promoters: arr(r.shareholdings).filter((s) => String(s?.shareholders || "").toLowerCase() === "promoter"),
          public: arr(r.shareholdings).filter((s) => String(s?.shareholders || "").toLowerCase() === "public"),
          directors: r.authorized_signatories,
          "director-shareholding": r.authorized_signatories,
          "shareholding-5": r.shareholdings_more_than_five_percent,
          securities: r.securities_allotment,
          "holding-corp": r.holding_entities,
          "subsidiary-corp": r.subsidiary_entities,
          "associate-corp": r.associate_entities,
          "joint-ventures": r.joint_ventures,
          "director-assoc": directorAssocRows,
          "other-directorships": r.director_network,
          "open-charges": r.open_charges,
          "satisfied-charges": arr(r.charge_sequence).filter((c) => String(c?.status || "").toLowerCase().includes("satisfied")),
          "open-charges-events": r.open_charges_latest_event,
          peerComparison: r.peer_comparison,
          "audit-comments-standalone": arr(fins)
            .map((f) => ({ year: f?.year, ...(f?.auditor_comments || {}) }))
            .filter((row) => Object.keys(row).length > 1),
          "audit-comments-consolidated": arr(consFins)
            .map((f) => ({ year: f?.year, ...(f?.auditor_comments || {}) }))
            .filter((row) => Object.keys(row).length > 1),
          "active-gstins": r.gst_details,
          "cases-against": casesAgainst,
          "cases-by": casesBy,
          "cases-consolidation": r.cases_for_consolidation_of_corporate_affairs,
          "probable-cases": r.probable_cases,
          "unverified-court": r.unverified_court_records,
          creditRatings: r.credit_ratings,
          unacceptedRatings: r.unaccepted_rating,
          struckOff: r.struckoff248_details,
          bifr: r.bifr_history,
          cdr: r.cdr_history,
          defaulters: r.defaulter_list,
          epfo: r.establishments_registered_with_epfo,
        };
        return (
          <div>
            <Sec
              id={active}
              icon={Layers}
              title={SECTIONS.find((s) => s.id === active)?.label || "Section Data"}
              refs={refs}
            />
            {renderAutoSection(sectionMap[active] ?? r?.[active])}
          </div>
        );
      }
    }
  };

  return (
    <div className="flex border border-slate-200 rounded-2xl overflow-hidden bg-white" style={{ minHeight: 600 }}>
      {/* Sidebar (desktop) */}
      <nav className="w-52 shrink-0 border-r border-slate-200 bg-slate-50/80 hidden lg:block">
        <div className="sticky top-0 py-3 space-y-0.5 px-2.5 overflow-y-auto" style={{ maxHeight: "80vh" }}>
          {SECTIONS.map((section) => (
            <SidebarItem key={section.id} item={section} active={active} onSelect={scrollTo} />
          ))}
        </div>
      </nav>
      {/* Mobile nav (simplified) */}
      <div className="lg:hidden flex gap-1 px-3 py-2 border-b border-slate-200 overflow-x-auto bg-slate-50 w-full flex-wrap">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] whitespace-nowrap ${active === id ? "bg-blue-600 text-white" : "text-slate-500 bg-slate-100"
              }`}
          >
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0 overflow-y-auto p-5 space-y-8" style={{ maxHeight: "80vh" }}>
        {renderContent()}
      </div>
    </div>
  );
}

/* ═══ Step Badge (unchanged) ═══ */
function StepBadge({ done, active, label }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${done
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : active
          ? "bg-blue-50 text-blue-700 border border-blue-200"
          : "bg-slate-50 text-slate-400 border border-slate-200"
        }`}
    >
      {done ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 ${active ? "border-blue-500" : "border-slate-300"
            }`}
        />
      )}
      {label}
    </div>
  );
}
const RC = {
  "A+": "text-emerald-700 bg-emerald-50 border-emerald-300",
  A: "text-emerald-700 bg-emerald-50 border-emerald-300",
  "B+": "text-amber-700 bg-amber-50 border-amber-300",
  B: "text-amber-700 bg-amber-50 border-amber-300",
  C: "text-red-700 bg-red-50 border-red-300",
  D: "text-red-900 bg-red-100 border-red-400",
};
const RK = {
  Low: "bg-emerald-50 border-emerald-200 text-emerald-700",
  Medium: "bg-amber-50 border-amber-200 text-amber-700",
  High: "bg-red-50 border-red-200 text-red-700",
  "Very High": "bg-red-100 border-red-300 text-red-900",
};

/* ═══ Main Component (unchanged) ═══ */
function OpsOrderDetail() {
  const routeParams = useParams();
  const id = Number(routeParams?.id);
  const qc = useQueryClient();
  const { data: order, isLoading } = useGetOperationsOrder(id);
  const fetchMut = useFetchComprehensiveReportData();
  const enrichMut = useSaveAnalystEnrichment();
  const modelMut = useRunDecisionModels();
  const pdfMut = useGeneratePdfReport();
  const publishMut = usePublishOrder();
  const [tab, setTab] = useState("data");
  const [invSum, setInvSum] = useState("");
  const [comments, setComments] = useState("");
  const [recNotes, setRecNotes] = useState("");
  const [redFlags, setRedFlags] = useState([]);
  const [newFlag, setNewFlag] = useState("");
  const [toast, setToast] = useState(null);
  const [localReport, setLocalReport] = useState(null);
  const [localDecision, setLocalDecision] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    if (order?.analystEnrichment) {
      setInvSum(order.analystEnrichment.investigationSummary || "");
      setComments(order.analystEnrichment.analystComments || "");
      setRecNotes(order.analystEnrichment.recommendationNotes || "");
      setRedFlags(order.analystEnrichment.redFlags || []);

      if (order.analystEnrichment.decisionOutputs) {
        setLocalDecision(order.analystEnrichment.decisionOutputs);
      }
    }

    if (order?.latestSnapshot?.report) {
      setLocalReport(order.latestSnapshot.report);
    } else if (order?.providerSearchSnapshot?.data) {
      setLocalReport(order.providerSearchSnapshot.data);
    }

    if (Array.isArray(order?.versions) && order.versions.length > 0) {
      setSelectedVersion(order.versions[0].version);
    } else {
      setSelectedVersion(null);
    }
  }, [order]);

  const notify = (t, m) => {
    setToast({ t, m });
    setTimeout(() => setToast(null), 3500);
  };
  const inv = () => qc.invalidateQueries({ queryKey: ["opsOrder", id] });

  if (!id || isNaN(id))
    return (
      <div className="p-8 text-center text-red-500">
        Invalid order ID. <Link href="~/operations/orders" className="text-blue-600 underline">Back</Link>
      </div>
    );
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        Loading...
      </div>
    );
  if (!order)
    return (
      <div className="p-8 text-center text-red-500">
        Order not found. <Link href="~/operations/orders" className="text-blue-600 underline">Back</Link>
      </div>
    );

  const snapshot = order?.providerSearchSnapshot || null;
  const versions = Array.isArray(order?.versions) ? order.versions : [];
  const selectedVersionData = versions.find((v) => String(v.version) === String(selectedVersion));

  const hasData = !!(snapshot?.data || localReport);
  const hasModels = !!(localDecision || order.analystEnrichment?.decisionOutputs);
  const hasPdf = order.generatedDocuments?.some((d) => d.documentType === "due_diligence_report" && d.status === "ready");
  const done = order.status === "completed";

  const report =
    selectedVersionData?.report ||
    localReport ||
    order?.latestSnapshot?.report ||
    snapshot?.data ||
    null;


  const decision = localDecision || order.analystEnrichment?.decisionOutputs;

  const doFetch = () => {
    fetchMut.mutate(
      { id },
      {
        onSuccess: (d) => {
          setLocalReport(
            d?.latestSnapshot?.report ||
            d?.latest?.report ||
            d?.latestSnapshot?.data ||
            d?.latest?.data ||
            null
          );
          if (Array.isArray(d?.versions) && d.versions.length > 0) {
            setSelectedVersion(d.versions[0].version);
          }

          inv();
          notify("ok", "Latest version fetched successfully");
        },
        onError: () => notify("err", "Fetch failed"),
      }
    );
  };

  const doSave = (draft) => {
    enrichMut.mutate(
      { id, data: { investigationSummary: invSum, analystComments: comments, redFlags, recommendationNotes: recNotes, isDraft: draft } },
      {
        onSuccess: () => {
          inv();
          notify("ok", draft ? "Draft saved" : "Submitted");
        },
        onError: () => notify("err", "Save failed"),
      }
    );
  };
  const doModels = () => {
    modelMut.mutate(
      { id },
      {
        onSuccess: (d) => {
          setLocalDecision(d);
          inv();
          notify("ok", "Done");
          setTab("decision");
        },
        onError: (e) => notify("err", e?.message || "Failed"),
      }
    );
  };
  const doPdf = () => {
    pdfMut.mutate(
      { id },
      {
        onSuccess: () => {
          inv();
          notify("ok", "PDF generated");
          setTab("publish");
        },
        onError: (e) => notify("err", e?.message || "Failed"),
      }
    );
  };
  const doPub = () => {
    publishMut.mutate(
      { id },
      {
        onSuccess: () => {
          inv();
          notify("ok", "Published!");
        },
        onError: () => notify("err", "Failed"),
      }
    );
  };

  const TABS = [
    { id: "data", label: "Company Data", icon: Building2 },
    { id: "notes", label: "Analyst Notes", icon: FileText },
    { id: "decision", label: "Decision Engine", icon: TrendingUp },
    { id: "publish", label: "Publish", icon: Send },
  ];

  return (
    <div className="pb-16 relative">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl font-medium text-sm flex items-center gap-2 ${toast.t === "ok" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
        >
          {toast.t === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.m}
        </div>
      )}

      <div className="mb-5">
        <Link href="~/operations/orders" className="text-slate-500 hover:text-slate-900 inline-flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Queue
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{order.subjectName}</h1>
            <StatusBadge status={order.status} />
            <PriorityBadge priority={order.priority} />
          </div>
          <p className="text-slate-500 text-sm">
            {order.orderNumber} · {order.clientCompanyName || "—"} · {order.productName || "DDR"} · {formatDate(order.createdAt)}
          </p>
          {order.subjectDetails?.cin && (
            <p className="text-xs font-mono text-slate-400 mt-1">CIN: {order.subjectDetails.cin}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <StepBadge done={hasData} active={!hasData} label="Data Fetched" />
        <StepBadge
          done={!!order.analystEnrichment?.investigationSummary}
          active={hasData && !order.analystEnrichment?.investigationSummary}
          label="Notes Written"
        />
        <StepBadge
          done={hasModels}
          active={!!order.analystEnrichment?.investigationSummary && !hasModels}
          label="Models Run"
        />
        <StepBadge done={hasPdf} active={hasModels && !hasPdf} label="PDF Generated" />
        <StepBadge done={done} active={hasPdf && !done} label="Published" />
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Company Data Tab ── */}
      {tab === "data" && (
        <div className="space-y-5">
          <div className="flex justify-end gap-2">
            {versions.length > 0 && (
              <select
                value={selectedVersion ?? ""}
                onChange={(e) => {
                  const nextVersion = Number(e.target.value);
                  setSelectedVersion(nextVersion);
                  const next = versions.find((v) => v.version === nextVersion);
                  if (next?.report) setLocalReport(next.report);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
              >
                {versions.map((v) => (
                  <option key={v.id || v.version} value={v.version}>
                    Version {v.version} ({formatDate(v.fetchedAt)})
                  </option>
                ))}
              </select>
            )}
            <Button variant="outline" size="sm" onClick={doFetch} isLoading={fetchMut.isPending}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Re-fetch
            </Button>
          </div>
          {!hasData ? (
            <Card className="p-12 text-center">
              <Building2 className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Data Available Yet</h3>
              <p className="text-slate-500 text-sm mb-2">Data should be auto-fetched when client places the order.</p>
              <p className="text-slate-500 text-sm">Use Re-fetch to pull a fresh version if required.</p>
            </Card>
          ) : (
            <>
              <CompanyDataPanel report={report} />
              <div className="flex justify-end pt-4">
                <Button onClick={() => setTab("notes")} size="lg">
                  Continue to Analyst Notes →
                </Button>
              </div>
            </>
          )}
        </div>
      )}



      {/* ── Analyst Notes Tab ── */}
      {tab === "notes" && (
        <div className="space-y-6">
          {!hasData && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" /> Fetch data first.
            </div>
          )}
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Investigation
            </h3>
            <div className="space-y-5">
              <div>
                <Label>Investigation Summary *</Label>
                <Textarea
                  value={invSum}
                  onChange={(e) => setInvSum(e.target.value)}
                  className="h-36"
                  placeholder="Summarize findings..."
                />
              </div>
              <div>
                <Label>Analyst Comments</Label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="h-28"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Red Flags
            </h3>
            <div className="space-y-2 mb-4">
              {redFlags.length === 0 && <p className="text-slate-400 text-sm italic">None added.</p>}
              {redFlags.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 text-sm text-red-700"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="flex-1">{f}</span>
                  <button
                    onClick={() => setRedFlags((fs) => fs.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add red flag..."
                value={newFlag}
                onChange={(e) => setNewFlag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFlag.trim()) {
                    setRedFlags((fs) => [...fs, newFlag.trim()]);
                    setNewFlag("");
                  }
                }}
              />
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  if (newFlag.trim()) {
                    setRedFlags((fs) => [...fs, newFlag.trim()]);
                    setNewFlag("");
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Recommendation
            </h3>
            <Textarea
              value={recNotes}
              onChange={(e) => setRecNotes(e.target.value)}
              className="h-28"
              placeholder="Final recommendation..."
            />
          </Card>
          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={() => doSave(true)} isLoading={enrichMut.isPending}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => doSave(false)}
                isLoading={enrichMut.isPending}
                disabled={!invSum.trim()}
              >
                Submit Notes
              </Button>
              <Button onClick={() => setTab("decision")}>Decision Engine →</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Decision Engine Tab ── */}
      {tab === "decision" && (
        <div className="space-y-6">
          {!hasModels ? (
            <Card className="p-12 text-center">
              <TrendingUp className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Run Decision Engine</h3>
              <p className="text-slate-500 text-sm mb-6">Execute scoring models.</p>
              <Button size="lg" onClick={doModels} isLoading={modelMut.isPending} disabled={!hasData}>
                <Play className="w-4 h-4 mr-2" /> Run Models
              </Button>
              {!hasData && <p className="text-xs text-amber-600 mt-3">Fetch data first.</p>}
            </Card>
          ) : (
            <>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={doModels} isLoading={modelMut.isPending}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Re-run
                </Button>
              </div>
              {decision && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Credit Rating</h4>
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-xl border-2 text-2xl font-bold ${RC[decision.creditRating?.rating] || "text-slate-700 bg-slate-50 border-slate-300"
                        }`}
                    >
                      {decision.creditRating?.rating || "N/A"}
                    </div>
                    <p className="text-sm text-slate-500 mt-3">{decision.creditRating?.rationale}</p>
                  </Card>
                  <Card className="p-6">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Risk Score</h4>
                    <div className="text-3xl font-bold text-slate-900">
                      {decision.riskScore?.score}
                      <span className="text-base text-slate-400 font-normal"> / 100</span>
                    </div>
                    <div
                      className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${RK[decision.riskScore?.band] || "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                    >
                      {decision.riskScore?.band || "Unknown"}
                    </div>
                  </Card>
                  <Card className="p-6">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Eligibility</h4>
                    <div className="text-lg font-bold">
                      {decision.eligibility
                        ? `${fmtCr(decision.eligibility.recommendedAmountMin)} - ${fmtCr(
                          decision.eligibility.recommendedAmountMax
                        )}`
                        : "N/A"}
                    </div>
                  </Card>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button onClick={() => setTab("publish")} size="lg">
                  Continue to Publish →
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Publish Tab ── */}
      {tab === "publish" && (
        <div className="space-y-6">
          <Card className="p-8">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FileOutput className="w-5 h-5 text-blue-600" /> Generate & Publish
            </h3>
            <div className="space-y-4">
              <div
                className={`p-5 rounded-xl border ${hasPdf ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {hasPdf ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <FileOutput className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">Generate PDF</p>
                      <p className="text-xs text-slate-500 mt-0.5">{hasPdf ? "Ready" : "Create report"}</p>
                    </div>
                  </div>
                  <Button
                    variant={hasPdf ? "outline" : "primary"}
                    size="sm"
                    onClick={doPdf}
                    isLoading={pdfMut.isPending}
                    disabled={!hasData}
                  >
                    {hasPdf ? "Re-generate" : "Generate"}
                  </Button>
                </div>
              </div>
              <div
                className={`p-5 rounded-xl border ${done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Send className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">Publish</p>
                      <p className="text-xs text-slate-500 mt-0.5">{done ? "Published" : "Make available"}</p>
                    </div>
                  </div>
                  {!done && (
                    <Button size="sm" onClick={doPub} isLoading={publishMut.isPending} disabled={!hasPdf}>
                      <Send className="w-4 h-4 mr-1.5" /> Publish
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {done && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-emerald-800">Published!</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default OpsOrderDetail;
