declare module "stockfish.wasm" {
  type StockfishOptions = {
    locateFile?: (path: string, prefix?: string) => string;
    mainScriptUrlOrBlob?: string | Blob;
  };

  type StockfishEngine = {
    postMessage: (command: string) => void;
    addMessageListener: (handler: (line: string) => void) => void;
    removeMessageListener?: (handler: (line: string) => void) => void;
    terminate?: () => void;
  };

  const Stockfish: (options?: StockfishOptions) => Promise<StockfishEngine>;
  export default Stockfish;
}
