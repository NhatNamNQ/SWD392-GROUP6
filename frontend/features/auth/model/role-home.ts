import type { AuthRole } from "@/features/auth/model/contracts";

export function getRoleHomePath(role: AuthRole) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "LECTURER") {
    return "/teacher";
  }

  return "/student";
}
