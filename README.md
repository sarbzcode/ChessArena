# ChessArena

ChessArena is a full-stack chess app with AI modes, room-based multiplayer, and matchmaking.
You can jump in and play instantly - no login or signup is required.

## Live Deployment

- Frontend is deployed on **Vercel**.
- Backend is running on **Render**.
- For production, point frontend and backend env values to each other:
  - `VITE_SERVER_URL=https://<your-render-service>.onrender.com`
  - `CLIENT_ORIGIN=https://<your-vercel-project>.vercel.app`

## Features

- Play vs AI with 3 difficulty levels: Beginner, Intermediate, Expert.
- AI vs AI mode to watch two engines play automatically.
- Multiplayer rooms with invite codes (create/join room flow).
- Find Opponent queue for instant matchmaking.
- Server-authoritative move validation for fair multiplayer games.
- Live game status, move list, captured pieces tracking, and promotion handling.
- No authentication required: open and start playing immediately.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, react-chessboard, Socket.IO client
- **AI:** `stockfish.wasm` in a Web Worker
- **Backend:** Node.js, TypeScript, Fastify, Socket.IO, chess.js
- **Tooling:** npm workspaces, concurrently, ESLint, Prettier, Vitest, Testing Library

## Run Locally (Clone + Start Fast)

After cloning, this project is easy to run locally by fixing the `.env` values and starting dev mode.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Update environment files:
   - `apps/web/.env`
     ```env
     VITE_SERVER_URL=http://localhost:3001
     ```
   - `apps/server/.env`
     ```env
     PORT=3001
     CLIENT_ORIGIN=http://localhost:5173
     ```
3. Start frontend + backend together:
   ```bash
   npm run dev
   ```
4. Open:
   - `http://localhost:5173`

## Workspace Scripts

- `npm run dev` - run web + server together
- `npm run dev:web` - run only frontend
- `npm run dev:server` - run only backend
- `npm run build` - build both apps
- `npm run lint` - lint both apps
