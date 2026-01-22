import { useGameStore } from "../store/useGameStore";

const StatusBanner = () => {
  const status = useGameStore((state) => state.status);
  const turn = useGameStore((state) => state.turn);
  const error = useGameStore((state) => state.error);

  const turnLabel = turn === "w" ? "White" : "Black";

  return (
    <div className="panel space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Current Turn</p>
        <p className="text-lg font-semibold">{turnLabel}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Game Status</p>
        <p className="text-sm text-white/80">{status}</p>
      </div>
      {error ? <p className="text-sm text-ember">Error: {error}</p> : null}
    </div>
  );
};

export default StatusBanner;
