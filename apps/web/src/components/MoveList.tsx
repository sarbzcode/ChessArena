import { useMemo } from "react";
import { useGameStore } from "../store/useGameStore";

const MoveList = () => {
  const moves = useGameStore((state) => state.moveList);

  const rows = useMemo(() => {
    const grouped: { index: number; white?: string; black?: string }[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      grouped.push({ index: i / 2 + 1, white: moves[i], black: moves[i + 1] });
    }
    return grouped;
  }, [moves]);

  return (
    <div className="panel">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Move List</p>
      <div className="mt-3 max-h-56 overflow-y-auto pr-2 text-sm">
        {rows.length === 0 ? (
          <p className="text-white/60">No moves yet.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row.index} className="grid grid-cols-[36px_1fr_1fr] gap-2">
                <span className="text-white/40">{row.index}.</span>
                <span className="font-medium">{row.white ?? "-"}</span>
                <span className="text-white/70">{row.black ?? "-"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveList;
