import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface StudentLoginProps {
  onLogin: (className: string, seatNumber: string, studentName: string) => Promise<void>;
}

const GRADES = ["一", "二", "三", "四", "五", "六"];
const CLASSES = ["一", "二", "三", "四", "五", "六"];

export function StudentLogin({ onLogin }: StudentLoginProps) {
  const [grade, setGrade] = useState("");
  const [classNum, setClassNum] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    if (newCount >= 5) {
      setLocation("/teacher");
    } else {
      setClickCount(newCount);
    }
  };

  const handleSubmit = async () => {
    if (!grade) {
      setError("請選擇年級");
      return;
    }
    if (!classNum) {
      setError("請選擇班級");
      return;
    }
    if (!seatNumber.trim()) {
      setError("請輸入座號");
      return;
    }
    const seatNum = parseInt(seatNumber);
    if (isNaN(seatNum) || seatNum < 1 || seatNum > 50) {
      setError("座號請輸入 1-50 的數字");
      return;
    }
    if (!studentName.trim()) {
      setError("請輸入姓名");
      return;
    }

    const className = `${grade}年${classNum}班`;
    setError("");
    setIsLoading(true);
    try {
      await onLogin(className, seatNumber.trim(), studentName.trim());
    } catch {
      setError("登入失敗，請再試一次");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] via-[#FFF3D6] to-[#FFE8B8] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-2 border-[#E60012] bg-white shadow-xl shadow-[#E60012]/10 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-b from-[#E60012] to-[#CC0010] p-6 text-center relative overflow-hidden">
            <div
              className="absolute top-1 left-3 text-5xl text-white/10 font-bold select-none cursor-default"
              onClick={handleSecretClick}
            >
              馬
            </div>
            <div
              className="absolute bottom-1 right-3 text-4xl text-white/10 font-bold select-none cursor-default"
              onClick={handleSecretClick}
            >
              福
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">歡迎來猜燈謎！</h2>
            <p className="text-white/70 text-sm mt-1">請輸入你的資料開始挑戰</p>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#8B4513] mb-1.5">年級</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-[#E8D5B7] px-3 text-base bg-white text-[#8B4513] focus:border-[#E60012] focus:outline-none transition-colors"
                  data-testid="select-grade"
                >
                  <option value="">選擇年級</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}年級</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8B4513] mb-1.5">班級</label>
                <select
                  value={classNum}
                  onChange={(e) => setClassNum(e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-[#E8D5B7] px-3 text-base bg-white text-[#8B4513] focus:border-[#E60012] focus:outline-none transition-colors"
                  data-testid="select-class"
                >
                  <option value="">選擇班級</option>
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>{c}班</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B4513] mb-1.5">座號</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                placeholder="請輸入座號"
                className="h-12 rounded-xl border-2 border-[#E8D5B7] text-base focus:border-[#E60012]"
                data-testid="input-seat-number"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B4513] mb-1.5">
                姓名 <span className="text-[#E60012]">*</span>
              </label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="請輸入真實姓名"
                className="h-12 rounded-xl border-2 border-[#E8D5B7] text-base focus:border-[#E60012]"
                data-testid="input-student-name"
                maxLength={10}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium" data-testid="login-error">{error}</p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#E60012] text-white font-bold text-lg"
              data-testid="button-login"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "🐴 開始挑戰！"
              )}
            </Button>

          </div>
        </Card>
      </div>

      <footer className="py-4 px-6 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-lg">🏮</span>
          <span className="text-lg">🐴</span>
          <span className="text-lg">🎆</span>
        </div>
        <p className="text-sm text-[#8B4513]/60 mt-1">
          © 2026 石門國小元宵猜燈謎活動 🏮{" "}
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
  );
}
