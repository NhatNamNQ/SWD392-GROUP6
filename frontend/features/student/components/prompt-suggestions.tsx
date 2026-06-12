type PromptSuggestionsProps = {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
};

export function PromptSuggestions({ prompts, onPromptClick }: PromptSuggestionsProps) {
  return (
    <>
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-left text-sm font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
          onClick={() => onPromptClick(prompt)}
        >
          {prompt}
        </button>
      ))}
    </>
  );
}
