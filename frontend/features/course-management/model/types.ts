export type CourseRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  lecturerId: string | null;
  lecturerName: string | null;
  createdAt: string;
};

export type CoursePayload = {
  code: string;
  name: string;
  description: string;
  lecturerId: string;
};

export type CourseSearchResponse = {
  content?: CourseRecord[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
};
