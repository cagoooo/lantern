import { FC, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface FestiveEffectsProps {
    type: "fireworks" | "lanterns" | "both";
    active: boolean;
}

export const FestiveEffects: FC<FestiveEffectsProps> = ({ type, active }) => {
    const triggerFireworks = useCallback(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ["#E60012", "#FFD700", "#FFFFFF"]
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ["#E60012", "#FFD700", "#FFFFFF"]
            });
        }, 250);
    }, []);

    const triggerLanterns = useCallback(() => {
        const end = Date.now() + 2 * 1000;
        const colors = ["#FFD700", "#FF4500", "#E60012"];

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 90,
                spread: 45,
                origin: { x: Math.random(), y: 1 },
                colors: colors,
                gravity: -0.2, // Drift upwards
                scalar: 2,
                ticks: 200,
                zIndex: 100,
                shapes: ['circle']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }, []);

    useEffect(() => {
        if (active) {
            if (type === "fireworks" || type === "both") {
                triggerFireworks();
            }
            if (type === "lanterns" || type === "both") {
                triggerLanterns();
            }
        }
    }, [active, type, triggerFireworks, triggerLanterns]);

    return null;
};
