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
          className="orbit-chip text-left"
          onClick={() => onPromptClick(prompt)}
        >
          {prompt}
        </button>
      ))}
    </>
  );
}
