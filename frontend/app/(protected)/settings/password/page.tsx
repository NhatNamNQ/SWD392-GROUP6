import type { Metadata } from "next";

import { PasswordPage } from "@/features/auth/password-page";
import { requireAuthSession } from "@/features/auth/server/require-session";

export const metadata: Metadata = {
  title: "OrbitDocs - Password Settings",
  description: "Change your OrbitDocs password.",
};

export default async function PasswordSettingsRoute() {
  await requireAuthSession("/settings/password");
  return <PasswordPage />;
}
