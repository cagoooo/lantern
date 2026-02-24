import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Users, Swords, Loader2, Crown, RefreshCw } from "lucide-react";
import { getClassLeaderboard } from "@/lib/gameStore";
import { Link } from "wouter";

export default function ClassBattle() {
  const [classData, setClassData] = useState<Record<string, { totalScore: number; count: number; avgScore: number }>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getClassLeaderboard();
      setClassData(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const sorted = Object.entries(classData).sort((a, b) => b[1].totalScore - a[1].totalScore);
  const maxScore = sorted.length > 0 ? sorted[0][1].totalScore : 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] via-[#FFF3D6] to-[#FFE8B8] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-xl border-[#E8D5B7]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-[#E60012]">
              <Swords className="w-6 h-6 inline mr-2" />
              班級對戰
            </h1>
          </div>
          <Button
            onClick={loadData}
            disabled={loading}
            variant="outline"
            size="sm"
            className="rounded-xl border-[#E8D5B7]"
            data-testid="button-refresh-battle"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>

        <Card className="rounded-2xl border-2 border-[#FFD700] bg-gradient-to-b from-[#E60012] to-[#CC0010] overflow-hidden">
          <div className="p-6 text-center text-white">
            <Swords className="w-10 h-10 mx-auto mb-2 text-[#FFD700]" />
            <h2 className="text-xl font-bold mb-1">各班比分擂台</h2>
            <p className="text-white/70 text-sm">全班分數加總，看哪班最厲害！</p>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#E60012]" />
          </div>
        ) : sorted.length === 0 ? (
          <Card className="rounded-2xl border-[#E8D5B7] bg-white/80 p-8 text-center">
            <Users className="w-12 h-12 text-[#8B4513]/30 mx-auto mb-3" />
            <p className="text-[#8B4513]/70">還沒有班級參與</p>
            <p className="text-sm text-[#8B4513]/40 mt-1">同學們先去登入再答題吧！</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {sorted.map(([name, data], i) => (
              <Card
                key={name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  i === 0
                    ? "border-[#FFD700] bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/5 shadow-lg"
                    : i === 1
                      ? "border-[#C0C0C0] bg-white/80"
                      : i === 2
                        ? "border-[#CD7F32] bg-white/80"
                        : "border-[#E8D5B7] bg-white/80"
                }`}
                data-testid={`battle-class-${i}`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                      {i === 0 ? (
                        <div className="relative">
                          <Crown className="w-8 h-8 text-[#FFD700]" />
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#FFD700]">1</span>
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          i === 1 ? "bg-[#C0C0C0]/20 text-[#777]" :
                          i === 2 ? "bg-[#CD7F32]/20 text-[#CD7F32]" :
                          "bg-[#E8D5B7]/30 text-[#8B4513]/50"
                        }`}>
                          {i + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-bold ${i === 0 ? "text-lg text-[#E60012]" : "text-[#8B4513]"}`}>
                        {name}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#8B4513]/50">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {data.count} 人
                        </span>
                        <span>平均 {Math.round(data.avgScore)} 分</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className={`text-2xl font-bold ${i === 0 ? "text-[#E60012]" : "text-[#8B4513]"}`}>
                        {data.totalScore}
                      </p>
                      <p className="text-[10px] text-[#8B4513]/40">總分</p>
                    </div>
                  </div>

                  <div className="mt-3 bg-[#E8D5B7]/20 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        i === 0 ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500]" :
                        i === 1 ? "bg-gradient-to-r from-[#C0C0C0] to-[#999]" :
                        i === 2 ? "bg-gradient-to-r from-[#CD7F32] to-[#AA6622]" :
                        "bg-gradient-to-r from-[#E60012]/60 to-[#FF6B6B]/60"
                      }`}
                      style={{ width: `${(data.totalScore / maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href="/">
            <Button className="rounded-xl bg-[#E60012] text-white font-bold px-8">
              回去答題
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
