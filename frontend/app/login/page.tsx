import type { Metadata } from "next";

import { LoginPage } from "@/features/auth/login-page";

export const metadata: Metadata = {
  title: "OrbitDocs - Login",
  description: "Sign in to OrbitDocs Student-Friendly RAG Workspace",
};

export default function LoginRoute() {
  return <LoginPage />;
}
