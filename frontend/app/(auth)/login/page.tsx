import type { Metadata } from "next";

import { LoginPage } from "@/features/auth/login-page";
import { redirectIfAuthenticated } from "@/features/auth/server/redirect-if-authenticated";

export const metadata: Metadata = {
  title: "OrbitDocs - Login",
  description: "Sign in to OrbitDocs Student-Friendly RAG Workspace",
};

export default async function LoginRoute() {
  await redirectIfAuthenticated();
  return <LoginPage />;
}
