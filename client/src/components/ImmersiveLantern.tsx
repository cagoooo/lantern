import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface ImmersiveLanternProps {
    position: [number, number, number];
    riddleIndex: number;
    isSolved: boolean;
    playerPosition: THREE.Vector3;
    onInteract: (index: number) => void;
    onNearby: (index: number | null) => void;  // 通知父層當前靠近的燈籠
    riddleQuestion?: string;
}

export function ImmersiveLantern({
    position,
    riddleIndex,
    isSolved,
    playerPosition,
    onInteract,
    onNearby,
    riddleQuestion,
}: ImmersiveLanternProps) {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.PointLight>(null);
    const [hovered, setHovered] = useState(false);
    const wasNearby = useRef(false);   // 追蹤前一幀的靠近狀態，避免重複 callback

    const INTERACT_DISTANCE = 3.0;

    const distToPlayer = playerPosition.distanceTo(
        new THREE.Vector3(...position)
    );
    const isNearby = distToPlayer < INTERACT_DISTANCE;

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        // 上下浮動
        groupRef.current.position.y =
            position[1] + 1.5 + Math.sin(t * 0.8 + riddleIndex * 1.3) * 0.18;
        // 緩慢自轉
        groupRef.current.rotation.y += 0.007;

        // 光暈呼吸
        if (glowRef.current) {
            glowRef.current.intensity = isSolved
                ? 1.2 + Math.sin(t * 2) * 0.2
                : isNearby
                    ? 3.5 + Math.sin(t * 4) * 0.8
                    : 2.0 + Math.sin(t * 1.5) * 0.4;
        }

        // 回報靠近狀態變化給父層（僅在狀態改變時觸發，避免每幀都 setState）
        if (isNearby !== wasNearby.current) {
            wasNearby.current = isNearby;
            onNearby(isNearby && !isSolved ? riddleIndex : null);
        }
    });

    const lanternColor = isSolved ? '#FFD700' : (isNearby || hovered ? '#FF6600' : '#CC0010');
    const emissiveColor = isSolved ? '#FFA500' : (isNearby ? '#FF3300' : '#440000');

    return (
        <group
            ref={groupRef}
            position={[position[0], position[1] + 1.5, position[2]]}
            onClick={() => {
                if (!isSolved) onInteract(riddleIndex);
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {/* 吊繩 */}
            <mesh position={[0, 0.7, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.4, 6]} />
                <meshStandardMaterial color="#8B6914" />
            </mesh>

            {/* 頂蓋 */}
            <mesh position={[0, 0.52, 0]}>
                <cylinderGeometry args={[0.38, 0.28, 0.14, 16]} />
                <meshStandardMaterial color="#333" metalness={0.5} roughness={0.6} />
            </mesh>

            {/* 燈籠主體 */}
            <mesh castShadow>
                <sphereGeometry args={[0.45, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.85]} />
                <meshStandardMaterial
                    color={lanternColor}
                    emissive={emissiveColor}
                    emissiveIntensity={isNearby ? 1.2 : 0.6}
                    transparent
                    opacity={0.92}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* 內部燈光感（半透明球） */}
            <mesh>
                <sphereGeometry args={[0.3, 12, 10]} />
                <meshBasicMaterial
                    color={isSolved ? '#FFF176' : '#FF8800'}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* 底蓋 */}
            <mesh position={[0, -0.46, 0]}>
                <cylinderGeometry args={[0.25, 0.35, 0.1, 16]} />
                <meshStandardMaterial color="#333" metalness={0.5} />
            </mesh>

            {/* 流蘇 */}
            <mesh position={[0, -0.6, 0]}>
                <cylinderGeometry args={[0.03, 0.005, 0.3, 6]} />
                <meshStandardMaterial color="#E60012" />
            </mesh>

            {/* 謎題序號文字 */}
            <Text
                position={[0, 0, 0.48]}
                fontSize={0.28}
                color="white"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {isSolved ? '✓' : `#${riddleIndex + 1}`}
            </Text>

            {/* 光暈 PointLight */}
            <pointLight
                ref={glowRef}
                color={isSolved ? '#FFD700' : '#FF4400'}
                intensity={2.0}
                distance={4}
                decay={2}
            />

            {/* 靠近提示（Billboard 永遠面向玩家） */}
            {isNearby && !isSolved && (
                <Billboard position={[0, 1.1, 0]}>
                    <Text
                        fontSize={0.2}
                        color="#FFD700"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.01}
                        outlineColor="#000"
                    >
                        🏮 按 [E] 或點擊猜謎！
                    </Text>
                </Billboard>
            )}

            {/* 已解題標示 */}
            {isSolved && (
                <Billboard position={[0, 1.1, 0]}>
                    <Text fontSize={0.18} color="#FFD700" anchorX="center" anchorY="middle">
                        ✨ 已解開！
                    </Text>
                </Billboard>
            )}
        </group>
    );
}
