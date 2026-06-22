"use client";

import { startTransition, useEffect, useState } from "react";
import { Save, ShieldPlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  async function loadRoles() {
    setLoading(true);
    try {
      setRoles(await fetchRoles());
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    startTransition(() => {
      void loadRoles();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast({ title: "Error", description: "Role name is required.", variant: "destructive" });
      return;
    }

    try {
      await createRole(createForm);
      setCreateForm(emptyRolePayload);
      await loadRoles();
      toast({ title: "Success", description: "Role created." });
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingRoleId) {
      toast({ title: "Error", description: "Select a role first.", variant: "destructive" });
      return;
    }

    try {
      await updateRole(editingRoleId, editForm);
      await loadRoles();
      toast({ title: "Success", description: "Role updated." });
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
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
      toast({ title: "Success", description: "Role deleted." });
    } catch (error) {
      toast({ title: "Error", description: toMessage(error), variant: "destructive" });
    }
  }

  return (
    <div className="p-6 md:p-8 mx-auto max-w-[1600px] space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-muted-foreground">
            Admin governance
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-foreground">Role Governance</h1>
        </div>
        <Button
          onClick={() => {
            setEditingRoleId("");
            setEditForm(emptyRolePayload);
          }}
        >
          <ShieldPlus className="mr-2 h-4 w-4" /> New Role
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Role list</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <p className="text-sm font-semibold text-muted-foreground">Loading roles...</p> : null}
            {roles.map((role) => (
              <article
                key={role.id}
                className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition duration-200 md:grid-cols-[1fr_auto]"
              >
                <button type="button" className="text-left" onClick={() => selectRole(role)}>
                  <p className="text-sm font-black text-foreground">{role.name}</p>
                  <p className="text-sm font-semibold text-muted-foreground">
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
              <p className="text-sm font-semibold text-muted-foreground">No roles found.</p>
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
  );
}
