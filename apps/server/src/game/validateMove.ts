import { Chess } from "chess.js";

export type MoveInput = {
  from: string;
  to: string;
  promotion?: string;
};

export function applyValidatedMove(
  chess: Chess,
  playerColor: "w" | "b",
  move: MoveInput
): { ok: true } | { ok: false; reason: string } {
  if (chess.turn() !== playerColor) {
    return { ok: false, reason: "Not your turn" };
  }
  const result = chess.move({
    from: move.from,
    to: move.to,
    promotion: move.promotion
  });
  if (!result) {
    return { ok: false, reason: "Illegal move" };
  }
  return { ok: true };
}
