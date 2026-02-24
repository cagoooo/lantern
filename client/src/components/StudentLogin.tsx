import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Loader2 } from "lucide-react";

interface StudentLoginProps {
  onLogin: (className: string, seatNumber: string, nickname: string) => Promise<void>;
}

const CLASS_OPTIONS = [
  "一年甲班", "一年乙班",
  "二年甲班", "二年乙班",
  "三年甲班", "三年乙班",
  "四年甲班", "四年乙班",
  "五年甲班", "五年乙班",
  "六年甲班", "六年乙班",
];

export function StudentLogin({ onLogin }: StudentLoginProps) {
  const [className, setClassName] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!className) {
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

    setError("");
    setIsLoading(true);
    try {
      await onLogin(className, seatNumber.trim(), nickname.trim() || `${className}${seatNumber}號`);
    } catch {
      setError("登入失敗，請再試一次");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] via-[#FFF3D6] to-[#FFE8B8] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm border-2 border-[#E60012] bg-white shadow-xl shadow-[#E60012]/10 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-b from-[#E60012] to-[#CC0010] p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">歡迎來猜燈謎！</h2>
          <p className="text-white/70 text-sm mt-1">請輸入你的班級和座號</p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8B4513] mb-1.5">班級</label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full h-12 rounded-xl border-2 border-[#E8D5B7] px-3 text-base bg-white text-[#8B4513] focus:border-[#E60012] focus:outline-none transition-colors"
              data-testid="select-class"
            >
              <option value="">請選擇班級...</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
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
              暱稱 <span className="text-[#8B4513]/40">（選填）</span>
            </label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="幫自己取一個暱稱吧"
              className="h-12 rounded-xl border-2 border-[#E8D5B7] text-base focus:border-[#E60012]"
              data-testid="input-nickname"
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
              "開始挑戰！"
            )}
          </Button>

          <p className="text-center text-xs text-[#8B4513]/40 mt-2">
            石門國小 2026 元宵猜燈謎活動
          </p>
        </div>
      </Card>
    </div>
  );
}
