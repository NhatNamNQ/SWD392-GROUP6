"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { Edit2, Save, Trash2, UserPlus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  createLecturer,
  createUser,
  deleteUser,
  fetchRoles,
  fetchUsers,
  updateUser,
} from "@/features/admin-governance/api/admin-client";
import type {
  RoleRecord,
  UserPayload,
  UserRecord,
} from "@/features/admin-governance/model/types";

const emptyUserPayload: UserPayload = {
  email: "",
  fullName: "",
  active: true,
  avatarUrl: "",
  roleId: "",
};

function toMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "User request failed.";
}

function toUserPayload(user: UserRecord): UserPayload {
  return {
    email: user.email,
    fullName: user.fullName ?? "",
    active: user.active ?? true,
    avatarUrl: user.avatarUrl ?? "",
    roleId: user.roleResponse?.id ?? "",
  };
}

function CenteredModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b-2 border-slate-200 px-6 py-4">
          <h2 className="text-xl font-black text-slate-800">{title}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  
  // UI states
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Form states
  const [createForm, setCreateForm] = useState({
    email: "",
    fullName: "",
    password: "",
    roleId: "",
  });
  const [editForm, setEditForm] = useState<UserPayload>(emptyUserPayload);

  const { toast } = useToast();

  async function loadGovernance() {
    setLoading(true);
    try {
      const [nextUsers, nextRoles] = await Promise.all([fetchUsers(), fetchRoles()]);
      setUsers(nextUsers);
      setRoles(nextRoles);
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    startTransition(() => {
      void loadGovernance();
    });
    // Initial bootstrap only; refreshes are explicit after mutations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return users;
    }

    return users.filter((user) =>
      `${user.email} ${user.fullName ?? ""} ${user.roleResponse?.name ?? ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, users]);

  function handleSelectUser(user: UserRecord) {
    setSelectedUserId(user.id);
    setEditForm(toUserPayload(user));
    setIsCreating(false);
  }

  function handleCancelEdit() {
    setSelectedUserId("");
    setEditForm(emptyUserPayload);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedRole = roles.find((r) => r.id === createForm.roleId);
    if (!selectedRole) {
      toast({ title: "Error", description: "Role is required.", variant: "destructive" });
      return;
    }

    if (!createForm.email || !createForm.fullName) {
      toast({ title: "Error", description: "Email and full name are required.", variant: "destructive" });
      return;
    }

    try {
      if (selectedRole.name === "LECTURER") {
        await createLecturer({ email: createForm.email, fullName: createForm.fullName });
        toast({ title: "Success", description: "Lecturer created and credential email sent." });
      } else {
        if (!createForm.password) {
          toast({ title: "Error", description: "Temporary password is required for this role.", variant: "destructive" });
          return;
        }
        await createUser({
          userCommonRequest: {
            email: createForm.email,
            fullName: createForm.fullName,
            roleId: createForm.roleId,
            active: true,
            avatarUrl: "",
          },
          password: createForm.password,
        });
        toast({ title: "Success", description: "User created." });
      }
      setCreateForm({ email: "", fullName: "", password: "", roleId: "" });
      setIsCreating(false);
      await loadGovernance();
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await updateUser(editForm);
      await loadGovernance();
      toast({ title: "Success", description: "User updated." });
      setSelectedUserId("");
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    }
  }

  async function handleDelete(userId: string) {
    try {
      await deleteUser(userId);
      setUsers((current) => current.filter((user) => user.id !== userId));
      if (selectedUserId === userId) {
        setSelectedUserId("");
        setEditForm(emptyUserPayload);
      }
      toast({ title: "Success", description: "User deleted." });
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    }
  }

  const isCreatingLecturer =
    createForm.roleId && roles.find((r) => r.id === createForm.roleId)?.name === "LECTURER";

  return (
    <div className="p-6 md:p-8 mx-auto max-w-5xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-slate-700 pb-6">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            Admin governance
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-800">Users Directory</h1>
        </div>
        <Button 
          onClick={() => { setIsCreating(true); setSelectedUserId(""); }} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-chip"
        >
          <UserPlus className="mr-2 h-4 w-4" /> New User
        </Button>
      </div>

      <Card>
        <CardHeader className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            Search users
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Email, name, or role"
              className="max-w-md"
            />
          </label>
          <Badge>{visibleUsers.length} users</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm font-bold text-slate-500">Loading users...</p> : null}
          {visibleUsers.map((user) => {
            const isAdmin = user.roleResponse?.name === "ADMIN";

            return (
              <article
                key={user.id}
                className="grid gap-3 rounded-md border-2 border-slate-200 bg-white p-4 shadow-chip lg:grid-cols-[1fr_auto]"
              >
                <div className="text-left flex flex-col justify-center">
                  <p className="text-sm font-black text-slate-800">{user.email}</p>
                  <p className="text-sm font-semibold text-slate-500">
                    {user.fullName || "No display name"} - {user.roleResponse?.name || "No role"}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 mt-1">
                    {user.active ? (
                      <span className="text-emerald-600">● Active</span>
                    ) : (
                      <span className="text-rose-600">● Inactive</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={() => handleSelectUser(user)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => handleDelete(user.id)}
                    disabled={isAdmin}
                    title={isAdmin ? "Admins cannot be deleted." : "Delete user"}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
          {!loading && !visibleUsers.length ? (
            <p className="text-sm font-bold text-slate-500">No users found.</p>
          ) : null}
        </CardContent>
      </Card>

      {/* Creation Modal */}
      {isCreating && (
        <CenteredModal title="Create New Account" onClose={() => setIsCreating(false)}>
          <form className="space-y-5" onSubmit={handleCreate}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Account Role</label>
              <select
                className="h-11 w-full rounded-sm border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-chip"
                value={createForm.roleId}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, roleId: event.target.value }))
                }
              >
                <option value="">Select a role...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {createForm.roleId && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {isCreatingLecturer && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm">
                    <p className="text-xs font-bold text-emerald-700">
                      Lecturers will automatically receive a credential email to activate their account.
                    </p>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <Input
                    value={createForm.email}
                    onChange={(event) =>
                      setCreateForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="user@example.com"
                    autoFocus
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <Input
                    value={createForm.fullName}
                    onChange={(event) =>
                      setCreateForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                    placeholder="John Doe"
                  />
                </div>

                {!isCreatingLecturer && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Temporary Password</label>
                    <Input
                      value={createForm.password}
                      onChange={(event) =>
                        setCreateForm((current) => ({ ...current, password: event.target.value }))
                      }
                      placeholder="••••••••"
                      type="password"
                    />
                  </div>
                )}
                
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-chip">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create account
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CenteredModal>
      )}

      {/* Edit Modal */}
      {selectedUserId && (
        <CenteredModal title="Edit User" onClose={handleCancelEdit}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <Input
                value={editForm.email}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="Email"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <Input
                value={editForm.fullName}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, fullName: event.target.value }))
                }
                placeholder="Full name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Role</label>
              <select
                className="h-11 w-full rounded-sm border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-chip"
                value={editForm.roleId}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, roleId: event.target.value }))
                }
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 border-2 border-slate-200 px-3 py-3 rounded-md cursor-pointer hover:bg-slate-50 transition">
                <input
                  checked={editForm.active}
                  type="checkbox"
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                  className="accent-emerald-600 w-4 h-4"
                />
                Active Account
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CenteredModal>
      )}
    </div>
  );
}
