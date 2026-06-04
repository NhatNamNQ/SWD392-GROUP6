import type { ReactNode } from "react";

import { SiteHeader } from "@/components/shared/site-header";
import { Card } from "@/components/ui/card";

type AuthShellProps = {
  benefits: ReactNode;
  form: ReactNode;
};

export function AuthShell({ benefits, form }: AuthShellProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader variant="app" />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center px-4 py-6 md:px-6">
        <Card className="grid w-full overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
          {benefits}
          {form}
        </Card>
      </main>
    </div>
  );
}
