import { create } from "zustand";
import { Chess } from "chess.js";
import { resetAiGame, getMoveListFromChess, getMoveListFromPgn } from "../game/chessClient";
import { getStatusFromChess, isGameOverStatus } from "../game/format";
import { resetStockfishWorker } from "../ai/stockfishWorker";
import { RoomState } from "../types/shared";

export type GameMode = "ai" | "aivsai" | "multiplayer" | "find";
export type Difficulty = "beginner" | "intermediate" | "expert";
export type PlayerRole = "w" | "b" | "spectator";
export type ConnectionStatus = "connected" | "disconnected";

type GameStore = {
  mode: GameMode;
  fen: string;
  pgn: string;
  turn: "w" | "b";
  status: string;
  gameOver: boolean;
  moveList: string[];
  roomId: string;
  myColor: PlayerRole;
  players: { white?: string; black?: string };
  searching: boolean;
  aiDifficulty: Difficulty;
  aiSide: "w" | "b";
  aiThinking: boolean;
  connectionStatus: ConnectionStatus;
  error: string | null;
  aiSessionId: number;
  setMode: (mode: GameMode) => void;
  setAiDifficulty: (difficulty: Difficulty) => void;
  setAiSide: (side: "w" | "b") => void;
  setAiThinking: (thinking: boolean) => void;
  startAiGame: () => void;
  syncFromChess: (chess: Chess) => void;
  setServerState: (state: RoomState) => void;
  setRoomId: (roomId: string) => void;
  setMyColor: (color: PlayerRole) => void;
  setSearching: (searching: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setError: (error: string | null) => void;
};

const initialChess = new Chess();
const initialInfo = getStatusFromChess(initialChess);

export const useGameStore = create<GameStore>((set, get) => ({
  mode: "ai",
  fen: initialChess.fen(),
  pgn: "",
  turn: initialInfo.turn,
  status: initialInfo.status,
  gameOver: initialInfo.gameOver,
  moveList: [],
  roomId: "",
  myColor: "spectator",
  players: {},
  searching: false,
  aiDifficulty: "beginner",
  aiSide: "w",
  aiThinking: false,
  connectionStatus: "disconnected",
  error: null,
  aiSessionId: 0,
  setMode: (mode) => {
    const currentMode = get().mode;
    set({ mode, error: null });
    if ((mode === "ai" || mode === "aivsai") && currentMode !== mode) {
      get().startAiGame();
    }
  },
  setAiDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),
  setAiSide: (side) => set({ aiSide: side }),
  setAiThinking: (thinking) => set({ aiThinking: thinking }),
  startAiGame: () => {
    resetStockfishWorker();
    const chess = resetAiGame();
    const info = getStatusFromChess(chess);
    set({
      fen: chess.fen(),
      pgn: chess.pgn(),
      moveList: getMoveListFromChess(chess),
      status: info.status,
      turn: info.turn,
      gameOver: info.gameOver,
      aiThinking: false,
      aiSessionId: get().aiSessionId + 1,
      error: null
    });
  },
  syncFromChess: (chess) => {
    const info = getStatusFromChess(chess);
    set({
      fen: chess.fen(),
      pgn: chess.pgn(),
      moveList: getMoveListFromChess(chess),
      status: info.status,
      turn: info.turn,
      gameOver: info.gameOver
    });
  },
  setServerState: (state) => {
    const current = get();
    const incomingGameOver = isGameOverStatus(state.status);
    const keepResignation = current.status.includes("Resignation") && current.gameOver && !incomingGameOver;
    set({
      roomId: state.roomId,
      fen: state.fen,
      pgn: state.pgn,
      turn: state.turn,
      status: keepResignation ? current.status : state.status,
      players: state.players,
      myColor: state.youAre,
      moveList: getMoveListFromPgn(state.pgn),
      gameOver: keepResignation ? true : incomingGameOver,
      error: null
    });
  },
  setRoomId: (roomId) => set({ roomId }),
  setMyColor: (color) => set({ myColor: color }),
  setSearching: (searching) => set({ searching }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setError: (error) => set({ error })
}));
