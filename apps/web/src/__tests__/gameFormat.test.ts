import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { getStatusFromChess } from "../game/format";

describe("getStatusFromChess", () => {
  it("returns checkmate status with correct winner", () => {
    const chess = new Chess("7k/6Q1/5K2/8/8/8/8/8 b - - 0 1");
    const status = getStatusFromChess(chess);
    expect(status.gameOver).toBe(true);
    expect(status.status).toBe("Checkmate - White wins");
  });

  it("returns stalemate status", () => {
    const chess = new Chess("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1");
    const status = getStatusFromChess(chess);
    expect(status.gameOver).toBe(true);
    expect(status.status).toBe("Stalemate - Draw");
  });

  it("returns draw status for insufficient material", () => {
    const chess = new Chess("8/8/8/8/8/8/2k5/3K4 w - - 0 1");
    const status = getStatusFromChess(chess);
    expect(status.gameOver).toBe(true);
    expect(status.status).toBe("Draw");
  });

  it("returns check status when side to move is in check", () => {
    const chess = new Chess("4k3/8/8/8/8/8/4Q3/4K3 b - - 0 1");
    const status = getStatusFromChess(chess);
    expect(status.gameOver).toBe(false);
    expect(status.status).toBe("Black to move - Check");
  });
});
