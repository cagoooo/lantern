import React, { useRef, useEffect, useCallback } from 'react';

interface JoystickState {
    dx: number;
    dy: number;
}

interface VirtualJoystickProps {
    onMove: (state: JoystickState) => void;
    onLook: (dx: number, dy: number) => void;
}

export function VirtualJoystick({ onMove, onLook }: VirtualJoystickProps) {
    // Left joystick - movement
    const leftBase = useRef<HTMLDivElement>(null);
    const leftKnob = useRef<HTMLDivElement>(null);
    const leftTouch = useRef<number | null>(null);
    const leftOrigin = useRef({ x: 0, y: 0 });

    // Right area - look
    const rightStartPos = useRef({ x: 0, y: 0 });
    const rightTouch = useRef<number | null>(null);

    const maxRadius = 45;

    const handleLeftStart = useCallback((e: React.TouchEvent) => {
        const touch = e.changedTouches[0];
        leftTouch.current = touch.identifier;
        leftOrigin.current = { x: touch.clientX, y: touch.clientY };
    }, []);

    const handleLeftMove = useCallback((e: TouchEvent) => {
        if (leftTouch.current === null) return;
        let touch: Touch | null = null;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === leftTouch.current) {
                touch = e.changedTouches[i];
                break;
            }
        }
        if (!touch) return;

        let dx = touch.clientX - leftOrigin.current.x;
        let dy = touch.clientY - leftOrigin.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
        }

        if (leftKnob.current) {
            leftKnob.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        }

        onMove({ dx: dx / maxRadius, dy: dy / maxRadius });
    }, [onMove]);

    const handleLeftEnd = useCallback((e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === leftTouch.current) {
                leftTouch.current = null;
                if (leftKnob.current) {
                    leftKnob.current.style.transform = 'translate(-50%, -50%)';
                }
                onMove({ dx: 0, dy: 0 });
                break;
            }
        }
    }, [onMove]);

    // Right side - look control
    const handleRightStart = useCallback((e: React.TouchEvent) => {
        const touch = e.changedTouches[0];
        rightTouch.current = touch.identifier;
        rightStartPos.current = { x: touch.clientX, y: touch.clientY };
    }, []);

    const handleRightMove = useCallback((e: TouchEvent) => {
        if (rightTouch.current === null) return;
        let touch: Touch | null = null;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === rightTouch.current) {
                touch = e.changedTouches[i];
                break;
            }
        }
        if (!touch) return;

        const dx = touch.clientX - rightStartPos.current.x;
        const dy = touch.clientY - rightStartPos.current.y;
        rightStartPos.current = { x: touch.clientX, y: touch.clientY };
        onLook(dx * 0.003, dy * 0.003);
    }, [onLook]);

    const handleRightEnd = useCallback((e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === rightTouch.current) {
                rightTouch.current = null;
                break;
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('touchmove', handleLeftMove, { passive: false });
        window.addEventListener('touchend', handleLeftEnd);
        window.addEventListener('touchmove', handleRightMove, { passive: false });
        window.addEventListener('touchend', handleRightEnd);
        return () => {
            window.removeEventListener('touchmove', handleLeftMove);
            window.removeEventListener('touchend', handleLeftEnd);
            window.removeEventListener('touchmove', handleRightMove);
            window.removeEventListener('touchend', handleRightEnd);
        };
    }, [handleLeftMove, handleLeftEnd, handleRightMove, handleRightEnd]);

    return (
        <div className="fixed inset-0 pointer-events-none z-30 md:hidden">
            {/* 左側搖桿 */}
            <div
                className="absolute bottom-16 left-8 pointer-events-auto"
                onTouchStart={handleLeftStart}
            >
                <div
                    ref={leftBase}
                    style={{
                        width: 110,
                        height: 110,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.12)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        position: 'relative',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <div
                        ref={leftKnob}
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: 'rgba(230,0,18,0.75)',
                            border: '2px solid rgba(255,180,0,0.8)',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            boxShadow: '0 0 12px rgba(230,0,18,0.5)',
                            transition: 'transform 0.05s',
                        }}
                    />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                    移動
                </p>
            </div>

            {/* 右側視角滑動區 */}
            <div
                className="absolute bottom-0 right-0 pointer-events-auto"
                style={{
                    width: '55%',
                    height: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '24px 0 0 0',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}
                onTouchStart={handleRightStart}
            >
                <p style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 11,
                    position: 'absolute',
                    bottom: 12,
                    right: 16,
                }}>
                    👆 滑動旋轉視角
                </p>
            </div>
        </div>
    );
}
