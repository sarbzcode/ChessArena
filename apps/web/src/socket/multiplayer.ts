import { connectSocket, setSocketAuth, socket } from "./socket";
import { useGameStore } from "../store/useGameStore";

const DEVICE_ID_KEY = "chess-arena-device-id";
const TAB_ID_KEY = "chess-arena-tab-id";
let initialized = false;

const generateId = (): string =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

// Use a per-tab instance suffix to avoid duplicate client IDs in cloned tabs.
const tabInstanceId = generateId();

const getDeviceId = (): string => {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }
  const generated = generateId();
  localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
};

const getTabId = (): string => {
  const existing = sessionStorage.getItem(TAB_ID_KEY);
  if (existing) {
    return existing;
  }
  const generated = generateId();
  sessionStorage.setItem(TAB_ID_KEY, generated);
  return generated;
};

const getClientId = (): string => `${getDeviceId()}-${getTabId()}-${tabInstanceId}`;

const ensureConnected = () => {
  const clientId = getClientId();
  setSocketAuth(clientId);
  connectSocket();
};

export const initializeMultiplayer = () => {
  if (initialized) {
    return;
  }
  initialized = true;
  ensureConnected();

  socket.on("connect", () => {
    useGameStore.getState().setConnectionStatus("connected");
    const roomId = useGameStore.getState().roomId;
    if (roomId) {
      socket.emit("sync:request", { roomId });
    }
  });

  socket.on("disconnect", () => {
    useGameStore.getState().setConnectionStatus("disconnected");
  });

  socket.on("room:state", (state) => {
    useGameStore.getState().setServerState(state);
  });

  socket.on("queue:status", ({ searching }) => {
    useGameStore.getState().setSearching(searching);
  });

  socket.on("match:found", ({ roomId }) => {
    useGameStore.getState().setMode("multiplayer");
    useGameStore.getState().setRoomId(roomId);
    socket.emit("sync:request", { roomId });
  });

  socket.on("move:rejected", ({ reason }) => {
    useGameStore.getState().setError(reason);
  });

  socket.on("game:ended", ({ result, reason }) => {
    useGameStore.setState({
      status: `${reason} - ${result}`,
      gameOver: true
    });
  });
};

export const createRoom = () => {
  ensureConnected();
  socket.emit("room:create");
};

export const joinRoom = (roomId: string) => {
  const trimmed = roomId.trim().toUpperCase();
  if (!trimmed) {
    useGameStore.getState().setError("Enter a room code.");
    return;
  }
  ensureConnected();
  socket.emit("room:join", { roomId: trimmed });
};

export const joinQueue = () => {
  ensureConnected();
  socket.emit("queue:join");
};

export const leaveQueue = () => {
  ensureConnected();
  socket.emit("queue:leave");
};

export const makeMove = (roomId: string, move: { from: string; to: string; promotion?: string }) => {
  ensureConnected();
  socket.emit("move:make", { roomId, ...move });
};

export const resignGame = (roomId: string) => {
  ensureConnected();
  socket.emit("game:resign", { roomId });
};

export const requestSync = (roomId: string) => {
  ensureConnected();
  socket.emit("sync:request", { roomId });
};
