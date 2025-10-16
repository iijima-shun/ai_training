interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface SearchHistoryProps {
  messages: Message[];
}

export function SearchHistory({ messages }: SearchHistoryProps) {
  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`p-4 rounded-lg max-w-[80%] md:max-w-[70%] shadow-sm ${
              message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="text-xs font-semibold mb-2 opacity-70">
              {message.role === "user" ? "あなた" : "AI"}
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
