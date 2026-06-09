import type { Metadata } from "next";

import { VerifyOtpPage } from "@/features/auth/verify-otp-page";
import { redirectIfAuthenticated } from "@/features/auth/server/redirect-if-authenticated";

export const metadata: Metadata = {
  title: "OrbitDocs - Verify OTP",
  description: "Confirm the OTP emailed during OrbitDocs registration.",
};

export default async function VerifyOtpRoute() {
  await redirectIfAuthenticated();
  return <VerifyOtpPage />;
}
