// Canvas drawing for Hog Wild. Everything is drawn in world units; only resize() knows about pixels.
// All art is original and shares the site's ink-outline style (no text on the canvas: text lives in the DOM for i18n).
import type { Game } from './game';
import { GROUND_Y, PIG_R, WORLD_H } from './physics';
import { balloonY, type Obstacle } from './spawner';

export interface Palette {
  skyTop: string;
  skyBottom: string;
  ink: string;
  grass: string;
  grassDeep: string;
  cloud: string;
  hillFar: string;
  hillNear: string;
  accent: string;
}

export function readPalette(el: Element): Palette {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const dark = cs.colorScheme.includes('dark') && !cs.colorScheme.includes('light');
  return {
    skyTop: v('--stage-sky-top', '#9fd6ff'),
    skyBottom: v('--stage-sky-bottom', '#e8f6ff'),
    ink: v('--art-ink', '#2a1e2e'),
    grass: v('--grass', '#84d06f'),
    grassDeep: v('--grass-deep', '#57ad4b'),
    cloud: v('--cloud', '#ffffff'),
    hillFar: dark ? '#3b3466' : '#bfe6c4',
    hillNear: dark ? '#2f5a52' : '#a5dca0',
    accent: v('--accent', '#ffc83d'),
  };
}

const PIG_W = 68;
const PIG_H = (PIG_W * 170) / 220;

export class Renderer {
  pigImg: HTMLImageElement | null = null;
  private ctx: CanvasRenderingContext2D;
  private scale = 1;
  private dpr = 1;
  private worldW = 640;
  private sky: CanvasGradient | null = null;

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
    this.sky = null;
    return this.worldW;
  }

  draw(game: Game, pal: Palette): void {
    const { ctx } = this;
    ctx.setTransform(this.scale * this.dpr, 0, 0, this.scale * this.dpr, 0, 0);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (!this.sky) {
      this.sky = ctx.createLinearGradient(0, 0, 0, WORLD_H);
      this.sky.addColorStop(0, pal.skyTop);
      this.sky.addColorStop(1, pal.skyBottom);
    }
    ctx.fillStyle = this.sky;
    ctx.fillRect(0, 0, this.worldW, WORLD_H);

    this.drawBackdrop(game, pal);
    for (const o of game.obstacles) this.drawObstacle(o, game, pal);
    this.drawGround(game, pal);
    this.drawPig(game, pal);
  }

  invalidatePalette(): void {
    this.sky = null;
  }

  private drawBackdrop(game: Game, pal: Palette): void {
    const { ctx } = this;
    const W = this.worldW;
    // Drifting clouds (decorative, no collision).
    ctx.fillStyle = pal.cloud;
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 4; i++) {
      const span = W + 220;
      const x = ((i * 260 - game.distance * 0.12 - game.time * 6) % span + span) % span - 110;
      const y = 40 + ((i * 53) % 90);
      const s = 0.7 + (i % 3) * 0.25;
      this.puff(x, y, s);
    }
    ctx.globalAlpha = 1;
    // Two layers of rolling hills.
    this.hills(pal.hillFar, GROUND_Y - 58, 34, 0.18, game.distance, 260);
    this.hills(pal.hillNear, GROUND_Y - 30, 24, 0.4, game.distance, 180);
  }

  private puff(x: number, y: number, s: number): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.ellipse(x, y, 34 * s, 13 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 12 * s, y - 8 * s, 15 * s, 13 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 10 * s, y - 11 * s, 17 * s, 15 * s, 0, 0, Math.PI * 2);
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
    ctx.fillStyle = pal.grass;
    ctx.fillRect(0, GROUND_Y, this.worldW, WORLD_H - GROUND_Y);
    ctx.fillStyle = pal.grassDeep;
    ctx.fillRect(0, GROUND_Y + 16, this.worldW, WORLD_H - GROUND_Y - 16);
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(this.worldW, GROUND_Y);
    ctx.stroke();
    // Grass tufts scroll with the world.
    ctx.lineWidth = 2;
    const off = game.distance % 46;
    for (let x = -off; x < this.worldW; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y + 10);
      ctx.lineTo(x + 3, GROUND_Y + 5);
      ctx.moveTo(x + 6, GROUND_Y + 10);
      ctx.lineTo(x + 8, GROUND_Y + 4);
      ctx.stroke();
    }
  }

  private drawObstacle(o: Obstacle, game: Game, pal: Palette): void {
    const { ctx } = this;
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 3;
    const t = game.time;
    switch (o.kind) {
      case 'kite': {
        const cx = o.x + o.w / 2;
        const top = o.y - o.h / 2;
        // string
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx, o.y + o.h / 2);
        ctx.quadraticCurveTo(cx - 10, (o.y + GROUND_Y) / 2, cx - 4, GROUND_Y);
        ctx.stroke();
        // tail bows
        ctx.fillStyle = '#4aa8ff';
        for (let i = 1; i <= 3; i++) {
          const bx = cx + Math.sin(t * 6 + i + o.phase) * 5 - i * 3;
          const by = o.y + o.h / 2 + i * 12;
          ctx.beginPath();
          ctx.moveTo(bx - 5, by - 3);
          ctx.lineTo(bx + 5, by + 3);
          ctx.lineTo(bx + 5, by - 3);
          ctx.lineTo(bx - 5, by + 3);
          ctx.closePath();
          ctx.fill();
        }
        // diamond
        ctx.lineWidth = 3;
        ctx.fillStyle = '#ff6b6f';
        ctx.beginPath();
        ctx.moveTo(cx, top);
        ctx.lineTo(o.x + o.w, o.y - 4);
        ctx.lineTo(cx, o.y + o.h / 2);
        ctx.lineTo(o.x, o.y - 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.moveTo(cx, top);
        ctx.lineTo(o.x + o.w, o.y - 4);
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
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.7, cy + r * 0.6);
        ctx.lineTo(cx - 8, cy + r + 12);
        ctx.moveTo(cx + r * 0.7, cy + r * 0.6);
        ctx.lineTo(cx + 8, cy + r + 12);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.fillStyle = '#b5713c';
        ctx.fillRect(cx - 10, cy + r + 12, 20, 16);
        ctx.strokeRect(cx - 10, cy + r + 12, 20, 16);
        ctx.fillStyle = '#ff9f43';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fffdf8';
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 0.42, r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'plane': {
        const y = o.y;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(o.x + o.w + 6 + i * 4, y - 6 + i * 6);
          ctx.lineTo(o.x + o.w + 20 + i * 6, y - 6 + i * 6);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.lineWidth = 3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(o.x, y);
        ctx.lineTo(o.x + o.w, y - o.h / 2);
        ctx.lineTo(o.x + o.w * 0.7, y + 2);
        ctx.lineTo(o.x + o.w, y + o.h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(o.x, y);
        ctx.lineTo(o.x + o.w * 0.7, y + 2);
        ctx.stroke();
        break;
      }
      case 'cloud': {
        const bottom = o.y;
        ctx.fillStyle = '#7d7898';
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
        // grumpy face
        ctx.fillStyle = pal.ink;
        ctx.beginPath();
        ctx.arc(o.x + o.w * 0.38, bottom - 30, 2.5, 0, Math.PI * 2);
        ctx.arc(o.x + o.w * 0.62, bottom - 30, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(o.x + o.w * 0.33, bottom - 38);
        ctx.lineTo(o.x + o.w * 0.43, bottom - 35);
        ctx.moveTo(o.x + o.w * 0.67, bottom - 38);
        ctx.lineTo(o.x + o.w * 0.57, bottom - 35);
        ctx.stroke();
        // occasional lightning
        if (Math.sin(t * 3 + o.phase) > 0.75) {
          const lx = o.x + o.w * 0.5;
          ctx.fillStyle = pal.accent;
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
        // updraft
        ctx.strokeStyle = pal.cloud;
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const lx = o.x + 8 + i * ((o.w - 16) / 3);
          const phase = (t * 120 + i * 37) % 90;
          ctx.beginPath();
          ctx.moveTo(lx, o.y - 10 - phase);
          ctx.lineTo(lx, o.y - 34 - phase);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = pal.ink;
        ctx.lineWidth = 3;
        ctx.fillStyle = '#8fa3cc';
        ctx.fillRect(o.x + 4, o.y + 8, o.w - 8, GROUND_Y - o.y - 8);
        ctx.strokeRect(o.x + 4, o.y + 8, o.w - 8, GROUND_Y - o.y - 8);
        ctx.fillStyle = '#e6f4ff';
        ctx.beginPath();
        ctx.ellipse(cx, o.y + 8, o.w / 2, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffc83d';
        const a = t * 18;
        for (let i = 0; i < 3; i++) {
          const ang = a + (i * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(ang) * 10, o.y + 8 + Math.sin(ang) * 3, 10, 3.5, ang, 0, Math.PI * 2);
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
    ctx.rotate(tilt);

    // Rocket mode flame.
    if (game.boostT > 0) {
      const flick = 0.8 + Math.sin(game.time * 60) * 0.2;
      ctx.fillStyle = '#ff6b3d';
      ctx.beginPath();
      ctx.ellipse(-PIG_W * 0.55, 4, 18 * flick, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.ellipse(-PIG_W * 0.5, 4, 10 * flick, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const diving = game.diving && game.state === 'playing';
    const flapping = game.state === 'playing' || game.state === 'ready';
    const wingAngle = diving ? 0.9 : flapping ? -0.35 + Math.sin(game.time * (game.pig.vy < 0 ? 26 : 12)) * 0.55 : 0.4;

    this.wing(-4, -PIG_H * 0.3, wingAngle - 0.25, pal, 0.85); // far wing
    if (this.pigImg) {
      ctx.drawImage(this.pigImg, -PIG_W * 0.55, -PIG_H * 0.56, PIG_W, PIG_H);
    } else {
      ctx.fillStyle = '#ff9fb6';
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, PIG_R + 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    this.wing(2, -PIG_H * 0.32, wingAngle, pal, 1); // near wing

    if (game.state === 'crashing' || game.state === 'over') {
      ctx.rotate(-tilt);
      ctx.fillStyle = pal.accent;
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const a = game.time * 4 + (i * Math.PI * 2) / 3;
        this.star(Math.cos(a) * 26, -30 + Math.sin(a) * 8, 6);
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
    ctx.lineWidth = 2.5;
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
