"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const crypto_1 = require("crypto");
const validateMove_1 = require("../game/validateMove");
const gameState_1 = require("../game/gameState");
const rooms_1 = require("./rooms");
const queue_1 = require("./queue");
const ROOM_ID_LENGTH = 6;
const ROOM_TTL_MS = 2 * 60 * 1000;
function generateRoomId() {
    return (0, crypto_1.randomBytes)(ROOM_ID_LENGTH).toString("hex").slice(0, ROOM_ID_LENGTH).toUpperCase();
}
function getClientId(socketId, socket) {
    return socket.data.clientId ?? socketId;
}
async function emitRoomStateToSockets(io, room) {
    const sockets = await io.in(room.roomId).fetchSockets();
    for (const socket of sockets) {
        const clientId = getClientId(socket.id, socket);
        const youAre = (0, rooms_1.getPlayerRole)(room, clientId);
        socket.emit("room:state", {
            roomId: room.roomId,
            roomStatus: room.status,
            fen: room.chess.fen(),
            pgn: room.chess.pgn(),
            turn: room.chess.turn(),
            status: (0, gameState_1.getStatusText)(room.chess),
            players: room.players,
            youAre
        });
    }
}
function markRoomActivityForClient(clientId) {
    for (const room of (0, rooms_1.listRooms)()) {
        if (room.players.white === clientId || room.players.black === clientId) {
            (0, rooms_1.touchRoom)(room);
        }
    }
}
function startRoomCleanup(io) {
    setInterval(() => {
        const now = Date.now();
        for (const room of (0, rooms_1.listRooms)()) {
            const roomSockets = io.sockets.adapter.rooms.get(room.roomId);
            const isActive = roomSockets && roomSockets.size > 0;
            if (!isActive && now - room.lastActiveAt > ROOM_TTL_MS) {
                (0, rooms_1.removeRoom)(room.roomId);
            }
        }
    }, 30 * 1000);
}
function registerSocketHandlers(io) {
    startRoomCleanup(io);
    io.on("connection", (socket) => {
        const authClientId = typeof socket.handshake.auth?.clientId === "string" ? socket.handshake.auth.clientId : undefined;
        socket.data.clientId = authClientId ?? socket.id;
        socket.on("room:create", async () => {
            const clientId = getClientId(socket.id, socket);
            let roomId = generateRoomId();
            while ((0, rooms_1.getRoom)(roomId)) {
                roomId = generateRoomId();
            }
            const room = (0, rooms_1.createRoom)(roomId, clientId);
            socket.join(roomId);
            await emitRoomStateToSockets(io, room);
        });
        socket.on("room:join", async (payload) => {
            const { roomId } = payload;
            const room = (0, rooms_1.getRoom)(roomId);
            if (!room) {
                socket.emit("move:rejected", { reason: "Room not found" });
                return;
            }
            const clientId = getClientId(socket.id, socket);
            (0, rooms_1.joinRoom)(room, clientId);
            socket.join(roomId);
            await emitRoomStateToSockets(io, room);
        });
        socket.on("queue:join", () => {
            if ((0, queue_1.isQueued)(socket.id)) {
                socket.emit("queue:status", { searching: true });
                return;
            }
            const clientId = getClientId(socket.id, socket);
            (0, queue_1.enqueue)({ socketId: socket.id, clientId, joinedAt: Date.now() });
            socket.emit("queue:status", { searching: true });
            let pair = (0, queue_1.popMatchPair)();
            while (pair) {
                const [first, second] = pair;
                const firstSocket = io.sockets.sockets.get(first.socketId);
                const secondSocket = io.sockets.sockets.get(second.socketId);
                if (!firstSocket || !secondSocket) {
                    pair = (0, queue_1.popMatchPair)();
                    continue;
                }
                let roomId = generateRoomId();
                while ((0, rooms_1.getRoom)(roomId)) {
                    roomId = generateRoomId();
                }
                const room = (0, rooms_1.createRoom)(roomId, first.clientId);
                const firstIsWhite = Math.random() >= 0.5;
                (0, rooms_1.setPlayers)(room, firstIsWhite ? first.clientId : second.clientId, firstIsWhite ? second.clientId : first.clientId);
                firstSocket.join(roomId);
                secondSocket.join(roomId);
                firstSocket.emit("match:found", { roomId });
                secondSocket.emit("match:found", { roomId });
                firstSocket.emit("queue:status", { searching: false });
                secondSocket.emit("queue:status", { searching: false });
                emitRoomStateToSockets(io, room);
                pair = (0, queue_1.popMatchPair)();
            }
        });
        socket.on("queue:leave", () => {
            (0, queue_1.dequeue)(socket.id);
            socket.emit("queue:status", { searching: false });
        });
        socket.on("move:make", async (payload) => {
            const { roomId, from, to, promotion } = payload;
            const room = (0, rooms_1.getRoom)(roomId);
            if (!room) {
                socket.emit("move:rejected", { reason: "Room not found" });
                return;
            }
            const clientId = getClientId(socket.id, socket);
            const role = (0, rooms_1.getPlayerRole)(room, clientId);
            if (role === "spectator") {
                socket.emit("move:rejected", { reason: "Not a player in this room" });
                return;
            }
            const result = (0, validateMove_1.applyValidatedMove)(room.chess, role, { from, to, promotion });
            if (!result.ok) {
                socket.emit("move:rejected", { reason: result.reason });
                return;
            }
            room.status = "active";
            (0, rooms_1.touchRoom)(room);
            await emitRoomStateToSockets(io, room);
            const gameResult = (0, gameState_1.getResultText)(room.chess);
            if (gameResult) {
                io.to(room.roomId).emit("game:ended", gameResult);
                room.status = "ended";
                (0, rooms_1.touchRoom)(room);
            }
        });
        socket.on("sync:request", async (payload) => {
            const { roomId } = payload;
            const room = (0, rooms_1.getRoom)(roomId);
            if (!room) {
                socket.emit("move:rejected", { reason: "Room not found" });
                return;
            }
            await emitRoomStateToSockets(io, room);
        });
        socket.on("game:resign", async (payload) => {
            const { roomId } = payload;
            const room = (0, rooms_1.getRoom)(roomId);
            if (!room) {
                socket.emit("move:rejected", { reason: "Room not found" });
                return;
            }
            const clientId = getClientId(socket.id, socket);
            const role = (0, rooms_1.getPlayerRole)(room, clientId);
            if (role === "spectator") {
                socket.emit("move:rejected", { reason: "Not a player in this room" });
                return;
            }
            const winner = role === "w" ? "Black" : "White";
            io.to(room.roomId).emit("game:ended", { result: winner, reason: "Resignation" });
            room.status = "ended";
            (0, rooms_1.touchRoom)(room);
            await emitRoomStateToSockets(io, room);
        });
        socket.on("game:rematch", async (payload) => {
            const { roomId } = payload;
            const room = (0, rooms_1.getRoom)(roomId);
            if (!room) {
                socket.emit("move:rejected", { reason: "Room not found" });
                return;
            }
            const clientId = getClientId(socket.id, socket);
            const role = (0, rooms_1.getPlayerRole)(room, clientId);
            if (role === "spectator") {
                socket.emit("move:rejected", { reason: "Not a player in this room" });
                return;
            }
            room.chess.reset();
            room.status = room.players.white && room.players.black ? "active" : "waiting";
            (0, rooms_1.touchRoom)(room);
            await emitRoomStateToSockets(io, room);
        });
        socket.on("disconnect", () => {
            (0, queue_1.dequeue)(socket.id);
            const clientId = getClientId(socket.id, socket);
            markRoomActivityForClient(clientId);
        });
    });
}
