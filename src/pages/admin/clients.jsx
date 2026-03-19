import { useState } from "react";
import {
  useListClientCompanies,
  useCreateClientCompany,
  useUpdateClientCompany,
  useListClientProducts,
  useListProducts,
  useCreateClientProduct,
  useRevokeClientProduct
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  PageHeader,
  Card,
  Button,
  Drawer,
  FormField,
  Input,
  Select,
  Textarea,
  SectionTitle,
  DetailRow,
  StatusBadge,
  EmptyState,
  ErrorAlert
} from "@/components/ui-shared";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Building2,
  MapPin,
  Phone,
  Mail,
  Package,
  CheckCircle2,
  XCircle,
  Pencil,
  ChevronRight,
  User
} from "lucide-react";
const EMPTY_FORM = {
  name: "",
  legalName: "",
  slug: "",
  registeredAddress: "",
  country: "United States",
  state: "",
  city: "",
  postalCode: "",
  contactPersonName: "",
  contactEmail: "",
  contactPhone: "",
  contactMobile: "",
  notes: "",
  status: "active"
};
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function AdminClients() {
  const qc = useQueryClient();
  const { data: companies = [], isLoading } = useListClientCompanies();
  const [selected, setSelected] = useState(null);
  const [drawerMode, setDrawerMode] = useState("view");
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const createMut = useCreateClientCompany({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["/api/admin/client-companies"] });
        setDrawerMode("view");
        setError(null);
      },
      onError: (err) => setError(err?.response?.data?.error || "Failed to create company")
    }
  });
  const updateMut = useUpdateClientCompany({
    mutation: {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: ["/api/admin/client-companies"] });
        setSelected(data);
        setDrawerMode("view");
        setError(null);
      },
      onError: (err) => setError(err?.response?.data?.error || "Failed to update company")
    }
  });
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSelected(null);
    setError(null);
    setDrawerMode("create");
  };
  const openView = (c) => {
    setSelected(c);
    setDrawerMode("view");
    setError(null);
  };
  const openEdit = (c) => {
    setForm({
      name: c.name,
      legalName: c.legalName || "",
      slug: c.slug,
      registeredAddress: c.registeredAddress || "",
      country: c.country || "",
      state: c.state || "",
      city: c.city || "",
      postalCode: c.postalCode || "",
      contactPersonName: c.contactPersonName || "",
      contactEmail: c.contactEmail || "",
      contactPhone: c.contactPhone || "",
      contactMobile: c.contactMobile || "",
      notes: c.notes || "",
      status: c.status
    });
    setError(null);
    setDrawerMode("edit");
  };
  const handleToggleStatus = (c) => {
    const newStatus = c.status === "active" ? "inactive" : "active";
    updateMut.mutate({
      id: c.id,
      data: { ...c, legalName: c.legalName ?? void 0, status: newStatus }
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      legalName: form.legalName || void 0,
      slug: form.slug,
      registeredAddress: form.registeredAddress || void 0,
      country: form.country || void 0,
      state: form.state || void 0,
      city: form.city || void 0,
      postalCode: form.postalCode || void 0,
      contactPersonName: form.contactPersonName || void 0,
      contactEmail: form.contactEmail || void 0,
      contactPhone: form.contactPhone || void 0,
      contactMobile: form.contactMobile || void 0,
      notes: form.notes || void 0,
      status: form.status
    };
    if (drawerMode === "create") {
      createMut.mutate({ data: payload });
    } else if (selected) {
      updateMut.mutate({ id: selected.id, data: payload });
    }
  };
  const drawerOpen = drawerMode === "create" || selected !== null && (drawerMode === "view" || drawerMode === "edit");
  return <div>
      <PageHeader
    title="Client Companies"
    description="Manage tenant organizations on the platform"
    action={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Client</Button>}
  />

      <Card>
        {isLoading ? <div className="p-12 text-center text-slate-500">Loading companies…</div> : companies.length === 0 ? <EmptyState
    icon={<Building2 className="w-8 h-8" />}
    title="No client companies yet"
    description="Add your first client to get started."
    action={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Client</Button>}
  /> : <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Company</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c) => <tr
    key={c.id}
    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selected?.id === c.id ? "bg-blue-50/50" : ""}`}
    onClick={() => openView(c)}
  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      {c.legalName && c.legalName !== c.name && <div className="text-xs text-slate-400 mt-0.5">{c.legalName}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {[c.city, c.state, c.country].filter(Boolean).join(", ") || "\u2014"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{c.contactEmail || "\u2014"}</td>
                    <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(c.createdAt)}</td>
                    <td className="px-6 py-4">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </Card>

      {
    /* Detail/Edit Drawer */
  }
      <Drawer
    isOpen={drawerOpen}
    onClose={() => {
      setSelected(null);
      setDrawerMode("view");
      setError(null);
    }}
    title={drawerMode === "create" ? "New Client Company" : drawerMode === "edit" ? "Edit Company" : selected?.name || ""}
    width="xl"
  >
        {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

        {
    /* View Mode */
  }
        {drawerMode === "view" && selected && <CompanyDetail
    company={selected}
    onEdit={() => openEdit(selected)}
    onToggle={() => handleToggleStatus(selected)}
    isToggling={updateMut.isPending}
  />}

        {
    /* Create / Edit Form */
  }
        {(drawerMode === "create" || drawerMode === "edit") && <form onSubmit={handleSubmit} className="space-y-6">
            <SectionTitle>Company Information</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormField label="Company Name" required>
                  <Input
    value={form.name}
    onChange={(e) => setForm((f) => ({
      ...f,
      name: e.target.value,
      slug: drawerMode === "create" ? slugify(e.target.value) : f.slug
    }))}
    placeholder="e.g. Acme Corporation"
    required
  />
                </FormField>
              </div>
              <div className="col-span-2">
                <FormField label="Legal Name">
                  <Input
    value={form.legalName}
    onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))}
    placeholder="Full legal name as registered"
  />
                </FormField>
              </div>
              <div className="col-span-2">
                <FormField label="Tenant Slug" required hint="Unique identifier. Lowercase, numbers, hyphens only. Cannot be changed after creation.">
                  <Input
    value={form.slug}
    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
    pattern="[a-z0-9\-]+"
    required
    disabled={drawerMode === "edit"}
    className={drawerMode === "edit" ? "bg-slate-50 text-slate-500" : ""}
  />
                </FormField>
              </div>
            </div>

            <SectionTitle>Registered Address</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormField label="Street Address">
                  <Input
    value={form.registeredAddress}
    onChange={(e) => setForm((f) => ({ ...f, registeredAddress: e.target.value }))}
    placeholder="123 Main Street, Suite 400"
  />
                </FormField>
              </div>
              <FormField label="Country">
                <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="United States" />
              </FormField>
              <FormField label="State / Province">
                <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="New York" />
              </FormField>
              <FormField label="City">
                <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="New York" />
              </FormField>
              <FormField label="Postal Code">
                <Input value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} placeholder="10001" />
              </FormField>
            </div>

            <SectionTitle>Primary Contact</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormField label="Contact Person Name">
                  <Input value={form.contactPersonName} onChange={(e) => setForm((f) => ({ ...f, contactPersonName: e.target.value }))} placeholder="Jane Smith" />
                </FormField>
              </div>
              <FormField label="Contact Email">
                <Input type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} placeholder="contact@company.com" />
              </FormField>
              <FormField label="Phone">
                <Input value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} placeholder="+1 (555) 000-0000" />
              </FormField>
              <div className="col-span-2">
                <FormField label="Mobile">
                  <Input value={form.contactMobile} onChange={(e) => setForm((f) => ({ ...f, contactMobile: e.target.value }))} placeholder="+1 (555) 000-0001" />
                </FormField>
              </div>
            </div>

            <SectionTitle>Settings</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Internal Notes">
              <Textarea
    value={form.notes}
    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
    placeholder="Any internal notes about this client..."
    className="min-h-[80px]"
  />
            </FormField>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => {
    if (drawerMode === "edit" && selected) {
      setDrawerMode("view");
    } else {
      setSelected(null);
      setDrawerMode("view");
    }
    setError(null);
  }}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMut.isPending || updateMut.isPending}>
                {drawerMode === "create" ? "Create Company" : "Save Changes"}
              </Button>
            </div>
          </form>}
      </Drawer>
    </div>;
}
function CompanyDetail({
  company,
  onEdit,
  onToggle,
  isToggling
}) {
  const qc = useQueryClient();
  const { data: entitlements = [] } = useListClientProducts({ clientCompanyId: company.id });
  const { data: allProducts = [] } = useListProducts();
  const grantMut = useCreateClientProduct({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/client-products"] }) }
  });
  const revokeMut = useRevokeClientProduct({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/client-products"] }) }
  });
  const grantedIds = new Set(entitlements.map((e) => e.productId));
  const handleToggleProduct = (productId) => {
    const existing = entitlements.find((e) => e.productId === productId);
    if (existing) {
      revokeMut.mutate({ id: existing.id });
    } else {
      grantMut.mutate({ data: { clientCompanyId: company.id, productId } });
    }
  };
  return <div className="space-y-8">
      {
    /* Header actions */
  }
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Details
        </Button>
        <Button
    size="sm"
    variant={company.status === "active" ? "destructive" : "secondary"}
    onClick={onToggle}
    isLoading={isToggling}
  >
          {company.status === "active" ? <><XCircle className="w-3.5 h-3.5 mr-1.5" />Deactivate</> : <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Activate</>}
        </Button>
      </div>

      {
    /* Company Info */
  }
      <div>
        <SectionTitle>Company Information</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <DetailRow label="Company Name" value={company.name} />
          <DetailRow label="Legal Name" value={company.legalName} />
          <DetailRow label="Slug" value={<span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{company.slug}</span>} />
          <DetailRow label="Status" value={<StatusBadge status={company.status} />} />
        </div>
      </div>

      {
    /* Address */
  }
      <div>
        <SectionTitle>Registered Address</SectionTitle>
        <div className="flex items-start gap-2 text-sm text-slate-700">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            {company.registeredAddress && <div>{company.registeredAddress}</div>}
            {[company.city, company.state, company.postalCode].filter(Boolean).length > 0 && <div>{[company.city, company.state, company.postalCode].filter(Boolean).join(", ")}</div>}
            {company.country && <div>{company.country}</div>}
            {!company.registeredAddress && !company.city && <span className="text-slate-400 italic">No address on file</span>}
          </div>
        </div>
      </div>

      {
    /* Contact */
  }
      <div>
        <SectionTitle>Primary Contact</SectionTitle>
        <div className="space-y-3">
          {company.contactPersonName && <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-800">{company.contactPersonName}</span>
            </div>}
          {company.contactEmail && <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <a href={`mailto:${company.contactEmail}`} className="text-blue-600 hover:underline">{company.contactEmail}</a>
            </div>}
          {company.contactPhone && <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-800">{company.contactPhone}</span>
            </div>}
          {company.contactMobile && <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-800">{company.contactMobile} <span className="text-slate-400 text-xs">(mobile)</span></span>
            </div>}
          {!company.contactPersonName && !company.contactEmail && !company.contactPhone && <span className="text-slate-400 italic text-sm">No contact info on file</span>}
        </div>
      </div>

      {
    /* Product Entitlements */
  }
      <div>
        <SectionTitle>Product Access</SectionTitle>
        <div className="space-y-2">
          {allProducts.map((product) => {
    const granted = grantedIds.has(product.id);
    return <div key={product.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${granted ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center gap-2">
                  <Package className={`w-4 h-4 ${granted ? "text-emerald-600" : "text-slate-400"}`} />
                  <div>
                    <div className={`text-sm font-semibold ${granted ? "text-emerald-800" : "text-slate-600"}`}>{product.name}</div>
                    <div className="text-xs text-slate-500">{product.code}</div>
                  </div>
                </div>
                <Button
      size="sm"
      variant={granted ? "destructive" : "secondary"}
      onClick={() => handleToggleProduct(product.id)}
      isLoading={grantMut.isPending || revokeMut.isPending}
    >
                  {granted ? "Revoke" : "Grant"}
                </Button>
              </div>;
  })}
        </div>
      </div>

      {
    /* Notes */
  }
      {company.notes && <div>
          <SectionTitle>Internal Notes</SectionTitle>
          <p className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-xl p-4 whitespace-pre-wrap">{company.notes}</p>
        </div>}

      {
    /* Meta */
  }
      <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-400">
        <div>Created: {formatDate(company.createdAt)}</div>
        <div>Last updated: {formatDate(company.updatedAt)}</div>
      </div>
    </div>;
}
export {
  AdminClients as default
};
