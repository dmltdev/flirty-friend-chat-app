import { useEffect, useState } from "react";
import type { ChatError } from "~/features/chat/types";

interface ChatErrorBannerProps {
  error: NonNullable<ChatError>;
  onRetry: () => void;
  onEdit: () => void;
}

export function ChatErrorBanner({
  error,
  onRetry,
  onEdit,
}: ChatErrorBannerProps) {
  const [countdown, setCountdown] = useState(
    error.type === "rate_limited" ? error.retryAfterSec : 0,
  );

  useEffect(() => {
    if (error.type !== "rate_limited") return;
    setCountdown(error.retryAfterSec);
    const id = setInterval(() => {
      setCountdown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [error]);

  const showEdit =
    error.type === "moderation_blocked" || error.type === "bad_request";
  const showRetry =
    error.type === "unknown" ||
    (error.type === "rate_limited" && countdown === 0);

  return (
    <div className="px-4 py-2 shrink-0">
      <div
        role="alert"
        className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300"
      >
        <div className="flex-1">
          {error.type === "moderation_blocked" && (
            <p>
              Message blocked - contains forbidden word pair
              {error.violations.length > 1 ? "s" : ""}:{" "}
              {error.violations
                .map((v) => `"${v.rule.w1}" near "${v.rule.w2}"`)
                .join(", ")}
            </p>
          )}
          {error.type === "rate_limited" && (
            <p>
              {countdown > 0
                ? `Too many messages. Try again in ${countdown}s.`
                : "You can try again now."}
            </p>
          )}
          {error.type === "bad_request" && (
            <p>{error.message ?? "Invalid request."}</p>
          )}
          {error.type === "unknown" && <p>{error.message}</p>}
        </div>
        {showEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-md border border-red-300 dark:border-red-700 px-2 py-1 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900"
          >
            Edit
          </button>
        )}
        {showRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-md border border-red-300 dark:border-red-700 px-2 py-1 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
