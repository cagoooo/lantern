import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star, RotateCcw, PartyPopper, Share2 } from "lucide-react";

interface CompletionModalProps {
  open: boolean;
  score: number;
  total: number;
  onReset: () => void;
  onClose: () => void;
  onShare?: () => void;
}

export function CompletionModal({
  open,
  score,
  total,
  onReset,
  onClose,
  onShare,
}: CompletionModalProps) {
  const maxScore = total * 10;
  const percentage = Math.round((score / maxScore) * 100);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-[#FFF8E7] to-[#FFF0C8] border-2 border-[#FFD700] rounded-2xl p-0 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#E60012]/10 to-transparent" />

          <div className="relative p-6 sm:p-8 text-center">
            <div className="mb-4 animate-bounce-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] shadow-lg shadow-[#FFD700]/30">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#E60012] mb-2">
              恭喜完成！
            </h2>
            <p className="text-[#8B4513]/70 mb-6">
              你已經猜完所有燈謎了！
            </p>

            <div className="bg-white/60 rounded-2xl p-5 mb-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#8B4513]/70 flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#FFD700]" />
                  總得分
                </span>
                <span className="text-2xl font-bold text-[#E60012]">
                  {score} <span className="text-base text-[#8B4513]/40">/ {maxScore}</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#8B4513]/70 flex items-center gap-2">
                  <PartyPopper className="w-4 h-4 text-[#FF6B6B]" />
                  正確率
                </span>
                <span className="text-2xl font-bold text-[#FFD700]">{percentage}%</span>
              </div>
            </div>

            <div className="mb-6">
              {percentage === 100 ? (
                <p className="text-lg font-bold text-[#E60012]">
                  太厲害了！全部一次就答對！
                </p>
              ) : percentage >= 70 ? (
                <p className="text-lg font-bold text-[#FF8C00]">
                  很棒喔！你是燈謎小高手！
                </p>
              ) : (
                <p className="text-lg font-bold text-[#8B4513]">
                  繼續加油，下次會更好！
                </p>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={onReset}
                className="flex-1 h-12 rounded-xl bg-[#E60012] text-white font-bold"
                data-testid="button-play-again"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                再玩一次
              </Button>
              {onShare && (
                <Button
                  onClick={onShare}
                  className="flex-1 h-12 rounded-xl bg-[#FFD700] text-[#8B4513] font-bold"
                  data-testid="button-share-from-modal"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  分享成績
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-10 rounded-xl border-2 border-[#E8D5B7] text-[#8B4513]/60 text-sm"
                data-testid="button-close-modal"
              >
                關閉
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
