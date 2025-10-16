"use client";

import { useState } from "react";

interface SearchResult {
  id: string;
  query: string;
  answer: string;
  timestamp: Date;
}

export default function AISearchPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null);
  const [currentResponse, setCurrentResponse] = useState("");
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const query = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);
    setCurrentResponse("");
    setShowHistory(false);

    // 新しい検索結果を作成
    const newResult: SearchResult = {
      id: `search-${Date.now()}`,
      query,
      answer: "",
      timestamp: new Date(),
    };
    setCurrentResult(newResult);

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: query,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // ストリーミングレスポンスの処理
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            const data = line.substring(2).trim();
            if (data) {
              try {
                const parsed = JSON.parse(data);
                if (parsed && typeof parsed === "string") {
                  accumulatedResponse += parsed;
                  setCurrentResponse(accumulatedResponse);
                }
              } catch {
                // JSON パースエラーは無視
              }
            }
          }
        }
      }

      // 完了したら履歴に追加
      const completedResult: SearchResult = {
        ...newResult,
        answer: accumulatedResponse,
      };

      setCurrentResult(completedResult);
      setSearchHistory((prev) => [completedResult, ...prev]);
      setCurrentResponse("");
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err instanceof Error ? err.message : "検索中にエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryClick = (result: SearchResult) => {
    setCurrentResult(result);
    setShowHistory(false);
    setError(null);
  };

  const handleDeleteHistory = (e: React.MouseEvent, historyId: string) => {
    e.stopPropagation();
    setSearchHistory((prev) => prev.filter((item) => item.id !== historyId));

    // 削除した履歴が現在表示中の場合はクリア
    if (currentResult?.id === historyId) {
      setCurrentResult(null);
    }
  };

  const handleClearAllHistory = () => {
    setSearchHistory([]);
    setShowHistory(false);
    setCurrentResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            AI検索
          </h1>
          <p className="text-gray-600">何でも質問してください</p>
        </div>

        {/* 検索ボックス */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="質問を入力..."
                className="flex-1 px-6 py-4 text-lg rounded-l-full focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-8 py-4 bg-blue-600 text-white rounded-r-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? "検索中..." : "検索"}
              </button>
            </div>

            {/* 検索履歴ドロップダウン */}
            {searchHistory.length > 0 && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="History icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  検索履歴 ({searchHistory.length})
                </button>
              </div>
            )}

            {/* 履歴リスト */}
            {showHistory && searchHistory.length > 0 && (
              <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                {/* ヘッダー */}
                <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    検索履歴
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    すべて削除
                  </button>
                </div>

                {/* 履歴アイテム */}
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group relative border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleHistoryClick(item)}
                      className="w-full text-left px-4 py-3 pr-12"
                    >
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.query}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.timestamp.toLocaleString("ja-JP")}
                      </div>
                    </button>

                    {/* 削除ボタン */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistory(e, item.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="この履歴を削除"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        role="img"
                        aria-label="Delete icon"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
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
              <div>
                <div className="font-semibold">エラー</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* 結果表示エリア */}
        {(currentResult || currentResponse) && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            {/* 質問 */}
            {currentResult && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="text-sm text-gray-500 mb-1">質問</div>
                <div className="text-lg font-medium text-gray-900">
                  {currentResult.query}
                </div>
              </div>
            )}

            {/* 回答 */}
            <div>
              <div className="text-sm text-gray-500 mb-2">回答</div>
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                {currentResponse || currentResult?.answer}
                {isLoading && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 初期状態のメッセージ */}
        {!currentResult && !currentResponse && !error && !isLoading && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Search icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg">
              上の検索ボックスに質問を入力してください
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Next.jsについて教えて", "TypeScriptとは？", "Reactの特徴"].map(
                (example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setInput(example)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {example}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
