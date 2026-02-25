import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Award, X } from "lucide-react";

interface CertificateProps {
    open: boolean;
    onClose: () => void;
    studentName: string;
    className: string;
    title: string;
    score: number;
}

export function CertificateGenerator({
    open,
    onClose,
    studentName,
    className,
    title,
    score,
}: CertificateProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const generateCertificate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // A4 Landscape-ish ratio
        const w = 842;
        const h = 595;
        canvas.width = w;
        canvas.height = h;

        // 1. Background (Premium Paper Style)
        ctx.fillStyle = "#FFFDF5";
        ctx.fillRect(0, 0, w, h);

        // 2. Decorative Border
        const margin = 20;
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 15;
        ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

        ctx.strokeStyle = "#E60012";
        ctx.lineWidth = 2;
        ctx.strokeRect(margin + 15, margin + 15, w - (margin + 15) * 2, h - (margin + 15) * 2);

        // 3. Corner Decorations (Traditional Patterns)
        drawCorner(ctx, margin + 20, margin + 20, 0);
        drawCorner(ctx, w - margin - 20, margin + 20, Math.PI / 2);
        drawCorner(ctx, w - margin - 20, h - margin - 20, Math.PI);
        drawCorner(ctx, margin + 20, h - margin - 20, -Math.PI / 2);

        // 4. Header
        ctx.textAlign = "center";
        ctx.fillStyle = "#E60012";
        ctx.font = "bold 48px 'Noto Sans TC', serif";
        ctx.fillText("榮 譽 獎 狀", w / 2, 120);

        // 5. Content
        ctx.fillStyle = "#8B4513";
        ctx.font = "24px 'Noto Sans TC', sans-serif";
        ctx.fillText(`石門國小 2026 元宵猜燈謎活動`, w / 2, 170);

        // Main Text
        ctx.font = "bold 32px 'Noto Sans TC', sans-serif";
        ctx.fillText(`${className}  ${studentName} 同學`, w / 2, 250);

        ctx.font = "24px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "left";
        const textX = 150;
        ctx.fillText("表現優異，在本次活動中展現卓越的智慧與毅力，", textX, 310);
        ctx.fillText(`不僅獲得總分 ${score} 分的高分，更榮獲`, textX, 350);

        ctx.textAlign = "center";
        ctx.fillStyle = "#E60012";
        ctx.font = "bold 42px 'Noto Sans TC', serif";
        ctx.fillText(`「${title}」`, w / 2, 420);

        ctx.textAlign = "left";
        ctx.fillStyle = "#8B4513";
        ctx.font = "24px 'Noto Sans TC', sans-serif";
        ctx.fillText("之稱號，特頒此狀，以資鼓勵。", textX, 480);

        // 6. Footer (Unit & Date)
        ctx.textAlign = "right";
        ctx.font = "bold 20px 'Noto Sans TC', sans-serif";
        ctx.fillText("石門國小學務處", w - 100, 520);
        ctx.fillText("二零二六年初春", w - 100, 550);

        // 7. Stamp (Traditional Style)
        drawStamp(ctx, w - 240, 480);

        setImageUrl(canvas.toDataURL("image/png"));
    };

    const drawCorner = (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(50, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 50);
        ctx.stroke();
        ctx.restore();
    };

    const drawStamp = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        ctx.save();
        ctx.strokeStyle = "rgba(230, 0, 18, 0.7)";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, 70, 70);
        ctx.fillStyle = "rgba(230, 0, 18, 0.7)";
        ctx.font = "bold 18px 'Noto Sans TC', serif";
        ctx.textAlign = "center";
        ctx.fillText("石門", x + 35, y + 30);
        ctx.fillText("學務", x + 35, y + 55);
        ctx.restore();
    };

    useEffect(() => {
        if (open) {
            setTimeout(generateCertificate, 100);
        } else {
            setImageUrl(null);
        }
    }, [open]);

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement("a");
        link.download = `石門國小猜燈謎獎狀_${studentName}.png`;
        link.href = imageUrl;
        link.click();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-[#FFFDF5] border-2 border-[#FFD700] rounded-2xl p-6">
                <DialogTitle className="text-xl font-bold text-[#8B4513] mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-[#E60012]" />
                    你的專屬數位獎狀
                </DialogTitle>
                <DialogDescription className="sr-only">
                    顯示您的數位個人獎狀。
                </DialogDescription>

                <canvas ref={canvasRef} className="hidden" />

                <div className="space-y-6">
                    {imageUrl ? (
                        <>
                            <div className="border shadow-lg rounded-lg overflow-hidden relative group">
                                <img src={imageUrl} alt="數位獎狀" className="w-full" />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={handleDownload}
                                    className="flex-1 h-12 rounded-xl bg-[#E60012] text-white font-bold"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    下載獎狀
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-xl border-2 border-[#E8D5B7] text-[#8B4513]"
                                >
                                    <X className="w-5 h-5 mr-2" />
                                    關閉
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="h-60 flex items-center justify-center">
                            <Award className="w-12 h-12 text-[#E60012] animate-pulse" />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
