import type {
  CreateUserPayload,
  CreateLecturerPayload,
  RolePayload,
  RoleRecord,
  UserPayload,
  UserRecord,
} from "@/features/admin-governance/model/types";

type AdminApiError = {
  status: number;
  message: string;
  code: string;
};

function normalizeRole(role: RoleRecord): RoleRecord {
  return {
    ...role,
    id: String(role.id),
  };
}

function normalizeUser(user: UserRecord): UserRecord {
  return {
    ...user,
    roleResponse: user.roleResponse ? normalizeRole(user.roleResponse) : null,
  };
}

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

async function request<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw await readJson<AdminApiError>(response);
  }

  return readJson<T>(response);
}

export function fetchUsers() {
  return request<UserRecord[]>("/api/admin/users").then((users) => users.map(normalizeUser));
}

export function createUser(payload: CreateUserPayload) {
  return request<UserRecord>("/api/admin/users", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function createLecturer(payload: CreateLecturerPayload) {
  return request<UserRecord>("/api/admin/lecturers", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function updateUser(payload: UserPayload) {
  return request<UserRecord>("/api/admin/users", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function deleteUser(userId: string) {
  return request<null>(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
}

export function fetchRoles() {
  return request<RoleRecord[]>("/api/admin/roles").then((roles) => roles.map(normalizeRole));
}

export function createRole(payload: RolePayload) {
  return request<RoleRecord>("/api/admin/roles", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function updateRole(roleId: string, payload: RolePayload) {
  return request<RoleRecord>(`/api/admin/roles/${roleId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function deleteRole(roleId: string) {
  return request<null>(`/api/admin/roles/${roleId}`, {
    method: "DELETE",
  });
}
