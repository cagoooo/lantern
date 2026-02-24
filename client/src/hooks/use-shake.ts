import { useEffect, useRef, useCallback } from "react";

interface UseShakeOptions {
  threshold?: number;
  timeout?: number;
  onShake: () => void;
  enabled?: boolean;
}

export function useShake({
  threshold = 15,
  timeout = 1000,
  onShake,
  enabled = true,
}: UseShakeOptions) {
  const lastShake = useRef(0);
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const permissionRequested = useRef(false);

  const requestPermission = useCallback(async () => {
    if (permissionRequested.current) return;
    permissionRequested.current = true;

    const DME = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DME.requestPermission === "function") {
      try {
        const result = await DME.requestPermission();
        if (result !== "granted") {
          permissionRequested.current = false;
        }
      } catch {
        permissionRequested.current = false;
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleFirstTouch = () => {
      requestPermission();
      document.removeEventListener("touchstart", handleFirstTouch);
    };
    document.addEventListener("touchstart", handleFirstTouch, { once: true });

    const handleMotion = (e: DeviceMotionEvent) => {
      const accel = e.accelerationIncludingGravity;
      if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

      const deltaX = Math.abs(accel.x - lastAccel.current.x);
      const deltaY = Math.abs(accel.y - lastAccel.current.y);
      const deltaZ = Math.abs(accel.z - lastAccel.current.z);

      lastAccel.current = {
        x: accel.x ?? 0,
        y: accel.y ?? 0,
        z: accel.z ?? 0,
      };

      if (
        (deltaX > threshold || deltaY > threshold || deltaZ > threshold) &&
        Date.now() - lastShake.current > timeout
      ) {
        lastShake.current = Date.now();
        onShake();
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      document.removeEventListener("touchstart", handleFirstTouch);
    };
  }, [threshold, timeout, onShake, enabled, requestPermission]);
}
