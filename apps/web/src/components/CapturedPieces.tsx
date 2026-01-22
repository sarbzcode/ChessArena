import React, { useMemo } from "react";
import { useGameStore } from "../store/useGameStore";

type PieceType = "p" | "n" | "b" | "r" | "q";

const PIECE_ORDER: PieceType[] = ["q", "r", "b", "n", "p"];
const STARTING_COUNTS: Record<PieceType, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
type CapturedCounts = {
  w: Record<PieceType, number>;
  b: Record<PieceType, number>;
};

type PieceIconProps = {
  piece: PieceType;
  className?: string;
};

const PieceIcon = ({ piece, className }: PieceIconProps) => {
  switch (piece) {
    case "p":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="7" r="3" fill="currentColor" />
          <path d="M9 11h6l2 7H7l2-7z" fill="currentColor" />
          <rect x="6" y="18" width="12" height="2" rx="1" fill="currentColor" />
        </svg>
      );
    case "n":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path
            d="M7 18h10v-2H9v-4l3-3 3 2 2-4-6-3-5 3 2 4v7z"
            fill="currentColor"
          />
          <rect x="6" y="18" width="12" height="2" rx="1" fill="currentColor" />
        </svg>
      );
    case "b":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="6.5" r="2.5" fill="currentColor" />
          <path
            d="M9 11c0-1.8 1.6-3.2 3-3.2s3 1.4 3 3.2c0 1.7-1.3 2.5-1.3 3.8 0 .9.6 1.6 1.3 2.2H9c.7-.6 1.3-1.3 1.3-2.2 0-1.3-1.3-2.1-1.3-3.8z"
            fill="currentColor"
          />
          <rect x="7" y="17" width="10" height="2" rx="1" fill="currentColor" />
        </svg>
      );
    case "r":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M6 5h3v3h2V5h2v3h2V5h3v5H6z" fill="currentColor" />
          <rect x="7" y="10" width="10" height="7" rx="1" fill="currentColor" />
          <rect x="5" y="18" width="14" height="2" rx="1" fill="currentColor" />
        </svg>
      );
    case "q":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="6.5" cy="7.5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="6" r="1.5" fill="currentColor" />
          <circle cx="17.5" cy="7.5" r="1.5" fill="currentColor" />
          <path d="M6 10l2.5 6h7L18 10l-3 2-3-2-3 2-3-2z" fill="currentColor" />
          <rect x="6.5" y="16.5" width="11" height="2" rx="1" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
};

const buildCapturedCounts = (fen: string): CapturedCounts => {
  const current: CapturedCounts = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
  };

  const placement = fen.split(" ")[0] ?? "";
  for (const char of placement) {
    if (char === "/" || (char >= "1" && char <= "8")) {
      continue;
    }
    const piece = char.toLowerCase();
    if (piece in current.w) {
      const color = char === piece ? "b" : "w";
      current[color][piece as PieceType] += 1;
    }
  }

  const captured: CapturedCounts = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
  };

  for (const piece of PIECE_ORDER) {
    captured.w[piece] = Math.max(0, STARTING_COUNTS[piece] - current.w[piece]);
    captured.b[piece] = Math.max(0, STARTING_COUNTS[piece] - current.b[piece]);
  }

  return captured;
};

type CapturedRowProps = {
  label: string;
  pieces: Record<PieceType, number>;
  tone: "light" | "dark";
};

const CapturedRow = ({ label, pieces, tone }: CapturedRowProps) => {
  const capturedPieces = PIECE_ORDER.filter((piece) => pieces[piece] > 0);
  const iconClassName = `h-5 w-5 ${tone === "light" ? "text-parchment" : "text-ink"}`;
  const chipClassName =
    tone === "light"
      ? "border-white/20 bg-white/15 text-white"
      : "border-ink/10 bg-parchment/90 text-ink";
  const countClassName = tone === "light" ? "text-white/70" : "text-ink/70";

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap justify-end gap-2">
        {capturedPieces.length === 0 ? (
          <span className="text-xs text-white/50">None</span>
        ) : (
          capturedPieces.map((piece) => (
            <span
              key={piece}
              className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${chipClassName}`}
            >
              <PieceIcon piece={piece} className={iconClassName} />
              <span className={countClassName}>x{pieces[piece]}</span>
            </span>
          ))
        )}
      </div>
    </div>
  );
};

const CapturedPieces = () => {
  const fen = useGameStore((state) => state.fen);
  const captured = useMemo(() => buildCapturedCounts(fen), [fen]);

  return (
    <div className="panel space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Captured Pieces</p>
      <div className="space-y-3">
        <CapturedRow label="White lost" pieces={captured.w} tone="light" />
        <CapturedRow label="Black lost" pieces={captured.b} tone="dark" />
      </div>
    </div>
  );
};

export default CapturedPieces;
