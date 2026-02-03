export type PlayerColor = "w" | "b";
export type PlayerRole = PlayerColor | "spectator";
export type RoomLifecycleStatus = "waiting" | "active" | "ended";

export type RoomPlayers = {
  white?: string;
  black?: string;
};

export type RoomState = {
  roomId: string;
  roomStatus: RoomLifecycleStatus;
  fen: string;
  pgn: string;
  turn: PlayerColor;
  status: string;
  players: RoomPlayers;
  youAre: PlayerRole;
};

export type ServerToClientEvents = {
  "room:state": (payload: RoomState) => void;
  "move:rejected": (payload: { reason: string }) => void;
  "queue:status": (payload: { searching: boolean }) => void;
  "match:found": (payload: { roomId: string }) => void;
  "game:ended": (payload: { result: string; reason: string }) => void;
};

export type ClientToServerEvents = {
  "room:create": () => void;
  "room:join": (payload: { roomId: string }) => void;
  "queue:join": () => void;
  "queue:leave": () => void;
  "move:make": (payload: { roomId: string; from: string; to: string; promotion?: string }) => void;
  "sync:request": (payload: { roomId: string }) => void;
  "game:resign": (payload: { roomId: string }) => void;
  "game:rematch": (payload: { roomId: string }) => void;
};
