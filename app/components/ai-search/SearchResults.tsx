interface SearchResultsProps {
  content: string;
  isStreaming: boolean;
}

export function SearchResults({ content, isStreaming }: SearchResultsProps) {
  if (!content) return null;

  return (
    <div className="flex justify-start">
      <div className="p-4 rounded-lg max-w-[80%] md:max-w-[70%] shadow-sm bg-white border border-gray-200">
        <div className="text-xs font-semibold mb-2 opacity-70">AI</div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {content}
        </div>
        {isStreaming && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            入力中...
          </div>
        )}
      </div>
    </div>
  );
}
