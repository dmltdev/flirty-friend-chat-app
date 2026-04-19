import { useImperativeHandle, useRef, useState } from "react";

export interface ChatInputHandle {
  focus: () => void;
  setValue: (text: string) => void;
}

interface ChatInputProps {
  ref?: React.Ref<ChatInputHandle>;
  isLoading: boolean;
  onSubmit: (text: string) => void;
  onStop: () => void;
  onDirty?: () => void;
}

export function ChatInput({
  ref,
  isLoading,
  onStop,
  onDirty,
  onSubmit,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState<string>("");

  useImperativeHandle(
    ref,
    () => ({
      focus: () => textareaRef.current?.focus(),
      setValue: (text: string) => setValue(text),
    }),
    [],
  );

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
    textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onDirty?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isLoading}
      className="flex items-end gap-2 px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 shrink-0"
      style={{ paddingBottom: `max(0.75rem, env(safe-area-inset-bottom))` }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Say something..."
        rows={1}
        className="flex-1 resize-none rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 [field-sizing:content] max-h-32 overflow-y-auto"
      />
      {isLoading ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop generating"
          className="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Stop
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim()}
          className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      )}
    </form>
  );
}
