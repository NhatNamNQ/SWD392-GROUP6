import type { Metadata } from "next";

import { PasswordPage } from "@/features/auth/password-page";
import { requireAuthSession } from "@/features/auth/server/require-session";

export const metadata: Metadata = {
  title: "OrbitDocs - Change Password",
  description: "Update your OrbitDocs account password.",
};

export default async function TeacherPasswordRoute() {
  await requireAuthSession("/teacher/password", { role: "LECTURER" });
  return <PasswordPage />;
}
