import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchResults } from "./SearchResults";

describe("SearchResults", () => {
  it("renders nothing when content is empty", () => {
    const { container } = render(
      <SearchResults content="" isStreaming={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders content when provided", () => {
    render(<SearchResults content="Test response" isStreaming={false} />);
    expect(screen.getByText("Test response")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  it("shows streaming indicator when isStreaming is true", () => {
    render(<SearchResults content="Loading..." isStreaming={true} />);
    expect(screen.getByText(/入力中/)).toBeInTheDocument();
  });

  it("does not show streaming indicator when isStreaming is false", () => {
    render(<SearchResults content="Complete response" isStreaming={false} />);
    expect(screen.queryByText(/入力中/)).not.toBeInTheDocument();
  });

  it("preserves whitespace in content", () => {
    const multilineContent = "Line 1\nLine 2\nLine 3";
    render(<SearchResults content={multilineContent} isStreaming={false} />);
    expect(screen.getByText(multilineContent)).toBeInTheDocument();
  });
});
