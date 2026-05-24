import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        default: "border-slate-300 bg-white text-slate-700",
        mint: "border-emerald-300 bg-emerald-100 text-emerald-800",
        peach: "border-orange-300 bg-orange-100 text-orange-800",
        pink: "border-pink-300 bg-pink-100 text-pink-800",
        blue: "border-sky-300 bg-sky-100 text-sky-800",
        yellow: "border-amber-300 bg-amber-100 text-amber-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
