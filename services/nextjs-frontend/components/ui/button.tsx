import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm border-2 border-slate-700 text-sm font-extrabold transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px]",
  {
    variants: {
      variant: {
        default: "bg-sky-100 text-slate-800 shadow-chip hover:-translate-y-0.5",
        secondary: "bg-white text-slate-700 shadow-chip hover:-translate-y-0.5",
        ghost: "border-slate-300 bg-white/70 text-slate-700 shadow-none hover:bg-white",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3 py-2 text-xs",
        lg: "h-12 px-5 py-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
