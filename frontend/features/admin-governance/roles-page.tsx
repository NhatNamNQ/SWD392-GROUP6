"use client";

import { startTransition, useEffect, useState } from "react";
import { Save, ShieldPlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createRole,
  deleteRole,
  fetchRoles,
  updateRole,
} from "@/features/admin-governance/api/admin-client";
import type { RolePayload, RoleRecord } from "@/features/admin-governance/model/types";

const emptyRolePayload: RolePayload = {
  name: "",
  description: "",
};

function toMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Role request failed.";
}

export function RolesPage() {
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [createForm, setCreateForm] = useState<RolePayload>(emptyRolePayload);
  const [editingRoleId, setEditingRoleId] = useState("");
  const [editForm, setEditForm] = useState<RolePayload>(emptyRolePayload);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadRoles() {
    setLoading(true);
    try {
      setRoles(await fetchRoles());
      setNotice(null);
    } catch (error) {
      setNotice(toMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    startTransition(() => {
      void loadRoles();
    });
  }, []);

  function selectRole(role: RoleRecord) {
    setEditingRoleId(role.id);
    setEditForm({
      name: role.name,
      description: role.description ?? "",
    });
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!createForm.name.trim()) {
      setNotice("Role name is required.");
      return;
    }

    try {
      await createRole(createForm);
      setCreateForm(emptyRolePayload);
      await loadRoles();
      setNotice("Role created.");
    } catch (error) {
      setNotice(toMessage(error));
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingRoleId) {
      setNotice("Select a role first.");
      return;
    }

    try {
      await updateRole(editingRoleId, editForm);
      await loadRoles();
      setNotice("Role updated.");
    } catch (error) {
      setNotice(toMessage(error));
    }
  }

  async function handleDelete(roleId: string) {
    try {
      await deleteRole(roleId);
      setRoles((current) => current.filter((role) => role.id !== roleId));
      if (editingRoleId === roleId) {
        setEditingRoleId("");
        setEditForm(emptyRolePayload);
      }
      setNotice("Role deleted.");
    } catch (error) {
      setNotice(toMessage(error));
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            Admin governance
          </p>
          <h1 className="text-4xl font-black text-slate-800">Roles</h1>
        </div>

        {notice ? (
          <div className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardHeader>
              <CardTitle>Role list</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? <p className="text-sm font-bold text-slate-500">Loading roles...</p> : null}
              {roles.map((role) => (
                <article
                  key={role.id}
                  className="grid gap-3 rounded-md border-2 border-slate-200 bg-white p-4 shadow-chip md:grid-cols-[1fr_auto]"
                >
                  <button type="button" className="text-left" onClick={() => selectRole(role)}>
                    <p className="text-sm font-black text-slate-800">{role.name}</p>
                    <p className="text-sm font-semibold text-slate-500">
                      {role.description || "No description"}
                    </p>
                  </button>
                  <Button type="button" variant="ghost" onClick={() => handleDelete(role.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </article>
              ))}
              {!loading && !roles.length ? (
                <p className="text-sm font-bold text-slate-500">No roles found.</p>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Create role</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleCreate}>
                  <Input
                    value={createForm.name}
                    onChange={(event) =>
                      setCreateForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Role name"
                  />
                  <Textarea
                    value={createForm.description}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Description"
                  />
                  <Button type="submit">
                    <ShieldPlus className="mr-2 h-4 w-4" />
                    Create
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Edit role</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleUpdate}>
                  <Input
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Role name"
                    disabled={!editingRoleId}
                  />
                  <Textarea
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Description"
                    disabled={!editingRoleId}
                  />
                  <Button type="submit" disabled={!editingRoleId}>
                    <Save className="mr-2 h-4 w-4" />
                    Save role
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
