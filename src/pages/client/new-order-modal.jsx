// src/pages/client/new-order-modal.jsx
import { useState } from "react";
import { useSearchCompanies, useCreateOrder, useGetClientEntitlements } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input, FormField, ErrorAlert } from "@/components/ui-shared";
import {
  Search, Building2, FileText, ArrowLeft, ArrowRight, CheckCircle2,
  MapPin, Hash, ChevronRight, Loader2, X, Briefcase, Users,
} from "lucide-react";

const ENTITY_TYPES = [
  { label: "Company", description: "Private / Public Ltd", icon: Building2 },
  { label: "LLP", description: "Limited Liability Partnership", icon: Users },
  { label: "Proprietorship", description: "Sole proprietorship", icon: Briefcase },
];

function StatusDot({ status }) {
  const isActive = status === "Active";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-400"}`} />
      {status}
    </span>
  );
}

function NewOrderModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const { data: entitlements } = useGetClientEntitlements();
  // "search" = step 1 (config + search), "confirm" = step 2, "success" = done
  const [step, setStep] = useState("search");
  const [entityType, setEntityType] = useState("Company");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [autoFetchStatus, setAutoFetchStatus] = useState(null);
  const [autoFetchMessage, setAutoFetchMessage] = useState("");

  const ddrProduct = entitlements?.find((p) => p.code === "DDR");
  const searchMut = useSearchCompanies();
  const searchResults = searchMut.data || [];
  const isSearching = searchMut.isPending;
  const createMut = useCreateOrder();

  function handleClose() {
    setStep("search");
    setEntityType("Company");
    setSearchQuery("");
    setHasSearched(false);
    setSelectedCompany(null);
    setNotes("");
    setError(null);
    setCreatedOrder(null);
    setAutoFetchStatus(null);
    setAutoFetchMessage("");
    searchMut.reset();
    onClose();
  }

  function handleSearch(e) {
    e?.preventDefault();
    if (searchQuery.trim().length < 2) return;
    setHasSearched(true);
    setSelectedCompany(null);
    searchMut.mutate(
      { q: searchQuery, companyType: entityType },
      { onError: () => setError("Search failed. Please try again.") }
    );
  }

  function handleSelectCompany(company) {
    setSelectedCompany(company);
    setStep("confirm");
    setError(null);
  }

  function handlePlaceOrder() {
    if (!selectedCompany || !ddrProduct) return;
    setError(null);
    createMut.mutate(
      {
        data: {
          productId: ddrProduct.productId || ddrProduct.id,
          selectedCompany,
          entityType,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: (order) => {
          setCreatedOrder(order);
          setAutoFetchStatus(order?.autoFetchStatus || "success");
          setAutoFetchMessage(order?.autoFetchMessage || "Order is processed and data is fetched successfully.");
          setStep("success");
          queryClient.invalidateQueries({ queryKey: ["clientOrders"] });
          queryClient.invalidateQueries({ queryKey: ["clientStats"] });
        },
        onError: (err) => {
          setError(err?.response?.data?.message || err?.message || "Failed to place order.");
        },
      }
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={step !== "success" ? handleClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">New Report Request</h2>
              {step !== "success" && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {step === "search"
                    ? "Step 1 of 2 \u2014 Select entity type & search"
                    : "Step 2 of 2 \u2014 Confirm & place order"}
                </p>
              )}
            </div>
          </div>
          {step !== "success" && (
            <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        {step !== "success" && (
          <div className="h-1 bg-slate-100 flex-shrink-0">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: step === "search" ? "50%" : "100%" }}
            />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ======= Step 1: Report Type + Entity Type + Search ======= */}
          {step === "search" && (
            <div className="space-y-5">
              {/* Report type (fixed to DDR) */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Report Type</h3>
                <div className="border-2 border-blue-600 rounded-xl p-3.5 bg-blue-50/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 text-sm">Due Diligence Report</p>
                      {!ddrProduct && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">Not Available</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Comprehensive corporate background investigation</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                </div>
              </div>

              {/* Entity type selector */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Entity Type</h3>
                <div className="grid grid-cols-3 gap-2">
                  {ENTITY_TYPES.map(({ label, description, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => {
                        setEntityType(label);
                        if (hasSearched) {
                          setHasSearched(false);
                          setSelectedCompany(null);
                          searchMut.reset();
                        }
                      }}
                      className={`flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all ${
                        entityType === label
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${entityType === label ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="font-semibold text-xs">{label}</span>
                      <span className={`text-[10px] mt-0.5 leading-tight ${entityType === label ? "text-blue-500" : "text-slate-400"}`}>
                        {description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search bar */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Search {entityType}</h3>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Enter ${entityType} name or identifier...`}
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  <Button type="submit" disabled={searchQuery.trim().length < 2 || isSearching}>
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span className="ml-1.5">{isSearching ? "Searching..." : "Search"}</span>
                  </Button>
                </form>
              </div>

              {/* Loading state */}
              {isSearching && (
                <div className="flex items-center justify-center py-8 gap-3 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-sm">Searching registry...</span>
                </div>
              )}

              {/* Search results */}
              {!isSearching && hasSearched && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    {searchResults.length === 0
                      ? "No results found. Try a different name."
                      : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} \u2014 click to select`}
                  </p>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {searchResults.map((company) => (
                      <button
                        key={company.cin || company.id}
                        onClick={() => handleSelectCompany(company)}
                        className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm leading-snug text-slate-900 group-hover:text-blue-700">
                              {company.companyName}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Hash className="w-3 h-3" />{company.cin}
                              </span>
                              {(company.city || company.state) && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin className="w-3 h-3" />{[company.city, company.state].filter(Boolean).join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <StatusDot status={company.status} />
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!isSearching && !hasSearched && (
                <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                  <Search className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">Enter a name and click Search</p>
                </div>
              )}

              {error && <ErrorAlert message={error} />}
            </div>
          )}

          {/* ======= Step 2: Confirm & Place Order ======= */}
          {step === "confirm" && selectedCompany && (
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Selected Company</h3>
                <p className="text-lg font-bold text-slate-900 leading-snug">{selectedCompany.companyName}</p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">CIN / Identifier</p>
                    <p className="text-sm font-mono font-medium text-slate-700">{selectedCompany.cin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Entity Type</p>
                    <p className="text-sm font-medium text-slate-700">{entityType}</p>
                  </div>
                  {(selectedCompany.city || selectedCompany.state) && (
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Location</p>
                      <p className="text-sm font-medium text-slate-700">
                        {[selectedCompany.city, selectedCompany.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Status</p>
                    <StatusDot status={selectedCompany.status} />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-700">Due Diligence Report</p>
                </div>
                <p className="text-xs text-blue-600">
                  Your report will be available in My Orders once completed.
                </p>
              </div>

              {/* Additional Notes section commented out
              <FormField label="Additional Notes (optional)" hint="Any specific instructions for the analyst">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Focus on recent legal history, check for regulatory actions..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </FormField>
              */}

              {error && <ErrorAlert message={error} />}
            </div>
          )}

          {/* ======= Success ======= */}
          {step === "success" && createdOrder && (
            <div className="flex flex-col items-center text-center py-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Order Processed Successfully!</h3>
              <p className="text-slate-600 max-w-sm text-sm leading-relaxed mb-6">Your order is processed and data is fetched successfully.</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 mb-6 inline-flex items-center gap-2">
                <span className="text-xs text-slate-500">Order Number</span>
                <span className="font-mono font-bold text-blue-700 text-sm">{createdOrder.orderNumber}</span>
              </div>
              <p className="text-xs text-slate-400">Track your order in My Orders.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
          {step === "search" && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <span className="text-xs text-slate-400">Select a company from results to continue</span>
            </>
          )}
          {step === "confirm" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("search");
                  setSelectedCompany(null);
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <Button
                onClick={handlePlaceOrder}
                disabled={!selectedCompany || createMut.isPending}
                isLoading={createMut.isPending}
              >
                {createMut.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </>
          )}
          {step === "success" && (
            <Button className="w-full" onClick={handleClose}>Done</Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewOrderModal;
