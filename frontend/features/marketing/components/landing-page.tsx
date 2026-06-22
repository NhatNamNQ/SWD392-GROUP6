import Link from "next/link";
import {
  ArrowRight,
  BookCopy,
  BrainCircuit,
  Files,
  Upload,
  Library,
  ShieldCheck,
} from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Student Chat",
    description:
      "Focused chat layout with prompt chips, clean message flow, and inline citation popovers.",
    icon: BrainCircuit,
  },
  {
    title: "Conversation History",
    description:
      "Resume sessions like Use Case Diagrams Review or GoF Design Patterns from the sidebar.",
    icon: BookCopy,
  },
  {
    title: "Course Context",
    description: "Every question stays scoped to the selected course so answers remain relevant.",
    icon: Files,
  },
];

const knowledgeCards = [
  {
    title: "Upload Zone",
    description:
      "Drag lecture slides or PDFs into a dedicated teacher workspace without crowding student chat.",
    icon: Upload,
  },
  {
    title: "Document Library",
    description: "Browse files by course, tags, and indexing status such as Processing or Indexed.",
    icon: Library,
  },
  {
    title: "Teacher Separation",
    description:
      "Management actions stay separate from the study flow so students only see cited answers.",
    icon: ShieldCheck,
  },
];

const workflow = [
  { step: 1, text: "Teacher uploads course documents in Knowledge Base." },
  { step: 2, text: "System indexes content and prepares searchable chunks." },
  { step: 3, text: "Student asks questions with course scope selected." },
  { step: 4, text: "AI returns concise responses with source citations." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader variant="landing" />

      {/* ── Hero ── */}
      <section id="overview" className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="space-y-6">
            <Badge variant="blue" className="w-fit">
              SWD392 Prototype
            </Badge>
            <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-foreground md:text-6xl">
              Ask course questions and get cited answers.
            </h1>
            <p className="max-w-xl text-base font-semibold text-muted-foreground md:text-lg">
              OrbitDocs helps students learn from course files using chat, while teachers manage
              uploaded documents in a separate knowledge base.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="mint">Inline citations</Badge>
              <Badge variant="mint">Conversation history</Badge>
              <Badge variant="mint">Teacher document space</Badge>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/student"
                className={cn(buttonVariants({ size: "lg" }), "inline-flex items-center gap-2")}
              >
                Launch workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#workflow" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                See the flow
              </a>
            </div>
          </div>

          {/* Chat preview card */}
          <div className="mt-10 lg:mt-0">
            <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border bg-secondary/60 px-5 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                  Chat preview
                </p>
              </div>
              <div className="space-y-3 p-5">
                <div className="max-w-[75%] rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm">
                  What is a Use Case Model?
                </div>
                <div className="ml-auto max-w-[82%] rounded-xl border border-primary/20 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm">
                  Can you compare Sequence vs Communication diagrams?
                </div>
                <div className="max-w-[85%] rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm">
                  Sequence diagrams focus on time order, while communication diagrams focus on object
                  collaboration{" "}
                  <span className="inline-flex h-5 items-center rounded border border-primary/30 bg-primary/10 px-1.5 text-[10px] font-black text-primary">
                    [1]
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Unified content container ── */}
      <main className="mx-auto max-w-7xl space-y-0 divide-y divide-border px-6">

        {/* Core Features */}
        <section id="features" className="py-16">
          <div className="mb-8 space-y-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              Core Features
            </p>
            <h2 className="text-2xl font-black tracking-[-0.03em] text-foreground md:text-3xl">
              Everything a student needs to learn faster
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 text-base font-black text-foreground">{feature.title}</h3>
                  <p className="text-sm font-semibold leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Knowledge Base */}
        <section id="knowledge" className="py-16">
          <div className="mb-8 space-y-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              Knowledge Base for Teachers
            </p>
            <h2 className="text-2xl font-black tracking-[-0.03em] text-foreground md:text-3xl">
              A dedicated space for course content management
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {knowledgeCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="mb-2 text-base font-black text-foreground">{card.title}</h3>
                  <p className="text-sm font-semibold leading-6 text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section id="workflow" className="py-16">
          <div className="mb-8 space-y-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              How It Works
            </p>
            <h2 className="text-2xl font-black tracking-[-0.03em] text-foreground md:text-3xl">
              From document upload to cited answer in 4 steps
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {workflow.map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector line between steps */}
                {index < workflow.length - 1 && (
                  <div className="absolute left-[calc(50%+24px)] top-5 hidden h-px w-[calc(100%-48px+1.5rem)] bg-border md:block" />
                )}
                <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
                    {item.step}
                  </div>
                  <p className="text-sm font-semibold leading-6 text-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-primary/20 bg-primary/5 px-8 py-8 md:flex-row md:items-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-[-0.03em] text-foreground">
                Ready to study smarter with cited answers?
              </h2>
              <p className="text-sm font-semibold text-muted-foreground md:text-base">
                Open the workspace and continue your SWD392 sessions.
              </p>
            </div>
            <Link
              href="/student"
              className={cn(
                buttonVariants({ size: "lg" }),
                "shrink-0 inline-flex items-center gap-2",
              )}
            >
              Launch Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col gap-1 text-sm font-semibold text-muted-foreground md:flex-row md:justify-between">
          <span>OrbitDocs | Educational RAG workspace</span>
          <span>Built for students and teachers | Course: SWD392</span>
        </div>
      </footer>
    </div>
  );
}
