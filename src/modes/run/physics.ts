// Pure game physics in world units (the world is always WORLD_H tall; width follows the screen).
export const WORLD_H = 360;
export const GROUND_H = 34;
export const GROUND_Y = WORLD_H - GROUND_H;
export const PIG_R = 15;
export const CEILING = PIG_R + 4;

export const GRAVITY = 760;
export const FLAP_VY = -330;
export const GLIDE_MAX_VY = 240; // letting go = gliding: falling speed is capped
export const DIVE_GRAVITY = 2100;
export const DIVE_MAX_VY = 620;
export const UPDRAFT = 2500; // hype fans push the pig up

export const SPEED_START = 210;
export const SPEED_RAMP = 6.5; // units/s gained per second
export const SPEED_MAX = 540;

export interface PigBody {
  y: number;
  vy: number;
}

export function speedAt(elapsed: number): number {
  return Math.min(SPEED_MAX, SPEED_START + SPEED_RAMP * elapsed);
}

export function flap(p: PigBody): void {
  p.vy = FLAP_VY;
}

/** Advance the pig. `lift` is extra upward acceleration (from fans or rocket mode). */
export function stepPig(p: PigBody, dive: boolean, lift: number, dt: number): void {
  const g = dive ? DIVE_GRAVITY : GRAVITY;
  p.vy += (g - lift) * dt;
  const max = dive ? DIVE_MAX_VY : GLIDE_MAX_VY;
  if (p.vy > max) p.vy = max;
  if (p.vy < FLAP_VY * 1.4) p.vy = FLAP_VY * 1.4;
  p.y += p.vy * dt;
  if (p.y < CEILING) {
    p.y = CEILING;
    if (p.vy < 0) p.vy = 0;
  }
}

export function touchesGround(p: PigBody): boolean {
  return p.y + PIG_R >= GROUND_Y;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function circleRect(cx: number, cy: number, r: number, x: number, y: number, w: number, h: number): boolean {
  const nx = clamp(cx, x, x + w);
  const ny = clamp(cy, y, y + h);
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
}

export function circleCircle(ax: number, ay: number, ar: number, bx: number, by: number, br: number): boolean {
  return (ax - bx) ** 2 + (ay - by) ** 2 < (ar + br) ** 2;
}
