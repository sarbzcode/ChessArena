import { useEffect } from "react";
import ChessBoardView from "./components/ChessBoardView";
import LeftPanel from "./components/LeftPanel";
import Navbar from "./components/Navbar";
import RightPanel from "./components/RightPanel";
import { initializeMultiplayer } from "./socket/multiplayer";

const App = () => {
  useEffect(() => {
    initializeMultiplayer();
  }, []);

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <main className="flex flex-1 flex-col px-4 pb-8 pt-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 lg:flex-row lg:items-start">
          <div className="order-3 w-full lg:order-1 lg:w-[280px]">
            <LeftPanel />
          </div>
          <div className="order-1 flex flex-1 items-center justify-center lg:order-2 lg:items-start">
            <ChessBoardView />
          </div>
          <div className="order-2 w-full lg:order-3 lg:w-[360px]">
            <RightPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
