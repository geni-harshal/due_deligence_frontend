import { useState } from "react";
import {
  useListProducts,
  useListClientProducts,
  useListClientCompanies,
  useCreateClientProduct,
  useRevokeClientProduct
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ShieldCheck } from "lucide-react";
import { PageHeader, Card, Button, Label, Select, Modal } from "@/components/ui-shared";
function AdminProducts() {
  const qc = useQueryClient();
  const { data: products = [] } = useListProducts();
  const { data: mappings = [] } = useListClientProducts({});
  const { data: companies = [] } = useListClientCompanies();
  const createMapping = useCreateClientProduct({
    mutation: { onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/client-products"] });
      setShowGrant(false);
    } }
  });
  const revoke = useRevokeClientProduct({
    mutation: { onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/client-products"] });
    } }
  });
  const [showGrant, setShowGrant] = useState(false);
  const [grantForm, setGrantForm] = useState({ clientCompanyId: "", productId: "" });
  const handleGrant = (e) => {
    e.preventDefault();
    createMapping.mutate({ data: { clientCompanyId: parseInt(grantForm.clientCompanyId), productId: parseInt(grantForm.productId) } });
  };
  return <div className="space-y-8">
      <PageHeader title="Product Catalog" subtitle="Manage products and client entitlements" />

      {
    /* Products */
  }
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Available Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => <Card key={p.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{p.name}</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded">{p.code}</span>
                    {p.isActive ? <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span> : <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">Inactive</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{p.description}</p>
                </div>
              </div>
            </Card>)}
        </div>
      </div>

      {
    /* Entitlements */
  }
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Client Entitlements</h2>
          <Button onClick={() => {
    setShowGrant(true);
    setGrantForm({ clientCompanyId: "", productId: "" });
  }}>
            <Plus className="w-4 h-4 mr-2" /> Grant Access
          </Button>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Client Company</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Granted</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m) => <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{m.clientCompanyName}</td>
                    <td className="px-4 py-3 text-slate-700">{m.productName}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded">{m.productCode}</span></td>
                    <td className="px-4 py-3 text-slate-500">{new Date(m.grantedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => revoke.mutate({ id: m.id })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>)}
                {mappings.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No entitlements configured</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {showGrant && <Modal title="Grant Product Access" onClose={() => setShowGrant(false)}>
          <form onSubmit={handleGrant} className="space-y-4">
            <div>
              <Label>Client Company</Label>
              <Select value={grantForm.clientCompanyId} onChange={(e) => setGrantForm((f) => ({ ...f, clientCompanyId: e.target.value }))} required>
                <option value="">— Select Company —</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Product</Label>
              <Select value={grantForm.productId} onChange={(e) => setGrantForm((f) => ({ ...f, productId: e.target.value }))} required>
                <option value="">— Select Product —</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowGrant(false)}>Cancel</Button>
              <Button type="submit" isLoading={createMapping.isPending}>Grant Access</Button>
            </div>
          </form>
        </Modal>}
    </div>;
}
export {
  AdminProducts as default
};
