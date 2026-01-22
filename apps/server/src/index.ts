import Fastify from "fastify";
import cors from "@fastify/cors";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket/handlers";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./types/shared";

const app = Fastify({ logger: true });

const PORT = Number(process.env.PORT ?? 8080);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.get("/health", async () => ({ ok: true }));
app.get("/", async () => "ChessArena server is running");

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(app.server, {
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
