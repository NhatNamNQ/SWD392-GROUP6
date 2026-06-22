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
import type { RoleRecord, UserPayload, UserRecord } from "@/features/admin-governance/model/types";

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

function CenteredModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-secondary p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
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
      toast({
        title: "Error",
        description: "Email and full name are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (selectedRole.name === "LECTURER") {
        await createLecturer({ email: createForm.email, fullName: createForm.fullName });
        toast({ title: "Success", description: "Lecturer created and credential email sent." });
      } else {
        if (!createForm.password) {
          toast({
            title: "Error",
            description: "Temporary password is required for this role.",
            variant: "destructive",
          });
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
    <div className="p-6 md:p-8 mx-auto max-w-[1600px] space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-muted-foreground">
            Admin governance
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-foreground">Users Directory</h1>
        </div>
        <Button
          onClick={() => {
            setIsCreating(true);
            setSelectedUserId("");
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" /> New User
        </Button>
      </div>

      <Card>
        <CardHeader className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm font-semibold text-muted-foreground">
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
          {loading ? <p className="text-sm font-semibold text-muted-foreground">Loading users...</p> : null}
          {visibleUsers.map((user) => {
            const isAdmin = user.roleResponse?.name === "ADMIN";

            return (
              <article
                key={user.id}
                className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition duration-200 lg:grid-cols-[1fr_auto]"
              >
                <div className="text-left flex flex-col justify-center">
                  <p className="text-sm font-black text-foreground">{user.email}</p>
                  <p className="text-sm font-semibold text-muted-foreground">
                    {user.fullName || "No display name"} - {user.roleResponse?.name || "No role"}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground mt-1">
                    {user.active ? (
                      <span className="text-primary">● Active</span>
                    ) : (
                      <span className="text-destructive">● Inactive</span>
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
            <p className="text-sm font-semibold text-muted-foreground">No users found.</p>
          ) : null}
        </CardContent>
      </Card>

      {/* Creation Modal */}
      {isCreating && (
        <CenteredModal title="Create New Account" onClose={() => setIsCreating(false)}>
          <form className="space-y-5" onSubmit={handleCreate}>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Account Role</label>
              <select
                className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none"
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
                  <div className="p-3 bg-emerald-50/50 border border-emerald-200/50 rounded-md">
                    <p className="text-xs font-semibold text-emerald-700">
                      Lecturers will automatically receive a credential email to activate their
                      account.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
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
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
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
                    <label className="text-xs font-semibold text-muted-foreground">Temporary Password</label>
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
                  <Button type="submit">
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
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <Input
                value={editForm.email}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="Email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <Input
                value={editForm.fullName}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, fullName: event.target.value }))
                }
                placeholder="Full name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Role</label>
              <select
                className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none"
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
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground border border-border px-3 py-3 rounded-md cursor-pointer hover:bg-muted transition">
                <input
                  checked={editForm.active}
                  type="checkbox"
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                  className="accent-primary w-4 h-4"
                />
                Active Account
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="submit">
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
