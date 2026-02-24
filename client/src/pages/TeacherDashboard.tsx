import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3, Users, CheckCircle, TrendingUp,
  Lock, ArrowLeft, RefreshCw, Loader2,
  Search, Download, Filter, GraduationCap,
  ClipboardList, ChevronRight
} from "lucide-react";
import { getStatsForTeacher, type ScoreEntry, getRiddles, isTeacherAuthenticated, loginTeacher, logoutTeacher } from "@/lib/gameStore";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PublicRiddle = { id: number; question: string; hint: string };

export default function TeacherDashboard() {
  const [authenticated, setAuthenticated] = useState(isTeacherAuthenticated());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{
    totalPlayers: number;
    classStats: Record<string, number>;
    riddleStats: Record<number, { attempts: number; solved: number }>;
    allScores: ScoreEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  const [riddles, setRiddles] = useState<PublicRiddle[] | null>(null);

  useEffect(() => {
    getRiddles().then(data => setRiddles(data));
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const s = await getStatsForTeacher();
      setStats(s);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) loadStats();
  }, [authenticated, loadStats]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await loginTeacher(email.trim(), password.trim());
      setAuthenticated(true);
      setError("");
    } catch (err: any) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("帳號或密碼錯誤");
      } else {
        setError("登入失敗，請確認已在 Firebase 建立帳號");
      }
    }
  };

  const handleLogout = async () => {
    await logoutTeacher();
    setAuthenticated(false);
  };

  const filteredStudents = useMemo(() => {
    if (!stats?.allScores) return [];
    return stats.allScores.filter(s => {
      const matchesSearch = s.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.className?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === "all" || s.className === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [stats?.allScores, searchQuery, classFilter]);

  const classes = useMemo(() => {
    if (!stats?.allScores) return [];
    return Array.from(new Set(stats.allScores.map(s => s.className).filter(Boolean))).sort();
  }, [stats?.allScores]);

  const completionDistribution = useMemo(() => {
    if (!stats?.allScores) return { bins: [0, 0, 0, 0, 0], labels: ["0題", "1-3題", "4-6題", "7-9題", "10題"] };
    const bins = [0, 0, 0, 0, 0];
    stats.allScores.forEach(s => {
      if (s.solvedCount === 0) bins[0]++;
      else if (s.solvedCount <= 3) bins[1]++;
      else if (s.solvedCount <= 6) bins[2]++;
      else if (s.solvedCount <= 9) bins[3]++;
      else bins[4]++;
    });
    return { bins, labels: ["0題", "1-3題", "4-6題", "7-9題", "10題"] };
  }, [stats?.allScores]);

  const exportToCSV = () => {
    if (!stats?.allScores) return;

    // Create CSV content with BOM for Excel UTF-8 support
    const BOM = "\uFEFF";
    const headers = ["班級", "座號", "姓名", "得分", "通關數", "完成時間"];
    const rows = stats.allScores.map(s => [
      s.className || "",
      s.seatNumber || "",
      s.nickname,
      s.score,
      s.solvedCount,
      s.createdAt ? new Date(s.createdAt as any).toLocaleString() : ""
    ]);

    const csvContent = BOM + [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `猜燈謎活動成績匯出_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] to-[#FFE8B8] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-2 border-[#E60012] rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-[#E60012] to-[#CC0010] p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">老師登入</h2>
            <p className="text-white/70 text-sm">請輸入教師管理密碼以查看數據</p>
          </div>
          <div className="p-8 space-y-4 bg-white">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8B4513]/50 ml-1 uppercase">帳號 (Email)</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@smes.edu.tw"
                  className="h-12 rounded-xl border-2 border-[#E8D5B7] text-base px-4 focus:ring-2 focus:ring-[#E60012] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8B4513]/50 ml-1 uppercase">密碼 (Password)</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-2 border-[#E8D5B7] text-base px-4 focus:ring-2 focus:ring-[#E60012] transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              {error && <p className="text-sm text-red-500 font-medium px-2">{error}</p>}
            </div>
            <Button
              onClick={handleLogin}
              className="w-full h-14 rounded-2xl bg-[#E60012] hover:bg-[#CC0010] text-white text-lg font-bold shadow-lg shadow-red-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              進入管理後台
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full h-10 text-[#8B4513] hover:bg-[#FFF8E7] rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首頁
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF0] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="rounded-full border-[#E8D5B7] text-[#8B4513] hover:bg-[#FFF8E7]">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-[#E60012] flex items-center gap-2">
                <BarChart3 className="w-8 h-8" />
                老師數據中心
              </h1>
              <p className="text-[#8B4513]/60 font-medium">即時掌握燈謎活動參與進度</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-xl border-red-200 text-red-500 h-11 px-6 font-bold hover:bg-red-50"
            >
              登出
            </Button>
            <Button
              onClick={exportToCSV}
              disabled={!stats}
              variant="outline"
              className="rounded-xl border-[#E8D5B7] text-[#8B4513] h-11 px-6 font-bold hover:bg-[#E8D5B7]/20"
            >
              <Download className="w-4 h-4 mr-2" />
              匯出 CSV
            </Button>
            <Button
              onClick={loadStats}
              disabled={loading}
              className="rounded-xl bg-[#E60012] text-white h-11 w-11 p-0 shadow-lg shadow-red-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {loading && !stats ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-[#E60012]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#E60012] rounded-full" />
              </div>
            </div>
            <p className="text-[#8B4513] font-bold animate-pulse">正在為您準備最準確的數據...</p>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: "總參與人數", value: stats.totalPlayers, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "平均分數", value: stats.totalPlayers > 0 ? Math.round(stats.allScores.reduce((a, b) => a + b.score, 0) / stats.totalPlayers) : 0, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
                { label: "全通關人數", value: stats.allScores.filter(s => s.solvedCount >= 10).length, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
                { label: "參與班級數", value: Object.keys(stats.classStats).length, icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-50" },
              ].map((item, idx) => (
                <Card key={idx} className="p-6 rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden relative group">
                  <div className={`absolute top-0 right-0 w-24 h-24 ${item.bg} rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
                  <div className="relative">
                    <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                    <p className="text-3xl font-black text-[#8B4513]">{item.value}</p>
                    <p className="text-sm font-bold text-[#8B4513]/40 uppercase tracking-wider">{item.label}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Detailed Student List */}
              <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm bg-white overflow-hidden">
                <div className="p-6 border-b border-[#F0F0F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-[#8B4513] flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#E60012]" />
                    學生實戰紀錄
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B4513]/30" />
                      <Input
                        placeholder="搜尋學生或班級..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 w-full sm:w-48 rounded-xl border-[#F0F0F0] text-sm focus:ring-[#E60012]"
                      />
                    </div>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-28 h-10 rounded-xl border-[#F0F0F0] text-sm">
                        <Filter className="w-3 h-3 mr-2" />
                        <SelectValue placeholder="班級" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有班級</SelectItem>
                        {classes.map(c => (
                          <SelectItem key={c} value={c as string}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAF9F6] text-[#8B4513]/50 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">學生</th>
                        <th className="px-6 py-4">班級 / 座號</th>
                        <th className="px-6 py-4 text-center">得分</th>
                        <th className="px-6 py-4 text-center">通關數</th>
                        <th className="px-6 py-4 text-right">進度條</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F0F0]">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-[#8B4513]/40 font-medium">
                            未找到符合條件的學生資料
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.slice(0, 50).map((s) => (
                          <tr key={s.uid} className="hover:bg-[#FFF8E7]/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-[#8B4513]">{s.nickname}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs bg-[#E8D5B7]/20 text-[#8B4513] px-2 py-1 rounded-md font-bold">
                                {s.className} {s.seatNumber}號
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-black text-[#E60012]">{s.score}</td>
                            <td className="px-6 py-4 text-center text-sm font-bold text-[#8B4513]/60">{s.solvedCount} / 10</td>
                            <td className="px-6 py-4">
                              <div className="w-24 ml-auto h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#E60012] rounded-full"
                                  style={{ width: `${(s.solvedCount / 10) * 100}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {filteredStudents.length > 50 && (
                    <div className="p-4 text-center bg-[#FAF9F6] text-xs text-[#8B4513]/50 font-bold">
                      僅顯示前 50 筆資料，建議使用搜尋功能或匯出 CSV 查看完整名單
                    </div>
                  )}
                </div>
              </Card>

              {/* Sidebar Charts */}
              <div className="space-y-8">
                {/* Completion Distribution */}
                <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                  <h3 className="text-lg font-bold text-[#8B4513] mb-6 flex items-center justify-between">
                    通關題數分佈
                    <span className="text-[10px] text-[#8B4513]/40 uppercase font-bold tracking-tighter">人數統計</span>
                  </h3>
                  <div className="space-y-5">
                    {completionDistribution.labels.map((label, i) => {
                      const count = completionDistribution.bins[i];
                      const percentage = stats.totalPlayers > 0 ? (count / stats.totalPlayers) * 100 : 0;
                      return (
                        <div key={label} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-[#8B4513]/60">{label}</span>
                            <span className="text-[#8B4513]">{count} 人</span>
                          </div>
                          <div className="h-3 bg-[#F0F0F0] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${i === 4 ? "bg-green-500" : i >= 2 ? "bg-yellow-400" : "bg-[#E60012]/60"
                                }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Question Difficulty analysis */}
                <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
                  <div className="p-5 border-b border-[#F0F0F0]">
                    <h3 className="font-bold text-[#8B4513]">題目難易度排行</h3>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {riddles?.map(r => {
                      const s = stats.riddleStats[r.id] || { attempts: 0, solved: 0 };
                      const rate = s.attempts > 0 ? Math.round((s.solved / s.attempts) * 100) : 0;
                      return (
                        <div key={r.id} className="p-4 hover:bg-[#FAF9F6] transition-colors group">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs ${rate >= 80 ? "bg-green-100 text-green-600" : rate >= 40 ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"
                              }`}>
                              #{r.id}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#8B4513] truncate">{r.question}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${rate >= 80 ? "bg-green-500" : rate >= 40 ? "bg-yellow-400" : "bg-red-500"}`}
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-black text-[#8B4513]/40">{rate}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ) : null}

        <footer className="py-12 text-center border-t border-[#F0F0F0]">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">🏮</div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">🏮</div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">🏮</div>
          </div>
          <p className="text-sm font-bold text-[#8B4513]/40">
            © 2026 石門國小教師管理系統 | Powered by 阿凱老師
          </p>
        </footer>
      </div>
    </div>
  );
}
