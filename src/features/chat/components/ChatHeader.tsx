interface ChatHeaderProps {
  isLoading: boolean;
}

export function ChatHeader({ isLoading }: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
      <div className="size-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm">
        FF
      </div>
      <div>
        <h1 className="text-sm font-semibold">Flirty Friend</h1>
        <p className="text-xs text-zinc-500">
          {isLoading ? "typing..." : "online"}
        </p>
      </div>
    </header>
  );
}
