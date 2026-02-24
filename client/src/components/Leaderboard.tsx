import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getLeaderboard, getClassLeaderboard, type ScoreEntry } from "@/lib/gameStore";
import { Trophy, Medal, Crown, Users, Loader2 } from "lucide-react";

interface LeaderboardProps {
  open: boolean;
  onClose: () => void;
}

export function Leaderboard({ open, onClose }: LeaderboardProps) {
  const [tab, setTab] = useState<"individual" | "class">("individual");
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [classData, setClassData] = useState<Record<string, { totalScore: number; count: number; avgScore: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([getLeaderboard(50), getClassLeaderboard()])
      .then(([scores, classes]) => {
        setEntries(scores);
        setClassData(classes);
      })
      .finally(() => setLoading(false));
  }, [open]);

  const sortedClasses = Object.entries(classData)
    .sort((a, b) => b[1].totalScore - a[1].totalScore);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-b from-[#FFF8E7] to-[#FFF0C8] border-2 border-[#FFD700] rounded-2xl p-0 overflow-hidden max-h-[80vh]">
        <DialogTitle className="sr-only">排行榜</DialogTitle>

        <div className="bg-gradient-to-r from-[#E60012] to-[#CC0010] p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-[#FFD700]" />
            <h2 className="text-xl font-bold text-white">排行榜</h2>
          </div>
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => setTab("individual")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === "individual"
                  ? "bg-white text-[#E60012]"
                  : "bg-white/20 text-white/80 hover:bg-white/30"
              }`}
              data-testid="tab-individual"
            >
              個人排名
            </button>
            <button
              onClick={() => setTab("class")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === "class"
                  ? "bg-white text-[#E60012]"
                  : "bg-white/20 text-white/80 hover:bg-white/30"
              }`}
              data-testid="tab-class"
            >
              班級排名
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#E60012]" />
            </div>
          ) : tab === "individual" ? (
            <div className="space-y-2">
              {entries.length === 0 ? (
                <p className="text-center text-[#8B4513]/50 py-8">還沒有人完成挑戰</p>
              ) : (
                entries.map((entry, i) => (
                  <div
                    key={entry.uid}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      i < 3 ? "bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/10" : "bg-white/60"
                    }`}
                    data-testid={`leaderboard-entry-${i}`}
                  >
                    <div className="w-8 text-center flex-shrink-0">
                      {i === 0 ? (
                        <Crown className="w-6 h-6 text-[#FFD700] mx-auto" />
                      ) : i === 1 ? (
                        <Medal className="w-5 h-5 text-[#C0C0C0] mx-auto" />
                      ) : i === 2 ? (
                        <Medal className="w-5 h-5 text-[#CD7F32] mx-auto" />
                      ) : (
                        <span className="text-sm font-bold text-[#8B4513]/50">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#8B4513] text-sm truncate">
                        {entry.nickname || "未填姓名"}
                      </p>
                      {entry.className && (
                        <p className="text-xs text-[#8B4513]/50">
                          {entry.className} {entry.seatNumber ? `${entry.seatNumber}號` : ""}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#E60012]">{entry.score}分</p>
                      <p className="text-[10px] text-[#8B4513]/40">
                        {entry.solvedCount}題
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedClasses.length === 0 ? (
                <p className="text-center text-[#8B4513]/50 py-8">還沒有班級資料</p>
              ) : (
                sortedClasses.map(([name, data], i) => (
                  <div
                    key={name}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      i < 3 ? "bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/10" : "bg-white/60"
                    }`}
                    data-testid={`class-entry-${i}`}
                  >
                    <div className="w-8 text-center flex-shrink-0">
                      {i === 0 ? (
                        <Crown className="w-6 h-6 text-[#FFD700] mx-auto" />
                      ) : (
                        <span className="text-sm font-bold text-[#8B4513]/50">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#8B4513] text-sm">{name}</p>
                      <p className="text-xs text-[#8B4513]/50">
                        <Users className="w-3 h-3 inline mr-1" />
                        {data.count} 人參與
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#E60012]">{data.totalScore}分</p>
                      <p className="text-[10px] text-[#8B4513]/40">
                        平均 {Math.round(data.avgScore)}分
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
