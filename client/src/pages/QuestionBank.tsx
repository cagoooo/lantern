import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock, ArrowLeft, Plus, Pencil, Trash2, Save,
  X, Loader2, BookOpen,
} from "lucide-react";
import { getRiddles, isTeacherAuthenticated, loginTeacher } from "@/lib/gameStore";
import { riddles as staticRiddles } from "@/lib/riddles";
import { Link } from "wouter";
import { FestiveDecorations } from "@/components/FestiveUI";

type PublicRiddle = { id: number; question: string; hint: string };

let TEACHER_CODE = "";

interface RiddleForm {
  question: string;
  hint: string;
  answers: string;
  explanation: string;
}

export default function QuestionBank() {
  const [authenticated, setAuthenticated] = useState(isTeacherAuthenticated());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<RiddleForm>({ question: "", hint: "", answers: "", explanation: "" });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const [riddles, setRiddles] = useState<PublicRiddle[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRiddles().then(data => {
      setRiddles(data);
      setIsLoading(false);
    });
  }, []);

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
        setError("登入失敗，請確認 Firebase 帳號");
      }
    }
  };

  const handleEdit = async (id: number) => {
    const riddle = staticRiddles.find(r => r.id === id);
    if (riddle) {
      setForm({
        question: riddle.question,
        hint: riddle.hint,
        answers: riddle.answers.join(", "),
        explanation: riddle.explanation || "",
      });
      setEditing(id);
      setAdding(false);
    }
  };

  const handleSave = async () => {
    alert("目前專案已轉為靜態架構，如需修改題目請直接編輯 client/src/lib/riddles.ts 檔案。");
    setEditing(null);
    setAdding(false);
  };

  const handleDelete = async (id: number) => {
    alert("目前專案已轉為靜態架構，如需刪除題目請直接編輯 client/src/lib/riddles.ts 檔案。");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] to-[#FFE8B8] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-2 border-[#E60012] rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-[#E60012] to-[#CC0010] p-6 text-center">
            <BookOpen className="w-10 h-10 text-white mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">題庫管理</h2>
            <p className="text-white/70 text-sm">請輸入教師密碼</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="p-5 space-y-4"
          >
            <div className="space-y-3">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="管理員 Email"
                className="h-12 rounded-xl border-2 border-[#E8D5B7] text-base"
                required
                autoComplete="username"
              />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                className="h-12 rounded-xl border-2 border-[#E8D5B7] text-base"
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#E60012] text-white font-bold"
            >
              登入
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full h-10 rounded-xl border-[#E8D5B7]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回遊戲
              </Button>
            </Link>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] to-[#FFE8B8] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-xl border-[#E8D5B7]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-[#E60012]">
              <BookOpen className="w-6 h-6 inline mr-2" />
              題庫管理
            </h1>
          </div>
          <Button
            onClick={() => {
              setAdding(true);
              setEditing(null);
              setForm({ question: "", hint: "", answers: "", explanation: "" });
            }}
            className="rounded-xl bg-[#E60012] text-white"
            data-testid="button-add-riddle"
          >
            <Plus className="w-4 h-4 mr-1" />
            新增題目
          </Button>
        </div>

        {(editing !== null || adding) && (
          <Card className="rounded-2xl border-2 border-[#FFD700] bg-white p-5 space-y-3">
            <h3 className="font-bold text-[#8B4513]">
              {editing !== null ? `編輯第 ${editing} 題` : "新增題目"}
            </h3>
            <div>
              <label className="block text-sm font-medium text-[#8B4513] mb-1">題目</label>
              <textarea
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="w-full h-20 rounded-xl border-2 border-[#E8D5B7] p-3 text-sm resize-none focus:border-[#E60012] focus:outline-none"
                placeholder="輸入謎面..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8B4513] mb-1">提示</label>
              <Input
                value={form.hint}
                onChange={(e) => setForm({ ...form, hint: e.target.value })}
                placeholder="例：猜一字"
                className="rounded-xl border-2 border-[#E8D5B7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8B4513] mb-1">
                答案 <span className="text-[#8B4513]/40">（多個答案用逗號分隔）</span>
              </label>
              <Input
                value={form.answers}
                onChange={(e) => setForm({ ...form, answers: e.target.value })}
                placeholder="例：白, 百減一"
                className="rounded-xl border-2 border-[#E8D5B7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8B4513] mb-1">解題解析</label>
              <textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                className="w-full h-20 rounded-xl border-2 border-[#E8D5B7] p-3 text-sm resize-none focus:border-[#E60012] focus:outline-none"
                placeholder="解釋答案的由來..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-[#E60012] text-white"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                儲存
              </Button>
              <Button
                onClick={() => { setEditing(null); setAdding(false); }}
                variant="outline"
                className="rounded-xl border-[#E8D5B7]"
              >
                <X className="w-4 h-4 mr-1" />
                取消
              </Button>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#E60012]" />
          </div>
        ) : (
          <div className="space-y-3">
            {riddles?.map((riddle) => (
              <Card key={riddle.id} className="rounded-xl border-[#E8D5B7] bg-white/80 p-4">
                <div className="flex items-start gap-3">
                  <span className="bg-[#E60012] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {riddle.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#8B4513]">{riddle.question}</p>
                    <p className="text-xs text-[#8B4513]/50 mt-1">{riddle.hint}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(riddle.id)}
                      className="h-8 w-8 p-0 text-[#8B4513]/50 hover:text-[#E60012]"
                      data-testid={`button-edit-${riddle.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(riddle.id)}
                      className="h-8 w-8 p-0 text-[#8B4513]/50 hover:text-red-500"
                      data-testid={`button-delete-${riddle.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <footer className="py-5 text-center mt-4">
          <FestiveDecorations />
          <p className="text-sm text-[#8B4513]/60 mt-3">
            © 2026 石門國小元宵猜燈謎網站 🏮{" "}
            <a
              href="https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#E60012] underline hover:text-[#CC0010] transition-colors"
            >
              阿凱老師
            </a>{" "}
            製作 ✨
          </p>
        </footer>
      </div>
    </div>
  );
}
