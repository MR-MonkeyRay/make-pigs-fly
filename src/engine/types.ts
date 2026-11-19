import type { AchievementId } from '../i18n/types';

export type ZoneId =
  | 'tarmac'
  | 'clouds'
  | 'airspace'
  | 'stratosphere'
  | 'space'
  | 'transcendence';

export interface PropulsionState {
  windLevel: number; // 0..100
  balloonCount: number; // 0..15
  rocketsActive: boolean;
  wingsEquipped: boolean;
  rainbowMode: boolean;
}

export type AtcEventKey =
  | 'ready'
  | 'liftoff'
  | 'windVent'
  | 'balloonOverload'
  | 'supersonic'
  | 'airspace'
  | 'stratosphere'
  | 'space'
  | 'transcendence'
  | 'rainbow'
  | 'popped';

export interface FlightTelemetry {
  altitude: number; // meters
  peakAltitude: number; // meters
  verticalVelocity: number; // m/s
  mach: number;
  skepticism: number; // 0..100
  zone: ZoneId;
  airborne: boolean;
  atcKey: AtcEventKey;
}

export interface PigRenderParams {
  x: number;
  y: number;
  vx: number;
  vy: number;
  altitude: number;
  scale: number;
  time: number;
  lookX: number; // -1..1
  lookY: number; // -1..1
  blink: number; // 0..1 (1 = closed)
  snoutSquish: number; // 0..1
  blush: number; // 0..1
  wingPhase: number; // 0..1 flap animation
  propulsion: PropulsionState;
  isDragging: boolean;
  isGrounded: boolean;
  mach: number;
  scarfTrail: Array<{ x: number; y: number }>;
  rainbowTrail: Array<{ x: number; y: number }>;
}

export interface EngineCallbacks {
  onTelemetry: (telemetry: FlightTelemetry) => void;
  onUnlockAchievement: (id: AchievementId) => void;
  onPropulsionSync?: (next: PropulsionState) => void;
}
