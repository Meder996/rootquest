// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RatingButtons } from "@/components/flashcards/rating-buttons";

describe("RatingButtons", () => {
  it("renders all four rating options", () => {
    render(<RatingButtons onRate={() => {}} />);
    expect(screen.getByRole("button", { name: /again/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /hard/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /good/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /easy/i })).toBeTruthy();
  });

  it("calls onRate with the correct rating when clicked", () => {
    const onRate = vi.fn();
    render(<RatingButtons onRate={onRate} />);
    fireEvent.click(screen.getByRole("button", { name: /good/i }));
    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onRate).toHaveBeenCalledWith("good");
  });

  it("supports keyboard shortcuts 1-4", () => {
    const onRate = vi.fn();
    render(<RatingButtons onRate={onRate} />);
    fireEvent.keyDown(window, { key: "1" });
    fireEvent.keyDown(window, { key: "4" });
    expect(onRate).toHaveBeenNthCalledWith(1, "again");
    expect(onRate).toHaveBeenNthCalledWith(2, "easy");
  });

  it("does not call onRate when disabled", () => {
    const onRate = vi.fn();
    render(<RatingButtons onRate={onRate} disabled />);
    fireEvent.click(screen.getByRole("button", { name: /again/i }));
    fireEvent.keyDown(window, { key: "1" });
    expect(onRate).not.toHaveBeenCalled();
  });
});
