"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
exports.setPlayers = setPlayers;
exports.getRoom = getRoom;
exports.removeRoom = removeRoom;
exports.listRooms = listRooms;
exports.touchRoom = touchRoom;
exports.getPlayerRole = getPlayerRole;
exports.joinRoom = joinRoom;
const chess_js_1 = require("chess.js");
const rooms = new Map();
function createRoom(roomId, creatorClientId) {
    const room = {
        roomId,
        chess: new chess_js_1.Chess(),
        players: { white: creatorClientId },
        status: "waiting",
        createdAt: Date.now(),
        lastActiveAt: Date.now()
    };
    rooms.set(roomId, room);
    return room;
}
function setPlayers(room, whiteClientId, blackClientId) {
    room.players = { white: whiteClientId, black: blackClientId };
    room.status = "active";
    touchRoom(room);
}
function getRoom(roomId) {
    return rooms.get(roomId);
}
function removeRoom(roomId) {
    rooms.delete(roomId);
}
function listRooms() {
    return Array.from(rooms.values());
}
function touchRoom(room) {
    room.lastActiveAt = Date.now();
}
function getPlayerRole(room, clientId) {
    if (room.players.white === clientId) {
        return "w";
    }
    if (room.players.black === clientId) {
        return "b";
    }
    return "spectator";
}
function joinRoom(room, clientId) {
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
