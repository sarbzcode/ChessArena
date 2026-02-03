import AiControls from "./mode/AiControls";
import AiVsAiControls from "./mode/AiVsAiControls";
import MultiplayerControls from "./mode/MultiplayerControls";
import FindOpponentControls from "./mode/FindOpponentControls";
import StatusBanner from "./StatusBanner";
import { useGameStore } from "../store/useGameStore";
import { createRoom, joinQueue, requestRematch } from "../socket/multiplayer";

const RightPanel = () => {
  const mode = useGameStore((state) => state.mode);
  const roomId = useGameStore((state) => state.roomId);
  const startAiGame = useGameStore((state) => state.startAiGame);

  const handleNewGame = () => {
    if (mode === "ai" || mode === "aivsai") {
      startAiGame();
      return;
    }
    if (mode === "multiplayer") {
      if (roomId) {
        requestRematch(roomId);
        return;
      }
      createRoom();
      return;
    }
    joinQueue();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="panel space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Mode Controls</p>
          <div className="mt-3 space-y-4">
            {mode === "ai" && <AiControls />}
            {mode === "aivsai" && <AiVsAiControls />}
            {mode === "multiplayer" && <MultiplayerControls />}
            {mode === "find" && <FindOpponentControls />}
          </div>
        </div>
        <button type="button" className="btn-primary w-full" onClick={handleNewGame}>
          {mode === "multiplayer" && roomId ? "Rematch" : "New Game"}
        </button>
      </div>

      <StatusBanner />
    </div>
  );
};

export default RightPanel;
