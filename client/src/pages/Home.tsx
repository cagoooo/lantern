import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RiddleCard } from "@/components/RiddleCard";
import { ScoreBoard } from "@/components/ScoreBoard";
import { FloatingLanterns } from "@/components/FloatingLanterns";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { CompletionModal } from "@/components/CompletionModal";
import type { GameState } from "@shared/schema";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicRiddle {
  id: number;
  question: string;
  hint: string;
}

const STORAGE_KEY = "shimen-riddle-game";

function loadGameState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { currentRiddleIndex: 0, solvedRiddles: [], attempts: {}, score: 0 };
}

function saveGameState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(loadGameState);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [solvedAnswers, setSolvedAnswers] = useState<Record<number, string>>({});

  const { data: riddles, isLoading } = useQuery<PublicRiddle[]>({
    queryKey: ["/api/riddles"],
  });

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const handleSubmit = useCallback(
    async (riddleId: number, answer: string): Promise<boolean> => {
      if (gameState.solvedRiddles.includes(riddleId)) return false;

      try {
        const res = await apiRequest("POST", `/api/riddles/${riddleId}/check`, { answer });
        const data = await res.json();

        setGameState((prev) => {
          if (prev.solvedRiddles.includes(riddleId)) return prev;

          const newAttempts = {
            ...prev.attempts,
            [riddleId]: (prev.attempts[riddleId] || 0) + 1,
          };

          if (data.correct) {
            const newSolved = [...prev.solvedRiddles, riddleId];
            const attemptCount = newAttempts[riddleId];
            const points = attemptCount === 1 ? 10 : attemptCount === 2 ? 7 : 5;

            if (newSolved.length === (riddles?.length || 10)) {
              setTimeout(() => setShowCompletion(true), 1500);
            }

            return {
              ...prev,
              solvedRiddles: newSolved,
              attempts: newAttempts,
              score: prev.score + points,
            };
          }

          return { ...prev, attempts: newAttempts };
        });

        if (data.correct) {
          setSolvedAnswers((prev) => ({ ...prev, [riddleId]: data.answer }));
          setShowConfetti(true);
          setConfettiKey((k) => k + 1);
          setTimeout(() => setShowConfetti(false), 3500);
        }

        return data.correct;
      } catch {
        return false;
      }
    },
    [riddles, gameState.solvedRiddles]
  );

  const handleSelectRiddle = useCallback((index: number) => {
    setGameState((prev) => ({ ...prev, currentRiddleIndex: index }));
  }, []);

  const handleReset = useCallback(() => {
    setGameState({ currentRiddleIndex: 0, solvedRiddles: [], attempts: {}, score: 0 });
    setSolvedAnswers({});
    setShowCompletion(false);
  }, []);

  if (isLoading || !riddles) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] via-[#FFF3D6] to-[#FFE8B8] flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <LanternIcon />
          <Loader2 className="w-8 h-8 animate-spin text-[#E60012] mx-auto" />
          <p className="text-[#8B4513] font-medium">載入燈謎中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] via-[#FFF3D6] to-[#FFE8B8] relative">
      <FloatingLanterns />
      <ConfettiEffect key={confettiKey} active={showConfetti} />

      <div className="relative z-10">
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#E60012] via-[#CC0010] to-[#A80010]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-4 text-6xl sm:text-8xl text-white/20 font-bold select-none">福</div>
            <div className="absolute top-4 right-6 text-5xl sm:text-7xl text-white/15 font-bold select-none">春</div>
            <div className="absolute bottom-2 left-1/4 text-4xl sm:text-6xl text-white/10 font-bold select-none">喜</div>
          </div>

          <div className="relative px-4 py-6 sm:py-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              <LanternIcon />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide">
                元宵猜燈謎
              </h1>
              <LanternIcon />
            </div>
            <p className="text-sm sm:text-lg text-white/80 font-medium">
              2026 石門國小 Lantern Festival
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700] animate-glow" />
              <p className="text-xs sm:text-sm text-[#FFD700] font-medium">
                學務處將於 3/3（二）進行猜燈謎活動！
              </p>
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700] animate-glow" />
            </div>
          </div>

          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
          >
            <path d="M0,40 C300,0 900,0 1200,40 L1200,40 L0,40 Z" fill="#FFF8E7" />
          </svg>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-5 sm:space-y-6 pb-20">
          <ScoreBoard
            solved={gameState.solvedRiddles.length}
            total={riddles.length}
            score={gameState.score}
          />

          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#8B4513]">
              燈謎題目
            </h2>
            {gameState.solvedRiddles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs border-[#E8D5B7] text-[#8B4513]/60 rounded-lg"
                data-testid="button-reset"
              >
                重新開始
              </Button>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {riddles.map((riddle, index) => (
              <RiddleCard
                key={riddle.id}
                riddle={riddle}
                index={index}
                isSolved={gameState.solvedRiddles.includes(riddle.id)}
                solvedAnswer={solvedAnswers[riddle.id]}
                attempts={gameState.attempts[riddle.id] || 0}
                onSubmit={(answer) => handleSubmit(riddle.id, answer)}
                isActive={gameState.currentRiddleIndex === index}
                onSelect={() => handleSelectRiddle(index)}
              />
            ))}
          </div>

          <div className="text-center pt-4 pb-8">
            <div className="inline-flex items-center gap-2 text-[#8B4513]/40 text-sm">
              <CloudIcon />
              <span>石門國小 2026 元宵節</span>
              <CloudIcon />
            </div>
          </div>
        </main>
      </div>

      <CompletionModal
        open={showCompletion}
        score={gameState.score}
        total={riddles.length}
        onReset={handleReset}
        onClose={() => setShowCompletion(false)}
      />
    </div>
  );
}

function LanternIcon() {
  return (
    <svg
      width="28"
      height="42"
      viewBox="0 0 60 90"
      className="animate-float hidden sm:block"
    >
      <line x1="30" y1="0" x2="30" y2="15" stroke="#FFD700" strokeWidth="2" />
      <rect x="24" y="12" width="12" height="5" rx="2" fill="#FFD700" />
      <ellipse cx="30" cy="46" rx="20" ry="28" fill="#FFD700" opacity="0.9" />
      <ellipse cx="30" cy="46" rx="16" ry="24" fill="#FFA500" opacity="0.5" />
      <rect x="24" y="72" width="12" height="4" rx="1" fill="#FFD700" />
      <text
        x="30"
        y="50"
        textAnchor="middle"
        fill="#E60012"
        fontSize="16"
        fontWeight="bold"
        fontFamily="'Noto Sans TC', sans-serif"
      >
        燈
      </text>
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="24" height="14" viewBox="0 0 40 24" fill="none">
      <path
        d="M8,18 C4,18 2,15 2,12 C2,9 4,7 7,7 C7,4 10,2 14,2 C18,2 21,4 22,7 C22,7 22,7 22,7 C25,7 28,9 28,12 C28,15 26,18 22,18 Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M18,22 C14,22 12,19 12,16 C12,13 14,11 17,11 C17,8 20,6 24,6 C28,6 31,8 32,11 C35,11 38,13 38,16 C38,19 36,22 32,22 Z"
        fill="currentColor"
        opacity="0.2"
      />
    </svg>
  );
}
