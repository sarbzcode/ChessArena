import { useGameStore } from "../../store/useGameStore";

const AiVsAiControls = () => {
  const aiDifficulty = useGameStore((state) => state.aiDifficulty);
  const aiThinking = useGameStore((state) => state.aiThinking);
  const setAiDifficulty = useGameStore((state) => state.setAiDifficulty);
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
      <button type="button" className="btn-outline w-full" onClick={startAiGame}>
        Start
      </button>
      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
        Watch two engines battle it out.
      </div>
      {aiThinking ? <p className="text-xs text-white/60">Engines are thinking...</p> : null}
    </div>
  );
};

export default AiVsAiControls;
