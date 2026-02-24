import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Lightbulb, Send, Star, Lock, Loader2 } from "lucide-react";

interface PublicRiddle {
  id: number;
  question: string;
  hint: string;
}

interface RiddleCardProps {
  riddle: PublicRiddle;
  index: number;
  isSolved: boolean;
  solvedAnswer?: string;
  attempts: number;
  onSubmit: (answer: string) => Promise<boolean>;
  isActive: boolean;
  onSelect: () => void;
}

export function RiddleCard({
  riddle,
  index,
  isSolved,
  solvedAnswer,
  attempts,
  onSubmit,
  isActive,
  onSelect,
}: RiddleCardProps) {
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current && !isSolved) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isActive, isSolved]);

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const correct = await onSubmit(answer.trim());
      setShowResult(correct ? "correct" : "wrong");

      if (!correct) {
        setTimeout(() => setShowResult(null), 1200);
      } else {
        setAnswer("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const numberLabel = String(index + 1).padStart(2, "0");

  return (
    <div
      className={`transition-all duration-300 ${isActive ? "animate-slide-up" : ""}`}
      onClick={!isActive && !isSolved ? onSelect : undefined}
      style={{ cursor: !isActive && !isSolved ? "pointer" : "default" }}
    >
      <Card
        className={`relative border-2 transition-all duration-300 ${
          isSolved
            ? "border-[#FFD700] bg-gradient-to-br from-[#FFF8E7] to-[#FFF0C8]"
            : isActive
              ? "border-[#E60012] bg-white shadow-lg shadow-[#E60012]/10"
              : "border-[#E8D5B7] bg-white/80"
        } ${!isActive && !isSolved ? "hover:border-[#FF6B6B] hover:shadow-md" : ""}`}
        data-testid={`riddle-card-${riddle.id}`}
      >
        {isSolved && (
          <div className="absolute -top-3 -right-3 z-10">
            <div className="bg-[#FFD700] rounded-full p-2 shadow-lg animate-bounce-in">
              <Star className="w-5 h-5 text-[#E60012] fill-[#E60012]" />
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg ${
                isSolved
                  ? "bg-[#FFD700] text-[#8B4513]"
                  : isActive
                    ? "bg-[#E60012] text-white"
                    : "bg-[#FFF0C8] text-[#8B4513]"
              }`}
            >
              {isSolved ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : numberLabel}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    isSolved
                      ? "bg-[#FFD700]/30 text-[#8B4513]"
                      : "bg-[#E60012]/10 text-[#E60012]"
                  }`}
                >
                  {riddle.hint}
                </span>
                {isSolved && (
                  <span className="text-xs text-[#8B4513]/60">
                    {attempts === 1 ? "一次就猜對！" : `猜了 ${attempts} 次`}
                  </span>
                )}
              </div>

              <p
                className={`text-base sm:text-lg leading-relaxed font-medium mb-3 ${
                  isSolved ? "text-[#8B4513]/70" : "text-[#8B4513]"
                }`}
              >
                {riddle.question}
              </p>

              {isSolved && solvedAnswer && (
                <div className="flex items-center gap-2 mb-2 animate-bounce-in">
                  <span className="text-sm text-[#8B4513]/60">答案：</span>
                  <span className="text-lg font-bold text-[#E60012]">{solvedAnswer}</span>
                </div>
              )}

              {isActive && !isSolved && (
                <div className="space-y-3 mt-4">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="輸入你的答案..."
                      disabled={isSubmitting}
                      className={`flex-1 border-2 text-base h-12 rounded-xl transition-colors ${
                        showResult === "wrong"
                          ? "border-red-400 animate-shake bg-red-50"
                          : showResult === "correct"
                            ? "border-[#FFD700] bg-[#FFF8E7]"
                            : "border-[#E8D5B7] focus:border-[#E60012]"
                      }`}
                      data-testid={`input-answer-${riddle.id}`}
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={!answer.trim() || isSubmitting}
                      className="h-12 px-4 sm:px-6 rounded-xl bg-[#E60012] text-white font-bold text-base"
                      data-testid={`button-submit-${riddle.id}`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5 sm:mr-2" />
                          <span className="hidden sm:inline">送出</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {showResult === "wrong" && (
                    <div className="flex items-center gap-2 text-red-500 animate-slide-up">
                      <X className="w-4 h-4" />
                      <span className="text-sm font-medium">不對喔，再想想看！</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-1.5 text-sm text-[#FF8C00] transition-colors"
                      data-testid={`button-hint-${riddle.id}`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHint ? "隱藏提示" : "需要提示嗎？"}
                    </button>
                    {attempts > 0 && (
                      <span className="text-xs text-[#8B4513]/40">
                        已嘗試 {attempts} 次
                      </span>
                    )}
                  </div>

                  {showHint && (
                    <div className="bg-[#FFF8E7] border border-[#FFD700]/40 rounded-lg p-3 animate-slide-up">
                      <p className="text-sm text-[#8B4513]">{getHintText(riddle.id)}</p>
                    </div>
                  )}
                </div>
              )}

              {!isActive && !isSolved && (
                <div className="flex items-center gap-2 mt-2 text-[#8B4513]/40">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-xs">點擊來挑戰這題</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function getHintText(riddleId: number): string {
  const hints: Record<number, string> = {
    1: "這個動物是十二生肖之一，在草原上跑得很快喔！",
    2: "想想看，什麼神獸跟水有關？地名裡有「水」的概念。",
    3: "把字拆開來看：委＋鬼是什麼字？再想想彥士這兩個字。",
    4: "耳＋東是什麼姓？草字頭＋方是什麼字？珊瑚的珊字...",
    5: "過年的時候，全家人坐在一起吃年夜飯的活動叫什麼？",
    6: "一百少一是什麼？百去掉「一」會變成什麼字？",
    7: "想想看「禾」和「火」合起來是什麼字？禾是綠色的，火是紅色的。",
    8: "空中的霸王就是「鷹」（英），聯想到哪個縣市呢？",
    9: "數到十就結束了，第十一本書就是超出想像的、不可能的...",
    10: "饒舌RAP要一直「又」，很多個「又」放在「木」上面是什麼字？",
  };
  return hints[riddleId] || "再仔細想想看喔！";
}
