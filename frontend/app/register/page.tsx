import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/orbit/site-header";

export const metadata: Metadata = {
  title: "OrbitDocs - Register",
  description: "Create an OrbitDocs account for SWD392 study sessions.",
};

const benefits = [
  "Save your study history",
  "Keep course documents organized",
  "Return to cited answers later",
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader variant="app" />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center px-4 py-6 md:px-6">
        <Card className="grid w-full overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4 bg-slate-50 p-6 md:p-8">
            <Badge variant="mint" className="w-fit">
              SWD392 workspace
            </Badge>
            <div className="space-y-3">
              <CardTitle className="text-3xl tracking-[-0.05em] text-slate-800 md:text-5xl">
                Create your OrbitDocs account.
              </CardTitle>
              <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base">
                Register once and keep your SWD392 chats, study materials, and source-backed answers
                in one workspace.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  icon: BookOpen,
                  label: "Study history",
                  copy: "Pick up where you left off on any course topic.",
                },
                {
                  icon: BadgeCheck,
                  label: "Verified access",
                  copy: "Keep the workspace tied to your school account.",
                },
                {
                  icon: Sparkles,
                  label: "Citations ready",
                  copy: "Answers stay linked to the source materials.",
                },
              ].map((item) => {
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

          <div className="space-y-6 bg-slate-50 p-6 md:p-8">
            <div className="space-y-2">
              <CardTitle className="text-3xl tracking-[-0.04em] text-slate-800">Register</CardTitle>
              <p className="text-sm font-semibold text-slate-600">
                Create a new account to get started.
              </p>
            </div>

            <CardContent className="space-y-6 rounded-md border border-slate-200 bg-white p-6 md:p-8">
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-slate-700" htmlFor="name">
                    Full name
                  </label>
                  <Input id="name" type="text" placeholder="Your name" autoComplete="name" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-slate-700" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@school.edu"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                </div>

                <Button type="button" size="lg" className="w-full gap-2">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
                <Link href="/login" className="transition hover:text-slate-800">
                  Already have an account?
                </Link>
                <Link href="/dashboard" className="transition hover:text-slate-800">
                  Go to dashboard
                </Link>
              </div>
            </CardContent>
          </div>
        </Card>
      </main>
    </div>
  );
}
