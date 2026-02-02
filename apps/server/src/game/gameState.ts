import { Chess } from "chess.js";

export function getTurnLabel(turn: "w" | "b"): string {
  return turn === "w" ? "White" : "Black";
}

export function getStatusText(chess: Chess): string {
  if (chess.isCheckmate()) {
    const winner = getTurnLabel(chess.turn() === "w" ? "b" : "w");
    return `Checkmate - ${winner} wins`;
  }
  if (chess.isStalemate()) {
    return "Stalemate - Draw";
  }
  if (chess.isDraw()) {
    return "Draw";
  }
  if (chess.isCheck()) {
    return `${getTurnLabel(chess.turn())} to move - Check`;
  }
  return `${getTurnLabel(chess.turn())} to move`;
}

export function getResultText(chess: Chess): { result: string; reason: string } | null {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === "w" ? "Black" : "White";
    return { result: winner, reason: "Checkmate" };
  }
  if (chess.isStalemate()) {
    return { result: "Draw", reason: "Stalemate" };
  }
  if (chess.isDraw()) {
    return { result: "Draw", reason: "Draw" };
  }
  return null;
}
