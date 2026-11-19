// Lightweight, silky confetti & star-sparkle celebration overlay.
// Respects prefers-reduced-motion and auto-cleans its canvas once all particles settle.
import { prefersReducedMotion } from './motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  color: string;
  shape: 'ribbon' | 'star' | 'dot';
  life: number;
  maxLife: number;
}

const COLORS = ['#FF5E8A', '#FFB830', '#48B8FF', '#36D399', '#A78BFA', '#FF8552', '#FFE066'];

let activeCanvas: HTMLCanvasElement | null = null;
let particles: Particle[] = [];
let rafId = 0;

function ensureCanvas(): HTMLCanvasElement {
  if (activeCanvas && activeCanvas.isConnected) return activeCanvas;
  const c = document.createElement('canvas');
  c.className = 'confetti-layer';
  c.setAttribute('aria-hidden', 'true');
  document.body.append(c);
  activeCanvas = c;
  return c;
}

function resizeCanvas(c: HTMLCanvasElement): { w: number; h: number; dpr: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
  }
  return { w, h, dpr };
}

function drawStar(ctx: CanvasRenderingContext2D, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? r : r * 0.38;
    if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

function tick(): void {
  if (!activeCanvas || particles.length === 0) {
    rafId = 0;
    if (activeCanvas) {
      activeCanvas.remove();
      activeCanvas = null;
    }
    return;
  }
  const { w, h, dpr } = resizeCanvas(activeCanvas);
  const ctx = activeCanvas.getContext('2d');
  if (!ctx) {
    particles = [];
    rafId = 0;
    return;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const next: Particle[] = [];
  for (const p of particles) {
    p.life += 1 / 60;
    if (p.life >= p.maxLife || p.y > h + 40) continue;
    p.vy += 420 / 60;
    p.vx *= 0.992;
    p.vy *= 0.992;
    p.x += p.vx / 60;
    p.y += p.vy / 60;
    p.rot += p.vrot / 60;

    const alpha = Math.max(0, 1 - Math.pow(p.life / p.maxLife, 2.2));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === 'ribbon') {
      const flutter = Math.cos(p.life * 10 + p.rot);
      ctx.scale(1, Math.max(0.25, Math.abs(flutter)));
      ctx.fillRect(-p.size * 0.6, -p.size * 0.3, p.size * 1.2, p.size * 0.6);
    } else if (p.shape === 'star') {
      drawStar(ctx, p.size * 0.65);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.36, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    next.push(p);
  }
  particles = next;
  rafId = requestAnimationFrame(tick);
}

/** Launch a celebratory burst of ribbons and 4-point sparkles! */
export function burstConfetti(opts: { originX?: number; originY?: number; count?: number; spread?: number } = {}): void {
  if (prefersReducedMotion()) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ox = opts.originX ?? w * 0.5;
  const oy = opts.originY ?? h * 0.44;
  const count = opts.count ?? 52;
  const spread = opts.spread ?? Math.PI * 0.95;

  ensureCanvas();
  const shapes: Particle['shape'][] = ['ribbon', 'ribbon', 'star', 'dot'];

  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
    const speed = 220 + Math.random() * 440;
    particles.push({
      x: ox + (Math.random() - 0.5) * 40,
      y: oy + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 11,
      size: 7 + Math.random() * 7,
      color: COLORS[i % COLORS.length]!,
      shape: shapes[i % shapes.length]!,
      life: 0,
      maxLife: 1.5 + Math.random() * 1.1,
    });
  }

  if (!rafId) rafId = requestAnimationFrame(tick);
}
