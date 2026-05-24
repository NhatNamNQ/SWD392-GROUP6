import Link from "next/link";
import { ArrowRight, BookCopy, BrainCircuit, Files } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Student Chat",
    tone: "blue" as const,
    description:
      "Focused chat layout with prompt chips, clean message flow, and inline citation popovers.",
    icon: BrainCircuit,
  },
  {
    title: "Conversation History",
    tone: "mint" as const,
    description:
      "Resume sessions like Use Case Diagrams Review or GoF Design Patterns from the sidebar.",
    icon: BookCopy,
  },
  {
    title: "Course Context",
    tone: "peach" as const,
    description:
      "Every question stays scoped to the selected course so answers remain relevant.",
    icon: Files,
  },
];

const knowledgeCards = [
  {
    title: "Upload Zone",
    description:
      "Drag lecture slides or PDFs into a dedicated teacher workspace without crowding student chat.",
  },
  {
    title: "Document Library",
    description:
      "Browse files by course, tags, and indexing status such as Processing or Indexed.",
  },
  {
    title: "Teacher Separation",
    description:
      "Management actions stay separate from the study flow so students only see cited answers.",
  },
];

const workflow = [
  "Teacher uploads course documents in Knowledge Base.",
  "System indexes content and prepares searchable chunks.",
  "Student asks questions with course scope selected.",
  "AI returns concise responses with source citations.",
];

export function LandingPage() {
  return (
    <div className="pb-12">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="orbit-shell flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-sm border-2 border-slate-700 bg-emerald-100 font-black text-emerald-800 shadow-chip">
              OD
            </div>
            <div>
              <p className="text-lg font-black text-slate-800">OrbitDocs</p>
              <p className="text-sm font-bold text-slate-500">
                Student-friendly RAG workspace
              </p>
            </div>
          </div>
          <nav className="hidden flex-wrap gap-2 md:flex">
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
          <Link
            href="/dashboard"
            className={cn(buttonVariants(), "hidden md:inline-flex")}
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      <main className="orbit-shell space-y-4 pt-5">
        <section
          id="overview"
          className="orbit-frame orbit-grid grid gap-4 overflow-hidden px-4 py-5 md:grid-cols-[1.12fr_0.88fr] md:px-5"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <Badge variant="yellow" className="w-fit">
                SWD392 Prototype
              </Badge>
              <h1 className="max-w-3xl text-balance text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-800 md:text-6xl">
                Ask course questions and get cited answers in one bright workspace.
              </h1>
              <p className="max-w-2xl text-base font-semibold text-slate-600 md:text-lg">
                OrbitDocs helps students learn from course files using chat, while
                teachers manage uploaded documents in a separate knowledge base view.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="mint">Inline citations</Badge>
              <Badge variant="peach">Conversation history</Badge>
              <Badge variant="pink">Teacher document space</Badge>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "lg" }), "inline-flex items-center gap-2")}
              >
                Launch workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#workflow"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                See the flow
              </a>
            </div>
          </div>

          <Card className="overflow-hidden rounded-md">
            <div className="orbit-panel-head bg-indigo-50 text-slate-700">
              Chat Preview
            </div>
            <CardContent className="space-y-3 p-4">
              <div className="max-w-[75%] rounded-sm border-2 border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                What is a Use Case Model?
              </div>
              <div className="ml-auto max-w-[82%] rounded-sm border-2 border-sky-300 bg-sky-100 px-4 py-3 text-sm font-bold text-slate-700">
                Can you compare Sequence vs Communication diagrams?
              </div>
              <div className="rounded-sm border-2 border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                Sequence diagrams focus on time order, while communication diagrams
                focus on object collaboration [1].
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="features" className="orbit-frame overflow-hidden">
          <div className="orbit-panel-head bg-indigo-50 text-slate-700">Core Features</div>
          <div className="grid gap-4 p-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              const headerTone =
                feature.tone === "blue"
                  ? "bg-indigo-50"
                  : feature.tone === "mint"
                    ? "bg-emerald-50"
                    : "bg-orange-50";

              return (
                <Card key={feature.title} className="overflow-hidden shadow-chip">
                  <CardHeader className={`border-b-2 border-slate-700 ${headerTone}`}>
                    <div className="flex items-center gap-3">
                      <div className="rounded-sm border-2 border-slate-700 bg-white p-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 text-sm font-semibold text-slate-600">
                    {feature.description}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="knowledge" className="orbit-frame overflow-hidden">
          <div className="orbit-panel-head bg-emerald-50 text-slate-700">
            Knowledge Base for Teachers
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-3">
            {knowledgeCards.map((card, index) => (
              <Card key={card.title} className="overflow-hidden shadow-chip">
                <CardHeader
                  className={
                    index === 0
                      ? "border-b-2 border-slate-700 bg-emerald-50"
                      : index === 1
                        ? "border-b-2 border-slate-700 bg-indigo-50"
                        : "border-b-2 border-slate-700 bg-orange-50"
                  }
                >
                  <CardTitle className="text-base">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm font-semibold text-slate-600">
                  {card.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="workflow" className="orbit-frame overflow-hidden">
          <div className="orbit-panel-head bg-orange-50 text-slate-700">
            How It Works
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-4">
            {workflow.map((step, index) => (
              <Card key={step} className="shadow-chip">
                <CardContent className="space-y-3 p-4">
                  <div className="inline-flex rounded-full border-2 border-slate-700 bg-amber-100 px-3 py-1 text-xs font-black">
                    {index + 1}
                  </div>
                  <p className="text-sm font-bold text-slate-700">{step}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="orbit-frame flex flex-col items-start justify-between gap-4 overflow-hidden bg-paper px-5 py-5 md:flex-row md:items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-800">
              Ready to study smarter with cited answers?
            </h2>
            <p className="text-sm font-semibold text-slate-600 md:text-base">
              Open the workspace and continue your SWD392 sessions.
            </p>
          </div>
          <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
            Launch Dashboard
          </Link>
        </section>
      </main>

      <footer className="orbit-shell flex flex-col gap-1 px-1 pt-6 text-sm font-bold text-slate-500 md:flex-row md:justify-between">
        <span>OrbitDocs | Educational RAG workspace</span>
        <span>Built for students and teachers | Course: SWD392</span>
      </footer>
    </div>
  );
}
