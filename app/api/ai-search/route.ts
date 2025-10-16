import { openrouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

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
