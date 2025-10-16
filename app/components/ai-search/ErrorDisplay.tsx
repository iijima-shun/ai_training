interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="flex justify-center">
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 max-w-[80%] md:max-w-[70%] shadow-sm">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            role="img"
            aria-label="Error icon"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <div className="font-semibold mb-1 text-sm">エラー</div>
            <div className="text-sm">{error}</div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
              >
                再試行
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
