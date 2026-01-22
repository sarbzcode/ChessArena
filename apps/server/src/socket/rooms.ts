import { Chess } from "chess.js";
import { PlayerRole, RoomPlayers } from "../types/shared";

export type RoomStatus = "waiting" | "active" | "ended";

export type Room = {
  roomId: string;
  chess: Chess;
  players: RoomPlayers;
  status: RoomStatus;
  createdAt: number;
  lastActiveAt: number;
};

const rooms = new Map<string, Room>();

export function createRoom(roomId: string, creatorClientId: string): Room {
  const room: Room = {
    roomId,
    chess: new Chess(),
    players: { white: creatorClientId },
    status: "waiting",
    createdAt: Date.now(),
    lastActiveAt: Date.now()
  };
  rooms.set(roomId, room);
  return room;
}

export function setPlayers(room: Room, whiteClientId: string, blackClientId: string): void {
  room.players = { white: whiteClientId, black: blackClientId };
  room.status = "active";
  touchRoom(room);
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function removeRoom(roomId: string): void {
  rooms.delete(roomId);
}

export function listRooms(): Room[] {
  return Array.from(rooms.values());
}

export function touchRoom(room: Room): void {
  room.lastActiveAt = Date.now();
}

export function getPlayerRole(room: Room, clientId: string): PlayerRole {
  if (room.players.white === clientId) {
    return "w";
  }
  if (room.players.black === clientId) {
    return "b";
  }
  return "spectator";
}

export function joinRoom(room: Room, clientId: string): PlayerRole {
  const role = getPlayerRole(room, clientId);
  if (role !== "spectator") {
    return role;
  }
  if (!room.players.white) {
    room.players.white = clientId;
    room.status = room.players.black ? "active" : "waiting";
    touchRoom(room);
    return "w";
  }
  if (!room.players.black) {
    room.players.black = clientId;
    room.status = room.players.white ? "active" : "waiting";
    touchRoom(room);
    return "b";
  }
  return "spectator";
}
