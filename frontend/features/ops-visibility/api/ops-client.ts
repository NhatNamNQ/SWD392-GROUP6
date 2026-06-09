import type {
  DocumentStatusSummary,
  JavaHealth,
  JavaMetrics,
} from "@/features/ops-visibility/model/types";

type OpsApiError = {
  status: number;
  message: string;
  code: string;
};

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

async function request<T>(input: string) {
  const response = await fetch(input, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw await readJson<OpsApiError>(response);
  }

  return readJson<T>(response);
}

export function fetchJavaHealth() {
  return request<JavaHealth>("/api/ops/health");
}

export function fetchJavaMetrics() {
  return request<JavaMetrics>("/api/ops/metrics");
}

export function fetchDocumentStatusSummary() {
  return request<DocumentStatusSummary>("/api/ops/document-status");
}

