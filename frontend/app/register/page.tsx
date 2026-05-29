import type { Metadata } from "next";

import { RegisterPage } from "@/features/auth/register-page";

export const metadata: Metadata = {
  title: "OrbitDocs - Register",
  description: "Create an OrbitDocs account for SWD392 study sessions.",
};

export default function RegisterRoute() {
  return <RegisterPage />;
}
