export type RoleRecord = {
  id: string;
  name: string;
  description?: string;
};

export type UserRecord = {
  id: string;
  email: string;
  fullName: string | null;
  active: boolean | null;
  avatarUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  roleResponse: RoleRecord | null;
};

export type UserPayload = {
  email: string;
  fullName: string;
  active: boolean;
  avatarUrl: string;
  roleId: string;
};

export type CreateUserPayload = {
  userCommonRequest: UserPayload;
  password: string;
};

export type CreateLecturerPayload = {
  email: string;
  fullName: string;
};

export type RolePayload = {
  name: string;
  description: string;
};
