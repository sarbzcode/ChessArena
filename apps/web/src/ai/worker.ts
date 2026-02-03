/// <reference lib="webworker" />
import Stockfish from "stockfish.wasm";
import mainScriptUrl from "stockfish.wasm/stockfish.js?url";
import wasmUrl from "stockfish.wasm/stockfish.wasm?url";
import workerUrl from "stockfish.wasm/stockfish.worker.js?url&no-inline";
import { getSettings, Difficulty, AiMode } from "./difficulty";

type WorkerRequest = {
  type: "bestmove";
  id: string;
  fen: string;
  difficulty: Difficulty;
  mode?: AiMode;
  retry?: boolean;
};

type WorkerResponse = {
  id: string;
  bestMove: string;
};

type Engine = {
  postMessage: (command: string) => void;
  addMessageListener: (handler: (line: string) => void) => void;
  removeMessageListener?: (handler: (line: string) => void) => void;
};

let enginePromise: Promise<Engine> | null = null;
let currentId: string | null = null;

const handleLine = (line: string) => {
  if (typeof line !== "string") {
    return;
  }
  if (line.startsWith("bestmove")) {
    const parts = line.split(" ");
    const bestMove = parts[1];
    if (currentId) {
      const response: WorkerResponse = { id: currentId, bestMove };
      self.postMessage(response);
    }
    currentId = null;
  }
};

const ensureEngine = async () => {
  if (!enginePromise) {
    enginePromise = (Stockfish({
      locateFile: (path: string) => {
        if (path.endsWith(".wasm")) {
          return wasmUrl;
        }
        if (path.endsWith(".worker.js")) {
          return workerUrl;
        }
        return path;
      },
      mainScriptUrlOrBlob: mainScriptUrl
    }) as Promise<Engine>).then((engine) => {
      engine.addMessageListener(handleLine);
      engine.postMessage("uci");
      return engine;
    });
  }
  return enginePromise;
};

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  if (message.type !== "bestmove") {
    return;
  }
  const engine = await ensureEngine();
  currentId = message.id;
  const settings = getSettings(message.difficulty, message.retry, message.mode ?? "ai");
  engine.postMessage("ucinewgame");
  engine.postMessage(`setoption name Skill Level value ${settings.skill}`);
  engine.postMessage(`position fen ${message.fen}`);
  engine.postMessage(`go movetime ${settings.movetime} depth ${settings.depth}`);
};
