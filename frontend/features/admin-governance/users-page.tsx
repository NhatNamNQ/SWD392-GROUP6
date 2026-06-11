"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { Save, Trash2, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createLecturer,
  createUser,
  deleteUser,
  fetchRoles,
  fetchUsers,
  updateUser,
} from "@/features/admin-governance/api/admin-client";
import type {
  CreateLecturerPayload,
  CreateUserPayload,
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

export function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [lecturerForm, setLecturerForm] = useState<CreateLecturerPayload>({
    email: "",
    fullName: "",
  });
  const [createForm, setCreateForm] = useState<CreateUserPayload>({
    userCommonRequest: emptyUserPayload,
    password: "",
  });
  const [editForm, setEditForm] = useState<UserPayload>(emptyUserPayload);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadGovernance() {
    setLoading(true);
    try {
      const [nextUsers, nextRoles] = await Promise.all([fetchUsers(), fetchRoles()]);
      setUsers(nextUsers);
      setRoles(nextRoles);
      setNotice(null);
      if (!selectedUserId && nextUsers[0]) {
        setSelectedUserId(nextUsers[0].id);
        setEditForm(toUserPayload(nextUsers[0]));
      }
    } catch (error) {
      setNotice(toMessage(error));
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
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !createForm.userCommonRequest.email ||
      !createForm.password ||
      !createForm.userCommonRequest.roleId
    ) {
      setNotice("Email, password, and role are required.");
      return;
    }

    try {
      await createUser(createForm);
      setCreateForm({ userCommonRequest: emptyUserPayload, password: "" });
      await loadGovernance();
      setNotice("User created.");
    } catch (error) {
      setNotice(toMessage(error));
    }
  }

  async function handleCreateLecturer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lecturerForm.email || !lecturerForm.fullName) {
      setNotice("Lecturer email and full name are required.");
      return;
    }

    try {
      await createLecturer(lecturerForm);
      setLecturerForm({ email: "", fullName: "" });
      await loadGovernance();
      setNotice("Lecturer created and credential email sent.");
    } catch (error) {
      setNotice(toMessage(error));
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await updateUser(editForm);
      await loadGovernance();
      setNotice("User updated.");
    } catch (error) {
      setNotice(toMessage(error));
    }
  }

  async function handleDelete(userId: string) {
    try {
      await deleteUser(userId);
      setUsers((current) => current.filter((user) => user.id !== userId));
      setSelectedUserId("");
      setEditForm(emptyUserPayload);
      setNotice("User deleted.");
    } catch (error) {
      setNotice(toMessage(error));
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            Admin governance
          </p>
          <h1 className="text-4xl font-black text-slate-800">Users</h1>
        </div>

        {notice ? (
          <div className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
          <Card>
            <CardHeader className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <label className="grid gap-2 text-sm font-extrabold text-slate-700">
                Search users
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Email, name, or role"
                />
              </label>
              <Badge>{visibleUsers.length} users</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? <p className="text-sm font-bold text-slate-500">Loading users...</p> : null}
              {visibleUsers.map((user) => (
                <article
                  key={user.id}
                  className="grid gap-3 rounded-md border-2 border-slate-200 bg-white p-4 shadow-chip lg:grid-cols-[1fr_auto]"
                >
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => handleSelectUser(user)}
                  >
                    <p className="text-sm font-black text-slate-800">{user.email}</p>
                    <p className="text-sm font-semibold text-slate-500">
                      {user.fullName || "No display name"} - {user.roleResponse?.name || "No role"}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      {user.active ? "Active" : "Inactive"}
                    </p>
                  </button>
                  <Button type="button" variant="ghost" onClick={() => handleDelete(user.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </article>
              ))}
              {!loading && !visibleUsers.length ? (
                <p className="text-sm font-bold text-slate-500">No users found.</p>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Create lecturer</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleCreateLecturer}>
                  <Input
                    value={lecturerForm.email}
                    onChange={(event) =>
                      setLecturerForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="Email"
                  />
                  <Input
                    value={lecturerForm.fullName}
                    onChange={(event) =>
                      setLecturerForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                    placeholder="Full name"
                  />
                  <Button type="submit">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create lecturer
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create user</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs font-bold text-slate-500">
                  Lecturer accounts use the dedicated lecturer form above.
                </p>
                <form className="space-y-3" onSubmit={handleCreate}>
                  <Input
                    value={createForm.userCommonRequest.email}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        userCommonRequest: {
                          ...current.userCommonRequest,
                          email: event.target.value,
                        },
                      }))
                    }
                    placeholder="Email"
                  />
                  <Input
                    value={createForm.userCommonRequest.fullName}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        userCommonRequest: {
                          ...current.userCommonRequest,
                          fullName: event.target.value,
                        },
                      }))
                    }
                    placeholder="Full name"
                  />
                  <Input
                    value={createForm.password}
                    onChange={(event) =>
                      setCreateForm((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="Temporary password"
                    type="password"
                  />
                  <select
                    className="h-11 w-full rounded-sm border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-chip"
                    value={createForm.userCommonRequest.roleId}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        userCommonRequest: {
                          ...current.userCommonRequest,
                          roleId: event.target.value,
                        },
                      }))
                    }
                  >
                    <option value="">Select role</option>
                    {roles
                      .filter((role) => role.name !== "LECTURER")
                      .map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                  </select>
                  <Button type="submit">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create user
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Edit selected user</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleUpdate}>
                  <Input
                    value={editForm.email}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="Email"
                  />
                  <Input
                    value={editForm.fullName}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                    placeholder="Full name"
                  />
                  <select
                    className="h-11 w-full rounded-sm border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 shadow-chip"
                    value={editForm.roleId}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, roleId: event.target.value }))
                    }
                    disabled={!selectedUserId}
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <input
                      checked={editForm.active}
                      disabled={!selectedUserId}
                      type="checkbox"
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          active: event.target.checked,
                        }))
                      }
                    />
                    Active
                  </label>
                  <Button type="submit" disabled={!selectedUserId}>
                    <Save className="mr-2 h-4 w-4" />
                    Save user
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
