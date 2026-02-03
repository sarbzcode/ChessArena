"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const socket_io_1 = require("socket.io");
const handlers_1 = require("./socket/handlers");
const app = (0, fastify_1.default)({ logger: true });
const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
app.addHook("onSend", async (_request, reply, payload) => {
    reply.header("Cross-Origin-Opener-Policy", "same-origin");
    reply.header("Cross-Origin-Embedder-Policy", "require-corp");
    return payload;
});
app.get("/health", async () => ({ ok: true }));
const io = new socket_io_1.Server(app.server, {
    cors: {
        origin: [CLIENT_ORIGIN],
        credentials: true
    }
});
(0, handlers_1.registerSocketHandlers)(io);
const start = async () => {
    try {
        await app.register(cors_1.default, {
            origin: [CLIENT_ORIGIN],
            credentials: true
        });
        await app.ready();
        await app.listen({ port: PORT, host: "0.0.0.0" });
        app.log.info(`Server running on http://localhost:${PORT}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
