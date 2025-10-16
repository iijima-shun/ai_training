"use client";

import { useState } from "react";
import { ErrorDisplay } from "../components/ai-search/ErrorDisplay";
import { SearchHistory } from "../components/ai-search/SearchHistory";
import { SearchInput } from "../components/ai-search/SearchInput";
import { SearchResults } from "../components/ai-search/SearchResults";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AISearchPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    // ユーザーメッセージを追加
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    setCurrentResponse("");

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
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
            // データ行を処理
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
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: accumulatedResponse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
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

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto p-4 md:p-6 bg-gray-50">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">
        AI検索ツール
      </h1>

      {/* 検索履歴 */}
      <div className="flex-1 overflow-y-auto mb-4 md:mb-6 space-y-4 px-2">
        <SearchHistory messages={messages} />
        <SearchResults content={currentResponse} isStreaming={isLoading} />
        <ErrorDisplay error={error} />
      </div>

      {/* 検索入力フォーム */}
      <SearchInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
