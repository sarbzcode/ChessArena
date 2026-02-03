"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTurnLabel = getTurnLabel;
exports.getStatusText = getStatusText;
exports.getResultText = getResultText;
function getTurnLabel(turn) {
    return turn === "w" ? "White" : "Black";
}
function getStatusText(chess) {
    if (chess.isCheckmate()) {
        const winner = getTurnLabel(chess.turn() === "w" ? "b" : "w");
        return `Checkmate - ${winner} wins`;
    }
    if (chess.isStalemate()) {
        return "Stalemate - Draw";
    }
    if (chess.isDraw()) {
        return "Draw";
    }
    if (chess.isCheck()) {
        return `${getTurnLabel(chess.turn())} to move - Check`;
    }
    return `${getTurnLabel(chess.turn())} to move`;
}
function getResultText(chess) {
    if (chess.isCheckmate()) {
        const winner = chess.turn() === "w" ? "Black" : "White";
        return { result: winner, reason: "Checkmate" };
    }
    if (chess.isStalemate()) {
        return { result: "Draw", reason: "Stalemate" };
    }
    if (chess.isDraw()) {
        return { result: "Draw", reason: "Draw" };
    }
    return null;
}
