"use client";

import { startTransition, useEffect, useState } from "react";
import { Activity, AlertTriangle, BarChart3, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchDocumentStatusSummary,
  fetchJavaHealth,
  fetchJavaMetrics,
} from "@/features/ops-visibility/api/ops-client";
import type {
  DocumentStatusSummary,
  JavaHealth,
  JavaMetrics,
} from "@/features/ops-visibility/model/types";

function toMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Ops request failed.";
}

export function OpsPage() {
  const [health, setHealth] = useState<JavaHealth | null>(null);
  const [metrics, setMetrics] = useState<JavaMetrics | null>(null);
  const [summary, setSummary] = useState<DocumentStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadOps() {
    setLoading(true);
    setError(null);

    try {
      const [nextHealth, nextMetrics, nextSummary] = await Promise.all([
        fetchJavaHealth(),
        fetchJavaMetrics(),
        fetchDocumentStatusSummary(),
      ]);
      setHealth(nextHealth);
      setMetrics(nextMetrics);
      setSummary(nextSummary);
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    startTransition(() => {
      void loadOps();
    });
  }, []);

  const healthStatus = health?.status ?? "UNKNOWN";
  const isHealthy = healthStatus.toUpperCase() === "UP";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
              Ops visibility
            </p>
            <h1 className="text-4xl font-black text-slate-800">Java backend status</h1>
          </div>
          <Button type="button" variant="secondary" onClick={loadOps} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant={isHealthy ? "mint" : "default"}>{healthStatus}</Badge>
              <p className="text-sm font-semibold text-slate-600">
                {isHealthy
                  ? "Java actuator health is reporting UP."
                  : "Java actuator health is down, unknown, or unreachable."}
              </p>
              {loading ? (
                <p className="text-sm font-bold text-slate-500">Loading health...</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-4xl font-black text-slate-800">{metrics?.names?.length ?? 0}</p>
              <p className="text-sm font-semibold text-slate-600">
                Metric names exposed by `/actuator/metrics`.
              </p>
              <div className="flex max-h-24 flex-wrap gap-2 overflow-hidden">
                {(metrics?.names ?? []).slice(0, 8).map((metric) => (
                  <Badge key={metric}>{metric}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Indexing failures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-4xl font-black text-slate-800">{summary?.failed ?? 0}</p>
              <p className="text-sm font-semibold text-slate-600">
                Failure reason unavailable from current API.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document status summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-5">
              {[
                ["Total", summary?.total ?? 0],
                ["Uploaded", summary?.uploaded ?? 0],
                ["Processing", summary?.processing ?? 0],
                ["Indexed", summary?.indexed ?? 0],
                ["Failed", summary?.failed ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    {label}
                  </p>
                  <p className="text-3xl font-black text-slate-800">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-600">
              Summary is derived by reading course documents through the Java document endpoints.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
