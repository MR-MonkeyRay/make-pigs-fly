// Game state machine. No DOM here: run.ts owns the page, render.ts owns the canvas.
import { mulberry32, type Rng } from '../../lib/rng';
import { flap, GRAVITY, PIG_R, speedAt, stepPig, touchesGround, UPDRAFT, WORLD_H, type PigBody } from './physics';
import { hits, liftAt, Spawner, type Obstacle, type ObstacleKind } from './spawner';
import { toMeters } from './score';

export type GameState = 'ready' | 'playing' | 'paused' | 'crashing' | 'over';
export type CrashCause = ObstacleKind | 'ground';

export const STEP = 1 / 60;
const CRASH_TIME = 0.75;
const BOOST_TIME = 2.6;

export class Game {
  state: GameState = 'ready';
  pig: PigBody & { x: number; tilt: number; flapT: number } = { x: 0, y: WORLD_H * 0.42, vy: 0, tilt: 0, flapT: 0 };
  obstacles: Obstacle[] = [];
  distance = 0;
  elapsed = 0;
  /** Wall-clock-ish time for decorative animation; keeps ticking on the ready screen. */
  time = 0;
  speed = speedAt(0);
  dive = false;
  /** Short dive triggered by a swipe; keeps going after the finger lifts. */
  diveT = 0;
  boostT = 0;
  crashT = 0;
  cause: CrashCause | null = null;
  worldW = 640;

  private rng: Rng;
  private spawner: Spawner;

  constructor(private seed: number) {
    this.rng = mulberry32(seed);
    this.spawner = new Spawner(this.rng);
  }

  get meters(): number {
    return toMeters(this.distance);
  }

  setWorldWidth(w: number): void {
    this.worldW = w;
    this.pig.x = Math.max(70, Math.min(w * 0.24, 200));
  }

  reset(seed = this.seed + 1): void {
    this.seed = seed;
    this.rng = mulberry32(seed);
    this.spawner = new Spawner(this.rng);
    this.state = 'ready';
    this.pig.y = WORLD_H * 0.42;
    this.pig.vy = 0;
    this.pig.tilt = 0;
    this.obstacles = [];
    this.distance = 0;
    this.elapsed = 0;
    this.speed = speedAt(0);
    this.dive = false;
    this.diveT = 0;
    this.boostT = 0;
    this.crashT = 0;
    this.cause = null;
  }

  get diving(): boolean {
    return this.dive || this.diveT > 0;
  }

  /** A downward swipe: cancel the tap's upward flap and dive for a moment. */
  swipeDive(): void {
    if (this.state !== 'playing') return;
    this.diveT = 0.32;
    this.pig.vy = Math.max(this.pig.vy, 160);
  }

  /** Forget held controls (used on pause, blur, unmount, lost pointer). */
  releaseControls(): void {
    this.dive = false;
    this.diveT = 0;
  }

  /** Tap / Space: start, resume, or flap. */
  press(): void {
    if (this.state === 'ready') this.state = 'playing';
    else if (this.state === 'paused') {
      this.state = 'playing';
      return;
    }
    if (this.state === 'playing') {
      this.diveT = 0; // a new flap ends any swipe-dive still running
      flap(this.pig);
      this.pig.flapT = 0;
    }
  }

  pause(): void {
    this.releaseControls();
    if (this.state === 'playing') this.state = 'paused';
  }

  togglePause(): void {
    this.releaseControls();
    if (this.state === 'playing') this.state = 'paused';
    else if (this.state === 'paused') this.state = 'playing';
  }

  boost(): void {
    if (this.state === 'ready' || this.state === 'paused') this.state = 'playing';
    if (this.state === 'playing') this.boostT = BOOST_TIME;
  }

  /** Advance one fixed step. Returns true on the step where the pig crashes. */
  update(dt: number): boolean {
    if (this.state === 'paused' || this.state === 'over') return false;
    this.time += dt;
    this.pig.flapT += dt;
    if (this.state === 'ready') {
      this.pig.y = WORLD_H * 0.42 + Math.sin(this.time * 3) * 8; // hover on the start screen
      return false;
    }
    if (this.state === 'crashing') {
      this.crashT += dt;
      this.pig.vy += 1400 * dt;
      this.pig.y = Math.min(this.pig.y + this.pig.vy * dt, WORLD_H - PIG_R);
      this.pig.tilt += 9 * dt;
      if (this.crashT >= CRASH_TIME) this.state = 'over';
      return false;
    }
    if (this.state !== 'playing') return false;

    this.elapsed += dt;
    const boosting = this.boostT > 0;
    if (boosting) this.boostT -= dt;
    this.speed = speedAt(this.elapsed) * (boosting ? 1.6 : 1);
    const dx = this.speed * dt;
    this.distance += dx;

    // Lift: fans push up; rocket mode steers toward the middle of the sky.
    let lift = 0;
    for (const o of this.obstacles) lift += liftAt(o, this.pig.x, this.pig.y) * UPDRAFT;
    if (boosting) {
      // Rocket mode: cancel gravity and steer smoothly toward the middle of the sky.
      lift += GRAVITY;
      const target = WORLD_H * 0.4;
      this.pig.vy += (target - this.pig.y) * 6 * dt - this.pig.vy * 3 * dt;
    }
    if (this.diveT > 0) this.diveT = Math.max(0, this.diveT - dt);
    stepPig(this.pig, this.diving && !boosting, lift, dt);
    this.pig.tilt = Math.max(-0.5, Math.min(0.75, this.pig.vy / 520));

    for (const o of this.obstacles) o.x -= dx + o.vx * dt;
    this.obstacles = this.obstacles.filter((o) => o.x + o.w > -60);
    const spawned = this.spawner.maybeSpawn(this.distance, this.elapsed, this.worldW);
    if (spawned) this.obstacles.push(spawned);

    if (boosting) return false;
    const hitR = PIG_R - 2; // forgiving hitbox
    const hit = this.obstacles.find((o) => hits(o, this.pig.x, this.pig.y, hitR, this.time));
    if (hit || touchesGround(this.pig)) {
      this.cause = hit ? hit.kind : 'ground';
      this.state = 'crashing';
      this.crashT = 0;
      this.pig.vy = Math.min(this.pig.vy, -120);
      this.releaseControls();
      return true;
    }
    return false;
  }
}
