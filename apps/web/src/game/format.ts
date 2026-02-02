import { Chess } from "chess.js";

export function getStatusFromChess(chess: Chess): {
  status: string;
  turn: "w" | "b";
  gameOver: boolean;
} {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === "w" ? "Black" : "White";
    return { status: `Checkmate - ${winner} wins`, turn: chess.turn(), gameOver: true };
  }
  if (chess.isStalemate()) {
    return { status: "Stalemate - Draw", turn: chess.turn(), gameOver: true };
  }
  if (chess.isDraw()) {
    return { status: "Draw", turn: chess.turn(), gameOver: true };
  }
  if (chess.isCheck()) {
    const turnLabel = chess.turn() === "w" ? "White" : "Black";
    return { status: `${turnLabel} to move - Check`, turn: chess.turn(), gameOver: false };
  }
  const turnLabel = chess.turn() === "w" ? "White" : "Black";
  return { status: `${turnLabel} to move`, turn: chess.turn(), gameOver: false };
}

export function isGameOverStatus(status: string): boolean {
  return (
    status.includes("Checkmate") ||
    status.includes("Stalemate") ||
    status.trim().toLowerCase() === "draw"
  );
}
