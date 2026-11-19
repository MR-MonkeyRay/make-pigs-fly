import { soundEngine } from '../audio/soundEngine';
import type { TranslationSchema } from '../i18n/types';
import { drawPig } from './drawPig';
import type {
  AtcEventKey,
  EngineCallbacks,
  FlightTelemetry,
  PropulsionState,
  ZoneId,
} from './types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  kind: 'smoke' | 'spark' | 'feather' | 'confetti' | 'wind' | 'pop';
  rot: number;
  vrot: number;
}

interface FloatingTag {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  bg: string;
  fg: string;
  life: number;
  maxLife: number;
}

interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  alpha: number;
}

interface Star {
  nx: number; // 0..1 normalized
  ny: number;
  r: number;
  phase: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number): string {
  const ct = clamp(t, 0, 1);
  const r = Math.round(lerp(c1[0], c2[0], ct));
  const g = Math.round(lerp(c1[1], c2[1], ct));
  const b = Math.round(lerp(c1[2], c2[2], ct));
  return `rgb(${r}, ${g}, ${b})`;
}

const SKY_STOPS: Array<{ alt: number; top: [number, number, number]; bot: [number, number, number] }> = [
  { alt: 0, top: [34, 122, 224], bot: [164, 224, 255] },
  { alt: 2500, top: [20, 84, 186], bot: [96, 180, 250] },
  { alt: 12000, top: [12, 32, 84], bot: [49, 102, 186] },
  { alt: 35000, top: [6, 10, 26], bot: [18, 38, 82] },
  { alt: 90000, top: [16, 7, 38], bot: [46, 18, 88] },
];

function getSkyGradientColors(altitude: number): [string, string] {
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    const a = SKY_STOPS[i];
    const b = SKY_STOPS[i + 1];
    if (altitude <= b.alt) {
      const t = (altitude - a.alt) / (b.alt - a.alt);
      return [lerpColor(a.top, b.top, t), lerpColor(a.bot, b.bot, t)];
    }
  }
  const last = SKY_STOPS[SKY_STOPS.length - 1];
  return [
    `rgb(${last.top[0]}, ${last.top[1]}, ${last.top[2]})`,
    `rgb(${last.bot[0]}, ${last.bot[1]}, ${last.bot[2]})`,
  ];
}

function getZone(altitude: number): ZoneId {
  if (altitude < 120) return 'tarmac';
  if (altitude < 2500) return 'clouds';
  if (altitude < 12000) return 'airspace';
  if (altitude < 40000) return 'stratosphere';
  if (altitude < 100000) return 'space';
  return 'transcendence';
}

export class FlightEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: EngineCallbacks;
  private t: TranslationSchema;

  private rafId: number | null = null;
  private lastTs = 0;
  private time = 0;
  private width = 800;
  private height = 460;

  // Physics state
  private altitude = 0; // meters
  private peakAltitude = 0;
  private vy = 0; // m/s (positive = upward!)
  private pigX = 400; // screen x
  private pigY = 360; // screen y
  private vx = 0; // screen px/s
  private screenVy = 0; // visual vy for tilt/scarf

  private propulsion: PropulsionState = {
    windLevel: 0,
    balloonCount: 0,
    rocketsActive: false,
    wingsEquipped: false,
    rainbowMode: false,
  };

  // Visual animation state
  private lookX = 0;
  private lookY = 0;
  private blinkTimer = 2.5;
  private blinkValue = 0;
  private snoutSquish = 0;
  private blush = 0;
  private wingPhase = 0;
  private shakeIntensity = 0;
  private flapCount = 0;
  private celebratedTranscendence = false;
  private reachedSpace = false;
  private reachedAirspace = false;
  private reachedStratosphere = false;
  private reachedLiftoff = false;

  // Speech bubble
  private speechText = '';
  private speechTimer = 0;
  private idleSpeechCooldown = 2.2;

  // ATC event
  private atcKey: AtcEventKey = 'ready';

  // Trails
  private scarfTrail: Array<{ x: number; y: number }> = [];
  private rainbowTrail: Array<{ x: number; y: number }> = [];

  // Particles & world props
  private particles: Particle[] = [];
  private tags: FloatingTag[] = [];
  private clouds: Cloud[] = [];
  private stars: Star[] = [];
  private planeX = -150;
  private gullX = -80;
  private satX = 120;
  private buzzwordTimer = 0;

  // Pointer drag/poke state
  private pointerDown = false;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private dragVelX = 0;
  private dragVelY = 0;
  private activePointerId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private telemetryAccum = 0;

  constructor(canvas: HTMLCanvasElement, t: TranslationSchema, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.t = t;
    this.callbacks = callbacks;

    this.initWorldProps();
    this.resize();
    this.pigX = this.width * 0.5;
    this.pigY = this.getGroundY();
    this.say(this.pick(this.t.pigDialogue.idle), 4.5);

    this.bindEvents();
  }

  public updateTranslations(t: TranslationSchema): void {
    this.t = t;
    if (this.altitude < 5 && this.speechTimer <= 0.5) {
      this.say(this.pick(this.t.pigDialogue.idle), 4);
    }
  }

  public setPeakAltitude(alt: number): void {
    this.peakAltitude = Math.max(this.peakAltitude, alt);
  }

  public setPropulsion(partial: Partial<PropulsionState>): void {
    const prev = { ...this.propulsion };
    this.propulsion = { ...this.propulsion, ...partial };

    if (this.propulsion.windLevel !== prev.windLevel) {
      soundEngine.setWindLevel(this.propulsion.windLevel / 100);
      if (this.propulsion.windLevel >= 100) {
        this.callbacks.onUnlockAchievement('vc_hype');
        this.setAtc('windVent');
        this.say(this.pick(this.t.pigDialogue.windHigh), 3.6);
      } else if (this.propulsion.windLevel >= 65 && prev.windLevel < 65) {
        this.setAtc('windVent');
        this.say(this.pick(this.t.pigDialogue.windHigh), 3.2);
      }
    }

    if (this.propulsion.rocketsActive !== prev.rocketsActive) {
      soundEngine.setRocketLevel(this.propulsion.rocketsActive ? 1 : 0);
      if (this.propulsion.rocketsActive) {
        soundEngine.playOink(1.28);
        this.say(this.pick(this.t.pigDialogue.rocket), 3.6);
      }
    }

    if (this.propulsion.rainbowMode && !prev.rainbowMode) {
      soundEngine.playFanfare();
      this.setAtc('rainbow');
      this.say(this.pick(this.t.pigDialogue.rainbow), 4.5);
      this.spawnConfetti(42);
    }
  }

  public addBalloon(): number {
    if (this.propulsion.balloonCount >= 15) {
      soundEngine.playBalloonAdd(15);
      this.blush = 1;
      this.say(this.pick(this.t.pigDialogue.balloons), 3.2);
      return 15;
    }
    const next = this.propulsion.balloonCount + 1;
    this.propulsion.balloonCount = next;
    soundEngine.playBalloonAdd(next);
    this.blush = 1;

    // Spawn floating compliment pill!
    const text = this.pick(this.t.pigDialogue.compliments);
    const palette = [
      { bg: '#FFE3EC', fg: '#8A1944' },
      { bg: '#FFF3C4', fg: '#7B4A00' },
      { bg: '#DFF5FF', fg: '#0E4A7B' },
      { bg: '#E6F9E8', fg: '#165E2B' },
    ];
    const theme = palette[next % palette.length];
    this.tags.push({
      x: this.pigX + (Math.random() - 0.5) * 90,
      y: this.pigY - 58,
      vx: (Math.random() - 0.5) * 28,
      vy: -58 - Math.random() * 25,
      text,
      bg: theme.bg,
      fg: theme.fg,
      life: 0,
      maxLife: 2.3,
    });

    if (next === 4 || next === 8 || next === 12) {
      this.say(this.pick(this.t.pigDialogue.balloons), 3.4);
    }
    if (next >= 10) {
      this.callbacks.onUnlockAchievement('sweet_talker');
      this.setAtc('balloonOverload');
    }
    return next;
  }

  public popAllBalloons(): void {
    if (this.propulsion.balloonCount <= 0) return;
    const count = this.propulsion.balloonCount;
    this.propulsion.balloonCount = 0;
    soundEngine.playPop();
    setTimeout(() => soundEngine.playPop(), 65);
    this.setAtc('popped');
    this.say(this.pick(this.t.pigDialogue.flung), 2.8);

    const colors = ['#FF5E8A', '#FFD166', '#4CC9F0', '#C77DFF', '#72EFDD'];
    for (let i = 0; i < count * 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 80 + Math.random() * 220;
      this.particles.push({
        x: this.pigX + (Math.random() - 0.5) * 80,
        y: this.pigY - 75 + (Math.random() - 0.5) * 35,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 4 + Math.random() * 5,
        life: 0,
        maxLife: 0.65 + Math.random() * 0.4,
        color: colors[i % colors.length],
        kind: 'pop',
        rot: Math.random() * 6,
        vrot: (Math.random() - 0.5) * 14,
      });
    }
  }

  public flapWings(): void {
    this.propulsion.wingsEquipped = true;
    this.wingPhase = 1;
    this.vy = Math.max(this.vy + 230, 310);
    if (this.altitude < 2) this.altitude = 3;
    this.flapCount += 1;
    soundEngine.playFlap();

    // Spawn golden feathers
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.pigX + (Math.random() - 0.5) * 44,
        y: this.pigY + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 110,
        vy: 40 + Math.random() * 90,
        size: 6 + Math.random() * 4,
        life: 0,
        maxLife: 0.9 + Math.random() * 0.5,
        color: i % 2 === 0 ? '#FFE07D' : '#FFF7D6',
        kind: 'feather',
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 8,
      });
    }

    if (this.flapCount === 1 || this.flapCount % 5 === 0) {
      this.say(this.pick(this.t.pigDialogue.flapping), 3);
    }
    if (this.flapCount >= 12) {
      this.callbacks.onUnlockAchievement('flappy_bacon');
    }
  }

  public fullSend(): PropulsionState {
    const next: PropulsionState = {
      ...this.propulsion,
      windLevel: 100,
      balloonCount: Math.max(this.propulsion.balloonCount, 8),
      rocketsActive: true,
      wingsEquipped: true,
    };
    this.setPropulsion(next);
    this.vy = Math.max(this.vy, 520);
    if (this.altitude < 4) this.altitude = 5;
    this.spawnConfetti(26);
    this.callbacks.onPropulsionSync?.(next);
    return next;
  }

  public resetToRunway(): PropulsionState {
    const next: PropulsionState = {
      windLevel: 0,
      balloonCount: 0,
      rocketsActive: false,
      wingsEquipped: false,
      rainbowMode: this.propulsion.rainbowMode,
    };
    this.setPropulsion(next);
    this.altitude = 0;
    this.vy = 0;
    this.vx = 0;
    this.pigX = this.width * 0.5;
    this.pigY = this.getGroundY();
    this.scarfTrail = [];
    this.rainbowTrail = [];
    this.setAtc('ready');
    this.say(this.pick(this.t.pigDialogue.idle), 4);
    this.callbacks.onPropulsionSync?.(next);
    return next;
  }

  public start(): void {
    if (this.rafId !== null) return;
    this.lastTs = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTs) / 1000));
      this.lastTs = now;
      this.update(dt);
      this.render();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    soundEngine.setRocketLevel(0);
    soundEngine.setWindLevel(0);
    this.unbindEvents();
  }

  private getGroundY(): number {
    return this.height - 84;
  }

  private getPigScale(): number {
    return this.width < 520 ? 0.78 : 0.94;
  }

  private initWorldProps(): void {
    this.clouds = Array.from({ length: 11 }, (_, i) => ({
      x: Math.random() * 1100,
      y: (i / 11) * 520,
      scale: 0.65 + Math.random() * 0.9,
      speed: 12 + Math.random() * 24,
      alpha: 0.55 + Math.random() * 0.35,
    }));

    this.stars = Array.from({ length: 95 }, () => ({
      nx: Math.random(),
      ny: Math.random(),
      r: 0.8 + Math.random() * 1.9,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  public resize = (): void => {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(280, Math.floor(rect.width));
    const h = Math.max(320, Math.floor(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = w;
    this.height = h;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.pigX = clamp(this.pigX, 60, this.width - 60);
    if (this.altitude <= 0.1) {
      this.pigY = this.getGroundY();
    }
  };

  private getCanvasPoint(e: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private onPointerDown = (e: PointerEvent): void => {
    const pt = this.getCanvasPoint(e);
    const dx = pt.x - this.pigX;
    const dy = pt.y - this.pigY;
    const dist = Math.hypot(dx, dy);

    // Only capture interaction when touching/clicking Wilbur directly (preserves mobile scroll!)
    if (dist < 82 * this.getPigScale()) {
      this.pointerDown = true;
      this.isDragging = false;
      this.activePointerId = e.pointerId;
      this.dragStartX = pt.x;
      this.dragStartY = pt.y;
      this.lastPointerX = pt.x;
      this.lastPointerY = pt.y;
      this.dragVelX = 0;
      this.dragVelY = 0;
      this.canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    const pt = this.getCanvasPoint(e);
    // Eye tracking toward cursor
    const dx = pt.x - (this.pigX + 24);
    const dy = pt.y - (this.pigY - 8);
    const len = Math.max(1, Math.hypot(dx, dy));
    this.lookX = clamp(dx / Math.max(len, 90), -1, 1);
    this.lookY = clamp(dy / Math.max(len, 90), -1, 1);

    if (!this.pointerDown || e.pointerId !== this.activePointerId) return;

    const moved = Math.hypot(pt.x - this.dragStartX, pt.y - this.dragStartY);
    if (moved > 8) {
      this.isDragging = true;
    }

    if (this.isDragging) {
      this.dragVelX = (pt.x - this.lastPointerX) * 52;
      this.dragVelY = (pt.y - this.lastPointerY) * 52;
      this.pigX = clamp(pt.x, 55, this.width - 55);
      this.pigY = clamp(pt.y, 55, this.getGroundY());
      const liftedAlt = Math.max(0, (this.getGroundY() - this.pigY) * 2.2);
      if (this.altitude < liftedAlt) {
        this.altitude = liftedAlt;
      }
    }

    this.lastPointerX = pt.x;
    this.lastPointerY = pt.y;
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (!this.pointerDown || e.pointerId !== this.activePointerId) return;
    this.pointerDown = false;
    try {
      this.canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if capture already released
    }
    this.activePointerId = null;

    if (this.isDragging) {
      this.isDragging = false;
      this.vx = clamp(this.dragVelX, -900, 900);
      const launchUp = clamp(-this.dragVelY * 1.45, -350, 1400);
      this.vy = launchUp;
      if (launchUp > 180) {
        this.altitude = Math.max(this.altitude, 18);
        soundEngine.playOink(1.18);
        this.say(this.pick(this.t.pigDialogue.flung), 3);
        this.callbacks.onUnlockAchievement('gravity_denier');
      }
    } else {
      // Cute Snout Poke!
      this.snoutSquish = 1;
      this.blush = 1;
      soundEngine.playOink(0.95 + Math.random() * 0.25);
      this.say(this.pick(this.t.pigDialogue.poked), 3.4);
      // Little startled hop
      if (this.altitude < 5) {
        this.vy = 140;
        this.altitude = 4;
      }
    }
  };

  private onTouchMove = (e: TouchEvent): void => {
    if (this.pointerDown) {
      e.preventDefault();
    }
  };

  private onVisibilityChange = (): void => {
    if (document.hidden) {
      soundEngine.setRocketLevel(0);
      soundEngine.setWindLevel(0);
    } else {
      soundEngine.setRocketLevel(this.propulsion.rocketsActive ? 1 : 0);
      soundEngine.setWindLevel(this.propulsion.windLevel / 100);
    }
  };

  private bindEvents(): void {
    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    if (typeof ResizeObserver !== 'undefined' && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  private unbindEvents(): void {
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private say(text: string, duration = 3.2): void {
    this.speechText = text;
    this.speechTimer = duration;
  }

  private setAtc(key: AtcEventKey): void {
    this.atcKey = key;
  }

  private spawnConfetti(count: number): void {
    const colors = ['#FF4D1C', '#FFD166', '#4CC9F0', '#FF7CA8', '#72EFDD', '#80ED99', '#C77DFF'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 90 + Math.random() * 340;
      this.particles.push({
        x: this.pigX,
        y: this.pigY - 10,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 120,
        size: 5 + Math.random() * 5,
        life: 0,
        maxLife: 1.5 + Math.random() * 1.1,
        color: colors[i % colors.length],
        kind: 'confetti',
        rot: Math.random() * 6.28,
        vrot: (Math.random() - 0.5) * 14,
      });
    }
  }

  private update(dt: number): void {
    this.time += dt;

    // Blinking
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.blinkValue = 1;
      if (this.blinkTimer <= -0.14) {
        this.blinkValue = 0;
        this.blinkTimer = 2.2 + Math.random() * 3.4;
      }
    }

    // Decay expression timers
    this.snoutSquish = Math.max(0, this.snoutSquish - dt * 4.5);
    this.blush = Math.max(0, this.blush - dt * 0.55);
    this.wingPhase = Math.max(0, this.wingPhase - dt * 3.8);
    if (this.speechTimer > 0) this.speechTimer -= dt;

    // Idle chatter when sitting on tarmac
    if (this.altitude < 2 && this.speechTimer <= 0) {
      this.idleSpeechCooldown -= dt;
      if (this.idleSpeechCooldown <= 0) {
        this.say(this.pick(this.t.pigDialogue.idle), 4);
        this.idleSpeechCooldown = 5.5 + Math.random() * 4;
      }
    }

    // PHYSICS SIMULATION
    if (!this.isDragging) {
      // Gravity tapers smoothly in upper atmosphere / space!
      const spaceFactor = clamp(this.altitude / 55000, 0, 0.88);
      const gravity = 320 * (1 - spaceFactor);

      // 1. Startup Hype Wind Vent thrust (strongest below 5,000m)
      const windNorm = this.propulsion.windLevel / 100;
      const windAltDecay = clamp(1 - this.altitude / 6800, 0.12, 1);
      const windAccel = windNorm > 0 ? windNorm * 610 * windAltDecay : 0;

      // 2. Compliment Balloons buoyancy (4+ balloons beat gravity cleanly!)
      const bCount = this.propulsion.balloonCount;
      const balloonAltDecay = clamp(1 - this.altitude / (bCount * 2600 + 800), 0.05, 1);
      const balloonAccel = bCount > 0 ? bCount * 95 * balloonAltDecay : 0;

      // 3. Zero-Bacon Booster Rockets (blasts straight to orbit!)
      const rocketAccel = this.propulsion.rocketsActive ? 1480 : 0;

      // 4. Rainbow Hyperdrive hover boost
      const rainbowAccel = this.propulsion.rainbowMode ? 355 : 0;

      // Air drag (thinner air in space!)
      const dragCoeff = lerp(0.55, 0.08, clamp(this.altitude / 45000, 0, 1));
      const drag = -this.vy * dragCoeff;

      const netAccel = windAccel + balloonAccel + rocketAccel + rainbowAccel - gravity + drag;
      this.vy += netAccel * dt;

      // Clamp max speeds nicely
      this.vy = clamp(this.vy, -950, 4800);

      // Update altitude
      this.altitude += this.vy * dt * 1.45;
      if (this.altitude <= 0) {
        this.altitude = 0;
        if (this.vy < -180) {
          // Cute soft bounce on tarmac
          this.vy = -this.vy * 0.28;
          this.snoutSquish = 0.65;
          soundEngine.playOink(0.86);
        } else {
          this.vy = 0;
        }
      }

      // Horizontal gentle sway & drift
      const windSway = windNorm > 0.1 && this.altitude > 10 ? Math.sin(this.time * 3.1) * 90 * windNorm : 0;
      const rainbowSway = this.propulsion.rainbowMode ? Math.cos(this.time * 2.4) * 130 : 0;
      const targetCenterPull = (this.width * 0.5 - this.pigX) * (this.altitude < 5 ? 4.5 : 0.75);

      this.vx += (targetCenterPull + windSway + rainbowSway - this.vx * 1.8) * dt;
      this.pigX += this.vx * dt;

      const margin = 62 * this.getPigScale();
      if (this.pigX < margin) {
        this.pigX = margin;
        this.vx = Math.abs(this.vx) * 0.55;
      } else if (this.pigX > this.width - margin) {
        this.pigX = this.width - margin;
        this.vx = -Math.abs(this.vx) * 0.55;
      }

      // Map altitude smoothly to screen Y (lifts off runway to sweet center!)
      const groundY = this.getGroundY();
      const flightTargetY = this.height * 0.52;
      const climbT = clamp(this.altitude / 240, 0, 1);
      const bob = this.altitude > 5 ? Math.sin(this.time * 3.2) * 8 : 0;
      const desiredY = lerp(groundY, flightTargetY, 1 - Math.pow(1 - climbT, 3)) + bob;
      this.pigY += (desiredY - this.pigY) * clamp(dt * 8, 0, 1);
      this.screenVy = -this.vy;
    }

    // Track peak altitude & milestone achievements!
    if (this.altitude > this.peakAltitude) {
      this.peakAltitude = this.altitude;
    }

    const mach = Math.abs(this.vy) / 343;
    if (this.altitude > 18 && !this.reachedLiftoff) {
      this.reachedLiftoff = true;
      this.setAtc('liftoff');
      this.callbacks.onUnlockAchievement('first_liftoff');
      soundEngine.playChime([523.25, 659.25]);
    }
    if (this.propulsion.rocketsActive && mach >= 1.0) {
      this.callbacks.onUnlockAchievement('sonic_oink');
      if (this.atcKey !== 'supersonic' && this.altitude < 40000) {
        this.setAtc('supersonic');
      }
    }
    if (this.altitude >= 3000 && !this.reachedAirspace) {
      this.reachedAirspace = true;
      this.setAtc('airspace');
    }
    if (this.altitude >= 12000 && !this.reachedStratosphere) {
      this.reachedStratosphere = true;
      this.setAtc('stratosphere');
    }
    if (this.altitude >= 40000 && !this.reachedSpace) {
      this.reachedSpace = true;
      this.setAtc('space');
      this.callbacks.onUnlockAchievement('orbital_swine');
      soundEngine.playChime([523.25, 659.25, 783.99, 1046.5]);
      this.say(this.pick(this.t.pigDialogue.space), 4.5);
    }
    if (this.altitude >= 100000 && !this.celebratedTranscendence) {
      this.celebratedTranscendence = true;
      this.setAtc('transcendence');
      soundEngine.playFanfare();
      this.spawnConfetti(60);
      this.say(this.pick(this.t.pigDialogue.space), 5);
    }

    // Screen shake for rockets
    const targetShake = this.propulsion.rocketsActive ? (mach > 1 ? 5.5 : 3.2) : 0;
    this.shakeIntensity = lerp(this.shakeIntensity, targetShake, dt * 8);

    // Update trails
    const scarfAnchorX = this.pigX + 12 * this.getPigScale();
    const scarfAnchorY = this.pigY + 12 * this.getPigScale();
    const worldScroll = clamp(this.vy * 0.45, -240, 420);

    this.scarfTrail.unshift({ x: scarfAnchorX, y: scarfAnchorY });
    for (let i = 1; i < this.scarfTrail.length; i++) {
      this.scarfTrail[i].x -= (38 + this.vx * 0.14) * dt;
      this.scarfTrail[i].y += (worldScroll + Math.sin(this.time * 16 + i * 0.7) * 55) * dt;
    }
    if (this.scarfTrail.length > 14) this.scarfTrail.pop();

    if (this.propulsion.rainbowMode) {
      this.rainbowTrail.unshift({ x: this.pigX - 28 * this.getPigScale(), y: this.pigY + 4 });
      for (let i = 1; i < this.rainbowTrail.length; i++) {
        this.rainbowTrail[i].x -= (150 + this.vx * 0.12) * dt;
        this.rainbowTrail[i].y += worldScroll * 0.7 * dt;
      }
      if (this.rainbowTrail.length > 28) this.rainbowTrail.pop();
    } else if (this.rainbowTrail.length > 0) {
      this.rainbowTrail.pop();
    }

    // Spawn Rocket Exhaust Particles
    if (this.propulsion.rocketsActive) {
      for (let i = 0; i < 3; i++) {
        this.particles.push({
          x: this.pigX - 10 * this.getPigScale() + (Math.random() - 0.5) * 28,
          y: this.pigY + 34 * this.getPigScale(),
          vx: (Math.random() - 0.5) * 90 - this.vx * 0.2,
          vy: 220 + Math.random() * 240,
          size: 7 + Math.random() * 11,
          life: 0,
          maxLife: 0.48 + Math.random() * 0.35,
          color: Math.random() > 0.35 ? '#FFF3D6' : '#FF7B29',
          kind: Math.random() > 0.25 ? 'smoke' : 'spark',
          rot: 0,
          vrot: 0,
        });
      }
    }

    // Spawn Startup Wind Vent ribbons & buzzwords
    if (this.propulsion.windLevel > 5) {
      const rate = this.propulsion.windLevel / 100;
      if (Math.random() < rate * 0.75) {
        this.particles.push({
          x: Math.random() * this.width,
          y: this.height + 20,
          vx: (Math.random() - 0.5) * 30,
          vy: -(320 + rate * 460),
          size: 28 + Math.random() * 54,
          life: 0,
          maxLife: 1.2,
          color: 'rgba(255, 255, 255, 0.45)',
          kind: 'wind',
          rot: 0,
          vrot: 0,
        });
      }

      this.buzzwordTimer -= dt;
      if (this.buzzwordTimer <= 0 && this.propulsion.windLevel >= 25) {
        this.buzzwordTimer = lerp(1.1, 0.26, rate);
        this.tags.push({
          x: 60 + Math.random() * (this.width - 120),
          y: this.height + 16,
          vx: (Math.random() - 0.5) * 35,
          vy: -(160 + rate * 240),
          text: this.pick(this.t.pigDialogue.buzzwords),
          bg: 'rgba(22, 26, 36, 0.78)',
          fg: '#FFD166',
          life: 0,
          maxLife: 2.2,
        });
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life += dt;
      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.rot += pt.vrot * dt;
      if (pt.kind === 'confetti' || pt.kind === 'pop') {
        pt.vy += 320 * dt;
      } else if (pt.kind === 'feather') {
        pt.x += Math.sin(this.time * 7 + pt.rot) * 45 * dt;
      }
    }

    // Update floating compliment / buzzword tags
    for (let i = this.tags.length - 1; i >= 0; i--) {
      const tag = this.tags[i];
      tag.life += dt;
      if (tag.life >= tag.maxLife) {
        this.tags.splice(i, 1);
        continue;
      }
      tag.x += tag.vx * dt;
      tag.y += tag.vy * dt;
    }

    // Update scrolling clouds & ambient flyers
    const cloudScrollY = clamp(this.vy * 0.42, -320, 620);
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      c.y += cloudScrollY * c.scale * dt;
      if (c.x > this.width + 130) c.x = -130;
      if (c.y > this.height + 90) {
        c.y = -80;
        c.x = Math.random() * this.width;
      } else if (c.y < -95) {
        c.y = this.height + 80;
        c.x = Math.random() * this.width;
      }
    }

    this.gullX += 72 * dt;
    if (this.gullX > this.width + 120) this.gullX = -120;

    this.planeX += 115 * dt;
    if (this.planeX > this.width + 240) this.planeX = -240;

    this.satX -= 36 * dt;
    if (this.satX < -100) this.satX = this.width + 100;

    // Emit throttled telemetry (~15Hz) so React UI stays ultra crisp without jank
    this.telemetryAccum += dt;
    if (this.telemetryAccum >= 0.065) {
      this.telemetryAccum = 0;
      const skepticism = Math.round(clamp(100 - (this.peakAltitude / 800) * 100, 0, 100));
      const telemetry: FlightTelemetry = {
        altitude: Math.round(this.altitude),
        peakAltitude: Math.round(this.peakAltitude),
        verticalVelocity: Math.round(this.vy),
        mach: Number((Math.abs(this.vy) / 343).toFixed(2)),
        skepticism,
        zone: getZone(this.altitude),
        airborne: this.altitude > 3,
        atcKey: this.atcKey,
      };
      this.callbacks.onTelemetry(telemetry);
    }
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.save();

    // Subtle camera shake when rockets fire
    if (this.shakeIntensity > 0.2) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(sx, sy);
    }

    // 1. Dynamic Sky Gradient
    const [topColor, botColor] = getSkyGradientColors(this.altitude);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, topColor);
    skyGrad.addColorStop(1, botColor);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(-10, -10, this.width + 20, this.height + 20);

    // Rainbow disco aurora overlay when Rainbow Hyperdrive is active
    if (this.propulsion.rainbowMode) {
      const hue = (this.time * 75) % 360;
      const aurora = ctx.createLinearGradient(0, 0, this.width, this.height);
      aurora.addColorStop(0, `hsla(${hue}, 90%, 60%, 0.16)`);
      aurora.addColorStop(0.5, `hsla(${(hue + 110) % 360}, 90%, 60%, 0.12)`);
      aurora.addColorStop(1, `hsla(${(hue + 220) % 360}, 90%, 60%, 0.18)`);
      ctx.fillStyle = aurora;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 2. Stars & Cosmic Space Props (fade in smoothly above 10,000m)
    if (this.altitude > 9000) {
      const starAlpha = clamp((this.altitude - 9000) / 18000, 0, 1);
      this.drawSpaceLayer(ctx, starAlpha);
    }

    // 3. Clouds (visible up to 24,000m)
    if (this.altitude < 24000) {
      const cloudFade = clamp(1 - (this.altitude - 14000) / 10000, 0, 1);
      this.drawClouds(ctx, cloudFade);
    }

    // 4. Passing Ambient Encounters (Seagull & Commercial Airliner)
    if (this.altitude > 140 && this.altitude < 2800) {
      this.drawConfusedSeagull(ctx, this.gullX, this.height * 0.28 + Math.sin(this.time * 4) * 14);
    }
    if (this.altitude > 2600 && this.altitude < 16000) {
      this.drawAirliner(ctx, this.planeX, this.height * 0.26);
    }

    // 5. Runway 09 & Ground Scenery (scrolls down cleanly after takeoff!)
    const groundOffset = this.altitude * 2.4;
    if (groundOffset < this.height + 160) {
      this.drawRunway(ctx, groundOffset);
    }

    // 6. Wind Updraft Ribbons & Background Particles
    this.drawParticles(ctx, 'wind');
    this.drawParticles(ctx, 'smoke');

    // 7. Floating Compliment & Buzzword Tags
    this.drawTags(ctx);

    // 8. Captain Wilbur!
    drawPig(ctx, {
      x: this.pigX,
      y: this.pigY,
      vx: this.vx,
      vy: this.screenVy,
      altitude: this.altitude,
      scale: this.getPigScale(),
      time: this.time,
      lookX: this.lookX,
      lookY: this.lookY,
      blink: this.blinkValue,
      snoutSquish: this.snoutSquish,
      blush: this.blush,
      wingPhase: this.wingPhase,
      propulsion: this.propulsion,
      isDragging: this.isDragging,
      isGrounded: this.altitude < 3,
      mach: Math.abs(this.vy) / 343,
      scarfTrail: this.scarfTrail,
      rainbowTrail: this.rainbowTrail,
    });

    // 9. Foreground Particles (feathers, sparks, confetti, balloon pops)
    this.drawParticles(ctx, 'spark');
    this.drawParticles(ctx, 'feather');
    this.drawParticles(ctx, 'confetti');
    this.drawParticles(ctx, 'pop');

    // 10. Wilbur's Live Speech Bubble
    if (this.speechTimer > 0 && this.speechText) {
      this.drawSpeechBubble(ctx, this.speechText);
    }

    // 11. Subtle Vertical Altitude Minimap Rail on Right Edge
    this.drawAltitudeRail(ctx);

    ctx.restore();
  }

  private drawSpaceLayer(ctx: CanvasRenderingContext2D, alpha: number): void {
    ctx.save();
    for (const s of this.stars) {
      const twinkle = 0.45 + 0.55 * Math.sin(this.time * 2.6 + s.phase);
      ctx.fillStyle = `rgba(255, 252, 238, ${alpha * twinkle})`;
      ctx.beginPath();
      ctx.arc(s.nx * this.width, s.ny * this.height, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Surprised Crescent Moon in upper left when in Space!
    if (this.altitude > 28000) {
      const moonAlpha = clamp((this.altitude - 28000) / 14000, 0, 1);
      ctx.save();
      ctx.globalAlpha = moonAlpha;
      const mx = Math.max(70, this.width * 0.14);
      const my = 86;
      ctx.fillStyle = '#FFF1B8';
      ctx.beginPath();
      ctx.arc(mx, my, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0A122B';
      ctx.beginPath();
      ctx.arc(mx + 12, my - 6, 24, 0, Math.PI * 2);
      ctx.fill();
      // Tiny surprised eye on moon watching Wilbur fly by!
      ctx.fillStyle = '#161A24';
      ctx.beginPath();
      ctx.arc(mx - 12, my + 1, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Passing Orbital Satellite above 36,000m
    if (this.altitude > 36000) {
      ctx.save();
      ctx.globalAlpha = clamp((this.altitude - 36000) / 10000, 0, 1);
      const sx = this.satX;
      const sy = 110 + Math.sin(this.time * 1.5) * 14;
      ctx.translate(sx, sy);
      ctx.rotate(-0.18);
      // Solar panels
      ctx.fillStyle = '#38A3F1';
      ctx.strokeStyle = '#E8F6FF';
      ctx.lineWidth = 1.4;
      ctx.fillRect(-34, -6, 22, 12);
      ctx.strokeRect(-34, -6, 22, 12);
      ctx.fillRect(12, -6, 22, 12);
      ctx.strokeRect(12, -6, 22, 12);
      // Core
      ctx.fillStyle = '#E5A93C';
      ctx.fillRect(-10, -8, 20, 16);
      // Blinking beacon
      if (Math.sin(this.time * 8) > 0) {
        ctx.fillStyle = '#FF4D1C';
        ctx.beginPath();
        ctx.arc(0, -13, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Curved Glowing Earth Limb at bottom when in Space!
    if (this.altitude > 32000) {
      const limbAlpha = clamp((this.altitude - 32000) / 14000, 0, 1);
      ctx.save();
      ctx.globalAlpha = limbAlpha;
      const earthRadius = this.width * 1.45;
      const earthY = this.height + earthRadius - 48;

      const atmGrad = ctx.createRadialGradient(
        this.width * 0.5,
        earthY,
        earthRadius - 12,
        this.width * 0.5,
        earthY,
        earthRadius + 38
      );
      atmGrad.addColorStop(0, '#1D6FE2');
      atmGrad.addColorStop(0.45, '#58C4FF');
      atmGrad.addColorStop(1, 'rgba(88, 196, 255, 0)');

      ctx.fillStyle = atmGrad;
      ctx.beginPath();
      ctx.arc(this.width * 0.5, earthY, earthRadius + 38, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  private drawClouds(ctx: CanvasRenderingContext2D, fade: number): void {
    ctx.save();
    for (const c of this.clouds) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);
      ctx.fillStyle = `rgba(255, 252, 246, ${c.alpha * fade})`;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.arc(22, -7, 20, 0, Math.PI * 2);
      ctx.arc(44, 0, 18, 0, Math.PI * 2);
      ctx.arc(-20, 4, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  private drawConfusedSeagull(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.translate(x, y);
    const flap = Math.sin(this.time * 11) * 7;
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, flap);
    ctx.quadraticCurveTo(-8, -10, 0, 0);
    ctx.quadraticCurveTo(8, -10, 18, flap);
    ctx.stroke();

    // Confused "?" bubble
    ctx.fillStyle = '#FAF6EE';
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(16, -20, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FF4D1C';
    ctx.font = '800 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 16, -19.5);
    ctx.restore();
  }

  private drawAirliner(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.translate(x, y);

    // Contrail
    const contrail = ctx.createLinearGradient(-150, 0, -24, 0);
    contrail.addColorStop(0, 'rgba(255,255,255,0)');
    contrail.addColorStop(1, 'rgba(255,255,255,0.75)');
    ctx.strokeStyle = contrail;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-150, 4);
    ctx.lineTo(-24, 4);
    ctx.stroke();

    // Fuselage
    ctx.fillStyle = '#FAF6EE';
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tail fin
    ctx.fillStyle = '#FF4D1C';
    ctx.beginPath();
    ctx.moveTo(-22, -4);
    ctx.lineTo(-30, -17);
    ctx.lineTo(-15, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wing
    ctx.fillStyle = '#DDE5F0';
    ctx.beginPath();
    ctx.moveTo(-4, 2);
    ctx.lineTo(-14, 15);
    ctx.lineTo(8, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawRunway(ctx: CanvasRenderingContext2D, offsetY: number): void {
    const baseTop = this.height - 96 + offsetY;
    ctx.save();

    // Distant pastel meadow hills
    ctx.fillStyle = '#7ED087';
    ctx.beginPath();
    ctx.moveTo(0, baseTop + 18);
    ctx.quadraticCurveTo(this.width * 0.25, baseTop - 34, this.width * 0.55, baseTop + 8);
    ctx.quadraticCurveTo(this.width * 0.82, baseTop - 26, this.width, baseTop + 14);
    ctx.lineTo(this.width, baseTop + 90);
    ctx.lineTo(0, baseTop + 90);
    ctx.closePath();
    ctx.fill();

    // Mini ATC Control Tower (left background)
    const tx = Math.max(46, this.width * 0.13);
    const ty = baseTop - 2;
    ctx.fillStyle = '#E8DFCF';
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 2;
    ctx.fillRect(tx - 10, ty - 42, 20, 44);
    ctx.strokeRect(tx - 10, ty - 42, 20, 44);
    // Tower cab
    ctx.fillStyle = '#2A3346';
    ctx.beginPath();
    ctx.moveTo(tx - 18, ty - 56);
    ctx.lineTo(tx + 18, ty - 56);
    ctx.lineTo(tx + 13, ty - 42);
    ctx.lineTo(tx - 13, ty - 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Tower roof & rotating radar
    ctx.fillStyle = '#FF4D1C';
    ctx.fillRect(tx - 20, ty - 61, 40, 6);
    ctx.strokeRect(tx - 20, ty - 61, 40, 6);
    const radarW = Math.max(2, Math.abs(Math.cos(this.time * 2.5)) * 11);
    ctx.strokeStyle = '#161A24';
    ctx.beginPath();
    ctx.moveTo(tx, ty - 61);
    ctx.lineTo(tx, ty - 71);
    ctx.stroke();
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(tx - radarW, ty - 75, radarW * 2, 5);
    ctx.strokeRect(tx - radarW, ty - 75, radarW * 2, 5);

    // Animated Windsock (right background)
    const wx = Math.min(this.width - 52, this.width * 0.87);
    const wy = baseTop + 4;
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx, wy - 44);
    ctx.stroke();

    const windStrength = this.propulsion.windLevel / 100;
    const sockAngle = lerp(0.85, -0.35, windStrength) + Math.sin(this.time * (4 + windStrength * 14)) * 0.1;
    ctx.save();
    ctx.translate(wx, wy - 42);
    ctx.rotate(sockAngle);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#FF4D1C' : '#FAF6EE';
      ctx.fillRect(i * 7, -4.5 + i * 0.6, 7, 9 - i * 1.2);
    }
    ctx.restore();

    // Foreground Grass Strip
    ctx.fillStyle = '#56B868';
    ctx.fillRect(0, baseTop + 4, this.width, 18);

    // Concrete Tarmac Runway 09
    ctx.fillStyle = '#333B4D';
    ctx.fillRect(0, baseTop + 20, this.width, 96);
    ctx.fillStyle = '#262C3A';
    ctx.fillRect(0, baseTop + 20, this.width, 4);

    // Runway Center Dashes
    ctx.fillStyle = '#FAF6EE';
    for (let dx = 22; dx < this.width; dx += 66) {
      ctx.fillRect(dx, baseTop + 52, 34, 5);
    }

    // "09" Runway Markings
    ctx.fillStyle = 'rgba(250, 246, 238, 0.35)';
    ctx.font = '800 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('RWY 09', 18, baseTop + 44);

    // Startup Wind Vent Grille right under center!
    const ventW = 148;
    const ventX = this.width * 0.5 - ventW * 0.5;
    const ventY = baseTop + 34;
    ctx.fillStyle = '#161A24';
    ctx.strokeStyle = '#E5A93C';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(ventX, ventY, ventW, 20, 8);
    ctx.fill();
    ctx.stroke();

    // Glowing updraft column when Wind Vent is ON!
    if (this.propulsion.windLevel > 2) {
      const alpha = (this.propulsion.windLevel / 100) * 0.42;
      const beamGrad = ctx.createLinearGradient(0, ventY, 0, Math.max(0, ventY - 360));
      beamGrad.addColorStop(0, `rgba(114, 239, 221, ${alpha})`);
      beamGrad.addColorStop(0.55, `rgba(255, 209, 102, ${alpha * 0.45})`);
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(ventX + 6, ventY);
      ctx.lineTo(ventX - 42, Math.max(-40, ventY - 360));
      ctx.lineTo(ventX + ventW + 42, Math.max(-40, ventY - 360));
      ctx.lineTo(ventX + ventW - 6, ventY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D, kind: Particle['kind']): void {
    ctx.save();
    for (const pt of this.particles) {
      if (pt.kind !== kind) continue;
      const t = pt.life / pt.maxLife;
      const alpha = 1 - t;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.rot);

      if (kind === 'wind') {
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, pt.size);
        ctx.stroke();
      } else if (kind === 'smoke') {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(0, 0, pt.size * (0.7 + t * 1.1), 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === 'spark') {
        ctx.fillStyle = '#FFD166';
        ctx.beginPath();
        ctx.arc(0, 0, pt.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === 'feather') {
        ctx.fillStyle = pt.color;
        ctx.strokeStyle = '#161A24';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.size, pt.size * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // confetti & balloon pop shards
        ctx.fillStyle = pt.color;
        ctx.fillRect(-pt.size * 0.5, -pt.size * 0.35, pt.size, pt.size * 0.7);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  private drawTags(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.font = '700 12px "Space Grotesk", "Noto Sans SC", "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const tag of this.tags) {
      const t = tag.life / tag.maxLife;
      const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      const textW = ctx.measureText(tag.text).width;
      const padX = 11;
      const h = 24;

      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.fillStyle = tag.bg;
      ctx.strokeStyle = 'rgba(22, 26, 36, 0.25)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(tag.x - textW * 0.5 - padX, tag.y - h * 0.5, textW + padX * 2, h, 999);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = tag.fg;
      ctx.fillText(tag.text, tag.x, tag.y + 0.5);
      ctx.restore();
    }
    ctx.restore();
  }

  private drawSpeechBubble(ctx: CanvasRenderingContext2D, text: string): void {
    ctx.save();
    const fade = clamp(this.speechTimer * 2.5, 0, 1);
    ctx.globalAlpha = fade;

    ctx.font = '700 13px "Space Grotesk", "Noto Sans SC", "Noto Sans JP", sans-serif';
    const maxBubbleW = Math.min(260, this.width - 64);
    const lines = wrapText(ctx, text, maxBubbleW - 24);
    const lineH = 18;
    const textW = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const bw = Math.min(maxBubbleW, textW + 26);
    const bh = lines.length * lineH + 16;

    const scale = this.getPigScale();
    const anchorX = clamp(this.pigX + 26 * scale, bw * 0.5 + 14, this.width - bw * 0.5 - 38);
    const aboveY = this.pigY - 68 * scale - bh;
    const placeBelow = aboveY < 14;
    const by = placeBelow ? this.pigY + 62 * scale : aboveY;
    const bx = anchorX - bw * 0.5;

    // Shadow
    ctx.fillStyle = 'rgba(22, 26, 36, 0.18)';
    ctx.beginPath();
    ctx.roundRect(bx + 3, by + 4, bw, bh, 14);
    ctx.fill();

    // Bubble card
    ctx.fillStyle = '#FAF6EE';
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 14);
    ctx.fill();
    ctx.stroke();

    // Pointer tail
    const tailX = clamp(this.pigX + 22 * scale, bx + 18, bx + bw - 18);
    ctx.fillStyle = '#FAF6EE';
    ctx.beginPath();
    if (placeBelow) {
      ctx.moveTo(tailX - 7, by + 1);
      ctx.lineTo(tailX, by - 9);
      ctx.lineTo(tailX + 7, by + 1);
    } else {
      ctx.moveTo(tailX - 7, by + bh - 1);
      ctx.lineTo(tailX, by + bh + 9);
      ctx.lineTo(tailX + 7, by + bh - 1);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cover inner border seam
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(tailX - 6, placeBelow ? by : by + bh - 3, 12, 4);

    // Text
    ctx.fillStyle = '#161A24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((line, idx) => {
      ctx.fillText(line, bx + bw * 0.5, by + 17 + idx * lineH);
    });

    ctx.restore();
  }

  private drawAltitudeRail(ctx: CanvasRenderingContext2D): void {
    const railX = this.width - 18;
    const topY = 26;
    const botY = this.height - 26;
    const railH = botY - topY;

    // Log-ish progress so low altitudes AND space both feel exciting on the rail!
    const progress = clamp(Math.log10(1 + this.altitude / 80) / Math.log10(1 + 100000 / 80), 0, 1);

    ctx.save();
    // Track
    ctx.fillStyle = 'rgba(22, 26, 36, 0.28)';
    ctx.beginPath();
    ctx.roundRect(railX - 3, topY, 6, railH, 999);
    ctx.fill();

    // Active fill
    const fillH = railH * progress;
    ctx.fillStyle = this.altitude >= 40000 ? '#FFD166' : '#FF4D1C';
    ctx.beginPath();
    ctx.roundRect(railX - 3, botY - fillH, 6, fillH, 999);
    ctx.fill();

    // Marker dot
    const markerY = botY - fillH;
    ctx.fillStyle = '#FAF6EE';
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(railX, markerY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = '';

  // Split by characters if CJK or by spaces if Latin
  const hasSpaces = text.includes(' ');
  const tokens = hasSpaces ? text.split(/(\s+)/) : Array.from(text);

  for (const token of tokens) {
    const test = current + token;
    if (ctx.measureText(test).width > maxWidth && current.trim().length > 0) {
      lines.push(current.trim());
      current = token.trimStart();
    } else {
      current = test;
    }
  }
  if (current.trim().length > 0) {
    lines.push(current.trim());
  }
  return lines.length ? lines : [text];
}
