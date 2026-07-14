export type DocumentStatus = "UPLOADED" | "PROCESSING" | "INDEXED" | "FAILED" | string;

export type CourseOption = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  lecturerId: string | null;
  lecturerName: string | null;
};

export type KnowledgeDocument = {
  id: string;
  courseId: string;
  uploadedBy: string;
  originalFilename: string;
  fileType: string;
  fileSizeBytes: number;
  status: DocumentStatus;
  failureReason?: string | null;
  chunkCount: number | null;
  indexedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type DocumentChapter = {
  id: string;
  documentId: string;
  orderIndex: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type DocumentChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

/** Generic Spring Data page envelope */
export type PagedResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page (0-based)
  size: number;
  first: boolean;
  last: boolean;
};

export type KnowledgeBaseBootstrap = {
  courses: CourseOption[];
};

export type KnowledgeBaseError = {
  status: number;
  code: string;
  message: string;
};
