// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Flashcard, type FlashcardItem } from "@/components/flashcards/flashcard";
import type { Word, WordPart } from "@/types";

const part = {
  id: "part-1",
  text: "trans-",
  type: "prefix",
  meaning: "across, through",
  description: "Movement from one side to another.",
  origin: "Latin",
  difficulty: "beginner",
  category: "movement",
  visual_mnemonic: "A bus crossing the city.",
  related_parts: "[]",
  status: "published",
  created_by: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
} as unknown as WordPart;

const word = {
  id: "word-1",
  word_part_id: "part-1",
  word: "transport",
  definition: "to carry across",
  sentence: "The ferry transports cars across the river.",
  pronunciation: null,
  difficulty: "beginner",
  status: "published",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
} as unknown as Word;

const item: FlashcardItem = {
  part,
  words: [word],
  progress: null,
  dueReason: "",
};

describe("Flashcard", () => {
  it("shows the part on the front and flips to the meaning on click", () => {
    const onFlip = vi.fn();
    render(<Flashcard item={item} onFlip={onFlip} />);
    const card = screen.getByRole("button", { name: /show the meaning/i });
    expect(screen.getByText("trans-")).toBeTruthy();
    fireEvent.click(card);
    expect(onFlip).toHaveBeenCalledWith(true);
    expect(
      screen.getByRole("button", { name: /show the word part/i })
    ).toBeTruthy();
  });

  it("flips with the Space key", () => {
    render(<Flashcard item={item} />);
    fireEvent.keyDown(window, { key: " " });
    expect(
      screen.getByRole("button", { name: /show the word part/i })
    ).toBeTruthy();
  });

  it("resets to the front when the part changes", () => {
    const { rerender } = render(<Flashcard item={item} />);
    fireEvent.click(screen.getByRole("button", { name: /show the meaning/i }));
    expect(
      screen.getByRole("button", { name: /show the word part/i })
    ).toBeTruthy();
    rerender(
      <Flashcard
        item={{ ...item, part: { ...part, id: "part-2", text: "cred" } }}
      />
    );
    expect(screen.getByRole("button", { name: /show the meaning/i })).toBeTruthy();
  });
});
