import { openrouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

// モックモード: APIキーがない場合にモックレスポンスを返す
const MOCK_MODE = !process.env.OPENROUTER_API_KEY;

// モックレスポンスを生成する関数
function createMockStreamResponse(userMessage: string) {
  const mockResponses: Record<string, string> = {
    default:
      "こんにちは！これはモックモードでの応答です。実際のAI応答を得るには、OpenRouter APIキーを.env.localファイルに設定してください。\n\nAPIキーの設定方法:\n1. https://openrouter.ai/keys でAPIキーを取得\n2. .env.localファイルに以下を追加:\n   OPENROUTER_API_KEY=your-api-key-here\n3. 開発サーバーを再起動",
    next: "Next.jsは、Reactベースのフルスタックフレームワークです。主な特徴:\n\n1. **App Router**: 最新のルーティングシステム\n2. **Server Components**: サーバーサイドレンダリング\n3. **Turbopack**: 高速なビルドツール\n4. **API Routes**: バックエンドAPI機能\n\n※これはモックレスポンスです。実際のAI応答を得るにはAPIキーが必要です。",
    typescript:
      "TypeScriptは、JavaScriptに静的型付けを追加したプログラミング言語です。\n\n主な利点:\n- コンパイル時の型チェック\n- IDEのインテリセンス向上\n- バグの早期発見\n- コードの保守性向上\n\n※これはモックレスポンスです。",
    react:
      "ReactはUIを構築するためのJavaScriptライブラリです。\n\n主な概念:\n- コンポーネントベース\n- 宣言的UI\n- 仮想DOM\n- Hooks（useState, useEffectなど）\n\n※これはモックレスポンスです。",
  };

  // キーワードに基づいてレスポンスを選択
  const lowerMessage = userMessage.toLowerCase();
  let response = mockResponses.default;

  if (lowerMessage.includes("next")) {
    response = mockResponses.next;
  } else if (lowerMessage.includes("typescript")) {
    response = mockResponses.typescript;
  } else if (lowerMessage.includes("react")) {
    response = mockResponses.react;
  }

  // ストリーミング風にレスポンスを返す
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // 文字列を1文字ずつストリーミング
      for (let i = 0; i < response.length; i++) {
        const char = response[i];
        const chunk = `0:"${char}"\n`;
        controller.enqueue(encoder.encode(chunk));
        // 少し遅延を入れてストリーミング感を出す
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(req: Request) {
  try {
    // リクエストボディのパース
    let body: { messages?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { messages } = body;

    // バリデーション
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array cannot be empty" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 各メッセージの検証
    for (const message of messages) {
      if (!message.role || !message.content) {
        return new Response(
          JSON.stringify({
            error: "Each message must have role and content",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    // モックモードの場合
    if (MOCK_MODE) {
      console.log("🔧 Running in MOCK MODE (no API key detected)");
      const lastUserMessage = messages
        .filter((m: { role: string }) => m.role === "user")
        .pop();
      const userContent = lastUserMessage?.content || "";
      return createMockStreamResponse(userContent);
    }

    // 通常モード: OpenRouterを使用
    const result = streamText({
      model: openrouter("meta-llama/llama-3.3-70b-instruct"),
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Search API Error:", error);

    // エラーの種類に応じたレスポンス
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message || "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
