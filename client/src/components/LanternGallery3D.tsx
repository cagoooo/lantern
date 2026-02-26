import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, PerspectiveCamera, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface LanternProps {
    position: [number, number, number];
    index: number;
    isSolved: boolean;
    onSelect: (index: number) => void;
    isActive: boolean;
}

function Lantern({ position, index, isSolved, onSelect, isActive }: LanternProps) {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            // Gentle floating animation
            meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() + index) * 0.1;
            // Rotation based on hover
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
                    color={isSolved ? "#FFD700" : (isActive ? "#E60012" : "#8B0000")}
                    emissive={isSolved ? "#FFA500" : (isActive ? "#FF0000" : "#300000")}
                    emissiveIntensity={hovered || isActive ? 2 : 0.5}
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
    const radius = 5;

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
                onCreated={({ gl }) => {
                    // Diagnostic check if THREE properties are being accessed correctly
                    // console.log("Three Renderer established:", gl.revision);
                }}
            >
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 4, 10]} fov={50} />
                    <OrbitControls
                        enablePan={false}
                        enableZoom={true}
                        minDistance={5}
                        maxDistance={12}
                        autoRotate={false}
                        maxPolarAngle={Math.PI / 2.1}
                    />

                    <ambientLight intensity={0.4} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} />

                    <group>
                        {lanternPositions.map((pos, i) => (
                            <Lantern
                                key={i}
                                position={pos}
                                index={i}
                                isSolved={solvedRiddles.includes(riddles[i]?.id)}
                                isActive={currentStage === i}
                                onSelect={onSelect}
                            />
                        ))}
                    </group>

                    <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.35} far={10} color="#000000" />
                    <Environment preset="night" />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-white/70 pointer-events-none">
                按住並旋轉視角 🏮 點擊進入關卡
            </div>
        </div>
    );
}
