import { useGameStore } from "../../store/useGameStore";
import { joinQueue, leaveQueue } from "../../socket/multiplayer";

const FindOpponentControls = () => {
  const searching = useGameStore((state) => state.searching);

  const handleToggle = () => {
    if (searching) {
      leaveQueue();
    } else {
      joinQueue();
    }
  };

  return (
    <div className="space-y-3">
      <button type="button" className="btn-primary w-full" onClick={handleToggle}>
        {searching ? "Cancel Search" : "Find Opponent"}
      </button>
      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
        {searching ? "Searching for a match..." : "Queue is idle."}
      </div>
    </div>
  );
};

export default FindOpponentControls;
