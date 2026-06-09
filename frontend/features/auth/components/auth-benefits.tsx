import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type AuthBenefitItem = {
  icon: LucideIcon;
  label: string;
  copy: string;
};

type AuthBenefitsProps = {
  badge: string;
  title: string;
  description: string;
  items: AuthBenefitItem[];
  benefits: string[];
};

export function AuthBenefits({
  badge,
  title,
  description,
  items,
  benefits,
}: AuthBenefitsProps) {
  return (
    <div className="space-y-6">
      <Badge variant="mint" className="w-fit">
        {badge}
      </Badge>

      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-800 md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-slate-600">{description}</p>
      </div>

      <div className="grid gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-md border-2 border-slate-700 bg-slate-50 p-5 shadow-chip transition-colors hover:bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 border-slate-700 bg-white text-slate-700 shadow-chip">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">{item.label}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.copy}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 pt-8">
        {benefits.map((benefit) => (
          <Badge
            key={benefit}
            variant="blue"
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            {benefit}
          </Badge>
        ))}
      </div>
    </div>
  );
}
