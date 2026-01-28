import Fastify from "fastify";
import cors from "@fastify/cors";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket/handlers";
import { ClientToServerEvents, ServerToClientEvents } from "./types/shared";

const app = Fastify({ logger: true });

const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.addHook("onSend", async (_request, reply, payload) => {
  reply.header("Cross-Origin-Opener-Policy", "same-origin");
  reply.header("Cross-Origin-Embedder-Policy", "require-corp");
  return payload;
});

app.get("/health", async () => ({ ok: true }));

const io = new Server<ServerToClientEvents, ClientToServerEvents>(app.server, {
  cors: {
    origin: [CLIENT_ORIGIN],
    credentials: true
  }
});

registerSocketHandlers(io);

const start = async () => {
  try {
    await app.register(cors, {
      origin: [CLIENT_ORIGIN],
      credentials: true
    });
    await app.ready();
    await app.listen({ port: PORT, host: "0.0.0.0" });
    app.log.info(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
