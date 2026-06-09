export type CourseRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
};

export type CoursePayload = {
  code: string;
  name: string;
  description: string;
};

export type CourseSearchResponse = {
  content?: CourseRecord[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
};

