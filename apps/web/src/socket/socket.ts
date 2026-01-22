import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/shared";

const serverUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl, {
  autoConnect: false,
  transports: ["websocket"]
});

export const setSocketAuth = (clientId: string) => {
  socket.auth = { clientId };
};

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};
