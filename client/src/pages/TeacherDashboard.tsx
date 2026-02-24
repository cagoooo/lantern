import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3, Users, CheckCircle, TrendingUp,
  Lock, ArrowLeft, RefreshCw, Loader2,
} from "lucide-react";
import { getStatsForTeacher, getLeaderboard, getClassLeaderboard, type ScoreEntry } from "@/lib/gameStore";
import { Link } from "wouter";

type PublicRiddle = { id: number; question: string; hint: string };

let TEACHER_CODE = "";

export default function TeacherDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{
    totalPlayers: number;
    classStats: Record<string, number>;
    riddleStats: Record<number, { attempts: number; solved: number }>;
  } | null>(null);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [classData, setClassData] = useState<Record<string, { totalScore: number; count: number; avgScore: number }>>({});
  const [loading, setLoading] = useState(false);

  const { data: riddles } = useQuery<PublicRiddle[]>({
    queryKey: ["/api/riddles"],
  });

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [s, lb, cd] = await Promise.all([
        getStatsForTeacher(),
        getLeaderboard(100),
        getClassLeaderboard(),
      ]);
      setStats(s);
      setLeaderboard(lb);
      setClassData(cd);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) loadStats();
  }, [authenticated, loadStats]);

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (res.ok) {
        TEACHER_CODE = code.trim();
        setAuthenticated(true);
        setError("");
      } else {
        setError("密碼錯誤");
      }
    } catch {
      setError("連線失敗，請再試一次");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] to-[#FFE8B8] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-2 border-[#E60012] rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-[#E60012] to-[#CC0010] p-6 text-center">
            <Lock className="w-10 h-10 text-white mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">老師儀表板</h2>
            <p className="text-white/70 text-sm">請輸入教師密碼</p>
          </div>
          <div className="p-5 space-y-4">
            <Input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="請輸入密碼"
              className="h-12 rounded-xl border-2 border-[#E8D5B7] text-base"
              data-testid="input-teacher-code"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              onClick={handleLogin}
              className="w-full h-12 rounded-xl bg-[#E60012] text-white font-bold"
              data-testid="button-teacher-login"
            >
              登入
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full h-10 rounded-xl border-[#E8D5B7]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回遊戲
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] to-[#FFE8B8] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-xl border-[#E8D5B7]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-[#E60012]">
              <BarChart3 className="w-6 h-6 inline mr-2" />
              教師儀表板
            </h1>
          </div>
          <Button
            onClick={loadStats}
            disabled={loading}
            variant="outline"
            size="sm"
            className="rounded-xl border-[#E8D5B7]"
            data-testid="button-refresh-stats"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>

        {loading && !stats ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#E60012]" />
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-4 rounded-xl border-[#E8D5B7] bg-white/80 text-center">
                <Users className="w-6 h-6 text-[#E60012] mx-auto mb-1" />
                <p className="text-2xl font-bold text-[#8B4513]">{stats.totalPlayers}</p>
                <p className="text-xs text-[#8B4513]/50">總參與人數</p>
              </Card>
              <Card className="p-4 rounded-xl border-[#E8D5B7] bg-white/80 text-center">
                <BarChart3 className="w-6 h-6 text-[#FFD700] mx-auto mb-1" />
                <p className="text-2xl font-bold text-[#8B4513]">
                  {Object.keys(stats.classStats).length}
                </p>
                <p className="text-xs text-[#8B4513]/50">參與班級數</p>
              </Card>
              <Card className="p-4 rounded-xl border-[#E8D5B7] bg-white/80 text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-[#8B4513]">
                  {leaderboard.filter((e) => e.solvedCount >= 10).length}
                </p>
                <p className="text-xs text-[#8B4513]/50">全部通關</p>
              </Card>
              <Card className="p-4 rounded-xl border-[#E8D5B7] bg-white/80 text-center">
                <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-[#8B4513]">
                  {leaderboard.length > 0 ? Math.round(leaderboard.reduce((s, e) => s + e.score, 0) / leaderboard.length) : 0}
                </p>
                <p className="text-xs text-[#8B4513]/50">平均分數</p>
              </Card>
            </div>

            <Card className="rounded-2xl border-[#E8D5B7] bg-white/80 overflow-hidden">
              <div className="bg-[#E60012]/10 p-3 border-b border-[#E8D5B7]">
                <h3 className="font-bold text-[#E60012]">各班參與情況</h3>
              </div>
              <div className="p-4">
                {Object.keys(stats.classStats).length === 0 ? (
                  <p className="text-[#8B4513]/50 text-center py-4">尚無班級資料</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(stats.classStats)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, count]) => {
                        const cd = classData[name];
                        return (
                          <div key={name} className="flex items-center gap-3 p-2 bg-[#FFF8E7] rounded-lg">
                            <span className="font-bold text-sm text-[#8B4513] w-24">{name}</span>
                            <div className="flex-1 bg-[#E8D5B7]/30 rounded-full h-6 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-[#E60012] to-[#FF6B6B] h-full rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${Math.min(100, (count / Math.max(...Object.values(stats.classStats))) * 100)}%` }}
                              >
                                <span className="text-[10px] text-white font-bold">{count}人</span>
                              </div>
                            </div>
                            {cd && (
                              <span className="text-xs text-[#8B4513]/50 w-20 text-right">
                                均{Math.round(cd.avgScore)}分
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </Card>

            <Card className="rounded-2xl border-[#E8D5B7] bg-white/80 overflow-hidden">
              <div className="bg-[#FFD700]/20 p-3 border-b border-[#E8D5B7]">
                <h3 className="font-bold text-[#8B4513]">各題答題分析</h3>
              </div>
              <div className="p-4">
                {riddles && riddles.length > 0 ? (
                  <div className="space-y-2">
                    {riddles.map((r) => {
                      const s = stats.riddleStats[r.id] || { attempts: 0, solved: 0 };
                      const rate = s.attempts > 0 ? Math.round((s.solved / (s.solved + (s.attempts - s.solved))) * 100) : 0;
                      return (
                        <div key={r.id} className="flex items-center gap-3 p-2 bg-[#FFF8E7] rounded-lg">
                          <span className="text-sm font-bold text-[#E60012] w-6">#{r.id}</span>
                          <span className="flex-1 text-sm text-[#8B4513] truncate">{r.question}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-16 bg-[#E8D5B7]/30 rounded-full h-4 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rate >= 70 ? "bg-green-400" : rate >= 40 ? "bg-yellow-400" : "bg-red-400"
                                }`}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#8B4513]/60 w-10 text-right">{rate}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[#8B4513]/50 text-center py-4">載入中...</p>
                )}
              </div>
            </Card>

            <Card className="rounded-2xl border-[#E8D5B7] bg-white/80 overflow-hidden">
              <div className="bg-[#E60012]/10 p-3 border-b border-[#E8D5B7]">
                <h3 className="font-bold text-[#E60012]">個人排行 (前 20 名)</h3>
              </div>
              <div className="p-4">
                {leaderboard.length === 0 ? (
                  <p className="text-[#8B4513]/50 text-center py-4">尚無成績資料</p>
                ) : (
                  <div className="space-y-1">
                    {leaderboard.slice(0, 20).map((entry, i) => (
                      <div key={entry.uid} className="flex items-center gap-2 p-2 bg-[#FFF8E7] rounded-lg text-sm">
                        <span className="w-6 text-center font-bold text-[#8B4513]/50">{i + 1}</span>
                        <span className="flex-1 font-medium text-[#8B4513] truncate">
                          {entry.nickname}
                        </span>
                        <span className="text-xs text-[#8B4513]/50">{entry.className}</span>
                        <span className="font-bold text-[#E60012] w-14 text-right">{entry.score}分</span>
                        <span className="text-xs text-[#8B4513]/40 w-10 text-right">{entry.solvedCount}題</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
