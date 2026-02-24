import { useEffect, useState } from "react";

interface Lantern {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export function FloatingLanterns() {
  const [lanterns, setLanterns] = useState<Lantern[]>([]);

  useEffect(() => {
    const generated: Lantern[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 30 + Math.random() * 40,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 6,
      opacity: 0.15 + Math.random() * 0.25,
    }));
    setLanterns(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {lanterns.map((lantern) => (
        <div
          key={lantern.id}
          className="absolute"
          style={{
            left: `${lantern.x}%`,
            top: `-${lantern.size + 20}px`,
            animationName: "lantern-drift",
            animationDuration: `${lantern.duration}s`,
            animationDelay: `${lantern.delay}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            opacity: lantern.opacity,
          }}
        >
          <LanternSVG size={lantern.size} />
        </div>
      ))}
      <style>{`
        @keyframes lantern-drift {
          0% {
            transform: translateY(0px) rotate(-5deg);
          }
          25% {
            transform: translateY(25vh) rotate(3deg);
          }
          50% {
            transform: translateY(50vh) rotate(-3deg);
          }
          75% {
            transform: translateY(75vh) rotate(5deg);
          }
          100% {
            transform: translateY(110vh) rotate(-5deg);
          }
        }
      `}</style>
    </div>
  );
}

function LanternSVG({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 60 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="30" y1="0" x2="30" y2="15" stroke="#8B4513" strokeWidth="2" />
      <rect x="24" y="12" width="12" height="6" rx="2" fill="#FFD700" />
      <ellipse cx="30" cy="48" rx="22" ry="30" fill="#E60012" />
      <ellipse cx="30" cy="48" rx="18" ry="26" fill="#FF3333" opacity="0.6" />
      <ellipse cx="30" cy="48" rx="12" ry="20" fill="#FF6B6B" opacity="0.3" />
      <rect x="24" y="76" width="12" height="4" rx="1" fill="#FFD700" />
      <line x1="27" y1="80" x2="27" y2="90" stroke="#FFD700" strokeWidth="1" />
      <line x1="30" y1="80" x2="30" y2="88" stroke="#FFD700" strokeWidth="1" />
      <line x1="33" y1="80" x2="33" y2="90" stroke="#FFD700" strokeWidth="1" />
      <text
        x="30"
        y="52"
        textAnchor="middle"
        fill="#FFD700"
        fontSize="14"
        fontWeight="bold"
        fontFamily="'Noto Sans TC', sans-serif"
      >
        福
      </text>
    </svg>
  );
}
