interface ProgressMapProps {
  total: number;
  solvedRiddles: number[];
  currentIndex: number;
  onSelectStage: (index: number) => void;
}

export function ProgressMap({
  total,
  solvedRiddles,
  currentIndex,
  onSelectStage,
}: ProgressMapProps) {
  const stages = Array.from({ length: total }, (_, i) => i);

  return (
    <div className="bg-gradient-to-r from-[#2D1810] to-[#3D2418] rounded-2xl p-4 sm:p-5 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1 left-3 text-3xl select-none">🌙</div>
        <div className="absolute top-2 right-8 text-lg select-none">✨</div>
        <div className="absolute bottom-2 right-3 text-lg select-none">✨</div>
      </div>

      <h3 className="text-sm font-bold text-[#FFD700] mb-3 relative z-10">
        🏮 闖關路線圖
      </h3>

      <div className="relative z-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2">
            <div className="h-full bg-[#FFD700]/20 rounded-full" />
            <div
              className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full absolute top-0 left-0 transition-all duration-700"
              style={{
                width: `${total > 1 ? (solvedRiddles.length / (total - 1)) * 100 : 0}%`,
              }}
            />
          </div>

          {stages.map((i) => {
            const riddleId = i + 1;
            const solved = solvedRiddles.includes(riddleId);
            const isCurrent = i === currentIndex;

            return (
              <button
                key={i}
                onClick={() => onSelectStage(i)}
                className="relative z-10 group"
                data-testid={`map-stage-${i + 1}`}
                title={`第 ${i + 1} 關${solved ? " ✓" : ""}`}
              >
                <div
                  className={`w-8 h-10 sm:w-9 sm:h-12 transition-all duration-500 ${
                    isCurrent ? "scale-125" : "hover:scale-110"
                  }`}
                >
                  {solved ? (
                    <svg viewBox="0 0 36 48" className="w-full h-full drop-shadow-lg">
                      <line x1="18" y1="0" x2="18" y2="10" stroke="#FFD700" strokeWidth="2" />
                      <rect x="13" y="8" width="10" height="4" rx="1.5" fill="#FFD700" />
                      <ellipse cx="18" cy="28" rx="14" ry="18" fill="#FFD700" opacity="0.95" />
                      <ellipse cx="18" cy="28" rx="10" ry="14" fill="#FFA500" opacity="0.6" />
                      <text
                        x="18"
                        y="32"
                        textAnchor="middle"
                        fill="#E60012"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        ✓
                      </text>
                      <rect x="14" y="44" width="8" height="3" rx="1" fill="#FFD700" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 36 48" className={`w-full h-full ${isCurrent ? "drop-shadow-lg" : "opacity-40"}`}>
                      <line x1="18" y1="0" x2="18" y2="10" stroke="#888" strokeWidth="2" />
                      <rect x="13" y="8" width="10" height="4" rx="1.5" fill="#888" />
                      <ellipse cx="18" cy="28" rx="14" ry="18" fill={isCurrent ? "#E60012" : "#666"} opacity="0.8" />
                      <ellipse cx="18" cy="28" rx="10" ry="14" fill={isCurrent ? "#FF4444" : "#555"} opacity="0.4" />
                      <text
                        x="18"
                        y="33"
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {i + 1}
                      </text>
                      <rect x="14" y="44" width="8" height="3" rx="1" fill="#888" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between mt-2 relative z-10">
        <span className="text-[10px] text-[#FFD700]/50">起點</span>
        <span className="text-[10px] text-[#FFD700]/50">
          {solvedRiddles.length >= total ? "🎉 全部通關！" : `已點亮 ${solvedRiddles.length}/${total} 盞`}
        </span>
      </div>
    </div>
  );
}
