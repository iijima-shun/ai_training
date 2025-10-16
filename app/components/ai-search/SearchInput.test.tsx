import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("renders input field and submit button", () => {
    render(
      <SearchInput
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
      />,
    );

    expect(
      screen.getByPlaceholderText(/質問を入力してください/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /送信/ })).toBeInTheDocument();
  });

  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SearchInput
        value=""
        onChange={onChange}
        onSubmit={vi.fn()}
        isLoading={false}
      />,
    );

    const textarea = screen.getByPlaceholderText(/質問を入力してください/);
    await user.type(textarea, "test query");

    expect(onChange).toHaveBeenCalled();
  });

  it("calls onSubmit when form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e) => e.preventDefault());

    render(
      <SearchInput
        value="test query"
        onChange={vi.fn()}
        onSubmit={onSubmit}
        isLoading={false}
      />,
    );

    const button = screen.getByRole("button", { name: /送信/ });
    await user.click(button);

    expect(onSubmit).toHaveBeenCalled();
  });

  it("disables button when isLoading is true", () => {
    render(
      <SearchInput
        value="test"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={true}
      />,
    );

    const button = screen.getByRole("button", { name: /検索中/ });
    expect(button).toBeDisabled();
  });

  it("disables button when value is empty", () => {
    render(
      <SearchInput
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
      />,
    );

    const button = screen.getByRole("button", { name: /送信/ });
    expect(button).toBeDisabled();
  });

  it("disables textarea when isLoading is true", () => {
    render(
      <SearchInput
        value="test"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={true}
      />,
    );

    const textarea = screen.getByPlaceholderText(/質問を入力してください/);
    expect(textarea).toBeDisabled();
  });
});
