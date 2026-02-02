import { Chess } from "chess.js";
import { AiMode, Difficulty } from "./difficulty";

type PendingRequest = {
  fen: string;
  difficulty: Difficulty;
  mode: AiMode;
  retry: boolean;
  resolve: (move: { from: string; to: string; promotion?: string }) => void;
  reject: (error: Error) => void;
};

let worker: Worker | null = null;
let requestId = 0;
const pending = new Map<string, PendingRequest>();

type WorkerResponse = {
  id: string;
  bestMove: string;
};

function ensureWorker(): Worker {
  if (worker) {
    return worker;
  }
  worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const { id, bestMove } = event.data;
    const request = pending.get(id);
    if (!request) {
      return;
    }
    pending.delete(id);
    const parsed = parseUciMove(bestMove);
    if (!parsed || !isValidMove(request.fen, parsed)) {
      if (!request.retry) {
        sendBestMoveRequest(
          request.fen,
          request.difficulty,
          request.mode,
          true,
          request.resolve,
          request.reject
        );
        return;
      }
      request.reject(new Error("Engine returned invalid move"));
      return;
    }
    request.resolve(parsed);
  };
  worker.onerror = () => {
    pending.forEach((request) => request.reject(new Error("Stockfish worker error")));
    pending.clear();
  };
  return worker;
}

function parseUciMove(uci: string): { from: string; to: string; promotion?: string } | null {
  if (!uci || uci === "(none)" || uci === "0000" || uci.length < 4) {
    return null;
  }
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length >= 5 ? uci[4] : undefined;
  return { from, to, promotion };
}

function isValidMove(fen: string, move: { from: string; to: string; promotion?: string }): boolean {
  const chess = new Chess(fen);
  return chess
    .moves({ verbose: true })
    .some(
      (legal) =>
        legal.from === move.from &&
        legal.to === move.to &&
        (legal.promotion ? legal.promotion === move.promotion : true)
    );
}

function sendBestMoveRequest(
  fen: string,
  difficulty: Difficulty,
  mode: AiMode,
  retry: boolean,
  resolve: PendingRequest["resolve"],
  reject: PendingRequest["reject"]
) {
  const id = `${Date.now()}-${requestId++}`;
  pending.set(id, { fen, difficulty, mode, retry, resolve, reject });
  ensureWorker().postMessage({ type: "bestmove", id, fen, difficulty, mode, retry });
}

export function getBestMove(
  fen: string,
  difficulty: Difficulty,
  mode: AiMode = "ai"
): Promise<{ from: string; to: string; promotion?: string }> {
  if (typeof SharedArrayBuffer === "undefined" || !globalThis.crossOriginIsolated) {
    return Promise.reject(
      new Error("AI is unavailable: missing cross-origin isolation headers (COOP/COEP).")
    );
  }

  return new Promise((resolve, reject) => {
    sendBestMoveRequest(fen, difficulty, mode, false, resolve, reject);
  });
}

export function resetStockfishWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  pending.clear();
}
