"use client";

import { CheckCircle2, KeyRound } from "lucide-react";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  changePassword,
  toAuthNotice,
  validateChangePasswordPayload,
} from "@/features/auth/model/forms";

export function PasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateChangePasswordPayload({ oldPassword, newPassword });

    if (validationError) {
      toast({ title: "Error", description: validationError, variant: "destructive" });
      return;
    }

    setPending(true);

    startTransition(async () => {
      try {
        const result = await changePassword({ oldPassword, newPassword });
        toast({ title: "Success", description: result.message });
        setOldPassword("");
        setNewPassword("");
      } catch (error) {
        const authNotice = toAuthNotice(error);
        toast({
          title: authNotice.tone === "error" ? "Error" : "Success",
          description: authNotice.message,
          variant: authNotice.tone === "error" ? "destructive" : "default",
        });
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6 md:p-8">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-2xl text-foreground">
            <KeyRound className="h-5 w-5 text-primary" />
            Password settings
          </CardTitle>
          <p className="text-sm font-semibold text-muted-foreground">
            Please enter your current password and the new password you wish to use.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-foreground" htmlFor="current-password">
              Current password
            </label>
            <Input
              id="current-password"
              type="password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold text-foreground" htmlFor="new-password">
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" size="lg" className="gap-2" disabled={pending}>
            {pending ? "Saving..." : "Save password"}
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
