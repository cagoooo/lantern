import { useState, useEffect, useCallback, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerModeProps {
  isActive: boolean;
  onToggle: () => void;
  solvedCount: number;
  totalCount: number;
  gameComplete: boolean;
  onElapsedChange?: (elapsed: number) => void;
}

export function TimerMode({
  isActive,
  onToggle,
  solvedCount,
  totalCount,
  gameComplete,
  onElapsedChange,
}: TimerModeProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem("shimen-best-time");
      return saved ? parseInt(saved) : null;
    } catch {
      return null;
    }
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && isRunning && !gameComplete) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isRunning, gameComplete]);

  useEffect(() => {
    if (onElapsedChange) onElapsedChange(elapsed);
  }, [elapsed, onElapsedChange]);

  useEffect(() => {
    if (gameComplete && isRunning && isActive) {
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);

      if (bestTime === null || elapsed < bestTime) {
        setBestTime(elapsed);
        localStorage.setItem("shimen-best-time", String(elapsed));
      }
    }
  }, [gameComplete, isRunning, isActive, elapsed, bestTime]);

  const handleStartPause = useCallback(() => {
    setIsRunning((r) => !r);
  }, []);

  const handleReset = useCallback(() => {
    setElapsed(0);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!isActive) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-[#E8D5B7] text-[#8B4513]/70 text-xs font-medium transition-colors"
        data-testid="button-timer-toggle"
      >
        <Timer className="w-3.5 h-3.5" />
        <span>計時挑戰</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#FF8C00] to-[#FF6B6B] rounded-2xl p-4 text-white shadow-lg shadow-[#FF6B6B]/20">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-white/70 text-xs">計時挑戰模式</p>
            <p className="text-3xl font-bold font-mono tabular-nums">
              {formatTime(elapsed)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {bestTime !== null && (
            <div className="text-center mr-2">
              <div className="flex items-center gap-1 text-[#FFD700]">
                <Trophy className="w-3.5 h-3.5" />
                <span className="text-sm font-bold font-mono">{formatTime(bestTime)}</span>
              </div>
              <p className="text-white/50 text-[10px]">最佳紀錄</p>
            </div>
          )}

          <Button
            size="icon"
            variant="ghost"
            onClick={handleStartPause}
            className="h-9 w-9 rounded-full bg-white/20 text-white"
            data-testid="button-timer-start-pause"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleReset}
            className="h-9 w-9 rounded-full bg-white/20 text-white"
            data-testid="button-timer-reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <button
            onClick={onToggle}
            className="text-xs text-white/60 underline ml-1"
            data-testid="button-timer-close"
          >
            關閉
          </button>
        </div>
      </div>

      {gameComplete && isActive && (
        <div className="mt-3 bg-white/10 rounded-lg p-2 text-center animate-bounce-in">
          <p className="text-sm font-bold">
            完成時間：{formatTime(elapsed)}
            {bestTime !== null && elapsed <= bestTime && " - 新紀錄！"}
          </p>
        </div>
      )}

      <div className="mt-2 text-white/50 text-xs">
        已完成 {solvedCount}/{totalCount} 題
      </div>
    </div>
  );
}
