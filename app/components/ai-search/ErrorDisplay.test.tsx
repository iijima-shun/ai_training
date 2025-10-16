import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorDisplay } from "./ErrorDisplay";

describe("ErrorDisplay", () => {
  it("renders nothing when error is null", () => {
    const { container } = render(<ErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders error message when provided", () => {
    render(<ErrorDisplay error="Test error message" />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByText("エラー")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    render(<ErrorDisplay error="Test error" onRetry={vi.fn()} />);
    expect(screen.getByRole("button", { name: /再試行/ })).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorDisplay error="Test error" />);
    expect(
      screen.queryByRole("button", { name: /再試行/ }),
    ).not.toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorDisplay error="Test error" onRetry={onRetry} />);

    const retryButton = screen.getByRole("button", { name: /再試行/ });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders error icon", () => {
    render(<ErrorDisplay error="Test error" />);
    const icon = screen.getByRole("img", { name: /Error icon/ });
    expect(icon).toBeInTheDocument();
  });
});
