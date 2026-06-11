import Link from "next/link";
import { ArrowUpRight, BookCopy, ShieldCheck, Users, Activity } from "lucide-react";

const mockMetrics = [
  { label: "Total Users", value: "1,248", change: "+12%", trend: "up", tone: "bg-sky-50", textTone: "text-sky-600" },
  { label: "Active Roles", value: "4", change: "Stable", trend: "neutral", tone: "bg-emerald-50", textTone: "text-emerald-600" },
  { label: "Active Courses", value: "32", change: "+4%", trend: "up", tone: "bg-indigo-50", textTone: "text-indigo-600" },
];

const mockChartData = [40, 60, 45, 80, 55, 90, 75, 100, 85, 110, 95, 120];

const adminActions = [
  {
    href: "/admin/users",
    title: "Users Management",
    description: "Manage accounts, assign roles, and keep access active for the right people.",
    icon: Users,
    tone: "bg-sky-50 text-sky-700",
    border: "border-sky-200",
  },
  {
    href: "/admin/courses",
    title: "Course Catalog",
    description: "Create and maintain course records that feed teacher and student workspaces.",
    icon: BookCopy,
    tone: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-200",
  },
  {
    href: "/admin/roles",
    title: "Role Governance",
    description: "Review the governance catalog and keep role definitions in sync.",
    icon: ShieldCheck,
    tone: "bg-slate-100 text-slate-700",
    border: "border-slate-300",
  },
];

export function AdminHomePage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-slate-700 pb-6">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            Overview
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-800">
            System Dashboard
          </h1>
          <p className="text-base font-semibold text-slate-600 max-w-xl">
            Monitor system health, user growth, and operational metrics at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-white px-4 py-2 border-2 border-slate-700 shadow-chip">
          <Activity className="h-5 w-5 text-emerald-600" />
          <span className="font-bold text-slate-800">System Healthy</span>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid gap-6 md:grid-cols-3">
        {mockMetrics.map((metric, i) => (
          <div 
            key={metric.label} 
            className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-white p-6 shadow-chip transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#334155]"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${metric.tone} opacity-50 transition-transform group-hover:scale-150`} />
            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-[0.1em] text-slate-500">{metric.label}</p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-black tracking-tighter text-slate-800">{metric.value}</span>
                <span className={`text-sm font-bold ${metric.trend === "up" ? "text-emerald-600" : "text-slate-500"}`}>
                  {metric.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Visual Data Section */}
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border-2 border-slate-700 bg-white p-6 shadow-chip">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">User Growth (30 Days)</h2>
            <select className="rounded border-2 border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 outline-none">
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          {/* Mock Chart Area */}
          <div className="flex h-64 items-end gap-2 border-b-2 border-l-2 border-slate-200 pb-2 pl-2">
            {mockChartData.map((val, i) => (
              <div key={i} className="group relative flex flex-1 flex-col justify-end">
                <div 
                  className="w-full rounded-t-sm bg-slate-200 transition-all group-hover:bg-emerald-400"
                  style={{ height: `${(val / 120) * 100}%` }}
                />
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {val}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs font-bold text-slate-400">
            <span>Oct 1</span>
            <span>Oct 15</span>
            <span>Oct 30</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border-2 border-slate-700 bg-slate-800 p-6 shadow-chip text-white">
          <h2 className="text-lg font-black">Quick Actions</h2>
          <p className="text-sm font-semibold text-slate-400 mb-2">
            Jump directly into the most common administrative tasks.
          </p>
          <div className="flex-1 space-y-3">
            <Link href="/admin/users" className="flex items-center justify-between rounded-md border border-slate-600 bg-slate-700/50 p-3 transition-colors hover:bg-emerald-500 hover:border-emerald-400 group">
              <span className="font-bold text-sm">Add New User</span>
              <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            </Link>
            <Link href="/admin/courses" className="flex items-center justify-between rounded-md border border-slate-600 bg-slate-700/50 p-3 transition-colors hover:bg-emerald-500 hover:border-emerald-400 group">
              <span className="font-bold text-sm">Create Course</span>
              <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            </Link>
            <Link href="/admin/roles" className="flex items-center justify-between rounded-md border border-slate-600 bg-slate-700/50 p-3 transition-colors hover:bg-emerald-500 hover:border-emerald-400 group">
              <span className="font-bold text-sm">Manage Roles</span>
              <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section>
        <h2 className="mb-6 text-xl font-black text-slate-800">Governance Modules</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {adminActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className={`group flex flex-col justify-between rounded-xl border-2 ${action.border} bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-chip`}
              >
                <div>
                  <div className={`mb-4 inline-flex rounded-lg p-3 ${action.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">{action.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-600 line-clamp-2">
                    {action.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-slate-800">
                  Manage <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}
