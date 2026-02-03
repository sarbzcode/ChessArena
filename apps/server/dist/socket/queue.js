"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueue = enqueue;
exports.dequeue = dequeue;
exports.popMatchPair = popMatchPair;
exports.isQueued = isQueued;
const queue = [];
function enqueue(entry) {
    const exists = queue.some((item) => item.socketId === entry.socketId);
    if (!exists) {
        queue.push(entry);
    }
}
function dequeue(socketId) {
    const index = queue.findIndex((item) => item.socketId === socketId);
    if (index >= 0) {
        queue.splice(index, 1);
    }
}
function popMatchPair() {
    if (queue.length < 2) {
        return null;
    }
    const first = queue.shift();
    const second = queue.shift();
    if (!first || !second) {
        return null;
    }
    return [first, second];
}
function isQueued(socketId) {
    return queue.some((item) => item.socketId === socketId);
}
