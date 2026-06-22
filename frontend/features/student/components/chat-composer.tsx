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
    <form onSubmit={onSubmit} className="px-4 py-3 md:px-6 md:py-4">
      {/* Scope indicator */}
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
        Scope: <span className="text-primary">{scopeLabel}</span>
      </p>
      <div className="flex items-end gap-3">
        <Textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Ask about a lecture, diagram, pattern, or assignment..."
          aria-label="Chat input"
          className="min-h-[80px] flex-1 rounded-md border border-border bg-secondary/80 px-4 py-3 text-sm font-semibold shadow-none focus-visible:ring-primary resize-none"
          disabled={disabled || loading}
        />
        <Button
          type="submit"
          size="lg"
          className="h-12 shrink-0 rounded-md px-6"
          disabled={disabled || loading}
        >
          {loading ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
}
