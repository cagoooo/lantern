import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Lightbulb, Send, Star, Loader2 } from "lucide-react";

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
  solvedExplanation?: string;
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
  solvedExplanation,
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

  // 移除自動開啟提示的邏輯，改為由使用者主動點擊且門檻提高至 3 次
  useEffect(() => {
    if (attempts >= 3 && isActive && !isSolved) {
      // 不再自動 setShowHint(true);
    }
  }, [attempts, isActive, isSolved]);

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
  const hintLevel = getHintLevel(attempts);
  const hints = getProgressiveHints(riddle.id);
  const currentHints = hints.slice(0, hintLevel);

  return (
    <div className="transition-all duration-300 animate-slide-up">
      <Card
        className={`relative border-2 transition-all duration-300 ${isSolved
            ? "border-[#FFD700] bg-gradient-to-br from-[#FFF8E7] to-[#FFF0C8]"
            : "border-[#E60012] bg-white shadow-lg shadow-[#E60012]/10"
          }`}
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
              className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg ${isSolved
                  ? "bg-[#FFD700] text-[#8B4513]"
                  : "bg-[#E60012] text-white"
                }`}
            >
              {isSolved ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : numberLabel}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${isSolved
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
                className={`text-base sm:text-lg leading-relaxed font-medium mb-3 ${isSolved ? "text-[#8B4513]/70" : "text-[#8B4513]"
                  }`}
              >
                {riddle.question}
              </p>

              {isSolved && solvedAnswer && (
                <div className="space-y-3 animate-bounce-in">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#8B4513]/60">答案：</span>
                    <span className="text-lg font-bold text-[#E60012]">{solvedAnswer}</span>
                  </div>
                  {solvedExplanation && (
                    <div className="bg-gradient-to-r from-[#FFF8E7] to-[#FFF0C8] border border-[#FFD700]/40 rounded-xl p-3 sm:p-4">
                      <div className="flex items-start gap-2">
                        <span className="text-base flex-shrink-0 mt-0.5">💡</span>
                        <div>
                          <p className="text-xs font-bold text-[#8B4513]/70 mb-1">解題解析</p>
                          <p className="text-sm text-[#8B4513] leading-relaxed">{solvedExplanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isSolved && (
                <div className="space-y-3 mt-4">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="輸入你的答案..."
                      disabled={isSubmitting}
                      className={`flex-1 border-2 text-base h-12 rounded-xl transition-colors ${showResult === "wrong"
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
                    {attempts >= 3 && (
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="flex items-center gap-1.5 text-sm text-[#FF8C00] transition-colors"
                        data-testid={`button-hint-${riddle.id}`}
                      >
                        <Lightbulb className="w-4 h-4" />
                        {showHint ? "隱藏提示" : "需要提示嗎？"}
                      </button>
                    )}
                    {attempts > 0 && (
                      <span className="text-xs text-[#8B4513]/40">
                        已嘗試 {attempts} 次
                      </span>
                    )}
                    {hintLevel > 1 && (
                      <span className="text-xs text-[#FF8C00]/60">
                        提示等級 {hintLevel}/{hints.length}
                      </span>
                    )}
                  </div>

                  {showHint && currentHints.length > 0 && (
                    <div className="space-y-2 animate-slide-up">
                      {currentHints.map((hint, i) => (
                        <div
                          key={i}
                          className={`border rounded-lg p-3 ${i === currentHints.length - 1 && hintLevel > 1
                              ? "bg-[#FFE8B8] border-[#FFD700]/60 animate-bounce-in"
                              : "bg-[#FFF8E7] border-[#FFD700]/40"
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <Lightbulb
                              className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${i === currentHints.length - 1 && hintLevel > 1
                                  ? "text-[#FF6B6B]"
                                  : "text-[#FFD700]"
                                }`}
                            />
                            <p className="text-sm text-[#8B4513]">{hint}</p>
                          </div>
                        </div>
                      ))}
                      {attempts >= 4 && hintLevel < hints.length && (
                        <p className="text-xs text-[#FF8C00]/50 text-center">
                          再試一次會解鎖更多提示...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function getHintLevel(attempts: number): number {
  if (attempts >= 5) return 3;
  if (attempts >= 3) return 2;
  return 1;
}

function getProgressiveHints(riddleId: number): string[] {
  const hints: Record<number, string[]> = {
    1: [
      "這個動物是十二生肖之一，在草原上跑得很快喔！",
      "人們可以騎在牠背上，古代打仗也會用到牠。",
      "答案是一個字，跟「騎」有關的動物。",
    ],
    2: [
      "想想看，什麼神獸跟水有關？地名裡有「水」的概念。",
      "這個神獸會飛會游，是中國最有名的吉祥物。池水就是潭。",
      "神獸是「龍」，池水是「潭」，合起來是...",
    ],
    3: [
      "把字拆開來看：委＋鬼是什麼字？再想想彥士這兩個字。",
      "委＋鬼＝魏（姓氏），後面的名字在題目裡已經告訴你了。",
      "姓「魏」，名字是「彥士」。",
    ],
    4: [
      "耳＋東是什麼姓？草字頭＋方是什麼字？珊瑚的珊字...",
      "耳東＝陳，草頭方＝芳，珊瑚取第一個字。",
      "姓「陳」，名字是「芳珊」。",
    ],
    5: [
      "過年的時候，全家人坐在一起吃年夜飯的活動叫什麼？",
      "大家圍著火爐坐在一起，感覺很溫暖。",
      "答案是兩個字，跟「爐火」有關的團圓活動。",
    ],
    6: [
      "一百少一是什麼？百去掉「一」會變成什麼字？",
      "把「百」這個字裡的「一」拿掉，看看剩下什麼。",
      "百 - 一 ＝ 白。答案是一個顏色。",
    ],
    7: [
      "想想看「禾」和「火」合起來是什麼字？禾是綠色的，火是紅色的。",
      "禾苗怕蟲吃，火怕水澆熄。這是一個季節。",
      "禾＋火＝秋。這個季節在夏天和冬天之間。",
    ],
    8: [
      "空中的霸王就是「鷹」（英），聯想到哪個縣市呢？",
      "「鷹」的台語發音聽起來像哪個地名？跟「義」有關。",
      "答案是台灣的一個縣市，「嘉」＋「義」。",
    ],
    9: [
      "數到十就結束了，第十一本書就是超出想像的、不可能的...",
      "「十一」超出了「十」的範圍，就是不能數、不能想的。",
      "答案是四個字的成語，意思是「難以想像」。",
    ],
    10: [
      "饒舌RAP要一直「又」，很多個「又」放在「木」上面是什麼字？",
      "三個「又」疊在一起放在「木」上面。",
      "又又又＋木＝桑。這是一種樹的名字。",
    ],
  };
  return hints[riddleId] || ["再仔細想想看喔！"];
}
