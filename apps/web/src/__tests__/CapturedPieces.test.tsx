import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CapturedPieces from "../components/CapturedPieces";
import { useGameStore } from "../store/useGameStore";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("CapturedPieces", () => {
  it("shows none captured for a fresh game", () => {
    useGameStore.setState({ fen: START_FEN });
    render(<CapturedPieces />);
    expect(screen.getAllByText("None")).toHaveLength(2);
  });

  it("shows captured counts for a missing black queen", () => {
    useGameStore.setState({
      fen: "rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    });
    render(<CapturedPieces />);
    const whiteRow = screen.getByText("White lost").closest("div");
    const blackRow = screen.getByText("Black lost").closest("div");

    expect(whiteRow).not.toBeNull();
    expect(blackRow).not.toBeNull();

    if (whiteRow && blackRow) {
      expect(within(whiteRow).getByText("None")).toBeInTheDocument();
      expect(within(blackRow).getByText("x1")).toBeInTheDocument();
    }
  });
});
