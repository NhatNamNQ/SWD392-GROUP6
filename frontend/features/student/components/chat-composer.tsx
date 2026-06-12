import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatComposerProps = {
  disabled?: boolean;
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  scopeLabel: string;
};

export function ChatComposer({
  disabled = false,
  input,
  loading,
  onInputChange,
  onSubmit,
  scopeLabel,
}: ChatComposerProps) {
  return (
    <form onSubmit={onSubmit} className="p-3 md:p-4">
      <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-[0_22px_60px_rgba(15,23,42,0.14)] backdrop-blur">
        <div className="border-b border-slate-200/80 px-5 py-3">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Scope: {scopeLabel}
          </p>
        </div>

        <div className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:px-5">
          <Textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Ask about a lecture, diagram, pattern, or assignment..."
            aria-label="Chat input"
            className="min-h-[132px] rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-4 py-4 text-[15px] font-semibold shadow-none focus-visible:ring-sky-300"
            disabled={disabled || loading}
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 rounded-full px-6 md:h-14 md:w-auto"
            disabled={disabled || loading}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </form>
  );
}
