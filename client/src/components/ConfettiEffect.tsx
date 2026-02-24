import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  rotation: number;
  shape: "circle" | "square" | "star";
}

const COLORS = ["#E60012", "#FFD700", "#FF6B6B", "#FF4500", "#FF8C00", "#FFA500"];

export function ConfettiEffect({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 10,
        delay: Math.random() * 0.8,
        rotation: Math.random() * 360,
        shape: (["circle", "square", "star"] as const)[Math.floor(Math.random() * 3)],
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => setPieces([]), 3500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: "-20px",
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.shape !== "star" ? piece.color : "transparent",
            borderRadius: piece.shape === "circle" ? "50%" : "2px",
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        >
          {piece.shape === "star" && (
            <svg width={piece.size} height={piece.size} viewBox="0 0 24 24">
              <polygon
                points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"
                fill={piece.color}
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
