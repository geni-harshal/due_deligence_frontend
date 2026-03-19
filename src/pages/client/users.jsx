import { useState } from "react";
import {
  useListMyCompanyUsers,
  useCreateMyCompanyUser,
  useUpdateMyCompanyUser,
  useResetMyCompanyUserPassword
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
  ErrorAlert
} from "@/components/ui-shared";
import { formatDate } from "@/lib/utils";
import { Plus, Users, UserCheck, UserX, Pencil, KeyRound } from "lucide-react";
const CLIENT_ROLES = [
  { value: "client_admin", label: "Admin", description: "Full access to manage orders and users", color: "bg-blue-100 text-blue-800" },
  { value: "client_user", label: "User", description: "Can place and track orders", color: "bg-sky-100 text-sky-800" }
];
function RoleBadge({ role }) {
  const r = CLIENT_ROLES.find((x) => x.value === role);
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${r?.color || "bg-slate-100 text-slate-700"}`}>
      {r?.label || role}
    </span>;
}
function ClientUsers() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useListMyCompanyUsers();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [error, setError] = useState(null);
  const [createForm, setCreateForm] = useState({ email: "", fullName: "", password: "", role: "client_user" });
  const [resetPw, setResetPw] = useState("");
  const createMut = useCreateMyCompanyUser({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["/api/client-admin/users"] });
        setShowCreate(false);
        setCreateForm({ email: "", fullName: "", password: "", role: "client_user" });
        setError(null);
      },
      onError: (err) => setError(err?.response?.data?.error || "Failed to create user")
    }
  });
  const updateMut = useUpdateMyCompanyUser({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["/api/client-admin/users"] });
        setEditing(null);
        setError(null);
      },
      onError: (err) => setError(err?.response?.data?.error || "Failed to update user")
    }
  });
  const resetMut = useResetMyCompanyUserPassword({
    mutation: {
      onSuccess: () => {
        setResetting(null);
        setResetPw("");
        setError(null);
      },
      onError: (err) => setError(err?.response?.data?.error || "Failed to reset password")
    }
  });
  const handleCreate = (e) => {
    e.preventDefault();
    setError(null);
    createMut.mutate({ data: createForm });
  };
  const handleUpdate = (e) => {
    e.preventDefault();
    setError(null);
    updateMut.mutate({ id: editing.id, data: { fullName: editing.fullName, role: editing.role, isActive: editing.isActive } });
  };
  const handleReset = (e) => {
    e.preventDefault();
    setError(null);
    resetMut.mutate({ id: resetting.id, data: { newPassword: resetPw } });
  };
  const handleToggle = (u) => {
    updateMut.mutate({ id: u.id, data: { fullName: u.fullName, role: u.role, isActive: !u.isActive } });
  };
  return <div>
      <PageHeader
    title="Team Members"
    description="Manage users who can access your company's account"
    action={<Button onClick={() => {
      setShowCreate(true);
      setError(null);
    }}>
            <Plus className="w-4 h-4 mr-2" /> Add Team Member
          </Button>}
  />

      {
    /* Role guide */
  }
      <div className="grid grid-cols-2 gap-4 mb-6">
        {CLIENT_ROLES.map((r) => <div key={r.value} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${r.color}`}>{r.label}</span>
            </div>
            <p className="text-xs text-slate-500">{r.description}</p>
          </div>)}
      </div>

      <Card>
        {isLoading ? <div className="p-12 text-center text-slate-500">Loading team members…</div> : users.length === 0 ? <EmptyState
    icon={<Users className="w-8 h-8" />}
    title="No team members yet"
    description="Add colleagues to give them access to your DiligencePro account."
    action={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Add Team Member</Button>}
  /> : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500">Name</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500">Email</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500">Role</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500">Status</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500">Joined</th>
                  <th className="px-5 py-4 text-right font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">{u.fullName}</td>
                    <td className="px-5 py-4 text-slate-600">{u.email}</td>
                    <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-4">
                      {u.isActive ? <span className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium"><UserCheck className="w-3.5 h-3.5" />Active</span> : <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium"><UserX className="w-3.5 h-3.5" />Inactive</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
    title="Edit"
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
    onClick={() => handleToggle(u)}
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
      {showCreate && <Modal title="Add Team Member" onClose={() => {
    setShowCreate(false);
    setError(null);
  }}>
          {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField label="Full Name" required>
              <Input value={createForm.fullName} onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))} required placeholder="Jane Smith" />
            </FormField>
            <FormField label="Email Address" required>
              <Input type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} required placeholder="jane@yourcompany.com" />
            </FormField>
            <FormField label="Password" required hint="They can change this after logging in.">
              <Input type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} required minLength={8} placeholder="At least 8 characters" />
            </FormField>
            <FormField label="Role" required>
              <Select value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}>
                {CLIENT_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label} — {r.description}</option>)}
              </Select>
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => {
    setShowCreate(false);
    setError(null);
  }}>Cancel</Button>
              <Button type="submit" isLoading={createMut.isPending}>Add Member</Button>
            </div>
          </form>
        </Modal>}

      {
    /* Edit Modal */
  }
      {editing && <Modal title="Edit Team Member" onClose={() => {
    setEditing(null);
    setError(null);
  }}>
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
                {CLIENT_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </FormField>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <input
    id="isActiveEdit"
    type="checkbox"
    className="w-4 h-4 rounded text-blue-600"
    checked={editing.isActive}
    onChange={(e) => setEditing((u) => ({ ...u, isActive: e.target.checked }))}
  />
              <label htmlFor="isActiveEdit" className="text-sm font-medium text-slate-700 cursor-pointer">Account is active</label>
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
            <p className="text-sm text-slate-600">
              Set a new password for <strong>{resetting.email}</strong>.
            </p>
            <FormField label="New Password" required hint="Minimum 8 characters.">
              <Input type="password" value={resetPw} onChange={(e) => setResetPw(e.target.value)} required minLength={8} placeholder="New password…" />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => {
    setResetting(null);
    setError(null);
  }}>Cancel</Button>
              <Button type="submit" isLoading={resetMut.isPending}>
                <KeyRound className="w-4 h-4 mr-1.5" />Reset Password
              </Button>
            </div>
          </form>
        </Modal>}
    </div>;
}
export {
  ClientUsers as default
};
