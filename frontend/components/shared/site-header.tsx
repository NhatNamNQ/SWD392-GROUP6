import type { ReactNode } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  variant: "landing" | "app";
  actions?: ReactNode;
};

function BrandMark() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-primary/10 font-black text-primary shadow-sm">
      OD
    </div>
  );
}

function BrandCopy() {
  return (
    <div>
      <p className="text-lg font-black text-foreground">OrbitDocs</p>
      <p className="text-sm font-semibold text-muted-foreground">Educational RAG workspace</p>
    </div>
  );
}

export function SiteHeader({ variant, actions }: SiteHeaderProps) {
  if (variant === "app") {
    return (
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="orbit-shell flex items-center justify-between gap-3 py-3">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
            <BrandCopy />
          </Link>
          {actions}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark />
          <BrandCopy />
        </Link>

        <nav className="hidden flex-wrap justify-center gap-2 md:flex">
          <a className="orbit-chip" href="#overview">
            Overview
          </a>
          <a className="orbit-chip" href="#features">
            Features
          </a>
          <a className="orbit-chip" href="#workflow">
            How It Works
          </a>
          <a className="orbit-chip" href="#knowledge">
            Knowledge Base
          </a>
        </nav>

        <div className="hidden items-center justify-end gap-2 md:flex">
          <Link href="/login" className={cn(buttonVariants({ variant: "secondary" }))}>
            Login
          </Link>
          <Link href="/register" className={cn(buttonVariants())}>
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
