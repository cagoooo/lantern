import { FC } from "react";

export const FestiveLantern: FC<{ className?: string }> = ({ className }) => {
    return (
        <svg
            width="24"
            height="32"
            viewBox="0 0 40 60"
            className={`drop-shadow-sm ${className || ""}`}
        >
            <rect x="18" y="0" width="4" height="8" fill="#FFD700" />
            <ellipse cx="20" cy="30" rx="16" ry="20" fill="#E60012" />
            <path
                d="M4,30 Q20,10 36,30 Q20,50 4,30"
                fill="none"
                stroke="#FFD700"
                strokeWidth="1"
                opacity="0.3"
            />
            <rect x="15" y="50" width="10" height="4" fill="#FFD700" />
            <line x1="20" y1="54" x2="20" y2="60" stroke="#FF6B6B" strokeWidth="2" />
        </svg>
    );
};

export const FestiveDecorations: FC = () => {
    return (
        <div className="flex items-center justify-center gap-4 text-2xl animate-bounce-slow">
            <span>🧧</span>
            <FestiveLantern />
            <span>🏮</span>
            <FestiveLantern />
            <span>✨</span>
        </div>
    );
};
