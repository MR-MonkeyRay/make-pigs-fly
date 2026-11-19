// Canvas drawing for Hog Wild — lush illustrated storybook sky, dynamic altitude-based sky cycle,
// live wing-flap feathers, rocket plasma sparks, parallax pine hills, and richly shaded obstacles.
// Everything is drawn in world units; only resize() knows about pixels.
import { prefersReducedMotion } from '../../lib/motion';
import type { Game, GameState } from './game';
import { GROUND_Y, PIG_R, WORLD_H } from './physics';
import { balloonY, type Obstacle } from './spawner';

export interface Palette {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  ink: string;
  grass: string;
  grassDeep: string;
  cloud: string;
  hillFar: string;
  hillNear: string;
  accent: string;
  dark: boolean;
}

export function readPalette(el: Element): Palette {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const dark = cs.colorScheme.includes('dark') && !cs.colorScheme.includes('light');
  return {
    skyTop: v('--stage-sky-top', '#5ba9fc'),
    skyMid: v('--stage-sky-mid', '#9fd7ff'),
    skyBottom: v('--stage-sky-bottom', '#fff0db'),
    ink: v('--art-ink', '#3a2133'),
    grass: v('--grass', '#68cb6c'),
    grassDeep: v('--grass-deep', '#48a752'),
    cloud: v('--cloud', '#ffffff'),
    hillFar: v('--hill-far', dark ? '#29295c' : '#9ad2c7'),
    hillNear: v('--hill-near', dark ? '#224a59' : '#78c494'),
    accent: v('--accent-gold', '#ffba30'),
    dark,
  };
}

const PIG_W = 68;
const PIG_H = (PIG_W * 172) / 222;

type RGB = [number, number, number];
interface SkyStop {
  top: RGB;
  mid: RGB;
  bot: RGB;
  stars: number;
}

const DAY_CYCLE: SkyStop[] = [
  { top: [78, 162, 252], mid: [158, 214, 255], bot: [255, 240, 219], stars: 0 }, // Crisp Morning
  { top: [92, 122, 232], mid: [252, 154, 140], bot: [255, 224, 164], stars: 0.12 }, // Golden Hour
  { top: [30, 36, 94], mid: [110, 62, 158], bot: [248, 134, 168], stars: 0.65 }, // Twilight Rose
  { top: [8, 13, 44], mid: [24, 34, 88], bot: [58, 36, 108], stars: 1.0 }, // Stratosphere Cosmos
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpRgb(a: RGB, b: RGB, t: number): string {
  return `rgb(${Math.round(lerp(a[0], b[0], t))}, ${Math.round(lerp(a[1], b[1], t))}, ${Math.round(lerp(a[2], b[2], t))})`;
}

interface FxParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vrot: number;
  life: number;
  maxLife: number;
  color: string;
  kind: 'feather' | 'spark' | 'ring';
}

export class Renderer {
  pigImg: HTMLImageElement | null = null;
  private ctx: CanvasRenderingContext2D;
  private scale = 1;
  private dpr = 1;
  private worldW = 640;

  private particles: FxParticle[] = [];
  private lastFlapT = 99;
  private lastState: GameState = 'ready';
  private lastTime = 0;
  private shakeT = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas not available');
    this.ctx = ctx;
  }

  /** Size the backing store for the CSS box; returns the world width in units. */
  resize(cssW: number, cssH: number): number {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(cssW * this.dpr));
    this.canvas.height = Math.max(1, Math.round(cssH * this.dpr));
    this.scale = cssH / WORLD_H;
    this.worldW = cssW / this.scale;
    return this.worldW;
  }

  invalidatePalette(): void {
    // Dynamic gradient is recomputed smoothly per frame; nothing cached to invalidate.
  }

  draw(game: Game, pal: Palette): void {
    const { ctx } = this;
    const dt = Math.max(0, Math.min(0.05, game.time - this.lastTime));
    this.lastTime = game.time;

    this.stepEffects(game, dt);

    // Subtle damped screen shake on impact (respecting reduced motion)
    let sx = 0;
    let sy = 0;
    if (this.shakeT > 0 && !prefersReducedMotion()) {
      const mag = (this.shakeT / 0.28) * 5;
      sx = (Math.random() - 0.5) * mag * 2;
      sy = (Math.random() - 0.5) * mag * 2;
    }

    ctx.setTransform(this.scale * this.dpr, 0, 0, this.scale * this.dpr, sx * this.scale * this.dpr, sy * this.scale * this.dpr);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const starAlpha = this.drawSky(game, pal);
    this.drawBackdrop(game, pal, starAlpha);
    for (const o of game.obstacles) this.drawObstacle(o, game, pal);
    this.drawGround(game, pal);
    this.drawParticles();
    this.drawPig(game, pal);
  }

  private stepEffects(game: Game, dt: number): void {
    if (this.shakeT > 0) this.shakeT = Math.max(0, this.shakeT - dt);

    // Detect fresh wing flap -> spawn cute fluffy feathers & air puff
    if (game.state === 'playing' && game.pig.flapT < this.lastFlapT && game.pig.flapT < 0.08) {
      for (let i = 0; i < 4; i++) {
        this.particles.push({
          x: game.pig.x - 10 + (Math.random() - 0.5) * 8,
          y: game.pig.y + 4 + (Math.random() - 0.5) * 8,
          vx: -70 - Math.random() * 80,
          vy: 15 + Math.random() * 55,
          r: 4 + Math.random() * 3,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 9,
          life: 0,
          maxLife: 0.48 + Math.random() * 0.25,
          color: i === 0 ? '#ffd0df' : '#ffffff',
          kind: 'feather',
        });
      }
      this.particles.push({
        x: game.pig.x - 14,
        y: game.pig.y + 8,
        vx: -95,
        vy: 12,
        r: 7,
        rot: 0,
        vrot: 0,
        life: 0,
        maxLife: 0.3,
        color: 'rgba(255,255,255,0.6)',
        kind: 'ring',
      });
    }
    this.lastFlapT = game.pig.flapT;

    // Rocket boost plasma & star sparks
    if (game.state === 'playing' && game.boostT > 0 && dt > 0) {
      const boostColors = ['#fff59d', '#ffb830', '#ff5e8a', '#64d2ff'];
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: game.pig.x - PIG_W * 0.45,
          y: game.pig.y + (Math.random() - 0.5) * 14,
          vx: -240 - Math.random() * 140,
          vy: (Math.random() - 0.5) * 60,
          r: 3.5 + Math.random() * 3.5,
          rot: Math.random() * Math.PI,
          vrot: 6,
          life: 0,
          maxLife: 0.32 + Math.random() * 0.22,
          color: boostColors[Math.floor(Math.random() * boostColors.length)]!,
          kind: 'spark',
        });
      }
    }

    // Detect crash -> cartoon feather explosion + brief shake
    if (game.state === 'crashing' && this.lastState === 'playing') {
      this.shakeT = 0.28;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2 + Math.random() * 0.3;
        const spd = 70 + Math.random() * 150;
        this.particles.push({
          x: game.pig.x,
          y: game.pig.y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd - 40,
          r: 4.5 + Math.random() * 3.5,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 12,
          life: 0,
          maxLife: 0.65 + Math.random() * 0.35,
          color: i % 3 === 0 ? '#ffd046' : i % 3 === 1 ? '#ffa8c0' : '#ffffff',
          kind: i % 3 === 0 ? 'spark' : 'feather',
        });
      }
    }
    this.lastState = game.state;

    // Advance particles
    if (dt > 0) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i]!;
        p.life += dt;
        if (p.life >= p.maxLife) {
          this.particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.kind === 'feather') {
          p.vy += 60 * dt;
          p.vx *= 0.97;
        }
        p.rot += p.vrot * dt;
      }
    }
  }

  private drawSky(game: Game, pal: Palette): number {
    const { ctx } = this;
    const g = ctx.createLinearGradient(0, 0, 0, WORLD_H);
    if (pal.dark) {
      g.addColorStop(0, pal.skyTop);
      g.addColorStop(0.55, pal.skyMid);
      g.addColorStop(1, pal.skyBottom);
      ctx.fillStyle = g;
      ctx.fillRect(-10, -10, this.worldW + 20, WORLD_H + 20);
      return 1;
    }

    // Smooth atmospheric sky journey as distance grows (cycles every 1400m)
    const cyclePos = ((game.meters % 1400) / 1400) * DAY_CYCLE.length;
    const idx = Math.floor(cyclePos) % DAY_CYCLE.length;
    const nextIdx = (idx + 1) % DAY_CYCLE.length;
    const frac = cyclePos - Math.floor(cyclePos);
    const smooth = frac * frac * (3 - 2 * frac);
    const a = DAY_CYCLE[idx]!;
    const b = DAY_CYCLE[nextIdx]!;

    g.addColorStop(0, lerpRgb(a.top, b.top, smooth));
    g.addColorStop(0.56, lerpRgb(a.mid, b.mid, smooth));
    g.addColorStop(1, lerpRgb(a.bot, b.bot, smooth));
    ctx.fillStyle = g;
    ctx.fillRect(-10, -10, this.worldW + 20, WORLD_H + 20);
    return lerp(a.stars, b.stars, smooth);
  }

  private drawBackdrop(game: Game, pal: Palette, starAlpha: number): void {
    const { ctx } = this;
    const W = this.worldW;

    // Stars & subtle aurora veil during night / high-altitude twilight
    if (starAlpha > 0.04) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 22; i++) {
        const sx = (i * 97 + 28) % W;
        const sy = 14 + ((i * 43) % 150);
        const r = 0.9 + (i % 3) * 0.65;
        ctx.globalAlpha = starAlpha * (0.3 + 0.6 * Math.abs(Math.sin(game.time * 2.2 + i)));
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Subtle aurora band
      ctx.globalAlpha = starAlpha * 0.16;
      const ag = ctx.createLinearGradient(0, 20, 0, 110);
      ag.addColorStop(0, 'rgba(60, 230, 185, 0)');
      ag.addColorStop(0.5, 'rgba(92, 232, 200, 0.9)');
      ag.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.moveTo(0, 110);
      for (let x = 0; x <= W + 20; x += 20) {
        ctx.lineTo(x, 62 + Math.sin(x * 0.015 + game.time * 0.9) * 16);
      }
      ctx.lineTo(W, 110);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Celestial orb: glowing sun or crescent moon
    const orbX = W * 0.82;
    const orbY = 58;
    if (pal.dark || starAlpha > 0.72) {
      ctx.save();
      const mg = ctx.createRadialGradient(orbX, orbY, 8, orbX, orbY, 44);
      mg.addColorStop(0, 'rgba(255, 244, 198, 0.45)');
      mg.addColorStop(1, 'rgba(255, 244, 198, 0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff5cc';
      ctx.beginPath();
      ctx.arc(orbX, orbY, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      const sg = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 56);
      sg.addColorStop(0, 'rgba(255, 248, 204, 0.72)');
      sg.addColorStop(0.45, 'rgba(255, 224, 115, 0.28)');
      sg.addColorStop(1, 'rgba(255, 224, 115, 0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 56, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff3b0';
      ctx.beginPath();
      ctx.arc(orbX, orbY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Drifting shaded volumetric clouds
    for (let i = 0; i < 5; i++) {
      const span = W + 240;
      const x = (((i * 220 - game.distance * 0.11 - game.time * 7) % span) + span) % span - 120;
      const y = 38 + ((i * 49) % 94);
      const s = 0.65 + (i % 3) * 0.25;
      this.puff(x, y, s, pal);
    }

    // Distant hazy alpine peaks
    this.peaks(pal.dark ? 'rgba(56, 52, 112, 0.55)' : 'rgba(128, 168, 222, 0.28)', GROUND_Y - 76, 46, 0.09, game.distance, 175);

    // Two layers of lush rolling hills
    this.hills(pal.hillFar, GROUND_Y - 52, 32, 0.18, game.distance, 250);
    this.hills(pal.hillNear, GROUND_Y - 26, 22, 0.4, game.distance, 170);

    // Tiny rolling hill pine silhouettes on the near hill
    ctx.fillStyle = pal.dark ? 'rgba(24, 58, 66, 0.65)' : 'rgba(66, 158, 104, 0.55)';
    const treeSpan = 96;
    const tOff = (game.distance * 0.4) % treeSpan;
    for (let x = -tOff; x < W + 40; x += treeSpan) {
      const y = GROUND_Y - 24 - Math.abs(Math.sin((x + game.distance * 0.4) / 170)) * 20;
      ctx.beginPath();
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x - 7, y + 4);
      ctx.lineTo(x + 7, y + 4);
      ctx.closePath();
      ctx.fill();
    }

    // High-speed slipstream wind lines during rocket boost or dive
    if (game.boostT > 0 || (game.diving && game.state === 'playing')) {
      ctx.save();
      ctx.strokeStyle = game.boostT > 0 ? '#fff5b8' : '#ffffff';
      ctx.globalAlpha = game.boostT > 0 ? 0.65 : 0.34;
      ctx.lineWidth = game.boostT > 0 ? 2.5 : 1.8;
      for (let i = 0; i < 7; i++) {
        const span = W + 180;
        const wx = (((i * 150 - game.time * 820) % span) + span) % span - 90;
        const wy = 36 + ((i * 59) % (GROUND_Y - 70));
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + (game.boostT > 0 ? 64 : 36), wy);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private puff(x: number, y: number, s: number, pal: Palette): void {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = pal.dark ? 0.28 : 0.88;
    ctx.fillStyle = pal.dark ? '#9c96d1' : '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x, y, 36 * s, 13 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 13 * s, y - 8 * s, 16 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 11 * s, y - 11 * s, 18 * s, 16 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private peaks(color: string, base: number, amp: number, parallax: number, distance: number, step: number): void {
    const { ctx } = this;
    const off = (distance * parallax) % (step * 2);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-step * 2, WORLD_H);
    for (let x = -off - step; x <= this.worldW + step * 2; x += step) {
      ctx.lineTo(x, base + 12);
      ctx.lineTo(x + step * 0.5, base - amp);
    }
    ctx.lineTo(this.worldW + step * 2, WORLD_H);
    ctx.closePath();
    ctx.fill();
  }

  private hills(color: string, base: number, amp: number, parallax: number, distance: number, wave: number): void {
    const { ctx } = this;
    const off = distance * parallax;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, WORLD_H);
    for (let x = 0; x <= this.worldW + 10; x += 10) {
      const y = base - Math.abs(Math.sin((x + off) / wave)) * amp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.worldW + 10, WORLD_H);
    ctx.closePath();
    ctx.fill();
  }

  private drawGround(game: Game, pal: Palette): void {
    const { ctx } = this;
    const gg = ctx.createLinearGradient(0, GROUND_Y, 0, WORLD_H);
    gg.addColorStop(0, pal.grass);
    gg.addColorStop(0.55, pal.grass);
    gg.addColorStop(1, pal.grassDeep);
    ctx.fillStyle = gg;
    ctx.fillRect(0, GROUND_Y, this.worldW, WORLD_H - GROUND_Y);

    // Sunlit top grass highlight & soft border
    ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.fillRect(0, GROUND_Y, this.worldW, 3);
    ctx.strokeStyle = 'rgba(58, 33, 51, 0.36)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(this.worldW, GROUND_Y);
    ctx.stroke();

    // Scrolling grass tufts & colorful meadow flowers
    const flowerColors = ['#ffe066', '#ffd1e0', '#ffffff'];
    const off = game.distance % 48;
    let idx = Math.floor(game.distance / 48);
    for (let x = -off; x < this.worldW + 24; x += 48) {
      ctx.strokeStyle = 'rgba(42, 27, 46, 0.24)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y + 11);
      ctx.lineTo(x + 3, GROUND_Y + 5);
      ctx.moveTo(x + 6, GROUND_Y + 11);
      ctx.lineTo(x + 8, GROUND_Y + 4);
      ctx.stroke();

      ctx.fillStyle = flowerColors[Math.abs(idx) % flowerColors.length]!;
      ctx.beginPath();
      ctx.arc(x + 26, GROUND_Y + 9, 2.5, 0, Math.PI * 2);
      ctx.fill();
      idx++;
    }
  }

  private drawParticles(): void {
    const { ctx } = this;
    for (const p of this.particles) {
      const progress = p.life / p.maxLife;
      const alpha = 1 - progress;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.kind === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * (0.7 + progress * 1.4), p.r * 0.45 * (0.7 + progress * 1.4), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === 'spark') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          const rad = i % 2 === 0 ? p.r * (1 - progress * 0.4) : p.r * 0.35;
          if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 1.25, p.r * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawObstacle(o: Obstacle, game: Game, pal: Palette): void {
    const { ctx } = this;
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 2.6;
    const t = game.time;
    switch (o.kind) {
      case 'kite': {
        const cx = o.x + o.w / 2;
        const top = o.y - o.h / 2;
        // Graceful swaying string
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(58, 33, 51, 0.55)';
        ctx.beginPath();
        ctx.moveTo(cx, o.y + o.h / 2);
        ctx.quadraticCurveTo(cx - 12, (o.y + GROUND_Y) / 2, cx - 4, GROUND_Y);
        ctx.stroke();
        // Colorful fluttering tail bows
        const bowColors = ['#48b8ff', '#ffba30', '#ff5e8a'];
        for (let i = 1; i <= 3; i++) {
          ctx.fillStyle = bowColors[i - 1]!;
          const bx = cx + Math.sin(t * 6.5 + i + o.phase) * 5.5 - i * 3;
          const by = o.y + o.h / 2 + i * 12;
          ctx.beginPath();
          ctx.moveTo(bx - 5, by - 3);
          ctx.lineTo(bx + 5, by + 3);
          ctx.lineTo(bx + 5, by - 3);
          ctx.lineTo(bx - 5, by + 3);
          ctx.closePath();
          ctx.fill();
        }
        // Jewel diamond kite
        ctx.strokeStyle = pal.ink;
        ctx.lineWidth = 2.6;
        ctx.fillStyle = '#ff5e7e';
        ctx.beginPath();
        ctx.moveTo(cx, top);
        ctx.lineTo(o.x + o.w, o.y - 4);
        ctx.lineTo(cx, o.y + o.h / 2);
        ctx.lineTo(o.x, o.y - 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffd046';
        ctx.beginPath();
        ctx.moveTo(cx, top);
        ctx.lineTo(o.x + o.w, o.y - 4);
        ctx.lineTo(cx, o.y - 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#48b8ff';
        ctx.beginPath();
        ctx.moveTo(cx, o.y + o.h / 2);
        ctx.lineTo(o.x, o.y - 4);
        ctx.lineTo(cx, o.y - 4);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx, top);
        ctx.lineTo(o.x + o.w, o.y - 4);
        ctx.lineTo(cx, o.y + o.h / 2);
        ctx.lineTo(o.x, o.y - 4);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case 'balloon': {
        const cx = o.x + o.w / 2;
        const cy = balloonY(o, t);
        const r = o.w / 2;
        // Suspension ropes
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.68, cy + r * 0.62);
        ctx.lineTo(cx - 8, cy + r + 12);
        ctx.moveTo(cx + r * 0.68, cy + r * 0.62);
        ctx.lineTo(cx + 8, cy + r + 12);
        ctx.stroke();
        // Flickering burner flame
        const flame = 0.75 + Math.sin(t * 22 + o.phase) * 0.25;
        ctx.fillStyle = '#ffba30';
        ctx.beginPath();
        ctx.ellipse(cx, cy + r + 6, 4.5 * flame, 6 * flame, 0, 0, Math.PI * 2);
        ctx.fill();
        // Woven wicker basket
        ctx.lineWidth = 2.4;
        ctx.fillStyle = '#c47c44';
        ctx.fillRect(cx - 10, cy + r + 12, 20, 15);
        ctx.strokeRect(cx - 10, cy + r + 12, 20, 15);
        // Striped Montgolfier envelope
        ctx.fillStyle = '#ff7b54';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff9f0';
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 0.44, r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffba30';
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 0.16, r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'plane': {
        const y = o.y;
        // Crisp slipstream lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(o.x + o.w + 6 + i * 4, y - 6 + i * 6);
          ctx.lineTo(o.x + o.w + 22 + i * 6, y - 6 + i * 6);
          ctx.stroke();
        }
        // Origami shaded paper plane
        ctx.strokeStyle = pal.ink;
        ctx.lineWidth = 2.4;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(o.x, y);
        ctx.lineTo(o.x + o.w, y - o.h / 2);
        ctx.lineTo(o.x + o.w * 0.72, y + 2);
        ctx.lineTo(o.x + o.w, y + o.h / 2);
        ctx.closePath();
        ctx.fill();
        // Lower folded shadow wing
        ctx.fillStyle = '#dce8f8';
        ctx.beginPath();
        ctx.moveTo(o.x, y);
        ctx.lineTo(o.x + o.w * 0.72, y + 2);
        ctx.lineTo(o.x + o.w, y + o.h / 2);
        ctx.closePath();
        ctx.fill();
        // Crisp outline
        ctx.beginPath();
        ctx.moveTo(o.x, y);
        ctx.lineTo(o.x + o.w, y - o.h / 2);
        ctx.lineTo(o.x + o.w * 0.72, y + 2);
        ctx.lineTo(o.x + o.w, y + o.h / 2);
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(o.x, y);
        ctx.lineTo(o.x + o.w * 0.72, y + 2);
        ctx.stroke();
        break;
      }
      case 'cloud': {
        const bottom = o.y;
        // Diagonal subtle rain streaks under storm cloud
        ctx.strokeStyle = 'rgba(154, 210, 255, 0.42)';
        ctx.lineWidth = 1.6;
        for (let i = 0; i < 4; i++) {
          const rx = o.x + 12 + i * ((o.w - 24) / 3);
          const ry = bottom + ((t * 95 + i * 19) % 28);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 10);
          ctx.stroke();
        }
        // Layered thundercloud body
        ctx.strokeStyle = pal.ink;
        ctx.lineWidth = 2.6;
        const cg = ctx.createLinearGradient(o.x, 0, o.x, bottom);
        cg.addColorStop(0, '#5a567a');
        cg.addColorStop(1, '#7a759e');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.moveTo(o.x, -10);
        ctx.lineTo(o.x, bottom - 18);
        const bumps = 4;
        for (let i = 0; i < bumps; i++) {
          const x0 = o.x + (o.w / bumps) * i;
          const x1 = x0 + o.w / bumps;
          ctx.quadraticCurveTo((x0 + x1) / 2, bottom + 8, x1, bottom - 18);
        }
        ctx.lineTo(o.x + o.w, -10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Cute grumpy face
        ctx.fillStyle = pal.ink;
        ctx.beginPath();
        ctx.arc(o.x + o.w * 0.38, bottom - 30, 2.6, 0, Math.PI * 2);
        ctx.arc(o.x + o.w * 0.62, bottom - 30, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(o.x + o.w * 0.32, bottom - 38);
        ctx.lineTo(o.x + o.w * 0.43, bottom - 35);
        ctx.moveTo(o.x + o.w * 0.68, bottom - 38);
        ctx.lineTo(o.x + o.w * 0.57, bottom - 35);
        ctx.stroke();
        // Glowing lightning bolt
        if (Math.sin(t * 3 + o.phase) > 0.72) {
          const lx = o.x + o.w * 0.5;
          ctx.fillStyle = '#ffe066';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(lx, bottom - 6);
          ctx.lineTo(lx - 9, bottom + 16);
          ctx.lineTo(lx - 1, bottom + 14);
          ctx.lineTo(lx - 7, bottom + 34);
          ctx.lineTo(lx + 9, bottom + 8);
          ctx.lineTo(lx + 1, bottom + 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        break;
      }
      case 'fan': {
        const cx = o.x + o.w / 2;
        // Luminous swirling updraft wind ribbons
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.lineWidth = 2.2;
        for (let i = 0; i < 4; i++) {
          const lx = o.x + 8 + i * ((o.w - 16) / 3);
          const phase = (t * 135 + i * 37) % 94;
          const alpha = 1 - phase / 94;
          ctx.globalAlpha = alpha * 0.75;
          ctx.beginPath();
          ctx.moveTo(lx, o.y - 8 - phase);
          ctx.quadraticCurveTo(lx + Math.sin(t * 8 + i) * 5, o.y - 22 - phase, lx, o.y - 36 - phase);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // Brushed metallic pedestal
        ctx.strokeStyle = pal.ink;
        ctx.lineWidth = 2.6;
        const fg = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
        fg.addColorStop(0, '#7c92ba');
        fg.addColorStop(0.5, '#a8bce0');
        fg.addColorStop(1, '#7085ad');
        ctx.fillStyle = fg;
        ctx.fillRect(o.x + 4, o.y + 8, o.w - 8, GROUND_Y - o.y - 8);
        ctx.strokeRect(o.x + 4, o.y + 8, o.w - 8, GROUND_Y - o.y - 8);
        // Fan cowling & spinning golden blades
        ctx.fillStyle = '#edf6ff';
        ctx.beginPath();
        ctx.ellipse(cx, o.y + 8, o.w / 2, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffba30';
        const a = t * 20;
        for (let i = 0; i < 3; i++) {
          const ang = a + (i * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(ang) * 10, o.y + 8 + Math.sin(ang) * 3, 10, 3.6, ang, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
    }
  }

  private drawPig(game: Game, pal: Palette): void {
    const { ctx } = this;
    const { x, y, tilt } = game.pig;
    ctx.save();
    ctx.translate(x, y);

    // Warm supersonic glow aura in rocket mode
    if (game.boostT > 0) {
      const aura = ctx.createRadialGradient(0, 0, 12, 0, 0, 48);
      aura.addColorStop(0, 'rgba(255, 224, 102, 0.42)');
      aura.addColorStop(1, 'rgba(255, 94, 138, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.rotate(tilt);

    // Rocket mode jet flame
    if (game.boostT > 0) {
      const flick = 0.82 + Math.sin(game.time * 60) * 0.22;
      ctx.fillStyle = '#ff5e7e';
      ctx.beginPath();
      ctx.ellipse(-PIG_W * 0.56, 4, 24 * flick, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffba30';
      ctx.beginPath();
      ctx.ellipse(-PIG_W * 0.52, 4, 16 * flick, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff9d6';
      ctx.beginPath();
      ctx.ellipse(-PIG_W * 0.46, 4, 8 * flick, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const diving = game.diving && game.state === 'playing';
    const flapping = game.state === 'playing' || game.state === 'ready';
    const wingAngle = diving ? 0.9 : flapping ? -0.35 + Math.sin(game.time * (game.pig.vy < 0 ? 28 : 13)) * 0.56 : 0.4;

    this.wing(-4, -PIG_H * 0.28, wingAngle - 0.25, pal, 0.85); // far wing
    if (this.pigImg) {
      ctx.drawImage(this.pigImg, -PIG_W * 0.55, -PIG_H * 0.56, PIG_W, PIG_H);
    } else {
      ctx.fillStyle = '#ffa8c0';
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(0, 0, PIG_R + 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    this.wing(2, -PIG_H * 0.3, wingAngle, pal, 1); // near wing

    if (game.state === 'crashing' || game.state === 'over') {
      ctx.rotate(-tilt);
      ctx.fillStyle = '#ffd046';
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const a = game.time * 4.5 + (i * Math.PI * 2) / 3;
        this.star(Math.cos(a) * 26, -30 + Math.sin(a) * 8, 6.2);
      }
    }
    ctx.restore();
  }

  private wing(x: number, y: number, angle: number, pal: Palette, alpha: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-6, -22, -22, -26);
    ctx.quadraticCurveTo(-18, -16, -24, -12);
    ctx.quadraticCurveTo(-14, -8, -16, -2);
    ctx.quadraticCurveTo(-8, -2, 0, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private star(x: number, y: number, r: number): void {
    const { ctx } = this;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.45;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
