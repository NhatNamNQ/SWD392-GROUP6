export type JavaHealth = {
  status: string;
  components?: Record<string, unknown>;
};

export type JavaMetrics = {
  names?: string[];
};

export type DocumentStatusSummary = {
  total: number;
  uploaded: number;
  processing: number;
  indexed: number;
  failed: number;
};

