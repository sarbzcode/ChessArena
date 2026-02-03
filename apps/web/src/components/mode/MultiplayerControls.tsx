import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { createRoom, joinRoom, requestRematch, resignGame } from "../../socket/multiplayer";

const MultiplayerControls = () => {
  const [roomInput, setRoomInput] = useState("");
  const [copied, setCopied] = useState(false);
  const roomId = useGameStore((state) => state.roomId);
  const myColor = useGameStore((state) => state.myColor);
  const connectionStatus = useGameStore((state) => state.connectionStatus);
  const canControlGame = Boolean(roomId) && myColor !== "spectator";

  const handleCopy = async () => {
    if (!roomId) {
      return;
    }
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const colorLabel =
    myColor === "spectator" ? "Spectator" : myColor === "w" ? "White" : "Black";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn-primary" onClick={createRoom}>
          Create Room
        </button>
        <button type="button" className="btn-secondary" onClick={() => joinRoom(roomInput)}>
          Join Room
        </button>
      </div>
      <input
        className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-ember/60"
        placeholder="Enter room code"
        value={roomInput}
        onChange={(event) => setRoomInput(event.target.value.toUpperCase())}
      />
      {roomId ? (
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Room Code</span>
            <button type="button" className="btn-outline px-3 py-1 text-xs" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-1 font-semibold tracking-[0.2em]">{roomId}</p>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
        <div>
          <p className="uppercase tracking-[0.2em] text-white/50">You Are</p>
          <p className="text-sm text-white">{colorLabel}</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.2em] text-white/50">Connection</p>
          <p className="text-sm text-white">{connectionStatus}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn-outline w-full disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => (roomId ? requestRematch(roomId) : null)}
          disabled={!canControlGame}
        >
          Rematch
        </button>
        <button
          type="button"
          className="btn-outline w-full disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => (roomId ? resignGame(roomId) : null)}
          disabled={!canControlGame}
        >
          Resign
        </button>
      </div>
    </div>
  );
};

export default MultiplayerControls;
