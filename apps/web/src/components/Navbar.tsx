import { useEffect, useMemo, useRef, useState } from "react";
import { useGameStore, type GameMode } from "../store/useGameStore";

const modeItems: Array<{ id: GameMode; label: string }> = [
  { id: "ai", label: "Play vs AI" },
  { id: "aivsai", label: "AI vs AI" },
  { id: "multiplayer", label: "Multiplayer" },
  { id: "find", label: "Find Opponent" }
];

const Navbar = () => {
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (navRef.current && !navRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const activeModeLabel = useMemo(
    () => modeItems.find((item) => item.id === mode)?.label ?? "Mode",
    [mode]
  );

  const handleModeChange = (nextMode: GameMode) => {
    setMode(nextMode);
    setMenuOpen(false);
  };

  return (
    <nav ref={navRef} className="relative px-4 py-4 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-sm">
        <div className="min-w-0">
          <p className="truncate font-display text-base tracking-[0.08em] text-parchment sm:text-lg">
            ChessArena
          </p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {modeItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tab-button ${mode === item.id ? "tab-active" : "tab-inactive"}`}
              onClick={() => handleModeChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
            {activeModeLabel}
          </span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6L18 18M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7H20M4 12H20M4 17H20" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        className={`absolute left-4 right-4 top-[calc(100%+8px)] z-30 transition duration-200 md:hidden lg:left-10 lg:right-10 ${
          menuOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="space-y-2 rounded-2xl border border-white/10 bg-ink/95 p-3 shadow-soft backdrop-blur-sm">
          {modeItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tab-button w-full text-left ${mode === item.id ? "tab-active" : "tab-inactive"}`}
              onClick={() => handleModeChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
