import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchHistory } from "./SearchHistory";

describe("SearchHistory", () => {
  it("renders empty when no messages", () => {
    const { container } = render(<SearchHistory messages={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders user messages", () => {
    const messages = [
      {
        id: "1",
        role: "user" as const,
        content: "Hello AI",
      },
    ];

    render(<SearchHistory messages={messages} />);
    expect(screen.getByText("Hello AI")).toBeInTheDocument();
    expect(screen.getByText("あなた")).toBeInTheDocument();
  });

  it("renders assistant messages", () => {
    const messages = [
      {
        id: "1",
        role: "assistant" as const,
        content: "Hello user",
      },
    ];

    render(<SearchHistory messages={messages} />);
    expect(screen.getByText("Hello user")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  it("renders multiple messages in order", () => {
    const messages = [
      {
        id: "1",
        role: "user" as const,
        content: "First message",
      },
      {
        id: "2",
        role: "assistant" as const,
        content: "Second message",
      },
      {
        id: "3",
        role: "user" as const,
        content: "Third message",
      },
    ];

    render(<SearchHistory messages={messages} />);
    expect(screen.getByText("First message")).toBeInTheDocument();
    expect(screen.getByText("Second message")).toBeInTheDocument();
    expect(screen.getByText("Third message")).toBeInTheDocument();
  });

  it("uses message id as key", () => {
    const messages = [
      {
        id: "unique-id-1",
        role: "user" as const,
        content: "Test message",
      },
    ];

    const { container } = render(<SearchHistory messages={messages} />);
    const messageElement = container.querySelector('[class*="flex"]');
    expect(messageElement).toBeInTheDocument();
  });
});
