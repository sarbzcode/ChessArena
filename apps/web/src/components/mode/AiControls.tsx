import { useGameStore } from "../../store/useGameStore";

const AiControls = () => {
  const aiDifficulty = useGameStore((state) => state.aiDifficulty);
  const aiSide = useGameStore((state) => state.aiSide);
  const aiThinking = useGameStore((state) => state.aiThinking);
  const setAiDifficulty = useGameStore((state) => state.setAiDifficulty);
  const setAiSide = useGameStore((state) => state.setAiSide);
  const startAiGame = useGameStore((state) => state.startAiGame);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-white/50">Difficulty</label>
        <div className="relative mt-2">
          <select
            className="select-control"
            value={aiDifficulty}
            onChange={(event) => setAiDifficulty(event.target.value as typeof aiDifficulty)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
              <path d="M5 7l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-white/50">Your Side</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={aiSide === "w" ? "btn-primary" : "btn-secondary"}
            onClick={() => setAiSide("w")}
          >
            White
          </button>
          <button
            type="button"
            className={aiSide === "b" ? "btn-primary" : "btn-secondary"}
            onClick={() => setAiSide("b")}
          >
            Black
          </button>
        </div>
      </div>
      <button type="button" className="btn-outline w-full" onClick={startAiGame}>
        Start
      </button>
      {aiThinking ? <p className="text-xs text-white/60">AI is thinking...</p> : null}
    </div>
  );
};

export default AiControls;
