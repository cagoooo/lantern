import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Calendar, Clock, Download } from "lucide-react";
import QRCode from "qrcode";

interface EventControlProps {
  open: boolean;
  onClose: () => void;
}

const EVENT_DATE = new Date("2026-03-03T08:00:00+08:00");
const EVENT_END = new Date("2026-03-03T17:00:00+08:00");

export function EventControl({ open, onClose }: EventControlProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      const url = "https://cagoooo.github.io/lantern/";
      QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        color: { dark: "#E60012", light: "#FFFFFF" },
      }).then(setQrDataUrl).catch(() => { });
    }
  }, [open]);

  const isBeforeEvent = now < EVENT_DATE;
  const isDuringEvent = now >= EVENT_DATE && now <= EVENT_END;
  const isAfterEvent = now > EVENT_END;

  const getCountdown = () => {
    if (!isBeforeEvent) return null;
    const diff = EVENT_DATE.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const countdown = getCountdown();

  const generatePoster = () => {
    const canvas = canvasRef.current;
    if (!canvas || !qrDataUrl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 600;
    const h = 900;
    canvas.width = w;
    canvas.height = h;

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#E60012");
    gradient.addColorStop(0.4, "#CC0010");
    gradient.addColorStop(1, "#8B0000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255, 215, 0, 0.08)";
    ctx.font = "bold 160px serif";
    ctx.textAlign = "center";
    ctx.fillText("\u798F", w / 2, 180);

    ctx.fillStyle = "#FFD700";
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 3;
    roundRect(ctx, 30, 30, w - 60, h - 60, 15);
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 52px 'Noto Sans TC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("\u5143\u5BB5\u731C\u71C8\u8B0E", w / 2, 120);

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 24px 'Noto Sans TC', sans-serif";
    ctx.fillText("2026 \u77F3\u9580\u570B\u5C0F", w / 2, 160);

    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    roundRect(ctx, 60, 190, w - 120, 70, 10);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "500 20px 'Noto Sans TC', sans-serif";
    ctx.fillText("\u6D3B\u52D5\u65E5\u671F\uFF1A2026\u5E74 3\u6708 3\u65E5\uFF08\u4E8C\uFF09", w / 2, 225);
    ctx.font = "400 16px 'Noto Sans TC', sans-serif";
    ctx.fillText("學務處將舉行猜燈謎活動 🧧✨🏮", w / 2, 250);

    const qrImg = new Image();
    qrImg.onload = () => {
      const qrSize = 240;
      const qrX = (w - qrSize) / 2;
      const qrY = 300;

      ctx.fillStyle = "#FFFFFF";
      roundRect(ctx, qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 15);
      ctx.fill();

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 22px 'Noto Sans TC', sans-serif";
      ctx.fillText("\u638C\u6A5F\u63CF\u63CF\u770B\uFF0C\u958B\u59CB\u731C\u71C8\u8B0E\uFF01", w / 2, qrY + qrSize + 60);

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "400 14px 'Noto Sans TC', sans-serif";
      ctx.fillText("https://cagoooo.github.io/lantern/", w / 2, qrY + qrSize + 90);

      const features = ["\u5341\u9053\u8DA3\u5473\u71C8\u8B0E", "\u5373\u6642\u8A08\u5206", "\u6311\u6230\u8A08\u6642", "\u6210\u7E3E\u5206\u4EAB"];
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      roundRect(ctx, 60, 680, w - 120, 50, 10);
      ctx.fill();

      ctx.fillStyle = "#FFD700";
      ctx.font = "400 15px 'Noto Sans TC', sans-serif";
      ctx.fillText(features.join("  \u2022  "), w / 2, 710);

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "400 13px 'Noto Sans TC', sans-serif";
      ctx.fillText("石門國小學務處 敬邀 ✨🏮", w / 2, h - 50);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "shimen-riddle-qr-poster.png";
      link.href = dataUrl;
      link.click();
    };
    qrImg.src = qrDataUrl;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#FFF8E7] border-2 border-[#FFD700] rounded-2xl p-5">
        <DialogTitle className="sr-only">活動資訊</DialogTitle>
        <DialogDescription className="sr-only">
          查看石門國小元宵猜燈謎網站的活動時間、地點與 QR Code 資訊。
        </DialogDescription>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E60012]" />
              活動資訊
            </h3>
          </div>

          <div
            className={`rounded-xl p-4 text-center ${isDuringEvent
              ? "bg-green-50 border border-green-200"
              : isBeforeEvent
                ? "bg-[#FFF0C8] border border-[#FFD700]/30"
                : "bg-gray-50 border border-gray-200"
              }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium text-[#8B4513]">
                {isDuringEvent
                  ? "活動進行中"
                  : isBeforeEvent
                    ? "活動倒數計時"
                    : "活動已結束"}
              </span>
            </div>

            {isDuringEvent && (
              <div className="text-2xl font-bold text-green-600 animate-glow">
                歡迎參加猜燈謎！
              </div>
            )}

            {isBeforeEvent && countdown && (
              <div className="flex items-center justify-center gap-3 mt-2">
                {[
                  { value: countdown.days, label: "天" },
                  { value: countdown.hours, label: "時" },
                  { value: countdown.minutes, label: "分" },
                  { value: countdown.seconds, label: "秒" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="bg-[#E60012] text-white rounded-lg w-14 h-14 flex items-center justify-center text-2xl font-bold font-mono">
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <span className="text-xs text-[#8B4513]/60 mt-1">{item.label}</span>
                  </div>
                ))}
              </div>
            )}

            {isAfterEvent && (
              <p className="text-gray-500 text-sm">
                感謝大家的參與！明年再見！
              </p>
            )}

            <p className="text-xs text-[#8B4513]/50 mt-3">
              活動日期：2026 年 3 月 3 日（二）
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-[#E60012]" />
              <span className="font-bold text-[#8B4513]">活動 QR Code</span>
            </div>

            {qrDataUrl && (
              <div className="inline-block bg-white rounded-xl p-4 border border-[#E8D5B7] shadow-sm">
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                  data-testid="img-qr-code"
                />
              </div>
            )}

            <p className="text-xs text-[#8B4513]/50">
              掃描 QR Code 即可開始猜燈謎
            </p>
          </div>

          <Button
            onClick={generatePoster}
            className="w-full h-11 rounded-xl bg-[#E60012] text-white font-bold"
            data-testid="button-download-poster"
          >
            <Download className="w-4 h-4 mr-2" />
            下載 QR Code 海報
          </Button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
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
