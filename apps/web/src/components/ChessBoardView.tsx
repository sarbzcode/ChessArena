import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { getAiGame } from "../game/chessClient";
import { getBestMove } from "../ai/stockfishWorker";
import { getMoveDelayMs } from "../ai/difficulty";
import { useGameStore } from "../store/useGameStore";
import { makeMove } from "../socket/multiplayer";

type PromotionState = {
  from: string;
  to: string;
};

const promotionPieces = ["q", "r", "b", "n"] as const;

const ChessBoardView = () => {
  const mode = useGameStore((state) => state.mode);
  const fen = useGameStore((state) => state.fen);
  const turn = useGameStore((state) => state.turn);
  const status = useGameStore((state) => state.status);
  const roomId = useGameStore((state) => state.roomId);
  const myColor = useGameStore((state) => state.myColor);
  const aiSide = useGameStore((state) => state.aiSide);
  const aiDifficulty = useGameStore((state) => state.aiDifficulty);
  const aiThinking = useGameStore((state) => state.aiThinking);
  const aiSessionId = useGameStore((state) => state.aiSessionId);
  const gameOver = useGameStore((state) => state.gameOver);
  const setAiThinking = useGameStore((state) => state.setAiThinking);
  const syncFromChess = useGameStore((state) => state.syncFromChess);

  const isAiMode = mode === "ai" || mode === "aivsai";
  const isAiVsAi = mode === "aivsai";
  const aiGameRef = useRef<Chess>(getAiGame());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [highlightSquares, setHighlightSquares] = useState<Record<string, CSSProperties>>({});
  const [promotionPending, setPromotionPending] = useState<PromotionState | null>(null);

  useEffect(() => {
    if (isAiMode) {
      aiGameRef.current = getAiGame();
      setSelectedSquare(null);
      setHighlightSquares({});
      const chess = aiGameRef.current;
      const shouldMove = isAiVsAi || chess.turn() !== aiSide;
      if (!chess.isGameOver() && shouldMove) {
        void triggerAiMove(aiSessionId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSessionId, aiSide, mode]);

  const boardOrientation = useMemo(() => {
    if (mode === "ai") {
      return aiSide === "w" ? "white" : "black";
    }
    if (mode === "aivsai") {
      return "white";
    }
    if (myColor === "b") {
      return "black";
    }
    return "white";
  }, [aiSide, mode, myColor]);

  const isDraggable = useMemo(() => {
    if (mode === "ai") {
      const chess = aiGameRef.current;
      return !aiThinking && !chess.isGameOver() && chess.turn() === aiSide;
    }
    if (mode === "multiplayer") {
      return !gameOver && myColor !== "spectator" && turn === myColor;
    }
    return false;
  }, [aiThinking, aiSide, gameOver, mode, myColor, turn]);

  const triggerAiMove = async (sessionId: number) => {
    const chess = aiGameRef.current;
    const { mode: currentMode, aiThinking: currentThinking, aiSide: currentSide } =
      useGameStore.getState();
    if (
      (currentMode !== "ai" && currentMode !== "aivsai") ||
      currentThinking ||
      chess.isGameOver()
    ) {
      return;
    }
    if (currentMode === "ai" && chess.turn() === currentSide) {
      return;
    }
    setAiThinking(true);
    let queueNextMove = false;
    try {
      const currentDifficulty = useGameStore.getState().aiDifficulty;
      const bestMove = await getBestMove(chess.fen(), currentDifficulty, currentMode);
      if (useGameStore.getState().aiSessionId !== sessionId) {
        return;
      }
      const delayMs = getMoveDelayMs(currentDifficulty);
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        if (useGameStore.getState().aiSessionId !== sessionId) {
          return;
        }
      }
      const applied = chess.move(bestMove);
      if (applied) {
        syncFromChess(chess);
        queueNextMove = useGameStore.getState().mode === "aivsai" && !chess.isGameOver();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI move failed. Try again.";
      useGameStore.getState().setError(message);

    } finally {
      setAiThinking(false);
      if (queueNextMove) {
        void triggerAiMove(sessionId);
      }
    }
  };

  const clearSelection = () => {
    setSelectedSquare(null);
    setHighlightSquares({});
  };

  const getMoveTargets = (square: string): string[] => {
    const chess = isAiMode ? aiGameRef.current : new Chess(fen);
    return chess
      .moves({ square, verbose: true })
      .map((move) => move.to);
  };

  const handleSquareClick = (square: string) => {
    if (mode === "find" || mode === "aivsai") {
      return;
    }
    if (selectedSquare === square) {
      clearSelection();
      return;
    }
    const chess = isAiMode ? aiGameRef.current : new Chess(fen);
    const piece = chess.get(square);
    if (!piece) {
      clearSelection();
      return;
    }
    if (mode === "ai" && (aiThinking || piece.color !== aiSide || chess.turn() !== aiSide)) {
      clearSelection();
      return;
    }
    if (
      mode === "multiplayer" &&
      (myColor === "spectator" || piece.color !== myColor || turn !== myColor)
    ) {
      clearSelection();
      return;
    }
    const targets = getMoveTargets(square);
    if (targets.length === 0) {
      clearSelection();
      return;
    }
    setSelectedSquare(square);
    const highlights: Record<string, CSSProperties> = {
      [square]: { backgroundColor: "rgba(231, 111, 81, 0.5)" }
    };
    targets.forEach((target) => {
      highlights[target] = {
        background:
          "radial-gradient(circle, rgba(231, 111, 81, 0.7) 20%, transparent 22%)"
      };
    });
    setHighlightSquares(highlights);
  };

  const isPromotionMove = (chess: Chess, from: string, to: string): boolean => {
    const piece = chess.get(from);
    if (!piece || piece.type !== "p") {
      return false;
    }
    return (piece.color === "w" && to[1] === "8") || (piece.color === "b" && to[1] === "1");
  };

  const applyMove = (from: string, to: string, promotion?: string): boolean => {
    if (mode === "aivsai") {
      return false;
    }
    if (mode === "ai") {
      const chess = aiGameRef.current;
      const result = chess.move({ from, to, promotion });
      if (!result) {
        return false;
      }
      syncFromChess(chess);
      clearSelection();
      if (!chess.isGameOver()) {
        void triggerAiMove(aiSessionId);
      }
      return true;
    }
    if (mode === "multiplayer") {
      if (!roomId || myColor === "spectator" || turn !== myColor) {
        return false;
      }
      const chess = new Chess(fen);
      const result = chess.move({ from, to, promotion });
      if (!result) {
        return false;
      }
      makeMove(roomId, { from, to, promotion });
      clearSelection();
      return false;
    }
    return false;
  };

  const handlePieceDrop = (from: string, to: string): boolean => {
    if (mode === "find" || mode === "aivsai") {
      return false;
    }
    if (mode === "ai" && aiThinking) {
      return false;
    }
    const chess = isAiMode ? aiGameRef.current : new Chess(fen);
    if (isPromotionMove(chess, from, to)) {
      setPromotionPending({ from, to });
      return false;
    }
    return applyMove(from, to);
  };

  const handlePromotionSelect = (piece: string) => {
    if (!promotionPending) {
      return;
    }
    applyMove(promotionPending.from, promotionPending.to, piece);
    setPromotionPending(null);
  };

  const isCheckmate = status.includes("Checkmate");
  const checkmatedLabel = turn === "w" ? "White" : "Black";

  return (
    <div className="relative w-full max-w-[560px]">
      <div className="aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 shadow-soft">
        <Chessboard
          position={fen}
          boardOrientation={boardOrientation}
          arePiecesDraggable={isDraggable}
          onPieceDrop={handlePieceDrop}
          onSquareClick={handleSquareClick}
          customSquareStyles={highlightSquares}
          animationDuration={180}
        />
      </div>
      {isCheckmate ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60">
          <div className="rounded-xl border border-white/10 bg-ink px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Checkmate</p>
            <p className="text-lg font-semibold">{checkmatedLabel} checkmated</p>
          </div>
        </div>
      ) : null}
      {promotionPending ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60">
          <div className="rounded-xl border border-white/10 bg-ink px-4 py-3 text-center">
            <p className="text-sm text-white/80">Choose promotion</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {promotionPieces.map((piece) => (
                <button
                  key={piece}
                  type="button"
                  className="btn-secondary w-12"
                  onClick={() => handlePromotionSelect(piece)}
                >
                  {piece.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ChessBoardView;
