import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <form onSubmit={onSubmit} className="border-t-2 border-slate-700 bg-slate-50/90 p-4 md:p-5">
      <Card className="overflow-hidden">
        <div className="border-b-2 border-slate-700 bg-sky-50 px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-slate-600">
          Scope: {scopeLabel}
        </div>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Ask about a lecture, diagram, pattern, or assignment..."
            aria-label="Chat input"
            className="min-h-[116px]"
            disabled={disabled || loading}
          />
          <Button
            type="submit"
            size="lg"
            className="md:h-[116px] md:w-[120px]"
            disabled={disabled || loading}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
