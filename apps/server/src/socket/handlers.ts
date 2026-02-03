import { randomBytes } from "crypto";
import { Server } from "socket.io";
import { applyValidatedMove } from "../game/validateMove";
import { getResultText, getStatusText } from "../game/gameState";
import {
  createRoom,
  getPlayerRole,
  getRoom,
  joinRoom,
  listRooms,
  removeRoom,
  setPlayers,
  touchRoom,
  Room
} from "./rooms";
import { dequeue, enqueue, isQueued, popMatchPair } from "./queue";
import { ClientToServerEvents, ServerToClientEvents } from "../types/shared";

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type RoomJoinPayload = Parameters<ClientToServerEvents["room:join"]>[0];
type MoveMakePayload = Parameters<ClientToServerEvents["move:make"]>[0];
type SyncRequestPayload = Parameters<ClientToServerEvents["sync:request"]>[0];
type GameResignPayload = Parameters<ClientToServerEvents["game:resign"]>[0];
type GameRematchPayload = Parameters<ClientToServerEvents["game:rematch"]>[0];

const ROOM_ID_LENGTH = 6;
const ROOM_TTL_MS = 2 * 60 * 1000;

function generateRoomId(): string {
  return randomBytes(ROOM_ID_LENGTH).toString("hex").slice(0, ROOM_ID_LENGTH).toUpperCase();
}

function getClientId(socketId: string, socket: { data: { clientId?: string } }): string {
  return socket.data.clientId ?? socketId;
}

async function emitRoomStateToSockets(io: TypedServer, room: Room): Promise<void> {
  const sockets = await io.in(room.roomId).fetchSockets();
  for (const socket of sockets) {
    const clientId = getClientId(socket.id, socket);
    const youAre = getPlayerRole(room, clientId);
    socket.emit("room:state", {
      roomId: room.roomId,
      roomStatus: room.status,
      fen: room.chess.fen(),
      pgn: room.chess.pgn(),
      turn: room.chess.turn(),
      status: getStatusText(room.chess),
      players: room.players,
      youAre
    });
  }
}

function markRoomActivityForClient(clientId: string): void {
  for (const room of listRooms()) {
    if (room.players.white === clientId || room.players.black === clientId) {
      touchRoom(room);
    }
  }
}

function startRoomCleanup(io: TypedServer): void {
  setInterval(() => {
    const now = Date.now();
    for (const room of listRooms()) {
      const roomSockets = io.sockets.adapter.rooms.get(room.roomId);
      const isActive = roomSockets && roomSockets.size > 0;
      if (!isActive && now - room.lastActiveAt > ROOM_TTL_MS) {
        removeRoom(room.roomId);
      }
    }
  }, 30 * 1000);
}

export function registerSocketHandlers(io: TypedServer): void {
  startRoomCleanup(io);

  io.on("connection", (socket) => {
    const authClientId = typeof socket.handshake.auth?.clientId === "string" ? socket.handshake.auth.clientId : undefined;
    socket.data.clientId = authClientId ?? socket.id;

    socket.on("room:create", async () => {
      const clientId = getClientId(socket.id, socket);
      let roomId = generateRoomId();
      while (getRoom(roomId)) {
        roomId = generateRoomId();
      }
      const room = createRoom(roomId, clientId);
      socket.join(roomId);
      await emitRoomStateToSockets(io, room);
    });

    socket.on("room:join", async (payload: RoomJoinPayload) => {
      const { roomId } = payload;
      const room = getRoom(roomId);
      if (!room) {
        socket.emit("move:rejected", { reason: "Room not found" });
        return;
      }
      const clientId = getClientId(socket.id, socket);
      joinRoom(room, clientId);
      socket.join(roomId);
      await emitRoomStateToSockets(io, room);
    });

    socket.on("queue:join", () => {
      if (isQueued(socket.id)) {
        socket.emit("queue:status", { searching: true });
        return;
      }
      const clientId = getClientId(socket.id, socket);
      enqueue({ socketId: socket.id, clientId, joinedAt: Date.now() });
      socket.emit("queue:status", { searching: true });

      let pair = popMatchPair();
      while (pair) {
        const [first, second] = pair;
        const firstSocket = io.sockets.sockets.get(first.socketId);
        const secondSocket = io.sockets.sockets.get(second.socketId);
        if (!firstSocket || !secondSocket) {
          pair = popMatchPair();
          continue;
        }
        let roomId = generateRoomId();
        while (getRoom(roomId)) {
          roomId = generateRoomId();
        }
        const room = createRoom(roomId, first.clientId);
        const firstIsWhite = Math.random() >= 0.5;
        setPlayers(room, firstIsWhite ? first.clientId : second.clientId, firstIsWhite ? second.clientId : first.clientId);
        firstSocket.join(roomId);
        secondSocket.join(roomId);
        firstSocket.emit("match:found", { roomId });
        secondSocket.emit("match:found", { roomId });
        firstSocket.emit("queue:status", { searching: false });
        secondSocket.emit("queue:status", { searching: false });
        emitRoomStateToSockets(io, room);
        pair = popMatchPair();
      }
    });

    socket.on("queue:leave", () => {
      dequeue(socket.id);
      socket.emit("queue:status", { searching: false });
    });

    socket.on("move:make", async (payload: MoveMakePayload) => {
      const { roomId, from, to, promotion } = payload;
      const room = getRoom(roomId);
      if (!room) {
        socket.emit("move:rejected", { reason: "Room not found" });
        return;
      }
      const clientId = getClientId(socket.id, socket);
      const role = getPlayerRole(room, clientId);
      if (role === "spectator") {
        socket.emit("move:rejected", { reason: "Not a player in this room" });
        return;
      }
      const result = applyValidatedMove(room.chess, role, { from, to, promotion });
      if (!result.ok) {
        socket.emit("move:rejected", { reason: result.reason });
        return;
      }
      room.status = "active";
      touchRoom(room);
      await emitRoomStateToSockets(io, room);
      const gameResult = getResultText(room.chess);
      if (gameResult) {
        io.to(room.roomId).emit("game:ended", gameResult);
        room.status = "ended";
        touchRoom(room);
      }
    });

    socket.on("sync:request", async (payload: SyncRequestPayload) => {
      const { roomId } = payload;
      const room = getRoom(roomId);
      if (!room) {
        socket.emit("move:rejected", { reason: "Room not found" });
        return;
      }
      await emitRoomStateToSockets(io, room);
    });

    socket.on("game:resign", async (payload: GameResignPayload) => {
      const { roomId } = payload;
      const room = getRoom(roomId);
      if (!room) {
        socket.emit("move:rejected", { reason: "Room not found" });
        return;
      }
      const clientId = getClientId(socket.id, socket);
      const role = getPlayerRole(room, clientId);
      if (role === "spectator") {
        socket.emit("move:rejected", { reason: "Not a player in this room" });
        return;
      }
      const winner = role === "w" ? "Black" : "White";
      io.to(room.roomId).emit("game:ended", { result: winner, reason: "Resignation" });
      room.status = "ended";
      touchRoom(room);
      await emitRoomStateToSockets(io, room);
    });

    socket.on("game:rematch", async (payload: GameRematchPayload) => {
      const { roomId } = payload;
      const room = getRoom(roomId);
      if (!room) {
        socket.emit("move:rejected", { reason: "Room not found" });
        return;
      }
      const clientId = getClientId(socket.id, socket);
      const role = getPlayerRole(room, clientId);
      if (role === "spectator") {
        socket.emit("move:rejected", { reason: "Not a player in this room" });
        return;
      }
      room.chess.reset();
      room.status = room.players.white && room.players.black ? "active" : "waiting";
      touchRoom(room);
      await emitRoomStateToSockets(io, room);
    });

    socket.on("disconnect", () => {
      dequeue(socket.id);
      const clientId = getClientId(socket.id, socket);
      markRoomActivityForClient(clientId);
    });
  });
}
