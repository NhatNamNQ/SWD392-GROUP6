import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  variant: "landing" | "app";
};

function BrandMark() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-sm border-2 border-slate-700 bg-emerald-100 font-black text-emerald-800 shadow-chip">
      OD
    </div>
  );
}

function BrandCopy() {
  return (
    <div>
      <p className="text-lg font-black text-slate-800">OrbitDocs</p>
      <p className="text-sm font-bold text-slate-500">Student-friendly RAG workspace</p>
    </div>
  );
}

export function SiteHeader({ variant }: SiteHeaderProps) {
  if (variant === "app") {
    return (
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="orbit-shell flex items-center gap-3 py-3">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
            <BrandCopy />
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
      <div className="orbit-shell grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3">
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
