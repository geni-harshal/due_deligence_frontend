import { useState } from "react";
import {
  useListUsers,
  useCreateUser,
  useUpdateUser,
  useAdminResetPassword,
  useListClientCompanies
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  PageHeader,
  Card,
  Button,
  Modal,
  Input,
  Select,
  FormField,
  EmptyState,
  ErrorAlert,
  SectionTitle
} from "@/components/ui-shared";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Users,
  Search,
  UserCheck,
  UserX,
  KeyRound,
  Pencil,
  Filter
} from "lucide-react";
const ALL_ROLES = [
  { value: "super_admin", label: "Super Admin", color: "bg-purple-100 text-purple-800" },
  { value: "client_admin", label: "Client Admin", color: "bg-blue-100 text-blue-800" },
  { value: "client_user", label: "Client User", color: "bg-sky-100 text-sky-800" },
  { value: "operations_user", label: "Ops User", color: "bg-amber-100 text-amber-800" },
  { value: "operations_reviewer", label: "Ops Reviewer", color: "bg-orange-100 text-orange-800" }
];
const CLIENT_ROLES = ALL_ROLES.filter((r) => r.value === "client_admin" || r.value === "client_user");
function RoleBadge({ role }) {
  const r = ALL_ROLES.find((x) => x.value === role);
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${r?.color || "bg-slate-100 text-slate-700"}`}>
      {r?.label || role}
    </span>;
}
function AdminUsers() {
  const qc = useQueryClient();
  const { data: companies = [] } = useListClientCompanies();
  const [filterCompany, setFilterCompany] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [error, setError] = useState(null);
  const [createForm, setCreateForm] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "client_user",
    clientCompanyId: ""
  });
  const [resetPw, setResetPw] = useState("");
  const { data: users = [], isLoading } = useListUsers(
    filterCompany ? { clientCompanyId: parseInt(filterCompany) } : {}
  );
  const createMut = useCreateUser({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
        setShowCreate(false);
        setError(null);
      },
      onError: (err) => setError(err?.response?.data?.error || "Failed to create user")
    }
  });
  const updateMut = useUpdateUser({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
        setEditing(null);
        setError(null);
      },
      onError: (err) => setError(err?.response?.data?.error || "Failed to update user")
    }
  });
  const resetMut = useAdminResetPassword({
    mutation: {
      onSuccess: () => {
        setResetting(null);
        setResetPw("");
        setError(null);
      },
      onError: (err) => setError(err?.response?.data?.error || "Failed to reset password")
    }
  });
  const needsCompany = (role) => role === "client_admin" || role === "client_user";
  const filtered = users.filter((u) => {
    if (!filterSearch) return true;
    const q = filterSearch.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });
  const handleCreate = (e) => {
    e.preventDefault();
    setError(null);
    createMut.mutate({
      data: {
        email: createForm.email,
        fullName: createForm.fullName,
        password: createForm.password,
        role: createForm.role,
        clientCompanyId: createForm.clientCompanyId ? parseInt(createForm.clientCompanyId) : void 0
      }
    });
  };
  const handleUpdate = (e) => {
    e.preventDefault();
    setError(null);
    updateMut.mutate({
      id: editing.id,
      data: {
        fullName: editing.fullName,
        role: editing.role,
        isActive: editing.isActive,
        clientCompanyId: editing.clientCompanyId || null
      }
    });
  };
  const handleReset = (e) => {
    e.preventDefault();
    setError(null);
    resetMut.mutate({ id: resetting.id, data: { newPassword: resetPw } });
  };
  const handleToggleActive = (u) => {
    updateMut.mutate({ id: u.id, data: { fullName: u.fullName, role: u.role, isActive: !u.isActive } });
  };
  return <div>
      <PageHeader title="User Management" description="Manage all platform users and their access">
        <Button onClick={() => {
    setShowCreate(true);
    setCreateForm({ email: "", fullName: "", password: "", role: "client_user", clientCompanyId: "" });
    setError(null);
  }}>
          <Plus className="w-4 h-4 mr-2" /> New User
        </Button>
      </PageHeader>

      {
    /* Filters */
  }
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
    value={filterSearch}
    onChange={(e) => setFilterSearch(e.target.value)}
    placeholder="Search by name or email…"
    className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
  />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
    value={filterCompany}
    onChange={(e) => setFilterCompany(e.target.value)}
    className="pl-3 pr-8 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 appearance-none"
  >
            <option value="">All Companies</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <span className="text-sm text-slate-500">{filtered.length} users</span>
      </div>

      <Card>
        {isLoading ? <div className="p-12 text-center text-slate-500">Loading users…</div> : filtered.length === 0 ? <EmptyState icon={<Users className="w-8 h-8" />} title="No users found" description="Try adjusting your search or filters." /> : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500">Name</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500">Email</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500">Role</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500">Company</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500">Status</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500">Joined</th>
                  <th className="px-5 py-4 text-right font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">{u.fullName}</td>
                    <td className="px-5 py-4 text-slate-600">{u.email}</td>
                    <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{u.clientCompanyName || <span className="text-slate-300">Internal</span>}</td>
                    <td className="px-5 py-4">
                      {u.isActive ? <span className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium"><UserCheck className="w-3.5 h-3.5" />Active</span> : <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium"><UserX className="w-3.5 h-3.5" />Inactive</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
    title="Edit user"
    onClick={() => {
      setEditing({ ...u });
      setError(null);
    }}
  >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors"
    title="Reset password"
    onClick={() => {
      setResetting(u);
      setResetPw("");
      setError(null);
    }}
  >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
    className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${u.isActive ? "text-slate-500 hover:text-red-600" : "text-slate-400 hover:text-emerald-600"}`}
    title={u.isActive ? "Deactivate" : "Activate"}
    onClick={() => handleToggleActive(u)}
  >
                          {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </Card>

      {
    /* Create Modal */
  }
      {showCreate && <Modal title="Create New User" onClose={() => {
    setShowCreate(false);
    setError(null);
  }} size="lg">
          {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <SectionTitle>Account Details</SectionTitle>
            <FormField label="Full Name" required>
              <Input value={createForm.fullName} onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))} required placeholder="Jane Smith" />
            </FormField>
            <FormField label="Email Address" required>
              <Input type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} required placeholder="jane@company.com" />
            </FormField>
            <FormField label="Password" required hint="Minimum 8 characters.">
              <Input type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} required minLength={8} placeholder="••••••••" />
            </FormField>

            <SectionTitle>Role & Access</SectionTitle>
            <FormField label="Role" required>
              <Select value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value, clientCompanyId: "" }))}>
                {ALL_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </FormField>
            {needsCompany(createForm.role) && <FormField label="Client Company" required>
                <Select value={createForm.clientCompanyId} onChange={(e) => setCreateForm((f) => ({ ...f, clientCompanyId: e.target.value }))} required>
                  <option value="">— Select a company —</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </FormField>}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => {
    setShowCreate(false);
    setError(null);
  }}>Cancel</Button>
              <Button type="submit" isLoading={createMut.isPending}>Create User</Button>
            </div>
          </form>
        </Modal>}

      {
    /* Edit Modal */
  }
      {editing && <Modal title="Edit User" onClose={() => {
    setEditing(null);
    setError(null);
  }} size="lg">
          {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
          <form onSubmit={handleUpdate} className="space-y-4">
            <FormField label="Full Name" required>
              <Input value={editing.fullName} onChange={(e) => setEditing((u) => ({ ...u, fullName: e.target.value }))} required />
            </FormField>
            <FormField label="Email">
              <Input value={editing.email} disabled className="bg-slate-50 text-slate-500" />
            </FormField>
            <FormField label="Role" required>
              <Select value={editing.role} onChange={(e) => setEditing((u) => ({ ...u, role: e.target.value }))}>
                {ALL_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </FormField>
            {needsCompany(editing.role) && <FormField label="Client Company">
                <Select value={editing.clientCompanyId || ""} onChange={(e) => setEditing((u) => ({ ...u, clientCompanyId: e.target.value ? parseInt(e.target.value) : null }))}>
                  <option value="">— None —</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </FormField>}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <input
    id="isActive"
    type="checkbox"
    className="w-4 h-4 rounded text-blue-600"
    checked={editing.isActive}
    onChange={(e) => setEditing((u) => ({ ...u, isActive: e.target.checked }))}
  />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                Account is active
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => {
    setEditing(null);
    setError(null);
  }}>Cancel</Button>
              <Button type="submit" isLoading={updateMut.isPending}>Save Changes</Button>
            </div>
          </form>
        </Modal>}

      {
    /* Reset Password Modal */
  }
      {resetting && <Modal title={`Reset Password \u2014 ${resetting.fullName}`} onClose={() => {
    setResetting(null);
    setError(null);
  }}>
          {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-slate-600">Set a new password for <strong>{resetting.email}</strong>. They will need to use this password on their next login.</p>
            <FormField label="New Password" required hint="Minimum 8 characters.">
              <Input
    id="reset-password-input"
    name="newPassword"
    type="password"
    value={resetPw}
    onChange={(e) => setResetPw(e.target.value)}
    required
    minLength={8}
    placeholder="New password…"
    autoFocus
  />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => {
    setResetting(null);
    setError(null);
  }}>Cancel</Button>
              <Button type="submit" isLoading={resetMut.isPending}>
                <KeyRound className="w-4 h-4 mr-1.5" /> Reset Password
              </Button>
            </div>
          </form>
        </Modal>}
    </div>;
}
export {
  AdminUsers as default
};
