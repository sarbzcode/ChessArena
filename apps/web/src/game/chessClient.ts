import { Chess } from "chess.js";

let aiGame = new Chess();

export function resetAiGame(fen?: string): Chess {
  aiGame = new Chess(fen);
  return aiGame;
}

export function getAiGame(): Chess {
  return aiGame;
}

export function getMoveListFromChess(chess: Chess): string[] {
  return chess.history();
}

export function getMoveListFromPgn(pgn: string): string[] {
  if (!pgn) {
    return [];
  }
  const temp = new Chess();
  try {
    temp.loadPgn(pgn);
    return temp.history();
  } catch {
    return [];
  }
}
