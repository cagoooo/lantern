import React, { useState, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { useLocation } from 'wouter';
import * as THREE from 'three';
import { ImmersiveWorld } from '@/components/ImmersiveWorld';
import { PlayerController } from '@/components/PlayerController';
import { VirtualJoystick } from '@/components/VirtualJoystick';
import {
    getRiddles,
    checkRiddleAnswer,
    loadGameState as loadFromFirestore,
    saveGameState as saveToFirestore,
    loadLocalProfile,
} from '@/lib/gameStore';
import { playCorrectSound, playWrongSound } from '@/lib/sounds';
import type { GameState } from '@shared/schema';

interface PublicRiddle {
    id: number;
    question: string;
    hint: string;
}

const LOCAL_KEY = 'shimen-riddle-game';
function loadLocalState(): GameState {
    try {
        const saved = localStorage.getItem(LOCAL_KEY);
        if (saved) return JSON.parse(saved);
    } catch { }
    return { currentRiddleIndex: 0, solvedRiddles: [], attempts: {}, score: 0 };
}

// 操作說明 Modal
function TutorialModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div
                className="relative max-w-md w-full mx-4 rounded-3xl overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #1a0a00 0%, #3d0d00 50%, #1a0a00 100%)',
                    border: '2px solid rgba(255,160,0,0.4)',
                    boxShadow: '0 0 60px rgba(230,0,18,0.3)',
                }}
            >
                {/* 標題 */}
                <div className="px-6 pt-6 pb-4 text-center border-b border-orange-900/40">
                    <div className="text-4xl mb-2">🏮</div>
                    <h2 className="text-xl font-bold text-amber-300">沉浸模式 — 操作說明</h2>
                    <p className="text-amber-200/60 text-sm mt-1">在虛擬操場中尋找隱藏的燈籠！</p>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* 桌機操作 */}
                    <div className="rounded-xl bg-white/5 p-4 border border-orange-900/30">
                        <p className="text-amber-300 font-semibold text-sm mb-2">💻 桌機操作</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-amber-100/80">
                            <span>🖱️ 點擊畫面</span><span>鎖定滑鼠 / 旋轉視角</span>
                            <span>⌨️ WASD / 方向鍵</span><span>前後左右移動</span>
                            <span>⌨️ [E] 鍵</span><span>與燈籠互動</span>
                            <span>⌨️ [ESC]</span><span>解除滑鼠鎖定</span>
                        </div>
                    </div>

                    {/* 手機操作 */}
                    <div className="rounded-xl bg-white/5 p-4 border border-orange-900/30">
                        <p className="text-amber-300 font-semibold text-sm mb-2">📱 手機操作</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-amber-100/80">
                            <span>🕹️ 左側搖桿</span><span>移動角色</span>
                            <span>👆 右側滑動</span><span>旋轉視角</span>
                            <span>🏮 點擊燈籠</span><span>觸發猜謎</span>
                        </div>
                    </div>

                    {/* 目標 */}
                    <div className="text-center text-xs text-amber-200/50">
                        走近發光燈籠（距離 3 公尺內）→ 按 [E] 或點擊 → 猜謎解鎖！
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-2xl font-bold text-white transition-all active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, #E60012, #FF6600)',
                            boxShadow: '0 4px 20px rgba(230,0,18,0.4)',
                        }}
                    >
                        🏮 開始探索！
                    </button>
                </div>
            </div>
        </div>
    );
}

// 猜謎 Modal
interface RiddleModalProps {
    riddle: PublicRiddle | null;
    riddleIndex: number;
    isSolved: boolean;
    onSubmit: (answer: string) => Promise<boolean>;
    onClose: () => void;
    attempts: number;
    solvedAnswer?: string;
}

function RiddleModal({ riddle, riddleIndex, isSolved, onSubmit, onClose, attempts, solvedAnswer }: RiddleModalProps) {
    const [answer, setAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [showHint, setShowHint] = useState(false);

    if (!riddle) return null;

    const handleSubmit = async () => {
        if (!answer.trim() || submitting) return;
        setSubmitting(true);
        const correct = await onSubmit(answer.trim());
        setFeedback(correct ? 'correct' : 'wrong');
        if (!correct) {
            setTimeout(() => { setFeedback(null); setSubmitting(false); }, 1200);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
            <div
                className="relative max-w-sm w-full rounded-3xl overflow-hidden"
                style={{
                    background: 'linear-gradient(160deg, #1a0000 0%, #3d0000 60%, #1a0a00 100%)',
                    border: `2px solid ${feedback === 'correct' ? 'rgba(255,215,0,0.6)' : feedback === 'wrong' ? 'rgba(255,60,60,0.5)' : 'rgba(255,120,0,0.4)'}`,
                    boxShadow: `0 0 50px ${feedback === 'correct' ? 'rgba(255,215,0,0.4)' : 'rgba(230,0,18,0.3)'}`,
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
            >
                <div className="px-5 pt-5 pb-4 text-center border-b border-red-900/40">
                    <div className="inline-flex items-center gap-2 bg-red-900/30 px-3 py-1 rounded-full mb-3">
                        <span className="text-amber-400 text-xs font-mono">燈籠 #{riddleIndex + 1}</span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-relaxed">
                        {riddle.question}
                    </h3>
                </div>

                <div className="px-5 py-4 space-y-3">
                    {isSolved ? (
                        <div className="text-center py-4">
                            <div className="text-4xl mb-2">🎉</div>
                            <p className="text-amber-300 font-bold">已解開！答案：{solvedAnswer}</p>
                        </div>
                    ) : (
                        <>
                            {showHint && (
                                <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 text-xs text-amber-200/80">
                                    💡 提示：{riddle.hint}
                                </div>
                            )}

                            {feedback === 'correct' ? (
                                <div className="text-center py-3 text-amber-300 font-bold animate-bounce">
                                    ✅ 答對了！燈籠點亮！
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                        placeholder="輸入謎底..."
                                        className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
                                        style={{
                                            background: 'rgba(255,255,255,0.08)',
                                            border: `1px solid ${feedback === 'wrong' ? 'rgba(255,80,80,0.6)' : 'rgba(255,160,0,0.3)'}`,
                                        }}
                                        autoFocus
                                    />
                                    {feedback === 'wrong' && (
                                        <p className="text-red-400 text-xs text-center animate-shake">
                                            ❌ 答錯了，再想想看！
                                        </p>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowHint(!showHint)}
                                            className="flex-1 py-2 rounded-xl text-xs text-amber-400/70 border border-amber-900/40 transition-all hover:bg-amber-900/20"
                                        >
                                            {showHint ? '隱藏提示' : '💡 提示'}
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting || !answer.trim()}
                                            className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                                            style={{ background: 'linear-gradient(135deg, #E60012, #FF6600)' }}
                                        >
                                            {submitting ? '⏳' : '提交答案'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all text-sm"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

// HUD 介面
interface HUDProps {
    solvedCount: number;
    total: number;
    score: number;
    onExit: () => void;
    nearbyLanternIndex: number | null;
}

function HUD({ solvedCount, total, score, onExit, nearbyLanternIndex }: HUDProps) {
    const progress = total > 0 ? solvedCount / total : 0;
    return (
        <>
            {/* 頂部資訊欄 */}
            <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🏮</span>
                    <div>
                        <div className="text-white font-bold text-sm">{solvedCount}/{total} 燈籠</div>
                        <div className="flex items-center gap-1 mt-0.5">
                            <div className="h-1.5 w-24 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${progress * 100}%`,
                                        background: 'linear-gradient(to right, #FF8800, #FFD700)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-amber-300 font-bold text-sm">⭐ {score} 分</div>
                    <button
                        onClick={onExit}
                        className="px-3 py-1 rounded-full text-xs text-white/70 border border-white/20 hover:bg-white/10 transition-all"
                    >
                        離開
                    </button>
                </div>
            </div>

            {/* 準星 (桌機用) */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10 hidden md:flex">
                <div className="relative">
                    <div className="w-4 h-px bg-white/50" />
                    <div className="w-px h-4 bg-white/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white/30" />
                </div>
            </div>

            {/* 底部「按 E 互動」提示 */}
            {nearbyLanternIndex !== null && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-none">
                    <div
                        className="px-4 py-2 rounded-full text-xs font-bold text-white"
                        style={{
                            background: 'rgba(230,0,18,0.7)',
                            border: '1px solid rgba(255,160,0,0.5)',
                            boxShadow: '0 0 20px rgba(230,0,18,0.4)',
                        }}
                    >
                        🏮 按 [E] 猜謎 · 燈籠 #{nearbyLanternIndex + 1}
                    </div>
                </div>
            )}
        </>
    );
}

export default function ImmersivePage() {
    const [, setLocation] = useLocation();
    const [riddles, setRiddles] = useState<PublicRiddle[]>([]);
    const [gameState, setGameState] = useState<GameState>(loadLocalState);
    const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1, 0));
    const [activeLanternIndex, setActiveLanternIndex] = useState<number | null>(null);
    const [nearbyLanternIndex, setNearbyLanternIndex] = useState<number | null>(null);
    const [solvedAnswers, setSolvedAnswers] = useState<Record<number, string>>({});
    const [showTutorial, setShowTutorial] = useState(true);
    const [mobileMove, setMobileMove] = useState({ dx: 0, dy: 0 });
    const [mobileLook, setMobileLook] = useState({ dx: 0, dy: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // 載入謎題和遊戲狀態
    useEffect(() => {
        Promise.all([getRiddles(), loadFromFirestore()]).then(([data, cloudState]) => {
            setRiddles(data);
            setGameState(cloudState);
            setIsLoading(false);
        }).catch(() => { setIsLoading(false); });
    }, []);

    // 儲存遊戲狀態
    useEffect(() => {
        if (!isLoading) saveToFirestore(gameState);
    }, [gameState, isLoading]);

    // 鍵盤 [E] 互動
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.code === 'KeyE' && nearbyLanternIndex !== null) {
                setActiveLanternIndex(nearbyLanternIndex);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [nearbyLanternIndex]);

    // 偵測靠近的燈籠（在 Home 原本是在 ImmersiveLantern 內，但這裡集中管理）
    const handlePositionUpdate = useCallback((pos: THREE.Vector3) => {
        setPlayerPosition(pos.clone());
    }, []);

    const handleLanternInteract = useCallback((index: number) => {
        setActiveLanternIndex(index);
    }, []);

    const handleAnswerSubmit = useCallback(async (answer: string): Promise<boolean> => {
        if (activeLanternIndex === null || !riddles[activeLanternIndex]) return false;
        const riddle = riddles[activeLanternIndex];
        if (gameState.solvedRiddles.includes(riddle.id)) return false;

        try {
            const data = await checkRiddleAnswer(riddle.id, answer);
            if (data.correct) {
                playCorrectSound();
                const result = data as { answer: string };
                setSolvedAnswers(prev => ({ ...prev, [riddle.id]: result.answer }));
                setGameState(prev => {
                    const newAttempts = { ...prev.attempts, [riddle.id]: (prev.attempts[riddle.id] || 0) + 1 };
                    const attemptCount = newAttempts[riddle.id];
                    const points = attemptCount === 1 ? 10 : attemptCount === 2 ? 7 : 5;
                    return {
                        ...prev,
                        solvedRiddles: [...prev.solvedRiddles, riddle.id],
                        attempts: newAttempts,
                        score: prev.score + points,
                    };
                });
                setTimeout(() => setActiveLanternIndex(null), 2000);
            } else {
                playWrongSound();
                setGameState(prev => ({
                    ...prev,
                    attempts: { ...prev.attempts, [riddle.id]: (prev.attempts[riddle.id] || 0) + 1 },
                }));
            }
            return data.correct;
        } catch {
            return false;
        }
    }, [activeLanternIndex, riddles, gameState.solvedRiddles]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#050510]">
                <div className="text-center space-y-4">
                    <div className="text-5xl animate-bounce">🏮</div>
                    <p className="text-amber-300 font-medium">正在載入虛擬操場...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#050510] overflow-hidden">
            {/* 操作說明 */}
            {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

            {/* HUD */}
            {!showTutorial && (
                <HUD
                    solvedCount={gameState.solvedRiddles.length}
                    total={riddles.length}
                    score={gameState.score}
                    onExit={() => setLocation('/')}
                    nearbyLanternIndex={nearbyLanternIndex}
                />
            )}

            {/* 猜謎 Modal */}
            {activeLanternIndex !== null && riddles[activeLanternIndex] && (
                <RiddleModal
                    riddle={riddles[activeLanternIndex]}
                    riddleIndex={activeLanternIndex}
                    isSolved={gameState.solvedRiddles.includes(riddles[activeLanternIndex].id)}
                    onSubmit={handleAnswerSubmit}
                    onClose={() => setActiveLanternIndex(null)}
                    attempts={gameState.attempts[riddles[activeLanternIndex].id] || 0}
                    solvedAnswer={solvedAnswers[riddles[activeLanternIndex].id]}
                />
            )}

            {/* 手機虛擬搖桿 */}
            {!showTutorial && (
                <VirtualJoystick
                    onMove={setMobileMove}
                    onLook={(dx, dy) => setMobileLook({ dx, dy })}
                />
            )}

            {/* 3D 場景 */}
            <Canvas
                shadows
                dpr={[1, 1.5]}
                camera={{ fov: 75, near: 0.1, far: 200 }}
                style={{ width: '100%', height: '100%' }}
                onClick={(e) => {
                    // 點擊空白處鎖定滑鼠（桌機）
                    (e.target as HTMLElement).requestPointerLock?.();
                }}
            >
                <Suspense fallback={null}>
                    <Physics
                        gravity={[0, -20, 0]}
                        defaultContactMaterial={{ friction: 0.01, restitution: 0.0 }}
                        broadphase="SAP"
                    >
                        <ImmersiveWorld
                            riddles={riddles}
                            solvedRiddles={gameState.solvedRiddles}
                            playerPosition={playerPosition}
                            onLanternInteract={handleLanternInteract}
                        />
                        {!showTutorial && (
                            <PlayerController
                                onPositionUpdate={handlePositionUpdate}
                                mobileMove={mobileMove}
                                mobileLook={mobileLook}
                            />
                        )}
                    </Physics>
                </Suspense>
            </Canvas>

            {/* 點擊提示（桌機，未鎖定時） */}
            {!showTutorial && (
                <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none hidden md:block"
                >
                    點擊畫面以鎖定滑鼠控制視角 · ESC 解除
                </div>
            )}
        </div>
    );
}
