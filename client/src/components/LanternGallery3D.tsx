import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text, PerspectiveCamera, OrbitControls, Environment, ContactShadows, Sky, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

interface LanternProps {
    position: [number, number, number];
    index: number;
    isSolved: boolean;
    onSelect: (index: number) => void;
    isActive: boolean;
    tilt: { x: number; y: number };
    timePhase: string;
}

function Lantern({ position, index, isSolved, onSelect, isActive, tilt, timePhase }: LanternProps) {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            // Base wobbling (gentle breeze)
            const time = state.clock.getElapsedTime();
            const wobble = Math.sin(time + index) * 0.05;

            // Dynamic tilt from Gyroscope/Mouse
            meshRef.current.rotation.z = wobble + (tilt.x * 0.15);
            meshRef.current.rotation.x = tilt.y * 0.15;

            // Subtle floating animation
            meshRef.current.position.y = position[1] + Math.sin(time * 0.5 + index) * 0.1;

            // Rotation based on hover (on Y axis)
            if (hovered || isActive) {
                meshRef.current.rotation.y += 0.02;
            } else {
                meshRef.current.rotation.y += 0.005;
            }
        }
    });

    return (
        <group position={position} ref={meshRef} onClick={() => onSelect(index)} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            {/* Lantern Body */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.5, 0.5, 0.8, 16]} />
                <meshStandardMaterial
                    color={isActive ? "#FF3333" : (isSolved ? "#FFD700" : "#8B0000")}
                    emissive={isActive ? "#FF0000" : (isSolved ? "#FFA500" : "#300000")}
                    emissiveIntensity={(hovered || isActive ? 4 : 1.2) * (timePhase === 'night' ? 1.5 : (timePhase === 'day' ? 0.8 : 1.1))}
                />
            </mesh>
            {/* Top/Bottom caps */}
            <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.55, 0.55, 0.1, 16]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[0, -0.45, 0]}>
                <cylinderGeometry args={[0.55, 0.55, 0.1, 16]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            {/* Stage Number */}
            <Text
                position={[0, 0, 0.52]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {index + 1}
            </Text>

            {/* Glowing Aura if active or hovered */}
            {(hovered || isActive) && (
                <pointLight intensity={2} distance={3} color={isSolved ? "yellow" : "red"} />
            )}
        </group>
    );
}

interface LanternGallery3DProps {
    totalStages: number;
    solvedRiddles: number[];
    currentStage: number;
    onSelect: (index: number) => void;
    riddles: any[];
}

export function LanternGallery3D({ totalStages, solvedRiddles, currentStage, onSelect, riddles }: LanternGallery3DProps) {
    const radius = 4.5;
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    // Dynamic Time System
    const timePhase = useMemo(() => {
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const time = hour + minutes / 60;

        if (time >= 5 && time < 8.5) return 'morning';   // 05:00 - 08:30
        if (time >= 8.5 && time < 16.5) return 'day';    // 08:30 - 16:30
        if (time >= 16.5 && time < 19) return 'sunset';   // 16:30 - 19:00
        return 'night';                                  // 19:00 - 05:00
    }, []);

    const sceneConfig = useMemo(() => {
        switch (timePhase) {
            case 'morning':
                return {
                    ambientOpacity: 0.5,
                    skyTurbidity: 10,
                    skyRayleigh: 4,
                    sunPosition: [100, 10, 100],
                    env: 'dawn',
                    fog: '#cad9e8',
                    lightColor: '#b0c4de'
                };
            case 'day':
                return {
                    ambientOpacity: 0.8,
                    skyTurbidity: 0.1,
                    skyRayleigh: 0.5,
                    sunPosition: [100, 100, 20],
                    env: 'park',
                    fog: null,
                    lightColor: '#ffffff'
                };
            case 'sunset':
                return {
                    ambientOpacity: 0.6,
                    skyTurbidity: 5,
                    skyRayleigh: 10,
                    sunPosition: [100, 2, -100],
                    env: 'sunset',
                    fog: '#ff7e33',
                    lightColor: '#ff8c00'
                };
            default: // night
                return {
                    ambientOpacity: 0.2,
                    skyTurbidity: 20,
                    skyRayleigh: 2,
                    sunPosition: [0, -10, 0],
                    env: 'night',
                    fog: '#050505',
                    lightColor: '#1a1a2e'
                };
        }
    }, [timePhase]);

    // Handle Gyroscope and Mouse for tilting effect
    useEffect(() => {
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.beta !== null && e.gamma !== null) {
                // Normalize tilt
                setTilt({
                    x: THREE.MathUtils.clamp(e.gamma / 30, -1, 1),
                    y: THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1)
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (window.innerWidth > 768) { // Only mouse tilt on Desktop
                setTilt({
                    x: (e.clientX / window.innerWidth - 0.5) * 2,
                    y: (e.clientY / window.innerHeight - 0.5) * 2
                });
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        window.addEventListener('mousemove', handleMouseMove);

        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timer);
        };
    }, []);

    const lanternPositions = useMemo(() => {
        return Array.from({ length: totalStages }).map((_, i) => {
            const angle = (i / totalStages) * Math.PI * 2;
            return [
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            ] as [number, number, number];
        });
    }, [totalStages]);

    return (
        <div className="w-full h-[400px] md:h-[600px] bg-black/10 rounded-3xl overflow-hidden relative border border-[#E8D5B7]/30 shadow-inner">
            <Canvas
                shadows
                dpr={[1, 2]}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                className="touch-none"
            >
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 4, 10]} fov={50} />
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableDamping={true}
                        minDistance={5}
                        maxDistance={15}
                        autoRotate={false}
                        maxPolarAngle={Math.PI / 2.1}
                    />

                    <ambientLight intensity={sceneConfig.ambientOpacity} color={sceneConfig.lightColor} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={timePhase === 'night' ? 0.5 : 1} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={timePhase === 'night' ? 0.2 : 0.5} />

                    {sceneConfig.fog && <fog attach="fog" args={[sceneConfig.fog, 8, 20]} />}

                    {/* Environment Components */}
                    {timePhase === 'night' && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
                    {timePhase === 'morning' && <Sparkles count={200} scale={15} size={2} speed={0.5} opacity={0.5} color="#eef" />}

                    <Sky
                        turbidity={sceneConfig.skyTurbidity}
                        rayleigh={sceneConfig.skyRayleigh}
                        sunPosition={sceneConfig.sunPosition as any}
                    />

                    <group>
                        {lanternPositions.map((pos, i) => (
                            <Lantern
                                key={i}
                                position={pos}
                                index={i}
                                isSolved={solvedRiddles.includes(riddles[i]?.id)}
                                isActive={currentStage === i}
                                onSelect={onSelect}
                                tilt={tilt}
                                timePhase={timePhase}
                            />
                        ))}
                    </group>

                    <ContactShadows resolution={1024} scale={20} blur={2} opacity={timePhase === 'night' ? 0.6 : 0.35} far={10} color="#000000" />
                    <Environment preset={sceneConfig.env as any} />

                    {/* Visual Evolution: Post-processing Effects */}
                    <EffectComposer enableNormalPass={false}>
                        <Bloom
                            intensity={0.8}
                            luminanceThreshold={0.5}
                            luminanceSmoothing={0.9}
                            mipmapBlur
                        />
                    </EffectComposer>
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-white/70 pointer-events-none">
                按住並旋轉視角 🏮 點擊進入關卡
            </div>
        </div>
    );
}
