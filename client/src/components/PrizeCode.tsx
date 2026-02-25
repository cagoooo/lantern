import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Download, PartyPopper, Award } from "lucide-react";
import { loadLocalProfile } from "@/lib/gameStore";

interface PrizeCodeProps {
  open: boolean;
  onClose: () => void;
  score: number;
  solvedCount: number;
  total: number;
  onShowCertificate?: () => void;
}

function generatePrizeCode(uid: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = ((hash << 5) - hash) + uid.charCodeAt(i);
    hash |= 0;
  }
  let code = "";
  let h = Math.abs(hash);
  for (let i = 0; i < 8; i++) {
    code += chars[h % chars.length];
    h = Math.floor(h / chars.length) + (i + 1) * 7;
  }
  return code.slice(0, 4) + "-" + code.slice(4);
}

export function PrizeCode({ open, onClose, score, solvedCount, total, onShowCertificate }: PrizeCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prizeCode, setPrizeCode] = useState("");
  const profile = loadLocalProfile();

  useEffect(() => {
    if (!open) return;
    const uid = profile?.uid || `anon-${Date.now()}`;
    setPrizeCode(generatePrizeCode(uid));
  }, [open]);

  useEffect(() => {
    if (!open || !prizeCode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;

    const qrData = `SHIMEN2026-${prizeCode}-${score}`;
    drawSimpleQR(ctx, qrData, size);
  }, [open, prizeCode, score]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const downloadCanvas = document.createElement("canvas");
    downloadCanvas.width = 400;
    downloadCanvas.height = 500;
    const dCtx = downloadCanvas.getContext("2d");
    if (!dCtx) return;

    dCtx.fillStyle = "#FFF8E7";
    dCtx.fillRect(0, 0, 400, 500);

    dCtx.fillStyle = "#E60012";
    dCtx.fillRect(0, 0, 400, 60);
    dCtx.font = "bold 24px 'Noto Sans TC', sans-serif";
    dCtx.fillStyle = "white";
    dCtx.textAlign = "center";
    dCtx.fillText("🏮 石門國小猜燈謎 🏮", 200, 40);

    dCtx.font = "bold 20px 'Noto Sans TC', sans-serif";
    dCtx.fillStyle = "#8B4513";
    dCtx.fillText("兌獎憑證", 200, 100);

    dCtx.drawImage(canvas, 100, 120, 200, 200);

    dCtx.font = "bold 28px monospace";
    dCtx.fillStyle = "#E60012";
    dCtx.fillText(prizeCode, 200, 360);

    dCtx.font = "16px 'Noto Sans TC', sans-serif";
    dCtx.fillStyle = "#8B4513";
    dCtx.fillText(`${profile?.nickname || "未填姓名"} | ${profile?.className || ""} | 得分 ${score}`, 200, 400);

    dCtx.font = "12px 'Noto Sans TC', sans-serif";
    dCtx.fillStyle = "#8B4513AA";
    dCtx.fillText("2026 元宵猜燈謎活動 | 請出示此憑證兌換獎品", 200, 440);
    dCtx.fillText(`答對 ${solvedCount}/${total} 題`, 200, 460);

    const link = document.createElement("a");
    link.download = `燈謎兌獎-${prizeCode}.png`;
    link.href = downloadCanvas.toDataURL("image/png");
    link.click();
  };

  const allSolved = solvedCount >= total;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-gradient-to-b from-[#FFF8E7] to-[#FFF0C8] border-2 border-[#FFD700] rounded-2xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">兌獎碼</DialogTitle>
        <DialogDescription className="sr-only">
          顯示你的專屬兌獎碼與相關成績資訊。
        </DialogDescription>

        <div className="bg-gradient-to-r from-[#E60012] to-[#CC0010] p-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-2">
            {allSolved ? <PartyPopper className="w-7 h-7 text-[#FFD700]" /> : <Gift className="w-7 h-7 text-white" />}
          </div>
          <h2 className="text-xl font-bold text-white">
            {allSolved ? "恭喜全部通關！" : "獎品兌換"}
          </h2>
        </div>

        <div className="p-5 text-center space-y-4">
          {allSolved ? (
            <>
              <p className="text-sm text-[#8B4513]/70">
                你的專屬兌獎碼，請出示給老師掃描
              </p>

              <canvas
                ref={canvasRef}
                className="mx-auto border-4 border-[#FFD700] rounded-lg"
                data-testid="prize-qr-code"
              />

              <div className="bg-white/80 rounded-xl p-3">
                <p className="text-xs text-[#8B4513]/50 mb-1">兌獎碼</p>
                <p className="text-2xl font-bold text-[#E60012] tracking-wider font-mono" data-testid="prize-code-text">
                  {prizeCode}
                </p>
              </div>

              <div className="text-sm text-[#8B4513]/60 space-y-1">
                <p>{profile?.nickname || "未填姓名"} | {profile?.className || "未登入"}</p>
                <p>得分：{score}分 | 答對 {solvedCount}/{total} 題</p>
              </div>

              <Button
                onClick={handleDownload}
                className="w-full h-10 rounded-xl bg-[#FFD700] text-[#8B4513] font-bold"
                data-testid="button-download-prize"
              >
                <Download className="w-4 h-4 mr-2" />
                下載兌獎圖片
              </Button>

              {onShowCertificate && (
                <Button
                  onClick={onShowCertificate}
                  variant="outline"
                  className="w-full h-10 rounded-xl border-2 border-[#FFD700] text-[#8B4513] font-bold"
                >
                  <Award className="w-4 h-4 mr-2 text-[#E60012]" />
                  查看榮譽獎狀
                </Button>
              )}
            </>
          ) : (
            <div className="py-6 space-y-3">
              <Gift className="w-12 h-12 text-[#8B4513]/30 mx-auto" />
              <p className="text-[#8B4513]/70">
                答對全部 {total} 題才能獲得兌獎碼喔！
              </p>
              <p className="text-sm text-[#8B4513]/50">
                目前進度：{solvedCount}/{total} 題
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function drawSimpleQR(ctx: CanvasRenderingContext2D, data: string, size: number) {
  const cellCount = 21;
  const cellSize = size / cellCount;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "black";

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash |= 0;
  }

  function drawFinderPattern(x: number, y: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBlack =
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        if (isBlack) {
          ctx.fillRect((x + c) * cellSize, (y + r) * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(cellCount - 7, 0);
  drawFinderPattern(0, cellCount - 7);

  let seed = Math.abs(hash);
  for (let r = 0; r < cellCount; r++) {
    for (let c = 0; c < cellCount; c++) {
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= cellCount - 8) ||
        (r >= cellCount - 8 && c < 8)
      ) continue;

      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      if (seed % 3 !== 0) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }
}
