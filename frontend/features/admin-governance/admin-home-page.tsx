"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, BookCopy, ShieldCheck, Users, Activity } from "lucide-react";
import { fetchUsers, fetchRoles } from "@/features/admin-governance/api/admin-client";
import type { UserRecord, RoleRecord } from "@/features/admin-governance/model/types";
import { fetchCourses } from "@/features/course-management/api/course-client";
import { useToast } from "@/hooks/use-toast";

const adminActions = [
  {
    href: "/admin/users",
    title: "Users Management",
    description: "Manage accounts, assign roles, and keep access active for the right people.",
    icon: Users,
    tone: "bg-primary/10 text-primary",
    border: "border-primary/20",
  },
  {
    href: "/admin/courses",
    title: "Course Catalog",
    description: "Create and maintain course records that feed teacher and student workspaces.",
    icon: BookCopy,
    tone: "bg-secondary text-foreground",
    border: "border-border",
  },
  {
    href: "/admin/roles",
    title: "Role Governance",
    description: "Review the governance catalog and keep role definitions in sync.",
    icon: ShieldCheck,
    tone: "bg-muted text-muted-foreground",
    border: "border-border",
  },
];

type DashboardState = {
  users: UserRecord[];
  roles: RoleRecord[];
  coursesCount: number;
};

export function AdminHomePage() {
  const [data, setData] = useState<DashboardState>({
    users: [],
    roles: [],
    coursesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    startTransition(() => {
      async function loadMetrics() {
        try {
          const [users, roles, courses] = await Promise.all([
            fetchUsers(),
            fetchRoles(),
            fetchCourses(),
          ]);
          setData({ users, roles, coursesCount: courses.length });
        } catch (error) {
          console.error(error);
          toast({
            title: "Warning",
            description: "Could not fetch real-time metrics. Showing cached data.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
      void loadMetrics();
    });
  }, [toast]);

  // Compute role distribution from real user data
  const roleDistribution = data.roles.map((role) => ({
    name: role.name,
    count: data.users.filter((u) => u.roleResponse?.id === role.id).length,
  }));
  const maxRoleCount = Math.max(...roleDistribution.map((r) => r.count), 1);

  const metricsData = [
    {
      label: "Total Users",
      value: loading ? "..." : String(data.users.length),
      sub: loading ? "" : `${data.users.filter((u) => u.active).length} active`,
      tone: "bg-primary/10",
      textTone: "text-primary",
    },
    {
      label: "Active Roles",
      value: loading ? "..." : String(data.roles.length),
      sub: loading ? "" : "governance roles",
      tone: "bg-secondary",
      textTone: "text-muted-foreground",
    },
    {
      label: "Total Courses",
      value: loading ? "..." : String(data.coursesCount),
      sub: loading ? "" : "in catalog",
      tone: "bg-primary/5",
      textTone: "text-primary",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-muted-foreground">Overview</p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-foreground">
            System Dashboard
          </h1>
          <p className="text-base font-semibold text-muted-foreground max-w-xl">
            Monitor system health, user distribution, and operational metrics at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-card px-4 py-2 border border-border shadow-sm">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">System Healthy</span>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid gap-6 md:grid-cols-3">
        {metricsData.map((metric, i) => (
          <div
            key={metric.label}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div
              className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${metric.tone} opacity-30 transition-transform group-hover:scale-150`}
            />
            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {metric.label}
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-black tracking-tighter text-foreground">
                  {metric.value}
                </span>
                <span className={`text-sm font-bold ${metric.textTone}`}>
                  {metric.sub}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Data Section */}
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* User Distribution by Role */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-black text-foreground">User Distribution by Role</h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Real-time breakdown of registered users across all governance roles.
            </p>
          </div>
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm font-semibold text-muted-foreground">
              Loading distribution…
            </div>
          ) : roleDistribution.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm font-semibold text-muted-foreground">
              No role data available.
            </div>
          ) : (
            <div className="space-y-4">
              {roleDistribution.map((row) => (
                <div key={row.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-foreground">{row.name}</span>
                    <span className="font-black text-foreground">{row.count} users</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(row.count / maxRoleCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm text-foreground">
          <h2 className="text-lg font-black">Quick Actions</h2>
          <p className="text-sm font-semibold text-muted-foreground">
            Jump directly into the most common administrative tasks.
          </p>
          <div className="flex-1 space-y-3">
            <Link
              href="/admin/users"
              className="group flex items-center justify-between rounded-md border border-border bg-secondary/40 p-3 transition-all hover:border-primary/40 hover:bg-secondary"
            >
              <span className="font-bold text-sm text-foreground">Add New User</span>
              <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100 text-primary" />
            </Link>
            <Link
              href="/admin/courses"
              className="group flex items-center justify-between rounded-md border border-border bg-secondary/40 p-3 transition-all hover:border-primary/40 hover:bg-secondary"
            >
              <span className="font-bold text-sm text-foreground">Create Course</span>
              <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100 text-primary" />
            </Link>
            <Link
              href="/admin/roles"
              className="group flex items-center justify-between rounded-md border border-border bg-secondary/40 p-3 transition-all hover:border-primary/40 hover:bg-secondary"
            >
              <span className="font-bold text-sm text-foreground">Manage Roles</span>
              <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100 text-primary" />
            </Link>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section>
        <h2 className="mb-6 text-xl font-black text-foreground">Governance Modules</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {adminActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className={`group flex flex-col justify-between rounded-xl border ${action.border} bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/30`}
              >
                <div>
                  <div className={`mb-4 inline-flex rounded-lg p-3 ${action.tone} opacity-90`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-foreground">{action.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-foreground">
                  Manage{" "}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
