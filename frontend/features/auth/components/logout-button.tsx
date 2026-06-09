"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { logoutSession, toAuthNotice } from "@/features/auth/model/forms";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function handleLogout() {
    setPending(true);

    startTransition(async () => {
      try {
        await logoutSession();
        router.replace("/login");
        router.refresh();
      } catch (error) {
        const notice = toAuthNotice(error);
        window.alert(notice.message);
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <Button type="button" variant="secondary" onClick={handleLogout} disabled={pending}>
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
