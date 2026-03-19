// src/pages/operations/order-detail.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import {
  useGetOperationsOrder, useFetchComprehensiveReportData,
  useSaveAnalystEnrichment, useRunDecisionModels,
  useGeneratePdfReport, usePublishOrder,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, StatusBadge, PriorityBadge, Label, Textarea, Input } from "@/components/ui-shared";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft, Building2, Users, Scale, FileText, Save, Play,
  FileOutput, Send, CheckCircle2, AlertTriangle, TrendingUp, Shield,
  Loader2, RefreshCw, Plus, X, MapPin, Landmark, Network,
  BarChart3, PieChart, CreditCard, Gavel, BookOpen, Activity,
  BadgeAlert, Briefcase, ChevronDown, ChevronRight, Star, Globe,
  Phone, Mail, Hash, FileSearch, Layers, GitBranch, DollarSign,
} from "lucide-react";

/* ═══ Helpers ═══ */
const fmt = (n) => { if (n == null) return "—"; return Number(n).toLocaleString("en-IN"); };
const fmtCr = (n) => { if (n == null || n === 0) return "—"; const a=Math.abs(n); if(a>=1e7) return `₹${(n/1e7).toFixed(2)} Cr`; if(a>=1e5) return `₹${(n/1e5).toFixed(2)} L`; return `₹${fmt(n)}`; };
const fmtPct = (n) => n != null ? `${Number(n).toFixed(2)}%` : "—";
const safe = (obj, ...path) => { let v = obj; for (const k of path) { if (v == null) return null; v = v[k]; } return v; };
const arr = (v) => Array.isArray(v) ? v : [];
const txt = (v) => (v != null && v !== "" && v !== "null") ? String(v) : "—";

function KV({ label, value, mono }) {
  return <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
    <span className="text-xs text-slate-500 min-w-[160px] shrink-0">{label}</span>
    <span className={`text-xs font-medium text-slate-800 break-all ${mono ? "font-mono" : ""}`}>{txt(value)}</span>
  </div>;
}
function Stat({ label, value, sub }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-3.5">
    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
    <p className="text-lg font-bold text-slate-900 mt-0.5 truncate">{value}</p>
    {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
  </div>;
}
function Sec({ id, icon: Icon, title, count, refs }) {
  return <h2 ref={el => { if(refs) refs.current[id] = el; }} className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4 pt-2 scroll-mt-4">
    <Icon className="w-5 h-5 text-blue-600" /> {title}
    {count != null && count > 0 && <span className="text-sm font-normal text-slate-400">({count})</span>}
  </h2>;
}
function Tbl({ headers, children }) {
  return <div className="overflow-x-auto border border-slate-200 rounded-xl"><table className="w-full text-xs">
    <thead className="bg-slate-50 border-b border-slate-200"><tr>{headers.map((h,i)=>
      <th key={i} className={`px-3 py-2.5 font-semibold text-slate-500 ${h.right?"text-right":"text-left"}`}>{h.label||h}</th>
    )}</tr></thead><tbody className="divide-y divide-slate-50">{children}</tbody></table></div>;
}
function Badge({ text, color = "slate" }) {
  const c = { green: "bg-emerald-50 text-emerald-700", red: "bg-red-50 text-red-700", amber: "bg-amber-50 text-amber-700", blue: "bg-blue-50 text-blue-700", slate: "bg-slate-100 text-slate-600" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c[color]||c.slate}`}>{text}</span>;
}
function ShowMore({ items, render, n = 10, label = "items" }) {
  const [all, setAll] = useState(false);
  if (!items?.length) return null;
  const vis = all ? items : items.slice(0, n);
  return <>{vis.map(render)}{items.length > n && (
    <tr><td colSpan={99} className="text-center py-2">
      <button onClick={()=>setAll(!all)} className="text-xs font-medium text-blue-600 hover:text-blue-800">
        {all ? "Show less" : `Show ${items.length - n} more ${label}`}
      </button></td></tr>
  )}</>;
}
function Empty({ text = "No data available" }) { return <p className="text-slate-400 text-xs py-4">{text}</p>; }


/* ═══ Sidebar sections — exact sequence from Excel ═══ */
const SECTIONS = [
  { id: "keyStats", label: "Key Statistics", icon: Building2 },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "lei", label: "LEI Details", icon: Hash },
  { id: "contact", label: "Contact Details", icon: Phone },
  { id: "keyIndicators", label: "Key Indicators", icon: Activity },
  { id: "about", label: "About Company", icon: BookOpen },
  { id: "nameHistory", label: "Name History", icon: GitBranch },
  { id: "directors", label: "Director Details", icon: Users },
  { id: "directorNetwork", label: "Director Network", icon: Network },
  { id: "charges", label: "Charges", icon: Landmark },
  { id: "financials", label: "Financial Data", icon: BarChart3 },
  { id: "finParams", label: "Financial Parameters", icon: FileSearch },
  { id: "shareholding", label: "Shareholding", icon: PieChart },
  { id: "securities", label: "Securities Allotment", icon: CreditCard },
  { id: "relatedCorp", label: "Related Corporates", icon: Layers },
  { id: "rpt", label: "Related Party Txns", icon: GitBranch },
  { id: "peerComparison", label: "Peer Comparison", icon: TrendingUp },
  { id: "creditRatings", label: "Credit Ratings", icon: Star },
  { id: "bifrCdr", label: "BIFR & CDR", icon: AlertTriangle },
  { id: "defaulters", label: "Suit Filed / Defaults", icon: BadgeAlert },
  { id: "legalHistory", label: "Legal History", icon: Gavel },
  { id: "struckOff", label: "Struck Off U/S 248", icon: Shield },
  { id: "gst", label: "GST", icon: Scale },
  { id: "epfo", label: "EPFO", icon: Briefcase },
  { id: "msme", label: "MSME Delays", icon: DollarSign },
  { id: "finDisputes", label: "Financial Disputes", icon: Gavel },
  { id: "probeScore", label: "Probe Score", icon: Star },
];

/* ═══ Company Data Panel ═══ */
function CompanyDataPanel({ report: r }) {
  const [active, setActive] = useState("keyStats");
  const [expandedDir, setExpandedDir] = useState(null);
  const refs = useRef({});
  const scrollTo = (id) => { setActive(id); refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  if (!r) return null;

  const co = r.company || {};
  const regAddr = co.registered_address || {};
  const busAddr = co.business_address || {};
  const lei = co.lei || {};
  const contact = r.contact_details || {};
  const keyInd = r.key_indicators || {};
  const desc = r.description || {};
  const fins = arr(r.financials);
  const latestFin = fins[0] || {};
  const pnl = safe(latestFin, "pnl", "lineItems") || {};
  const bs = safe(latestFin, "bs") || {};
  const bsAssets = bs.assets || {};
  const bsLiab = bs.liabilities || {};
  const bsSub = bs.subTotals || {};
  const ratios = latestFin.ratios || {};
  const cashFlow = latestFin.cash_flow || {};
  const pnlSub = safe(latestFin, "pnl", "subTotals") || {};
  const revBreakup = safe(latestFin, "pnl", "revenue_breakup") || {};
  const pnlKS = latestFin.pnl_key_schedule || {};
  const auditor = latestFin.auditor || {};
  const auditorComments = latestFin.auditor_comments || {};
  const probeScore = r.probe_financial_score || {};

  const countFor = (id) => {
    const m = { directors: arr(r.authorized_signatories).length, directorNetwork: arr(r.director_network).length,
      charges: arr(r.open_charges).length + arr(r.charge_sequence).length,
      legalHistory: arr(r.legal_history).length, defaulters: arr(r.defaulter_list).length,
      creditRatings: arr(r.credit_ratings).length, gst: arr(r.gst_details).length,
      securities: arr(r.securities_allotment).length, epfo: arr(r.establishments_registered_with_epfo).length };
    return m[id] || 0;
  };

  return (
    <div className="flex border border-slate-200 rounded-2xl overflow-hidden bg-white" style={{ minHeight: 600 }}>
      {/* Sidebar */}
      <nav className="w-52 shrink-0 border-r border-slate-200 bg-slate-50/80 hidden lg:block">
        <div className="sticky top-0 py-3 space-y-0.5 px-2.5 overflow-y-auto" style={{ maxHeight: "80vh" }}>
          {SECTIONS.map(({ id, label, icon: Icon }) => { const c = countFor(id); return (
            <button key={id} onClick={() => scrollTo(id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${active === id ? "bg-blue-600 text-white font-semibold shadow-sm" : "text-slate-600 hover:bg-slate-200/60"}`}>
              <Icon className="w-3.5 h-3.5 shrink-0" /> <span className="flex-1 text-left truncate">{label}</span>
              {c > 0 && <span className={`text-[10px] ${active === id ? "text-blue-200" : "text-slate-400"}`}>{c}</span>}
            </button>
          ); })}
        </div>
      </nav>
      {/* Mobile nav */}
      <div className="lg:hidden flex gap-1 px-3 py-2 border-b border-slate-200 overflow-x-auto bg-slate-50 w-full flex-wrap">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => scrollTo(id)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] whitespace-nowrap ${active === id ? "bg-blue-600 text-white" : "text-slate-500 bg-slate-100"}`}>
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0 overflow-y-auto p-5 space-y-8" style={{ maxHeight: "80vh" }}>
        {/* ── 1. Key Statistics ── */}
        <section><Sec id="keyStats" icon={Building2} title="Key Statistics" refs={refs} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Stat label="Company Status" value={txt(co.efiling_status)} />
            <Stat label="Active Compliance" value={txt(co.active_compliance)} />
            <Stat label="Authorized Capital" value={fmtCr(co.authorized_capital)} />
            <Stat label="Paid-up Capital" value={fmtCr(co.paid_up_capital)} />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <KV label="Company Name" value={co.legal_name} /><KV label="CIN" value={co.cin} mono />
            <KV label="PAN" value={co.pan} mono /><KV label="Company Status" value={co.efiling_status} />
            <KV label="Active Compliance" value={co.active_compliance} /><KV label="Type of Entity" value={co.classification} />
            <KV label="Listing Status" value={co.status} /><KV label="Date of Incorporation" value={co.incorporation_date} />
            <KV label="Date of Last AGM" value={co.last_agm_date} /><KV label="Authorized Capital (INR)" value={fmt(co.authorized_capital)} />
            <KV label="Paid Up Capital (INR)" value={fmt(co.paid_up_capital)} /><KV label="Sum of Charges (INR)" value={fmt(co.sum_of_charges)} />
            <KV label="Email" value={co.email} /><KV label="Website" value={co.website} />
            <KV label="Last Filing with ROC" value={co.last_filing_date} />
          </div>
        </section>

        {/* ── 2. Addresses ── */}
        <section><Sec id="addresses" icon={MapPin} title="Addresses" refs={refs} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4"><Badge text="Registered Address" color="blue" />
              <div className="mt-3"><KV label="Full Address" value={regAddr.full_address} />
                <KV label="Address Line 1" value={regAddr.address_line1} /><KV label="Address Line 2" value={regAddr.address_line2} />
                <KV label="City / Village" value={regAddr.city} /><KV label="Pincode" value={regAddr.pincode} /><KV label="State" value={regAddr.state} /></div>
            </div>
            {busAddr.city && <div className="rounded-xl border border-slate-200 p-4"><Badge text="Business Address" color="green" />
              <div className="mt-3"><KV label="Address Line 1" value={busAddr.address_line1} /><KV label="Address Line 2" value={busAddr.address_line2} />
                <KV label="City" value={busAddr.city} /><KV label="Pincode" value={busAddr.pincode} /><KV label="State" value={busAddr.state} /></div>
            </div>}
          </div>
        </section>

        {/* ── 3. LEI Details ── */}
        <section><Sec id="lei" icon={Hash} title="Legal Entity Identifier (LEI) Details" refs={refs} />
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <KV label="LEI Code" value={lei.number} mono /><KV label="LEI Status" value={lei.status} />
            <KV label="Registration Date" value={lei.registration_date} /><KV label="Last Updated Date" value={lei.last_updated_date} />
            <KV label="Next Renewal Date" value={lei.next_renewal_date} />
          </div>
        </section>

        {/* ── 4. Contact Details ── */}
        <section><Sec id="contact" icon={Phone} title="Contact Details" refs={refs} />
          {arr(contact.email).length > 0 && <div className="mb-3"><p className="text-xs font-semibold text-slate-500 mb-2">Email</p>
            <Tbl headers={["Email ID","Status"]}>{arr(contact.email).map((e,i)=><tr key={i}><td className="px-3 py-2">{txt(e.emailId)}</td><td className="px-3 py-2">{txt(e.status)}</td></tr>)}</Tbl></div>}
          {arr(contact.phone).length > 0 && <div><p className="text-xs font-semibold text-slate-500 mb-2">Phone</p>
            <Tbl headers={["Phone Number","Status"]}>{arr(contact.phone).map((p,i)=><tr key={i}><td className="px-3 py-2">{txt(p.phoneNumber)}</td><td className="px-3 py-2">{txt(p.status)}</td></tr>)}</Tbl></div>}
          {!arr(contact.email).length && !arr(contact.phone).length && <Empty />}
        </section>

        {/* ── 5. Key Indicators ── */}
        <section><Sec id="keyIndicators" icon={Activity} title="Key Indicators" refs={refs} />
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <KV label="Revenue Range" value={keyInd.revenue} /><KV label="Profit Range" value={keyInd.profit} />
            <KV label="Employee Count Range" value={keyInd.employee_count} />
            <KV label="Pending Cases Against" value={keyInd.pending_cases_filed_against_this_corporate ? "Yes" : "No"} />
            <KV label="Bureau Defaults" value={keyInd.bureau_defaults ? "Yes" : "No"} />
            <KV label="GST Filing Delay (12m)" value={keyInd.gst_filing_delay != null ? String(keyInd.gst_filing_delay) : "—"} />
            <KV label="EPF Payment Delay (12m)" value={keyInd.epf_payment_delay != null ? String(keyInd.epf_payment_delay) : "—"} />
          </div>
        </section>

        {/* ── 6. About The Company ── */}
        <section><Sec id="about" icon={BookOpen} title="About The Company" refs={refs} />
          {desc.desc_thousand_char && <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">{desc.desc_thousand_char}</p>}
          {arr(r.industry_segments).length > 0 && <div className="mb-4"><p className="text-xs font-semibold text-slate-500 mb-2">Industry & Segments</p>
            <Tbl headers={["Industry","Segments"]}>{arr(r.industry_segments).map((s,i)=><tr key={i}><td className="px-3 py-2 font-medium">{txt(s.industry)}</td><td className="px-3 py-2">{arr(s.segments).join(", ")||"—"}</td></tr>)}</Tbl></div>}
          {arr(r.principal_business_activities).length > 0 && <div><p className="text-xs font-semibold text-slate-500 mb-2">Principal Business Activities</p>
            <Tbl headers={["Year","Activity Group","Description","% Turnover"]}>{arr(r.principal_business_activities).map((a,i)=><tr key={i}><td className="px-3 py-2">{txt(a.year)}</td><td className="px-3 py-2">{txt(a.main_activity_group_code)}</td><td className="px-3 py-2">{txt(a.main_activity_group_description)}</td><td className="px-3 py-2">{txt(a.percentage_of_turnover)}</td></tr>)}</Tbl></div>}
        </section>

        {/* ── 7. Name History ── */}
        <section><Sec id="nameHistory" icon={GitBranch} title="Name History" refs={refs} />
          {arr(r.name_history).length > 0 ? <Tbl headers={["Old Name","Till Date"]}>{arr(r.name_history).map((n,i)=><tr key={i}><td className="px-3 py-2 font-medium">{txt(n.name)}</td><td className="px-3 py-2">{txt(n.date)}</td></tr>)}</Tbl> : <Empty />}
        </section>

        {/* ── 8. Director Details ── */}
        <section><Sec id="directors" icon={Users} title="Director Details" count={arr(r.authorized_signatories).length} refs={refs} />
          {arr(r.authorized_signatories).length > 0 ? <Tbl headers={["Name","DIN","DIN Status","Designation","Appointed","Cessation","Age","Nationality"]}>
            <ShowMore items={arr(r.authorized_signatories)} n={15} label="directors" render={(d,i)=>(
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-3 py-2"><div className="font-medium">{txt(d.name)}</div><span className="text-slate-400">{d.gender}</span></td>
                <td className="px-3 py-2 font-mono">{txt(d.din)}</td>
                <td className="px-3 py-2"><Badge text={txt(d.din_status)} color={d.din_status?.includes("Disqualified")?"red":d.din_status?.includes("Deactivated")?"amber":"slate"} /></td>
                <td className="px-3 py-2">{txt(d.designation)}</td>
                <td className="px-3 py-2">{txt(d.date_of_appointment)}</td>
                <td className="px-3 py-2">{d.date_of_cessation ? <Badge text={d.date_of_cessation} color="red" /> : <Badge text="Active" color="green" />}</td>
                <td className="px-3 py-2">{d.age||"—"}</td>
                <td className="px-3 py-2">{txt(d.nationality)}</td>
              </tr>
            )} />
          </Tbl> : <Empty />}
        </section>

        {/* ── 9. Director Network ── */}
        <section><Sec id="directorNetwork" icon={Network} title="Other Directorships (Director Network)" count={arr(r.director_network).length} refs={refs} />
          {arr(r.director_network).length > 0 ? <div className="space-y-2">
            <ShowMore items={arr(r.director_network)} n={5} label="directors" render={(dn,i)=>(
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={()=>setExpandedDir(expandedDir===i?null:i)} className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-slate-50">
                  <div className="text-left"><span className="text-xs font-semibold">{txt(dn.name)}</span> <span className="text-[10px] text-slate-400 ml-2">DIN: {txt(dn.din)} · {arr(safe(dn,"network","companies")).length} cos, {arr(safe(dn,"network","llps")).length} LLPs</span></div>
                  {expandedDir===i ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedDir===i && <div className="border-t border-slate-100 max-h-64 overflow-y-auto">
                  {arr(safe(dn,"network","companies")).length > 0 && <Tbl headers={["Company","CIN","Status","Designation","Appointed","Cessation"]}>
                    <ShowMore items={arr(safe(dn,"network","companies"))} n={10} label="companies" render={(c,j)=>(
                      <tr key={j}><td className="px-3 py-1.5 font-medium">{txt(c.legal_name)}</td><td className="px-3 py-1.5 font-mono text-[10px]">{txt(c.cin)}</td>
                        <td className="px-3 py-1.5"><Badge text={txt(c.company_status||c.status)} color={(c.company_status||c.status||"").includes("ACTIVE")?"green":"red"} /></td>
                        <td className="px-3 py-1.5">{txt(c.designation)}</td><td className="px-3 py-1.5">{txt(c.date_of_appointment)}</td>
                        <td className="px-3 py-1.5">{txt(c.date_of_cessation)}</td></tr>
                    )} /></Tbl>}
                  {arr(safe(dn,"network","llps")).length > 0 && <><p className="text-[10px] font-semibold text-slate-500 px-3 pt-2">LLPs</p>
                    <Tbl headers={["LLP Name","LLPIN","Status","Designation"]}>
                      {arr(safe(dn,"network","llps")).map((l,j)=><tr key={j}><td className="px-3 py-1.5">{txt(l.legal_name)}</td><td className="px-3 py-1.5 font-mono">{txt(l.llpin)}</td>
                        <td className="px-3 py-1.5"><Badge text={txt(l.status)} color={l.status==="ACTIVE"?"green":"red"} /></td><td className="px-3 py-1.5">{txt(l.designation)}</td></tr>)}
                    </Tbl></>}
                </div>}
              </div>
            )} />
          </div> : <Empty />}
        </section>

        {/* ── 10. Charges ── */}
        <section><Sec id="charges" icon={Landmark} title="Charges" refs={refs} />
          {arr(r.open_charges).length > 0 && <div className="mb-5"><p className="text-xs font-semibold text-slate-500 mb-2">Open Charges ({r.open_charges.length})</p>
            <Tbl headers={["Charge ID","Status","Date","Holder Name",{label:"Amount (INR)",right:true}]}>
              <ShowMore items={arr(r.open_charges)} n={15} label="charges" render={(c,i)=>(
                <tr key={i}><td className="px-3 py-2 font-mono text-[10px]">{c.id}</td><td className="px-3 py-2"><Badge text={c.type} color={c.type==="Creation"?"blue":"amber"} /></td>
                  <td className="px-3 py-2">{txt(c.date)}</td><td className="px-3 py-2 font-medium max-w-[200px] truncate">{txt(c.holder_name)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{fmtCr(c.amount)}</td></tr>
              )} /></Tbl></div>}
          {arr(r.open_charges_latest_event).length > 0 && <div className="mb-5"><p className="text-xs font-semibold text-slate-500 mb-2">Open Charges Latest Events ({r.open_charges_latest_event.length})</p>
            <Tbl headers={["ID","Type","Date","Holder",{label:"Amount",right:true},"Property Type"]}>
              <ShowMore items={arr(r.open_charges_latest_event)} n={10} label="events" render={(c,i)=>(
                <tr key={i}><td className="px-3 py-2 font-mono text-[10px]">{c.id}</td><td className="px-3 py-2"><Badge text={c.type} color={c.type==="Creation"?"blue":"amber"} /></td>
                  <td className="px-3 py-2">{txt(c.date)}</td><td className="px-3 py-2 font-medium max-w-[180px] truncate">{txt(c.holder_name)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{fmtCr(c.amount)}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate text-slate-500">{txt(c.property_type)}</td></tr>
              )} /></Tbl></div>}
          {arr(r.charge_sequence).length > 0 && <div><p className="text-xs font-semibold text-slate-500 mb-2">Charges Sequence ({r.charge_sequence.length})</p>
            <Tbl headers={["Charge ID","Status","Date","Filing Date","Holder",{label:"Amount",right:true}]}>
              <ShowMore items={arr(r.charge_sequence)} n={15} label="entries" render={(c,i)=>(
                <tr key={i}><td className="px-3 py-2 font-mono text-[10px]">{c.charge_id}</td>
                  <td className="px-3 py-2"><Badge text={c.status} color={c.status==="Satisfaction"?"green":c.status==="Creation"?"blue":"amber"} /></td>
                  <td className="px-3 py-2">{txt(c.date)}</td><td className="px-3 py-2">{txt(c.filing_date)}</td>
                  <td className="px-3 py-2 font-medium max-w-[180px] truncate">{txt(c.holder_name)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{fmtCr(c.amount)}</td></tr>
              )} /></Tbl></div>}
          {!arr(r.open_charges).length && !arr(r.charge_sequence).length && <Empty text="No charges data" />}
        </section>

        {/* ── 11. Financial Data ── */}
        <section><Sec id="financials" icon={BarChart3} title="Financial Data" refs={refs} />
          {fins.length > 0 ? <>
            <p className="text-[10px] text-slate-400 mb-3">Latest: FY {latestFin.year} · {latestFin.nature} · {latestFin.filing_type} · {latestFin.filing_standard}</p>
            {/* Balance Sheet */}
            <p className="text-xs font-semibold text-slate-700 mb-2">Balance Sheet — Equity & Liabilities</p>
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
              <p className="text-[10px] font-bold text-slate-500 mb-1">Equity</p>
              <KV label="Share Capital" value={fmtCr(bsLiab.share_capital)} /><KV label="Reserves & Surplus" value={fmtCr(bsLiab.reserves_and_surplus)} />
              <KV label="Money Against Share Warrants" value={fmtCr(bsLiab.money_received_against_share_warrants)} />
              <KV label="Total Equity" value={fmtCr(bsSub.total_equity)} />
              <p className="text-[10px] font-bold text-slate-500 mt-3 mb-1">Non-current Liabilities</p>
              <KV label="Long Term Borrowings" value={fmtCr(bsLiab.long_term_borrowings)} /><KV label="Deferred Tax Liabilities" value={fmtCr(bsLiab.deferred_tax_liabilities_net)} />
              <KV label="Other Long Term Liabilities" value={fmtCr(bsLiab.other_long_term_liabilities)} /><KV label="Long Term Provisions" value={fmtCr(bsLiab.long_term_provisions)} />
              <KV label="Total Non-current Liabilities" value={fmtCr(bsSub.total_non_current_liabilities)} />
              <p className="text-[10px] font-bold text-slate-500 mt-3 mb-1">Current Liabilities</p>
              <KV label="Short Term Borrowings" value={fmtCr(bsLiab.short_term_borrowings)} /><KV label="Trade Payables" value={fmtCr(bsLiab.trade_payables)} />
              <KV label="Other Current Liabilities" value={fmtCr(bsLiab.other_current_liabilities)} /><KV label="Short Term Provisions" value={fmtCr(bsLiab.short_term_provisions)} />
              <KV label="Total Current Liabilities" value={fmtCr(bsSub.total_current_liabilities)} />
              <div className="border-t border-slate-300 mt-2 pt-2"><KV label="Total Equity & Liabilities" value={fmtCr(bsLiab.given_liabilities_total)} /></div>
            </div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Balance Sheet — Assets</p>
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
              <p className="text-[10px] font-bold text-slate-500 mb-1">Net Fixed Assets</p>
              <KV label="Tangible Assets" value={fmtCr(bsAssets.tangible_assets)} /><KV label="Intangible Assets" value={fmtCr(bsAssets.intangible_assets)} />
              <KV label="Capital WIP" value={fmtCr(bsAssets.tangible_assets_capital_work_in_progress)} />
              <KV label="Total Net Fixed Assets" value={fmtCr(bsSub.net_fixed_assets)} />
              <p className="text-[10px] font-bold text-slate-500 mt-3 mb-1">Other Non-current Assets</p>
              <KV label="Non-current Investments" value={fmtCr(bsAssets.noncurrent_investments)} /><KV label="Deferred Tax Assets" value={fmtCr(bsAssets.deferred_tax_assets_net)} />
              <KV label="Long Term Loans & Advances" value={fmtCr(bsAssets.long_term_loans_and_advances)} /><KV label="Other Non-current Assets" value={fmtCr(bsAssets.other_noncurrent_assets)} />
              <KV label="Total Other Non-current" value={fmtCr(bsSub.total_other_non_current_assets)} />
              <p className="text-[10px] font-bold text-slate-500 mt-3 mb-1">Current Assets</p>
              <KV label="Current Investments" value={fmtCr(bsAssets.current_investments)} /><KV label="Inventories" value={fmtCr(bsAssets.inventories)} />
              <KV label="Trade Receivables" value={fmtCr(bsAssets.trade_receivables)} /><KV label="Cash & Bank Balances" value={fmtCr(bsAssets.cash_and_bank_balances)} />
              <KV label="Short Term Loans & Advances" value={fmtCr(bsAssets.short_term_loans_and_advances)} /><KV label="Other Current Assets" value={fmtCr(bsAssets.other_current_assets)} />
              <KV label="Total Current Assets" value={fmtCr(bsSub.total_current_assets)} />
              <div className="border-t border-slate-300 mt-2 pt-2"><KV label="Total Assets" value={fmtCr(bsAssets.given_assets_total)} /></div>
            </div>
            {/* P&L */}
            <p className="text-xs font-semibold text-slate-700 mb-2">Profit & Loss Statement</p>
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
              <KV label="Net Revenue" value={fmtCr(pnl.net_revenue)} />
              <p className="text-[10px] font-bold text-slate-500 mt-2 mb-1">Operating Cost</p>
              <KV label="Materials Consumed" value={fmtCr(pnl.total_cost_of_materials_consumed)} /><KV label="Purchases Stock-in-Trade" value={fmtCr(pnl.total_purchases_of_stock_in_trade)} />
              <KV label="Changes in Inventories" value={fmtCr(pnl.total_changes_in_inventories_or_finished_goods)} /><KV label="Employee Benefit Expense" value={fmtCr(pnl.total_employee_benefit_expense)} />
              <KV label="Other Expenses" value={fmtCr(pnl.total_other_expenses)} /><KV label="Total Operating Cost" value={fmtCr(pnlSub.total_operating_cost)} />
              <div className="border-t border-slate-200 mt-2 pt-2">
                <KV label="EBITDA" value={fmtCr(pnl.operating_profit)} /><KV label="Other Income" value={fmtCr(pnl.other_income)} />
                <KV label="Depreciation" value={fmtCr(pnl.depreciation)} /><KV label="PBIT" value={fmtCr(pnl.profit_before_interest_and_tax)} />
                <KV label="Finance Costs" value={fmtCr(pnl.interest)} /><KV label="PBT (excl exceptional)" value={fmtCr(pnl.profit_before_tax_and_exceptional_items_before_tax)} />
                <KV label="Exceptional Items" value={fmtCr(pnl.exceptional_items_before_tax)} /><KV label="Profit Before Tax" value={fmtCr(pnl.profit_before_tax)} />
                <KV label="Income Tax" value={fmtCr(pnl.income_tax)} /><KV label="Profit After Tax" value={fmtCr(pnl.profit_after_tax)} />
              </div>
            </div>
            {/* P&L Key Schedule */}
            {(pnlKS.payment_to_auditors || pnlKS.power_and_fuel) && <div className="mb-4"><p className="text-xs font-semibold text-slate-700 mb-2">P&L Key Schedule</p>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <KV label="Managerial Remuneration" value={fmtCr(pnlKS.managerial_remuneration)} /><KV label="Payment to Auditors" value={fmtCr(pnlKS.payment_to_auditors)} />
                <KV label="Insurance Expenses" value={fmtCr(pnlKS.insurance_expenses)} /><KV label="Power & Fuel" value={fmtCr(pnlKS.power_and_fuel)} />
              </div></div>}
            {/* Cash Flow */}
            {cashFlow && Object.keys(cashFlow).length > 0 && <div className="mb-4"><p className="text-xs font-semibold text-slate-700 mb-2">Cash Flow Statement</p>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] font-bold text-slate-500 mb-1">Operating Activities</p>
                <KV label="PBT" value={fmtCr(cashFlow.profit_before_tax)} /><KV label="Adj Finance & Depreciation" value={fmtCr(cashFlow.adjustment_for_finance_cost_and_depreciation)} />
                <KV label="Adj Current/Non-current Assets" value={fmtCr(cashFlow.adjustment_for_current_and_non_current_assets)} />
                <KV label="Net Operating Cash Flow" value={fmtCr(cashFlow.cash_flows_from_used_in_operating_activities)} />
                <p className="text-[10px] font-bold text-slate-500 mt-2 mb-1">Investing Activities</p>
                <KV label="Purchase of Assets" value={fmtCr(cashFlow.cash_outflow_from_purchase_of_assets)} />
                <KV label="Net Investing Cash Flow" value={fmtCr(cashFlow.cash_flows_from_used_in_investing_activities)} />
                <p className="text-[10px] font-bold text-slate-500 mt-2 mb-1">Financing Activities</p>
                <KV label="Repayment of Capital" value={fmtCr(cashFlow.cash_outflow_from_repayment_of_capital_and_borrowings)} />
                <KV label="Net Financing Cash Flow" value={fmtCr(cashFlow.cash_flows_from_used_in_financing_activities)} />
                <div className="border-t border-slate-300 mt-2 pt-2"><KV label="Net Change in Cash" value={fmtCr(cashFlow.incr_decr_in_cash_cash_equv)} />
                  <KV label="Cash at End of Period" value={fmtCr(cashFlow.cash_flow_statement_at_end_of_period)} /></div>
              </div></div>}
            {/* Ratios */}
            <p className="text-xs font-semibold text-slate-700 mb-2">Financial Ratios</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-0 bg-white rounded-xl border border-slate-200 p-4 mb-4">
              <KV label="Revenue Growth" value={fmtPct(ratios.revenue_growth)} /><KV label="Gross Profit Margin" value={fmtPct(ratios.gross_profit_margin)} />
              <KV label="EBITDA Margin" value={fmtPct(ratios.ebitda_margin)} /><KV label="Net Margin" value={fmtPct(ratios.net_margin)} />
              <KV label="ROE" value={fmtPct(ratios.return_on_equity)} /><KV label="ROCE" value={fmtPct(ratios.return_on_capital_employed)} />
              <KV label="Debt Ratio" value={ratios.debt_ratio?.toFixed(2)||"—"} /><KV label="Debt/Equity" value={ratios.debt_by_equity?.toFixed(2)||"—"} />
              <KV label="Interest Coverage" value={ratios.interest_coverage_ratio?.toFixed(2)||"—"} /><KV label="Current Ratio" value={ratios.current_ratio?.toFixed(2)||"—"} />
              <KV label="Quick Ratio" value={ratios.quick_ratio?.toFixed(2)||"—"} /><KV label="Inventory Days" value={ratios.inventory_by_sales_days?.toFixed(1)||"—"} />
              <KV label="Debtor Days" value={ratios.debtors_by_sales_days?.toFixed(1)||"—"} /><KV label="Payable Days" value={ratios.payables_by_sales_days?.toFixed(1)||"—"} />
              <KV label="Cash Conversion Cycle" value={ratios.cash_conversion_cycle?.toFixed(1)||"—"} /><KV label="Sales/Net Fixed Assets" value={ratios.sales_by_net_fixed_assets?.toFixed(2)||"—"} />
            </div>
            {/* Revenue Breakup */}
            {Object.values(revBreakup).some(v=>v!=null) && <div className="mb-4"><p className="text-xs font-semibold text-slate-700 mb-2">Revenue Breakup</p>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <KV label="Sale of Products" value={fmtCr(revBreakup.revenue_from_sale_of_products)} /><KV label="Sale of Services" value={fmtCr(revBreakup.revenue_from_sale_of_services)} />
                <KV label="Other Operating Revenue" value={fmtCr(revBreakup.other_operating_revenues)} /><KV label="Revenue from Operations" value={fmtCr(revBreakup.revenue_from_operations)} />
              </div></div>}
            {/* Auditor */}
            {auditor.auditor_name && <div className="mb-4"><p className="text-xs font-semibold text-slate-700 mb-2">Auditor Details</p>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <KV label="Auditor Name" value={auditor.auditor_name} /><KV label="Membership No." value={auditor.membership_number} />
                <KV label="Firm Name" value={auditor.auditor_firm_name} /><KV label="Firm Reg No." value={auditor.firm_registration_number} />
              </div></div>}
            {/* Yearly History */}
            {fins.length > 1 && <><p className="text-xs font-semibold text-slate-700 mb-2">Financial History ({fins.length} years)</p>
              <Tbl headers={["FY","Nature",{label:"Revenue",right:true},{label:"PAT",right:true},{label:"Net Worth",right:true},{label:"Total Assets",right:true},"Growth"]}>
                <ShowMore items={fins} n={10} label="years" render={(f,i)=>{const p2=safe(f,"pnl","lineItems")||{};const b2=safe(f,"bs","subTotals")||{};const a2=safe(f,"bs","assets")||{};return(
                  <tr key={i} className="hover:bg-slate-50"><td className="px-3 py-2 font-medium">{f.year}</td><td className="px-3 py-2">{f.nature}</td>
                    <td className="px-3 py-2 text-right">{fmtCr(p2.net_revenue)}</td><td className="px-3 py-2 text-right">{fmtCr(p2.profit_after_tax)}</td>
                    <td className="px-3 py-2 text-right">{fmtCr(b2.total_equity)}</td><td className="px-3 py-2 text-right">{fmtCr(a2.given_assets_total)}</td>
                    <td className={`px-3 py-2 text-right font-medium ${(f.ratios?.revenue_growth||0)>=0?"text-emerald-600":"text-red-600"}`}>{fmtPct(f.ratios?.revenue_growth)}</td></tr>
                );}} /></Tbl></>}
          </> : <Empty text="No financial data" />}
        </section>

        {/* ── 12. Financial Parameters ── */}
        <section><Sec id="finParams" icon={FileSearch} title="Financial Parameters" refs={refs} />
          {arr(r.financial_parameters).length > 0 ? <Tbl headers={["Year","Nature","FC Income","FC Expense","Employees","CSR Spent","Proposed Dividend"]}>
            <ShowMore items={arr(r.financial_parameters)} n={10} label="years" render={(f,i)=>(
              <tr key={i}><td className="px-3 py-2">{f.year}</td><td className="px-3 py-2">{f.nature}</td>
                <td className="px-3 py-2">{fmtCr(f.earning_fc)}</td><td className="px-3 py-2">{fmtCr(f.expenditure_fc)}</td>
                <td className="px-3 py-2">{txt(f.number_of_employees)}</td><td className="px-3 py-2">{fmtCr(f.total_amount_csr_spent_for_financial_year)}</td>
                <td className="px-3 py-2">{txt(f.proposed_dividend)}</td></tr>
            )} /></Tbl> : <Empty />}
        </section>

        {/* ── 13. Shareholding ── */}
        <section><Sec id="shareholding" icon={PieChart} title="Shareholding" refs={refs} />
          {arr(r.shareholdings_summary).length > 0 && <div className="mb-4"><p className="text-xs font-semibold text-slate-500 mb-2">Share Holding Summary</p>
            <Tbl headers={["FY","Equity Shares","Preference Shares","Promoter Holders","Public Holders","Total"]}>
              {arr(r.shareholdings_summary).map((s,i)=><tr key={i}><td className="px-3 py-2">{txt(s.financial_year)}</td><td className="px-3 py-2 text-right">{fmt(s.total_equity_shares)}</td>
                <td className="px-3 py-2 text-right">{fmt(s.total_preference_shares)}</td><td className="px-3 py-2 text-right">{fmt(s.promoter)}</td>
                <td className="px-3 py-2 text-right">{fmt(s.public)}</td><td className="px-3 py-2 text-right font-semibold">{fmt(s.total)}</td></tr>)}
            </Tbl></div>}
          {arr(r.director_shareholdings).length > 0 && <div className="mb-4"><p className="text-xs font-semibold text-slate-500 mb-2">Director Shareholding</p>
            <Tbl headers={["FY","DIN/PAN","Name","Designation","Shares",{label:"Holding %",right:true}]}>
              <ShowMore items={arr(r.director_shareholdings)} n={10} label="entries" render={(d,i)=>(
                <tr key={i}><td className="px-3 py-2">{txt(d.financial_year)}</td><td className="px-3 py-2 font-mono text-[10px]">{txt(d.din_pan)}</td>
                  <td className="px-3 py-2 font-medium">{txt(d.full_name)}</td><td className="px-3 py-2">{txt(d.designation)}</td>
                  <td className="px-3 py-2 text-right">{fmt(d.no_of_shares)}</td><td className="px-3 py-2 text-right font-semibold">{d.percentage_holding ? `${d.percentage_holding}%` : "—"}</td></tr>
              )} /></Tbl></div>}
          {arr(r.shareholdings_more_than_five_percent).length > 0 && <div><p className="text-xs font-semibold text-slate-500 mb-2">Shareholding &gt; 5%</p>
            {arr(r.shareholdings_more_than_five_percent).map((fy,fi)=><div key={fi} className="mb-3">
              <p className="text-[10px] text-slate-400 mb-1">FY: {fy.financial_year||"Latest"}</p>
              {["company","llp","individual","others"].map(cat=>{const items=arr(fy[cat]); if(!items.length) return null; return <div key={cat} className="mb-2">
                <Badge text={cat.charAt(0).toUpperCase()+cat.slice(1)} color="blue" />
                <Tbl headers={["Name",{label:"Shares",right:true},{label:"Holding %",right:true}]}>
                  {items.map((s,i)=><tr key={i}><td className="px-3 py-2 font-medium">{txt(s.name)}</td><td className="px-3 py-2 text-right">{fmt(s.no_of_shares)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{s.shareholding_percentage?`${s.shareholding_percentage}%`:"—"}</td></tr>)}
                </Tbl></div>;})}
            </div>)}</div>}
          {!arr(r.shareholdings_summary).length && !arr(r.director_shareholdings).length && <Empty />}
        </section>

        {/* ── 14. Securities Allotment ── */}
        <section><Sec id="securities" icon={CreditCard} title="Securities Allotment" count={arr(r.securities_allotment).length} refs={refs} />
          {arr(r.securities_allotment).length > 0 ? <Tbl headers={["Date","Instrument","Type","Securities",{label:"Amount Raised",right:true},"Nominal","Premium"]}>
            {arr(r.securities_allotment).map((s,i)=><tr key={i}><td className="px-3 py-2">{txt(s.allotment_date)}</td>
              <td className="px-3 py-2 font-medium max-w-[200px] truncate">{txt(s.instrument)}</td><td className="px-3 py-2">{txt(s.allotment_type)}</td>
              <td className="px-3 py-2 text-right">{fmt(s.number_of_securities_allotted)}</td><td className="px-3 py-2 text-right font-semibold">{fmtCr(s.total_amount_raised)}</td>
              <td className="px-3 py-2 text-right">{s.nominal_amount_per_security}</td><td className="px-3 py-2 text-right">{s.premium_amount_per_security}</td></tr>)}
          </Tbl> : <Empty />}
        </section>

        {/* ── 15. Related Corporates ── */}
        <section><Sec id="relatedCorp" icon={Layers} title="Related Corporates" refs={refs} />
          {[["Holding", r.holding_entities], ["Subsidiary", r.subsidiary_entities], ["Associate", r.associate_entities], ["Joint Venture", r.joint_ventures]].map(([label, ent]) => {
            if (!ent) return null;
            const cos = arr(safe(ent, "company") || safe(ent, "companies"));
            const llps = arr(safe(ent, "llp") || safe(ent, "llps"));
            const oth = arr(safe(ent, "others"));
            if (!cos.length && !llps.length && !oth.length) return null;
            return <div key={label} className="mb-4"><p className="text-xs font-semibold text-slate-700 mb-2">{label} Corporates {ent.financial_year ? `(FY ${ent.financial_year})` : ""}</p>
              {cos.length > 0 && <div className="mb-2"><Tbl headers={["Company","CIN","Status",{label:"Paid-up",right:true},"City",{label:"Holding %",right:true}]}>
                <ShowMore items={cos} n={10} label="companies" render={(c,i)=>(
                  <tr key={i}><td className="px-3 py-2 font-medium max-w-[200px] truncate">{txt(c.legal_name)}</td><td className="px-3 py-2 font-mono text-[10px]">{txt(c.cin)}</td>
                    <td className="px-3 py-2"><Badge text={txt(c.status)} color={(c.status||"").includes("Active")?"green":"red"} /></td>
                    <td className="px-3 py-2 text-right">{fmtCr(c.paid_up_capital)}</td><td className="px-3 py-2">{txt(c.city)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{c.share_holding_percentage?`${c.share_holding_percentage}%`:"—"}</td></tr>
                )} /></Tbl></div>}
              {llps.length > 0 && <div className="mb-2"><Badge text="LLPs" color="blue" /><Tbl headers={["LLP Name","LLPIN","Status",{label:"Holding %",right:true}]}>
                {llps.map((l,i)=><tr key={i}><td className="px-3 py-2">{txt(l.legal_name)}</td><td className="px-3 py-2 font-mono">{txt(l.llpin)}</td>
                  <td className="px-3 py-2"><Badge text={txt(l.status)} /></td><td className="px-3 py-2 text-right">{l.share_holding_percentage?`${l.share_holding_percentage}%`:"—"}</td></tr>)}
              </Tbl></div>}
            </div>;
          })}
          {![r.holding_entities,r.subsidiary_entities,r.associate_entities,r.joint_ventures].some(e=>e&&(arr(safe(e,"company")||safe(e,"companies")).length||arr(safe(e,"llp")||safe(e,"llps")).length)) && <Empty />}
        </section>

        {/* ── 16. Related Party Transactions ── */}
        <section><Sec id="rpt" icon={GitBranch} title="Related Party Transactions" refs={refs} />
          {arr(r.related_party_transactions).length > 0 ? <>{arr(r.related_party_transactions).map((fy,fi)=><div key={fi} className="mb-4">
            <p className="text-[10px] text-slate-400 mb-1">FY: {fy.financial_year||"—"}</p>
            {["company","llp","individual","others"].map(cat=>{const items=arr(fy[cat]); if(!items.length) return null; return <div key={cat} className="mb-2">
              <Badge text={cat.charAt(0).toUpperCase()+cat.slice(1)} color="blue" />
              <Tbl headers={["Name","Relationship","Transaction Type",{label:"Amount",right:true}]}>
                {items.map((t,i)=><tr key={i}><td className="px-3 py-2 font-medium">{txt(t.name||t.legal_name)}</td><td className="px-3 py-2">{txt(t.relationship)}</td>
                  <td className="px-3 py-2">{txt(t.type_of_transaction)}</td><td className="px-3 py-2 text-right font-semibold">{fmtCr(t.amount)}</td></tr>)}
              </Tbl></div>;})}
          </div>)}</> : <Empty />}
        </section>

        {/* ── 17. Peer Comparison ── */}
        <section><Sec id="peerComparison" icon={TrendingUp} title="Peer Comparison" refs={refs} />
          {arr(r.peer_comparison).length > 0 ? arr(r.peer_comparison).map((pc,pi)=><div key={pi} className="mb-4">
            <p className="text-[10px] text-slate-400 mb-2">{pc.bizIndustry} — {pc.bizSegment} · FY {pc.refYear}</p>
            {arr(pc.peers).length > 0 && <div className="mb-3"><p className="text-xs font-semibold text-slate-500 mb-1">Closest Peers by Revenue</p>
              <Tbl headers={["Company","CIN","City",{label:"Revenue",right:true}]}>
                {arr(pc.peers).map((p,i)=><tr key={i}><td className="px-3 py-2 font-medium">{txt(p.legalName)}</td><td className="px-3 py-2 font-mono text-[10px]">{txt(p.cin)}</td>
                  <td className="px-3 py-2">{txt(p.city)}</td><td className="px-3 py-2 text-right font-semibold">{fmtCr(p.revenue)}</td></tr>)}
              </Tbl></div>}
            {pc.benchMarks && <div><p className="text-xs font-semibold text-slate-500 mb-1">Benchmarks (Actual vs Median)</p>
              <div className="grid grid-cols-2 gap-x-4 bg-white rounded-xl border border-slate-200 p-4">
                {[["Revenue","revenue","median_revenue"],["Revenue Growth","revenue_growth","median_revenue_growth"],["EBITDA Margin","ebitda_margin","median_ebitda_margin"],
                  ["Net Margin","net_margin","median_net_margin"],["ROE","return_on_equity","median_return_on_equity"],["D/E","debt_by_equity","median_debt_by_equity"]
                ].map(([l,a,m])=><KV key={l} label={l} value={`${pc.benchMarks[a]??'—'} / ${pc.benchMarks[m]??'—'}`} />)}
              </div></div>}
          </div>) : <Empty />}
        </section>

        {/* ── 18. Credit Ratings ── */}
        <section><Sec id="creditRatings" icon={Star} title="Credit Ratings" count={arr(r.credit_ratings).length} refs={refs} />
          {arr(r.credit_ratings).length > 0 ? <Tbl headers={["Date","Agency","Rating","Instrument",{label:"Amount",right:true},"Currency"]}>
            <ShowMore items={arr(r.credit_ratings)} n={15} label="ratings" render={(cr,i)=>(
              <tr key={i}><td className="px-3 py-2">{txt(cr.rating_date)}</td><td className="px-3 py-2 uppercase font-semibold">{txt(cr.rating_agency)}</td>
                <td className="px-3 py-2"><Badge text={txt(cr.rating)} color={cr.rating?.includes("D")?"red":cr.rating?.includes("A")?"green":"amber"} /></td>
                <td className="px-3 py-2 max-w-[150px] truncate">{txt(cr.type_of_loan)}</td><td className="px-3 py-2 text-right font-semibold">{fmtCr(cr.amount)}</td>
                <td className="px-3 py-2">{txt(cr.currency)}</td></tr>
            )} /></Tbl> : <Empty />}
        </section>

        {/* ── 19. BIFR & CDR ── */}
        <section><Sec id="bifrCdr" icon={AlertTriangle} title="BIFR & CDR History" refs={refs} />
          {arr(r.bifr_history).length > 0 && <div className="mb-3"><p className="text-xs font-semibold text-slate-500 mb-2">BIFR History</p>
            <Tbl headers={["Case No.","Date","Status"]}>{arr(r.bifr_history).map((b,i)=><tr key={i}><td className="px-3 py-2">{txt(b.case_number)}</td><td className="px-3 py-2">{txt(b.date)}</td><td className="px-3 py-2">{txt(b.status)}</td></tr>)}</Tbl></div>}
          {arr(r.cdr_history).length > 0 && <div><p className="text-xs font-semibold text-slate-500 mb-2">CDR History</p>
            {arr(r.cdr_history).map((c,i)=><div key={i} className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs mb-2"><span className="font-semibold">{c.date}</span> — {c.description}</div>)}</div>}
          {!arr(r.bifr_history).length && !arr(r.cdr_history).length && <Empty text="No BIFR/CDR history" />}
        </section>

        {/* ── 20. Defaulter List ── */}
        <section><Sec id="defaulters" icon={BadgeAlert} title="Suit Filed Cases as per Bureaus" count={arr(r.defaulter_list).length} refs={refs} />
          {arr(r.defaulter_list).length > 0 ? <Tbl headers={["Date","Bureau","Bank",{label:"Amount",right:true},"Type"]}>
            <ShowMore items={arr(r.defaulter_list)} n={20} label="entries" render={(d,i)=>(
              <tr key={i}><td className="px-3 py-2">{txt(d.date)}</td><td className="px-3 py-2 uppercase">{txt(d.agency)}</td>
                <td className="px-3 py-2 font-medium max-w-[180px] truncate">{txt(d.bank)}</td><td className="px-3 py-2 text-right font-semibold">{fmtCr(d.amount)}</td>
                <td className="px-3 py-2"><Badge text={txt(d.defaulter_type)} color={String(d.defaulter_type).includes("Wilful")?"red":"amber"} /></td></tr>
            )} /></Tbl> : <Empty text="No defaults on record" />}
        </section>

        {/* ── 21. Legal History ── */}
        <section><Sec id="legalHistory" icon={Gavel} title="Legal History" count={arr(r.legal_history).length} refs={refs} />
          {arr(r.legal_history).length > 0 ? <>
            {(()=>{const pending=arr(r.legal_history).filter(c=>c.case_status==="Pending").length;const against=arr(r.legal_history).filter(c=>String(c.case_type).includes("Against")).length;
              return <div className="grid grid-cols-3 gap-3 mb-3"><Stat label="Total Cases" value={arr(r.legal_history).length} /><Stat label="Pending" value={pending} /><Stat label="Against Company" value={against} /></div>;})()}
            <Tbl headers={["Case No.","Court","Category","Petitioner","Status","Severity","Type"]}>
              <ShowMore items={arr(r.legal_history)} n={20} label="cases" render={(c,i)=>(
                <tr key={i} className="hover:bg-slate-50"><td className="px-3 py-2 font-mono text-[10px]">{txt(c.case_number)}</td>
                  <td className="px-3 py-2 max-w-[140px] truncate">{txt(c.court)}</td><td className="px-3 py-2">{txt(c.case_category)}</td>
                  <td className="px-3 py-2 max-w-[140px] truncate">{txt(c.petitioner)}</td>
                  <td className="px-3 py-2"><Badge text={txt(c.case_status)} color={c.case_status==="Pending"?"amber":"slate"} /></td>
                  <td className="px-3 py-2"><Badge text={txt(c.severity)} color={c.severity==="high"?"red":c.severity==="medium"?"amber":"green"} /></td>
                  <td className="px-3 py-2 text-[10px]">{txt(c.case_type)}</td></tr>
              )} /></Tbl>
          </> : <Empty text="No legal history" />}
        </section>

        {/* ── 22. Struck Off 248 ── */}
        <section><Sec id="struckOff" icon={Shield} title="Incidents of Name Removal U/S 248(5)" refs={refs} />
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <KV label="Struck Off Status" value={safe(r, "struckoff248_details", "struck_off_status")} />
            <KV label="Restored Status" value={safe(r, "struckoff248_details", "restored_status")} />
          </div>
        </section>

        {/* ── 23. GST ── */}
        <section><Sec id="gst" icon={Scale} title="GST" count={arr(r.gst_details).length} refs={refs} />
          {arr(r.gst_details).length > 0 ? <Tbl headers={["GSTIN","Status","State","Trade Name","Taxpayer Type","Registered","Timeliness"]}>
            <ShowMore items={arr(r.gst_details)} n={15} label="registrations" render={(g,i)=>(
              <tr key={i}><td className="px-3 py-2 font-mono text-[10px]">{txt(g.gstin)}</td>
                <td className="px-3 py-2"><Badge text={txt(g.status)} color={g.status==="Active"?"green":"red"} /></td>
                <td className="px-3 py-2">{txt(g.state)}</td><td className="px-3 py-2">{txt(g.trade_name)}</td>
                <td className="px-3 py-2">{txt(g.taxpayer_type)}</td><td className="px-3 py-2">{txt(g.date_of_registration)}</td>
                <td className="px-3 py-2">{txt(g.filing_timeliness)}</td></tr>
            )} /></Tbl> : <Empty />}
        </section>

        {/* ── 24. EPFO ── */}
        <section><Sec id="epfo" icon={Briefcase} title="EPFO Establishments" count={arr(r.establishments_registered_with_epfo).length} refs={refs} />
          {arr(r.establishments_registered_with_epfo).length > 0 ? <div className="space-y-3">
            {arr(r.establishments_registered_with_epfo).map((e,i)=><div key={i} className="rounded-xl border border-slate-200 p-4 bg-white">
              <div className="flex items-center gap-2 mb-2"><Badge text={txt(e.working_status)} color={e.working_status==="LIVE ESTABLISHMENT"?"green":"red"} /></div>
              <p className="text-xs font-semibold">{txt(e.establishment_name)}</p>
              <p className="text-[10px] font-mono text-slate-400">{txt(e.establishment_id)}</p>
              <div className="mt-2"><KV label="Address" value={e.address} /><KV label="City" value={e.city} />
                <KV label="PF Exemption" value={e.exemption_status_pf} /><KV label="Pension Exemption" value={e.exemption_status_pension} />
                <KV label="EDLI Exemption" value={e.exemption_status_edli} /><KV label="Payment Timeliness" value={e.payment_timeliness} />
                <KV label="Employees" value={e.no_of_employees} /><KV label="Latest Wage Month" value={e.latest_wage_month} /></div>
            </div>)}
          </div> : <Empty />}
        </section>

        {/* ── 25. MSME Delays ── */}
        <section><Sec id="msme" icon={DollarSign} title="MSME Supplier Payment Delays" refs={refs} />
          {r.msme_supplier_payment_delays ? <>
            {arr(safe(r,"msme_supplier_payment_delays","trend")).length > 0 && <div className="mb-3"><p className="text-xs font-semibold text-slate-500 mb-2">Delay Trend</p>
              <Tbl headers={["Period",{label:"Amount Due",right:true}]}>{arr(safe(r,"msme_supplier_payment_delays","trend")).map((t,i)=><tr key={i}><td className="px-3 py-2">{txt(t.period)}</td><td className="px-3 py-2 text-right font-semibold">{fmtCr(t.amount)}</td></tr>)}</Tbl></div>}
            {arr(safe(r,"msme_supplier_payment_delays","delays_for_period")).length > 0 && <div><p className="text-xs font-semibold text-slate-500 mb-2">Delay Details</p>
              <Tbl headers={["Supplier","PAN",{label:"Amount Due",right:true},"Due From"]}>{arr(safe(r,"msme_supplier_payment_delays","delays_for_period")).map((d,i)=><tr key={i}><td className="px-3 py-2">{txt(d.supplier_name)}</td><td className="px-3 py-2 font-mono">{txt(d.supplier_pan)}</td>
                <td className="px-3 py-2 text-right font-semibold">{fmtCr(d.amount_due)}</td><td className="px-3 py-2">{txt(d.amount_due_from_date)}</td></tr>)}</Tbl></div>}
            {!arr(safe(r,"msme_supplier_payment_delays","trend")).length && <Empty text="No MSME delays" />}
          </> : <Empty />}
        </section>

        {/* ── 26. Financial Disputes ── */}
        <section><Sec id="finDisputes" icon={Gavel} title="Legal Cases of Financial Disputes" refs={refs} />
          {(()=>{const disputes = arr(r.legal_cases_of_financial_disputes); const payable=arr(safe(r,"legal_cases_of_financial_disputes","payable")); const receivable=arr(safe(r,"legal_cases_of_financial_disputes","receivable"));
            const all = disputes.length ? disputes : [...payable,...receivable];
            return all.length > 0 ? <Tbl headers={["Type","Court","Litigant","Case No.","Verdict",{label:"Amount",right:true},"Judgement Date"]}>
              {all.map((d,i)=><tr key={i}><td className="px-3 py-2">{txt(d.type_of_financial_dispute)}</td><td className="px-3 py-2 max-w-[140px] truncate">{txt(d.court)}</td>
                <td className="px-3 py-2 max-w-[140px] truncate">{txt(d.litigant)}</td><td className="px-3 py-2 font-mono text-[10px]">{txt(d.case_no)}</td>
                <td className="px-3 py-2">{txt(d.verdict)}</td><td className="px-3 py-2 text-right font-semibold">{fmtCr(d.amount_under_default)}</td>
                <td className="px-3 py-2">{txt(d.date_of_judgement)}</td></tr>)}
            </Tbl> : <Empty />;
          })()}
        </section>

        {/* ── 27. Probe Score ── */}
        <section className="pb-8"><Sec id="probeScore" icon={Star} title="Probe Score" refs={refs} />
          {probeScore && probeScore.overall_financial_score != null ? <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {[["Overall", probeScore.overall_financial_score], ["Growth", probeScore.growth_score], ["Profitability", probeScore.profitability_score],
              ["Liquidity", probeScore.liquidity_score], ["Solvency", probeScore.solvency_score], ["Efficiency", probeScore.efficiency_score]
            ].map(([l, v]) => <div key={l} className="text-center p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className={`text-2xl font-bold ${(v||0) >= 4 ? "text-emerald-600" : (v||0) >= 3 ? "text-amber-600" : "text-red-600"}`}>{v || 0}<span className="text-sm text-slate-400">/5</span></div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">{l}</div></div>)}
          </div> : <Empty text="No probe score available" />}
        </section>

      </div>
    </div>
  );
}

/* ═══ Step Badge ═══ */
function StepBadge({ done, active, label }) {
  return <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${done ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : active ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-50 text-slate-400 border border-slate-200"}`}>
    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className={`w-3.5 h-3.5 rounded-full border-2 ${active ? "border-blue-500" : "border-slate-300"}`} />}{label}
  </div>;
}
const RC = { "A+": "text-emerald-700 bg-emerald-50 border-emerald-300", A: "text-emerald-700 bg-emerald-50 border-emerald-300", "B+": "text-amber-700 bg-amber-50 border-amber-300", B: "text-amber-700 bg-amber-50 border-amber-300", C: "text-red-700 bg-red-50 border-red-300", D: "text-red-900 bg-red-100 border-red-400" };
const RK = { Low: "bg-emerald-50 border-emerald-200 text-emerald-700", Medium: "bg-amber-50 border-amber-200 text-amber-700", High: "bg-red-50 border-red-200 text-red-700", "Very High": "bg-red-100 border-red-300 text-red-900" };

/* ═══ Main Component ═══ */
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

  useEffect(() => {
    if (order?.analystEnrichment) {
      setInvSum(order.analystEnrichment.investigationSummary || "");
      setComments(order.analystEnrichment.analystComments || "");
      setRecNotes(order.analystEnrichment.recommendationNotes || "");
      setRedFlags(order.analystEnrichment.redFlags || []);
      if (order.analystEnrichment.decisionOutputs) setLocalDecision(order.analystEnrichment.decisionOutputs);
    }
    if (order?.providerSearchSnapshot?.rawResults) setLocalReport(order.providerSearchSnapshot.rawResults);
  }, [order]);

  const notify = (t, m) => { setToast({ t, m }); setTimeout(() => setToast(null), 3500); };
  const inv = () => qc.invalidateQueries({ queryKey: [`opsOrder-${id}`] });

  if (!id || isNaN(id)) return <div className="p-8 text-center text-red-500">Invalid order ID. <Link href="~/operations/orders" className="text-blue-600 underline">Back</Link></div>;
  if (isLoading) return <div className="flex flex-col items-center justify-center py-24 text-slate-400"><Loader2 className="w-10 h-10 animate-spin mb-4" />Loading...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found. <Link href="~/operations/orders" className="text-blue-600 underline">Back</Link></div>;

  const hasData = !!(order.providerSearchSnapshot || localReport);
  const hasModels = !!(localDecision || order.analystEnrichment?.decisionOutputs);
  const hasPdf = order.generatedDocuments?.some(d => d.documentType === "due_diligence_report" && d.status === "ready");
  const done = order.status === "completed";
  const report = localReport || order.providerSearchSnapshot?.rawResults;
  const decision = localDecision || order.analystEnrichment?.decisionOutputs;

  const doFetch = () => { fetchMut.mutate({ id }, { onSuccess: (d) => { setLocalReport(d.report); inv(); notify("ok", "Data fetched"); }, onError: () => notify("err", "Fetch failed") }); };
  const doSave = (draft) => { enrichMut.mutate({ id, data: { investigationSummary: invSum, analystComments: comments, redFlags, recommendationNotes: recNotes, isDraft: draft } }, { onSuccess: () => { inv(); notify("ok", draft ? "Draft saved" : "Submitted"); }, onError: () => notify("err", "Save failed") }); };
  const doModels = () => { modelMut.mutate({ id }, { onSuccess: (d) => { setLocalDecision(d); inv(); notify("ok", "Done"); setTab("decision"); }, onError: (e) => notify("err", e?.message || "Failed") }); };
  const doPdf = () => { pdfMut.mutate({ id }, { onSuccess: () => { inv(); notify("ok", "PDF generated"); setTab("publish"); }, onError: (e) => notify("err", e?.message || "Failed") }); };
  const doPub = () => { publishMut.mutate({ id }, { onSuccess: () => { inv(); notify("ok", "Published!"); }, onError: (e) => notify("err", e?.message || "Failed") }); };

  const TABS = [{ id: "data", label: "Company Data", icon: Building2 }, { id: "notes", label: "Analyst Notes", icon: FileText }, { id: "decision", label: "Decision Engine", icon: TrendingUp }, { id: "publish", label: "Publish", icon: Send }];

  return (
    <div className="pb-16 relative">
      {toast && <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl font-medium text-sm flex items-center gap-2 ${toast.t === "ok" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
        {toast.t === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{toast.m}
      </div>}

      <div className="mb-5"><Link href="~/operations/orders" className="text-slate-500 hover:text-slate-900 inline-flex items-center text-sm font-medium"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Queue</Link></div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
        <div><div className="flex items-center gap-3 flex-wrap mb-1"><h1 className="text-2xl font-bold text-slate-900">{order.subjectName}</h1><StatusBadge status={order.status} /><PriorityBadge priority={order.priority} /></div>
          <p className="text-slate-500 text-sm">{order.orderNumber} · {order.clientCompanyName || "—"} · {order.productName || "DDR"} · {formatDate(order.createdAt)}</p>
          {order.subjectDetails?.cin && <p className="text-xs font-mono text-slate-400 mt-1">CIN: {order.subjectDetails.cin}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <StepBadge done={hasData} active={!hasData} label="Data Fetched" />
        <StepBadge done={!!order.analystEnrichment?.investigationSummary} active={hasData && !order.analystEnrichment?.investigationSummary} label="Notes Written" />
        <StepBadge done={hasModels} active={!!order.analystEnrichment?.investigationSummary && !hasModels} label="Models Run" />
        <StepBadge done={hasPdf} active={hasModels && !hasPdf} label="PDF Generated" />
        <StepBadge done={done} active={hasPdf && !done} label="Published" />
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}><t.icon className="w-4 h-4" />{t.label}</button>)}
      </div>

      {/* ── Company Data Tab ── */}
      {tab === "data" && (<div className="space-y-5">
        {!hasData ? <Card className="p-12 text-center"><Building2 className="w-14 h-14 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-700 mb-2">No Data Fetched Yet</h3><p className="text-slate-500 text-sm mb-6">Click below to fetch comprehensive company data from Probe42.</p>
          <Button size="lg" onClick={doFetch} isLoading={fetchMut.isPending}><RefreshCw className="w-4 h-4 mr-2" /> Fetch Company Data</Button></Card>
        : <><div className="flex justify-end"><Button variant="outline" size="sm" onClick={doFetch} isLoading={fetchMut.isPending}><RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Re-fetch</Button></div>
          <CompanyDataPanel report={report} />
          <div className="flex justify-end pt-4"><Button onClick={() => setTab("notes")} size="lg">Continue to Analyst Notes →</Button></div></>}
      </div>)}

      {/* ── Analyst Notes Tab ── */}
      {tab === "notes" && (<div className="space-y-6">
        {!hasData && <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-medium"><AlertTriangle className="w-4 h-4" /> Fetch data first.</div>}
        <Card className="p-6"><h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> Investigation</h3>
          <div className="space-y-5"><div><Label>Investigation Summary *</Label><Textarea value={invSum} onChange={e => setInvSum(e.target.value)} className="h-36" placeholder="Summarize findings..." /></div>
            <div><Label>Analyst Comments</Label><Textarea value={comments} onChange={e => setComments(e.target.value)} className="h-28" placeholder="Additional notes..." /></div></div></Card>
        <Card className="p-6"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Red Flags</h3>
          <div className="space-y-2 mb-4">{redFlags.length === 0 && <p className="text-slate-400 text-sm italic">None added.</p>}
            {redFlags.map((f, i) => <div key={i} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 text-sm text-red-700"><AlertTriangle className="w-3.5 h-3.5" /><span className="flex-1">{f}</span><button onClick={() => setRedFlags(fs => fs.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-700"><X className="w-3.5 h-3.5" /></button></div>)}</div>
          <div className="flex gap-2"><Input placeholder="Add red flag..." value={newFlag} onChange={e => setNewFlag(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newFlag.trim()) { setRedFlags(fs => [...fs, newFlag.trim()]); setNewFlag(""); } }} />
            <Button variant="outline" size="md" onClick={() => { if (newFlag.trim()) { setRedFlags(fs => [...fs, newFlag.trim()]); setNewFlag(""); } }}><Plus className="w-4 h-4" /></Button></div></Card>
        <Card className="p-6"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" /> Recommendation</h3>
          <Textarea value={recNotes} onChange={e => setRecNotes(e.target.value)} className="h-28" placeholder="Final recommendation..." /></Card>
        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" onClick={() => doSave(true)} isLoading={enrichMut.isPending}><Save className="w-4 h-4 mr-2" /> Save Draft</Button>
          <div className="flex gap-3"><Button variant="secondary" onClick={() => doSave(false)} isLoading={enrichMut.isPending} disabled={!invSum.trim()}>Submit Notes</Button><Button onClick={() => setTab("decision")}>Decision Engine →</Button></div>
        </div>
      </div>)}

      {/* ── Decision Engine Tab ── */}
      {tab === "decision" && (<div className="space-y-6">
        {!hasModels ? <Card className="p-12 text-center"><TrendingUp className="w-14 h-14 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-700 mb-2">Run Decision Engine</h3><p className="text-slate-500 text-sm mb-6">Execute scoring models.</p>
          <Button size="lg" onClick={doModels} isLoading={modelMut.isPending} disabled={!hasData}><Play className="w-4 h-4 mr-2" /> Run Models</Button>{!hasData && <p className="text-xs text-amber-600 mt-3">Fetch data first.</p>}</Card>
        : <><div className="flex justify-end"><Button variant="outline" size="sm" onClick={doModels} isLoading={modelMut.isPending}><RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Re-run</Button></div>
          {decision && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6"><h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Credit Rating</h4><div className={`inline-flex items-center px-4 py-2 rounded-xl border-2 text-2xl font-bold ${RC[decision.creditRating?.rating] || "text-slate-700 bg-slate-50 border-slate-300"}`}>{decision.creditRating?.rating || "N/A"}</div><p className="text-sm text-slate-500 mt-3">{decision.creditRating?.rationale}</p></Card>
            <Card className="p-6"><h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Risk Score</h4><div className="text-3xl font-bold text-slate-900">{decision.riskScore?.score}<span className="text-base text-slate-400 font-normal"> / 100</span></div><div className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${RK[decision.riskScore?.band] || "bg-slate-50 border-slate-200 text-slate-600"}`}>{decision.riskScore?.band || "Unknown"}</div></Card>
            <Card className="p-6"><h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Eligibility</h4><div className="text-lg font-bold">{decision.eligibility ? `${fmtCr(decision.eligibility.recommendedAmountMin)} - ${fmtCr(decision.eligibility.recommendedAmountMax)}` : "N/A"}</div></Card>
          </div>}
          <div className="flex justify-end pt-4"><Button onClick={() => setTab("publish")} size="lg">Continue to Publish →</Button></div></>}
      </div>)}

      {/* ── Publish Tab ── */}
      {tab === "publish" && (<div className="space-y-6"><Card className="p-8"><h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><FileOutput className="w-5 h-5 text-blue-600" /> Generate & Publish</h3>
        <div className="space-y-4">
          <div className={`p-5 rounded-xl border ${hasPdf ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between"><div className="flex items-center gap-3">{hasPdf ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <FileOutput className="w-5 h-5 text-slate-400" />}<div><p className="font-semibold text-slate-800">Generate PDF</p><p className="text-xs text-slate-500 mt-0.5">{hasPdf ? "Ready" : "Create report"}</p></div></div><Button variant={hasPdf ? "outline" : "primary"} size="sm" onClick={doPdf} isLoading={pdfMut.isPending} disabled={!hasData}>{hasPdf ? "Re-generate" : "Generate"}</Button></div></div>
          <div className={`p-5 rounded-xl border ${done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between"><div className="flex items-center gap-3">{done ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Send className="w-5 h-5 text-slate-400" />}<div><p className="font-semibold text-slate-800">Publish</p><p className="text-xs text-slate-500 mt-0.5">{done ? "Published" : "Make available"}</p></div></div>{!done && <Button size="sm" onClick={doPub} isLoading={publishMut.isPending} disabled={!hasPdf}><Send className="w-4 h-4 mr-1.5" /> Publish</Button>}</div></div>
        </div>
        {done && <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center"><CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" /><p className="font-bold text-emerald-800">Published!</p></div>}
      </Card></div>)}
    </div>
  );
}

export default OpsOrderDetail;