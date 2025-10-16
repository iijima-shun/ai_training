interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: SearchInputProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-2 bg-white p-4 rounded-lg shadow-md border border-gray-200"
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
          }
        }}
        placeholder="質問を入力してください... (Shift+Enterで改行)"
        className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        rows={3}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="px-4 md:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {isLoading ? "検索中..." : "送信"}
      </button>
    </form>
  );
}
