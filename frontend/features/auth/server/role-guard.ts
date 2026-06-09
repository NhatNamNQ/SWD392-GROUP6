export type RequiredAuthRole = "STUDENT" | "LECTURER" | "ADMIN";

export type RequireAuthOptions = {
  role?: RequiredAuthRole;
};
