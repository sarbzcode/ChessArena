"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyValidatedMove = applyValidatedMove;
function applyValidatedMove(chess, playerColor, move) {
    if (chess.turn() !== playerColor) {
        return { ok: false, reason: "Not your turn" };
    }
    const result = chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion
    });
    if (!result) {
        return { ok: false, reason: "Illegal move" };
    }
    return { ok: true };
}
