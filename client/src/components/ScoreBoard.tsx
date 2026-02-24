import { Trophy, Star, Target, Flame } from "lucide-react";

interface ScoreBoardProps {
  solved: number;
  total: number;
  score: number;
}

export function ScoreBoard({ solved, total, score }: ScoreBoardProps) {
  const progress = (solved / total) * 100;

  return (
    <div className="bg-gradient-to-r from-[#E60012] to-[#CC0010] rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-[#E60012]/20">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2.5">
            <Trophy className="w-6 h-6 text-[#FFD700]" />
          </div>
          <div>
            <p className="text-white/70 text-xs sm:text-sm font-medium">遊戲進度</p>
            <p className="text-xl sm:text-2xl font-bold">
              {solved} <span className="text-white/60 text-base">/ {total}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Star className="w-4 h-4 text-[#FFD700]" />
              <span className="text-lg sm:text-xl font-bold">{score}</span>
            </div>
            <p className="text-white/60 text-xs">得分</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Target className="w-4 h-4 text-[#FFD700]" />
              <span className="text-lg sm:text-xl font-bold">
                {total > 0 ? Math.round((solved / total) * 100) : 0}%
              </span>
            </div>
            <p className="text-white/60 text-xs">完成率</p>
          </div>
          {solved >= 5 && (
            <div className="text-center animate-bounce-in">
              <div className="flex items-center gap-1 justify-center">
                <Flame className="w-4 h-4 text-[#FF6B6B]" />
                <span className="text-lg sm:text-xl font-bold">
                  {solved >= total ? "全對" : "厲害"}
                </span>
              </div>
              <p className="text-white/60 text-xs">
                {solved >= total ? "滿分！" : "加油！"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-white/50">開始</span>
          <span className="text-xs text-white/50">
            {solved >= total ? "恭喜完成！" : `還剩 ${total - solved} 題`}
          </span>
        </div>
      </div>
    </div>
  );
}
