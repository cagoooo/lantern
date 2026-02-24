import { useEffect, useRef } from "react";

interface FireworksEffectProps {
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  trail: { x: number; y: number }[];
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  speed: number;
  exploded: boolean;
  color: string;
  particles: Particle[];
}

const COLORS = [
  "#E60012", "#FFD700", "#FF6B6B", "#FFA500",
  "#FF1493", "#00CED1", "#7FFF00", "#FF4500",
  "#9370DB", "#00FF7F",
];

export function FireworksEffect({ active }: FireworksEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const fireworksRef = useRef<Firework[]>([]);

  useEffect(() => {
    if (!active) {
      fireworksRef.current = [];
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let spawnTimer = 0;
    const spawnInterval = 300;
    let lastTime = performance.now();

    function createFirework() {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      fireworksRef.current.push({
        x: Math.random() * canvas!.width * 0.8 + canvas!.width * 0.1,
        y: canvas!.height,
        targetY: Math.random() * canvas!.height * 0.4 + canvas!.height * 0.1,
        speed: 4 + Math.random() * 3,
        exploded: false,
        color,
        particles: [],
      });
    }

    function explode(fw: Firework) {
      const count = 40 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 4;
        fw.particles.push({
          x: fw.x,
          y: fw.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 60 + Math.random() * 40,
          color: fw.color,
          size: 2 + Math.random() * 2,
          trail: [],
        });
      }
      fw.exploded = true;
    }

    function animate(time: number) {
      const dt = time - lastTime;
      lastTime = time;
      spawnTimer += dt;

      if (spawnTimer >= spawnInterval && fireworksRef.current.length < 8) {
        createFirework();
        spawnTimer = 0;
      }

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      fireworksRef.current = fireworksRef.current.filter((fw) => {
        if (!fw.exploded) {
          fw.y -= fw.speed;
          ctx!.beginPath();
          ctx!.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
          ctx!.fillStyle = fw.color;
          ctx!.fill();

          ctx!.beginPath();
          ctx!.moveTo(fw.x, fw.y);
          ctx!.lineTo(fw.x, fw.y + 15);
          ctx!.strokeStyle = fw.color;
          ctx!.lineWidth = 2;
          ctx!.globalAlpha = 0.5;
          ctx!.stroke();
          ctx!.globalAlpha = 1;

          if (fw.y <= fw.targetY) explode(fw);
          return true;
        }

        fw.particles = fw.particles.filter((p) => {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 5) p.trail.shift();

          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04;
          p.vx *= 0.99;
          p.life += 1;

          const alpha = Math.max(0, 1 - p.life / p.maxLife);

          for (let i = 0; i < p.trail.length; i++) {
            const t = p.trail[i];
            const ta = alpha * (i / p.trail.length) * 0.5;
            ctx!.beginPath();
            ctx!.arc(t.x, t.y, p.size * 0.6, 0, Math.PI * 2);
            ctx!.fillStyle = p.color;
            ctx!.globalAlpha = ta;
            ctx!.fill();
          }

          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = alpha;
          ctx!.fill();
          ctx!.globalAlpha = 1;

          return p.life < p.maxLife;
        });

        return fw.particles.length > 0;
      });

      animRef.current = requestAnimationFrame(animate);
    }

    createFirework();
    setTimeout(createFirework, 200);
    setTimeout(createFirework, 500);
    animRef.current = requestAnimationFrame(animate);

    const timeout = setTimeout(() => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }, 8000);

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      clearTimeout(timeout);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      data-testid="fireworks-canvas"
    />
  );
}
