# ChessArena

ChessArena is a single-page web chess app with AI play, invite-code multiplayer, and matchmaking. The UI keeps the board centered with a right-side control panel and live game info.

## Features
- Play vs AI (Beginner / Intermediate / Expert) using Stockfish in a Web Worker.
- Multiplayer rooms with server-authoritative move validation.
- Matchmaking queue for quick opponents.
- Responsive layout with move list, game status, and mode switching.

## Run Instructions
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start both apps:
   ```bash
   npm run dev
   ```
3. Open the web app:
   - http://localhost:5173

## Workspace Scripts
- `npm run dev`: run web + server together
- `npm run dev:web`: run the web app only
- `npm run dev:server`: run the API + Socket.IO server only
- `npm run build`: build both apps

## App Usage
- Play vs AI: pick a difficulty, choose a side, and press Start.
- Multiplayer: create a room to get an invite code, or join a room by code.
- Find Opponent: enter the queue and auto-join when matched.

## Environment
Copy `.env.example` files as needed:
- `apps/web/.env.example` for `VITE_SERVER_URL`
- `apps/server/.env.example` for `PORT` and `CLIENT_ORIGIN`

## Ports
- Web: `5173`
- Server: `3001`

## Deployment Notes
- Build the web app with `npm run build` and host the `apps/web/dist` output.
- Run the server with `npm run build --workspace apps/server` then `npm run start --workspace apps/server`.
- Set `CLIENT_ORIGIN` to your deployed web URL for CORS.
- Ensure your static host sends `Cross-Origin-Opener-Policy: same-origin` and
  `Cross-Origin-Embedder-Policy: require-corp` for Stockfish WASM.
