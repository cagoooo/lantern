import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePlane, useBox } from '@react-three/cannon';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { ImmersiveLantern } from './ImmersiveLantern';

interface PublicRiddle {
    id: number;
    question: string;
    hint: string;
}

interface ImmersiveWorldProps {
    riddles: PublicRiddle[];
    solvedRiddles: number[];
    playerPosition: THREE.Vector3;
    onLanternInteract: (riddleIndex: number) => void;
}

// 操場地板
function Floor() {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0, 0],
        type: 'Static',
    }));

    return (
        <mesh ref={ref as any} receiveShadow>
            <planeGeometry args={[80, 80]} />
            <meshStandardMaterial
                color="#3a5a3a"
                roughness={0.9}
                metalness={0.05}
            />
        </mesh>
    );
}

// 棋盤格地磚（視覺輔助）
function GroundGrid() {
    return (
        <gridHelper
            args={[80, 40, '#2d4a2d', '#254024']}
            position={[0, 0.01, 0]}
        />
    );
}

// 圍牆（帶碰撞）
function Wall({ position, rotation, size }: {
    position: [number, number, number];
    rotation?: [number, number, number];
    size: [number, number, number];
}) {
    const [ref] = useBox(() => ({
        type: 'Static',
        position,
        rotation: rotation ?? [0, 0, 0],
        args: size,
    }));

    return (
        <mesh ref={ref as any} castShadow receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color="#B22222" roughness={0.8} metalness={0.1} />
        </mesh>
    );
}

// 裝飾樹木
function Tree({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* 樹幹 */}
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
                <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
            </mesh>
            {/* 樹冠 */}
            <mesh position={[0, 3, 0]} castShadow>
                <sphereGeometry args={[1.2, 10, 8]} />
                <meshStandardMaterial color="#1a5c1a" roughness={0.8} />
            </mesh>
            {/* 簡單光點裝飾 */}
            <pointLight position={[0, 2.5, 0]} color="#88ff88" intensity={0.3} distance={3} />
        </group>
    );
}

// 旗桿
function Flagpole({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh castShadow>
                <cylinderGeometry args={[0.06, 0.1, 10, 8]} />
                <meshStandardMaterial color="#CCCCCC" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* 國旗（示意） */}
            <mesh position={[0.8, 4, 0]}>
                <planeGeometry args={[1.5, 1]} />
                <meshStandardMaterial color="#E60012" side={THREE.DoubleSide} />
            </mesh>
            {/* 頂球 */}
            <mesh position={[0, 5.1, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#FFD700" metalness={0.9} />
            </mesh>
        </group>
    );
}

// 夜空粒子
function NightSky() {
    const stars = useMemo(() => {
        const count = 300;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 1] = Math.random() * 40 + 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
        }
        return positions;
    }, []);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={stars}
                    count={stars.length / 3}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial color="#FFFFFF" size={0.12} sizeAttenuation />
        </points>
    );
}

// 天燈粒子（漂浮的橘色光點）
function FloatingSkyLanterns() {
    const lanternData = useMemo(() => {
        return Array.from({ length: 25 }, (_, i) => ({
            x: (Math.random() - 0.5) * 60,
            y: Math.random() * 15 + 8,
            z: (Math.random() - 0.5) * 60,
            speed: 0.2 + Math.random() * 0.3,
            offset: Math.random() * Math.PI * 2,
        }));
    }, []);

    return (
        <group>
            {lanternData.map((l, i) => (
                <mesh key={i} position={[l.x, l.y, l.z]}>
                    <sphereGeometry args={[0.15, 6, 6]} />
                    <meshBasicMaterial color="#FF8800" transparent opacity={0.75} />
                </mesh>
            ))}
        </group>
    );
}

// 隱藏燈籠的分布位置（手動設計，確保分散在整個操場）
const LANTERN_POSITIONS_TEMPLATE: [number, number, number][] = [
    [-15, 0, -15], [15, 0, -18], [0, 0, -25],
    [-22, 0, 5], [22, 0, 8], [-8, 0, 18],
    [10, 0, 22], [-18, 0, -5], [18, 0, -8],
    [0, 0, 30], [-28, 0, 15], [28, 0, -15],
    [-5, 0, -30], [20, 0, 25], [-25, 0, -22],
];

export function ImmersiveWorld({
    riddles,
    solvedRiddles,
    playerPosition,
    onLanternInteract,
}: ImmersiveWorldProps) {
    // 計算燈籠位置（依據謎題數量）
    const lanternPositions = useMemo(() => {
        return riddles.map((_, i) => {
            const template = LANTERN_POSITIONS_TEMPLATE[i % LANTERN_POSITIONS_TEMPLATE.length];
            // 稍微加點隨機偏移，避免完全重疊
            return [
                template[0] + (Math.floor(i / LANTERN_POSITIONS_TEMPLATE.length) * 4),
                template[1],
                template[2] + (Math.floor(i / LANTERN_POSITIONS_TEMPLATE.length) * 4),
            ] as [number, number, number];
        });
    }, [riddles]);

    const WALL_HALF = 32;
    const WALL_HEIGHT = 4;
    const WALL_THICKNESS = 1;

    return (
        <>
            {/* 環境光 */}
            <ambientLight intensity={0.15} color="#1a1a3f" />
            {/* 月光 */}
            <directionalLight
                position={[10, 30, 10]}
                intensity={0.3}
                color="#b0c4de"
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            {/* 場景中央燈光 */}
            <pointLight position={[0, 6, 0]} color="#FF8800" intensity={1.5} distance={25} decay={2} />

            {/* 天空顏色 */}
            <color attach="background" args={['#050510']} />
            <fog attach="fog" args={['#0a0a1f', 30, 70]} />

            {/* 夜空元素 */}
            <NightSky />
            <FloatingSkyLanterns />

            {/* 地板 */}
            <Floor />
            <GroundGrid />

            {/* 四面圍牆 */}
            <Wall position={[0, WALL_HEIGHT / 2, -WALL_HALF]} size={[WALL_HALF * 2, WALL_HEIGHT, WALL_THICKNESS]} />
            <Wall position={[0, WALL_HEIGHT / 2, WALL_HALF]} size={[WALL_HALF * 2, WALL_HEIGHT, WALL_THICKNESS]} />
            <Wall position={[-WALL_HALF, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, WALL_HALF * 2]} />
            <Wall position={[WALL_HALF, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, WALL_HALF * 2]} />

            {/* 旗桿 */}
            <Flagpole position={[0, 0, -20]} />

            {/* 裝飾樹木 */}
            <Tree position={[-10, 0, -10]} />
            <Tree position={[10, 0, -10]} />
            <Tree position={[-12, 0, 12]} />
            <Tree position={[12, 0, 12]} />
            <Tree position={[-20, 0, 0]} />
            <Tree position={[20, 0, 0]} />
            <Tree position={[0, 0, 18]} />

            {/* 學校名稱標牌 */}
            <Text
                position={[0, 3.5, -31]}
                fontSize={1.5}
                color="#FFD700"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#8B0000"
            >
                🏮 石門國小虛擬操場 🏮
            </Text>
            <Text
                position={[0, 1.8, -31]}
                fontSize={0.7}
                color="rgba(255,200,100,0.8)"
                anchorX="center"
                anchorY="middle"
            >
                尋找 {riddles.length} 個隱藏燈籠，猜對燈謎！
            </Text>

            {/* 隱藏燈籠群 */}
            {riddles.map((riddle, i) => (
                <ImmersiveLantern
                    key={riddle.id}
                    position={lanternPositions[i]}
                    riddleIndex={i}
                    isSolved={solvedRiddles.includes(riddle.id)}
                    playerPosition={playerPosition}
                    onInteract={onLanternInteract}
                    riddleQuestion={riddle.question}
                />
            ))}
        </>
    );
}
