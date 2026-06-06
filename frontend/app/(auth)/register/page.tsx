import type { Metadata } from "next";

import { RegisterPage } from "@/features/auth/register-page";
import { redirectIfAuthenticated } from "@/features/auth/server/redirect-if-authenticated";

export const metadata: Metadata = {
  title: "OrbitDocs - Register",
  description: "Create an OrbitDocs account for SWD392 study sessions.",
};

export default async function RegisterRoute() {
  await redirectIfAuthenticated();
  return <RegisterPage />;
}
