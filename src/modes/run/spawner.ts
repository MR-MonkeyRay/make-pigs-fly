import { between, type Rng } from '../../lib/rng';
import { circleCircle, circleRect, GROUND_Y, WORLD_H } from './physics';

export type ObstacleKind = 'kite' | 'balloon' | 'plane' | 'cloud' | 'fan';

/**
 * Geometry by kind (x = left edge):
 * - kite:    diamond centred at (x + w/2, y); its string runs straight down to the ground
 * - balloon: envelope centred at (x + w/2, y), radius w/2, basket below
 * - plane:   box (x, y - h/2, w, h); flies faster than the scroll (vx)
 * - cloud:   hangs from the top: box (x, 0, w, y)
 * - fan:     sits on the ground: box (x, y, w, GROUND_Y - y); blows an updraft above itself
 */
export interface Obstacle {
  kind: ObstacleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  phase: number;
}

export function chooseKind(elapsed: number, rng: Rng): ObstacleKind {
  const table: [ObstacleKind, number][] = [
    ['kite', 3],
    ['balloon', 3],
    ['cloud', 2.5],
    ['plane', elapsed > 8 ? 2.2 : 0],
    ['fan', elapsed > 14 ? 1.6 : 0],
  ];
  const total = table.reduce((s, [, w]) => s + w, 0);
  let roll = rng() * total;
  for (const [kind, w] of table) {
    roll -= w;
    if (roll < 0) return kind;
  }
  return 'kite';
}

export function makeObstacle(kind: ObstacleKind, x: number, rng: Rng): Obstacle {
  const phase = rng() * Math.PI * 2;
  switch (kind) {
    case 'kite':
      return { kind, x, y: between(WORLD_H * 0.32, WORLD_H * 0.62, rng), w: 30, h: 40, vx: 0, phase };
    case 'balloon':
      return { kind, x, y: between(70, GROUND_Y - 90, rng), w: 50, h: 82, vx: 0, phase };
    case 'plane':
      return { kind, x, y: between(40, GROUND_Y - 70, rng), w: 42, h: 16, vx: between(90, 150, rng), phase };
    case 'cloud':
      return { kind, x, y: between(WORLD_H * 0.26, WORLD_H * 0.44, rng), w: between(90, 130, rng), h: 0, vx: 0, phase };
    case 'fan':
      return { kind, x, y: GROUND_Y - 52, w: 48, h: 52, vx: 0, phase };
  }
}

/** Vertical bob for balloons (pure, so tests and renderer agree). */
export function balloonY(o: Obstacle, time: number): number {
  return o.y + Math.sin(time * 2 + o.phase) * 9;
}

export function hits(o: Obstacle, cx: number, cy: number, r: number, time: number): boolean {
  switch (o.kind) {
    case 'kite': {
      const mid = o.x + o.w / 2;
      return circleRect(cx, cy, r, o.x + 3, o.y - o.h / 2 + 3, o.w - 6, o.h - 6) || circleRect(cx, cy, r, mid - 2, o.y + o.h / 2, 4, GROUND_Y - o.y);
    }
    case 'balloon': {
      const by = balloonY(o, time);
      return circleCircle(cx, cy, r, o.x + o.w / 2, by, o.w / 2 - 3) || circleRect(cx, cy, r, o.x + o.w / 2 - 10, by + o.w / 2 + 12, 20, 16);
    }
    case 'plane':
      return circleRect(cx, cy, r, o.x + 4, o.y - o.h / 2 + 2, o.w - 8, o.h - 4);
    case 'cloud':
      return circleRect(cx, cy, r, o.x + 6, 0, o.w - 12, o.y - 4);
    case 'fan':
      return circleRect(cx, cy, r, o.x + 4, o.y + 6, o.w - 8, GROUND_Y - o.y);
  }
}

/** Upward push from a fan's updraft column (0 elsewhere). */
export function liftAt(o: Obstacle, cx: number, cy: number): number {
  if (o.kind !== 'fan') return 0;
  return cx > o.x && cx < o.x + o.w && cy < o.y ? 1 : 0;
}

export class Spawner {
  private nextAt = 160;
  constructor(private readonly rng: Rng) {}

  /** Returns a new obstacle when enough distance has passed since the last one. */
  maybeSpawn(distance: number, elapsed: number, worldW: number): Obstacle | null {
    if (distance < this.nextAt) return null;
    const kind = chooseKind(elapsed, this.rng);
    this.nextAt = distance + between(230, 350, this.rng) + Math.min(110, elapsed * 1.8);
    return makeObstacle(kind, worldW + 30, this.rng);
  }
}
