import { useGameStore } from "../store/useGameStore";

const Navbar = () => {
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);

  return (
    <nav className="flex items-center justify-between px-4 py-4 lg:px-10">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold tracking-wide">ChessArena</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`tab-button ${mode === "ai" ? "tab-active" : "tab-inactive"}`}
          onClick={() => setMode("ai")}
        >
          Play vs AI
        </button>
        <button
          type="button"
          className={`tab-button ${mode === "aivsai" ? "tab-active" : "tab-inactive"}`}
          onClick={() => setMode("aivsai")}
        >
          AIvsAI
        </button>
        <button
          type="button"
          className={`tab-button ${mode === "multiplayer" ? "tab-active" : "tab-inactive"}`}
          onClick={() => setMode("multiplayer")}
        >
          Multiplayer
        </button>
        <button
          type="button"
          className={`tab-button ${mode === "find" ? "tab-active" : "tab-inactive"}`}
          onClick={() => setMode("find")}
        >
          Find Opponent
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
