import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, X } from "lucide-react";

interface ShareCardProps {
  open: boolean;
  onClose: () => void;
  score: number;
  total: number;
  solvedCount: number;
  elapsedTime?: number;
  titles?: string[];
  badges?: string[];
}

export function ShareCard({
  open,
  onClose,
  score,
  total,
  solvedCount,
  elapsedTime,
  titles = [],
  badges = [],
}: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const maxScore = total * 10;
  const percentage = Math.round((score / maxScore) * 100);

  const generateImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 600;
    const h = 800;
    canvas.width = w;
    canvas.height = h;

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#E60012");
    gradient.addColorStop(0.35, "#CC0010");
    gradient.addColorStop(0.35, "#FFF8E7");
    gradient.addColorStop(1, "#FFE8B8");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255, 215, 0, 0.15)";
    ctx.font = "bold 120px serif";
    ctx.fillText("\u798F", 30, 140);
    ctx.fillStyle = "rgba(255, 215, 0, 0.1)";
    ctx.font = "bold 100px serif";
    ctx.fillText("\u6625", 430, 200);

    drawLantern(ctx, 80, 40, 0.6);
    drawLantern(ctx, 520, 50, 0.5);
    drawLantern(ctx, 300, 20, 0.4);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 42px 'Noto Sans TC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("\u5143\u5BB5\u731C\u71C8\u8B0E", w / 2, 100);

    ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
    ctx.font = "500 18px 'Noto Sans TC', sans-serif";
    ctx.fillText("2026 \u77F3\u9580\u570B\u5C0F Lantern Festival", w / 2, 135);

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 20px 'Noto Sans TC', sans-serif";
    ctx.fillText("\u6210\u7E3E\u5361", w / 2, 190);

    const cardY = 220;
    const cardH = 300;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    roundRect(ctx, 40, cardY, w - 80, cardH, 20);
    ctx.fill();

    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    roundRect(ctx, 40, cardY, w - 80, cardH, 20);
    ctx.stroke();

    ctx.fillStyle = "#8B4513";
    ctx.font = "500 16px 'Noto Sans TC', sans-serif";
    ctx.fillText("\u7B54\u5C0D\u984C\u6578", w / 2, cardY + 45);

    ctx.fillStyle = "#E60012";
    ctx.font = "bold 64px 'Noto Sans TC', sans-serif";
    ctx.fillText(`${solvedCount} / ${total}`, w / 2, cardY + 110);

    ctx.fillStyle = "#8B4513";
    ctx.font = "500 16px 'Noto Sans TC', sans-serif";

    const col1 = w / 2 - 100;
    const col2 = w / 2 + 100;
    const row = cardY + 170;

    ctx.fillText("\u7E3D\u5F97\u5206", col1, row);
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 36px 'Noto Sans TC', sans-serif";
    ctx.fillText(`${score}`, col1, row + 45);

    ctx.fillStyle = "#8B4513";
    ctx.font = "500 16px 'Noto Sans TC', sans-serif";
    ctx.fillText("\u6B63\u78BA\u7387", col2, row);
    ctx.fillStyle = "#FF6B6B";
    ctx.font = "bold 36px 'Noto Sans TC', sans-serif";
    ctx.fillText(`${percentage}%`, col2, row + 45);

    if (elapsedTime !== undefined && elapsedTime > 0) {
      const m = Math.floor(elapsedTime / 60);
      const s = elapsedTime % 60;
      const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      ctx.fillStyle = "#8B4513";
      ctx.font = "500 14px 'Noto Sans TC', sans-serif";
      ctx.fillText(`\u5B8C\u6210\u6642\u9593\uFF1A${timeStr}`, w / 2, cardY + cardH - 15);
    }

    const msgY = cardY + cardH + 50;
    let message = "";
    if (percentage === 100) {
      message = "\u592A\u5389\u5BB3\u4E86\uFF01\u5168\u90E8\u7B54\u5C0D\uFF01";
    } else if (percentage >= 70) {
      message = "\u5F88\u68D2\u55CE\uFF01\u71C8\u8B0E\u5C0F\u9AD8\u624B\uFF01";
    } else if (percentage >= 50) {
      message = "\u4E0D\u932F\u55CE\uFF01\u7E7C\u7E8C\u52A0\u6CB9\uFF01";
    } else {
      message = "\u518D\u63A5\u518D\u53B2\uFF0C\u4E0B\u6B21\u66F4\u597D\uFF01";
    }

    ctx.fillStyle = "#E60012";
    ctx.font = "bold 28px 'Noto Sans TC', sans-serif";
    ctx.fillText(message, w / 2, msgY);

    // 繪製稱號與徽章
    if (titles.length > 0 || badges.length > 0) {
      ctx.fillStyle = "#8B4513";
      ctx.font = "bold 16px 'Noto Sans TC', sans-serif";
      let achievementY = msgY + 40;

      if (titles.length > 0) {
        ctx.fillText(`稱號：${titles.join(" | ")}`, w / 2, achievementY);
        achievementY += 25;
      }

      if (badges.length > 0) {
        ctx.fillStyle = "#E60012";
        ctx.font = "bold 14px 'Noto Sans TC', sans-serif";
        ctx.fillText(`獲得勳章：${badges.map(b => `【${b}】`).join(" ")}`, w / 2, achievementY);
      }
    }

    drawStars(ctx, w / 2, msgY + 50, solvedCount, total);

    ctx.fillStyle = "rgba(139, 69, 19, 0.4)";
    ctx.font = "400 14px 'Noto Sans TC', sans-serif";
    ctx.fillText("石門國小 2026 元宵猜燈謎網站", w / 2, h - 40);
    ctx.fillText("學務處將舉行猜燈謎活動 🧧✨🏮", w / 2, h - 18);

    const dataUrl = canvas.toDataURL("image/png");
    setImageUrl(dataUrl);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.download = "shimen-riddle-score.png";
    link.href = imageUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!imageUrl) return;

    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], "shimen-riddle-score.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "2026 石門國小元宵猜燈謎成績",
          text: `我在石門國小元宵猜燈謎得了 ${score} 分！`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setImageUrl(null);
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-md bg-[#FFF8E7] border-2 border-[#FFD700] rounded-2xl p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-[#8B4513]">
              {imageUrl ? "你的成績卡" : "生成成績卡"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              製作並分享你的元宵猜燈謎成績。
            </DialogDescription>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {imageUrl ? (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-[#E8D5B7] shadow-md">
                <img
                  src={imageUrl}
                  alt="成績卡"
                  className="w-full"
                  data-testid="img-share-card"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleShare}
                  className="flex-1 h-11 rounded-xl bg-[#E60012] text-white font-bold"
                  data-testid="button-share"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-2 border-[#E8D5B7] text-[#8B4513] font-bold"
                  data-testid="button-download"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下載
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 py-4">
              <p className="text-[#8B4513]/70 text-sm">
                將你的成績製作成精美的圖片，可以分享給家人和朋友看！
              </p>
              <Button
                onClick={generateImage}
                className="h-12 px-8 rounded-xl bg-[#E60012] text-white font-bold text-base"
                data-testid="button-generate-card"
              >
                生成成績卡
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawLantern(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 15);
  ctx.stroke();

  ctx.fillStyle = "#FFD700";
  ctx.fillRect(-6, 12, 12, 5);

  ctx.fillStyle = "rgba(255, 215, 0, 0.6)";
  ctx.beginPath();
  ctx.ellipse(0, 46, 20, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 165, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(0, 46, 14, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFD700";
  ctx.fillRect(-6, 72, 12, 4);

  ctx.restore();
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  filled: number,
  total: number
) {
  const starSize = 14;
  const gap = 6;
  const totalWidth = total * (starSize * 2) + (total - 1) * gap;
  let startX = cx - totalWidth / 2 + starSize;

  for (let i = 0; i < total; i++) {
    const x = startX + i * (starSize * 2 + gap);
    ctx.fillStyle = i < filled ? "#FFD700" : "rgba(139, 69, 19, 0.15)";
    drawStar(ctx, x, cy, 5, starSize, starSize / 2);
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  ctx.fill();
}
