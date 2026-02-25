import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

interface PlayerControllerProps {
    onPositionUpdate: (pos: THREE.Vector3) => void;
    mobileMove?: { dx: number; dy: number };
    mobileLook?: { dx: number; dy: number };
    modalOpen?: boolean;  // Modal 開啟時停用 PointerLockControls
}

const SPEED = 5;
const JUMP_FORCE = 5;

export const PlayerController = forwardRef<{ position: THREE.Vector3 }, PlayerControllerProps>(
    ({ onPositionUpdate, mobileMove, mobileLook, modalOpen = false }, ref) => {
        const { camera } = useThree();

        const [sphereRef, api] = useSphere(() => ({
            mass: 80,
            type: 'Dynamic',
            position: [0, 1, 0],
            args: [0.4],
            linearDamping: 0.99,
            angularFactor: [0, 0, 0], // 鎖定角度，防止翻滾
            fixedRotation: true,
        }));

        const velocity = useRef([0, 0, 0]);
        const position = useRef([0, 1, 0]);
        const keys = useRef<Record<string, boolean>>({});
        const controlsRef = useRef<any>(null);
        const playerPos = useRef(new THREE.Vector3(0, 1, 0));

        // 訂閱物理位置與速度
        useEffect(() => {
            const unsubVel = api.velocity.subscribe((v) => { velocity.current = v; });
            const unsubPos = api.position.subscribe((p) => {
                position.current = p;
                playerPos.current.set(p[0], p[1], p[2]);
                onPositionUpdate(playerPos.current.clone());
            });
            return () => { unsubVel(); unsubPos(); };
        }, [api, onPositionUpdate]);

        // 鍵盤事件
        useEffect(() => {
            const down = (e: KeyboardEvent) => { keys.current[e.code] = true; };
            const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
            window.addEventListener('keydown', down);
            window.addEventListener('keyup', up);
            return () => {
                window.removeEventListener('keydown', down);
                window.removeEventListener('keyup', up);
            };
        }, []);

        useImperativeHandle(ref, () => ({ position: playerPos.current }));

        useFrame(() => {
            // 同步相機到物理球體位置（眼睛高度 +0.6）
            camera.position.set(
                position.current[0],
                position.current[1] + 0.6,
                position.current[2]
            );

            // 計算移動方向（根據相機朝向）
            const frontVector = new THREE.Vector3();
            const sideVector = new THREE.Vector3();
            const direction = new THREE.Vector3();

            const kd = keys.current;

            // 鍵盤輸入
            const forward = (kd['KeyW'] || kd['ArrowUp'] ? 1 : 0) - (kd['KeyS'] || kd['ArrowDown'] ? 1 : 0);
            const strafe = (kd['KeyD'] || kd['ArrowRight'] ? 1 : 0) - (kd['KeyA'] || kd['ArrowLeft'] ? 1 : 0);

            // 手機搖桿輸入
            const mobileForward = mobileMove ? -mobileMove.dy : 0;
            const mobileStrafe = mobileMove ? mobileMove.dx : 0;

            const totalForward = forward + mobileForward;
            const totalStrafe = strafe + mobileStrafe;

            frontVector.set(0, 0, -totalForward);
            sideVector.set(totalStrafe, 0, 0);
            direction
                .addVectors(frontVector, sideVector)
                .normalize()
                .multiplyScalar(SPEED)
                .applyEuler(camera.rotation);

            api.velocity.set(direction.x, velocity.current[1], direction.z);

            // 手機視角（當 PointerLock 未啟用時）
            if (mobileLook && (mobileLook.dx !== 0 || mobileLook.dy !== 0)) {
                camera.rotation.y -= mobileLook.dx;
                camera.rotation.x = Math.max(
                    -Math.PI / 3,
                    Math.min(Math.PI / 3, camera.rotation.x - mobileLook.dy)
                );
            }
        });

        return (
            <>
                <mesh ref={sphereRef as any} />
                <PointerLockControls ref={controlsRef} />
            </>
        );
    }
);

PlayerController.displayName = 'PlayerController';
