import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";

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
    <div className="space-y-4 bg-slate-50 p-6 md:p-8">
      <Badge variant="mint" className="w-fit">
        {badge}
      </Badge>

      <div className="space-y-3">
        <CardTitle className="text-3xl tracking-[-0.05em] text-slate-800 md:text-5xl">
          {title}
        </CardTitle>
        <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base">{description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-md border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-sm border-2 border-slate-700 bg-slate-50">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800">{item.label}</p>
                  <p className="text-sm text-slate-600">{item.copy}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {benefits.map((benefit) => (
          <Badge key={benefit} variant="blue">
            {benefit}
          </Badge>
        ))}
      </div>
    </div>
  );
}
