import { describe, expect, it } from 'vitest';
import { Game, STEP } from '../../src/modes/run/game';
import { CEILING, circleRect, FLAP_VY, GLIDE_MAX_VY, GROUND_Y, stepPig, WORLD_H } from '../../src/modes/run/physics';
import { mulberry32 } from '../../src/lib/rng';
import { Spawner } from '../../src/modes/run/spawner';
import { parseChallenge, percentile, toMeters } from '../../src/modes/run/score';

const run = (g: Game, seconds: number, each?: (i: number) => void) => {
  for (let i = 0; i < Math.round(seconds / STEP); i++) {
    each?.(i);
    g.update(STEP);
  }
};

describe('physics', () => {
  it('caps the falling speed while gliding', () => {
    const p = { y: 100, vy: 0 };
    for (let i = 0; i < 300; i++) stepPig(p, false, 0, STEP);
    expect(p.vy).toBeLessThanOrEqual(GLIDE_MAX_VY);
  });

  it('dives faster than it glides', () => {
    const a = { y: 100, vy: 0 };
    const b = { y: 100, vy: 0 };
    for (let i = 0; i < 30; i++) {
      stepPig(a, false, 0, STEP);
      stepPig(b, true, 0, STEP);
    }
    expect(b.y).toBeGreaterThan(a.y);
  });

  it('stops at the ceiling', () => {
    const p = { y: CEILING + 1, vy: FLAP_VY };
    stepPig(p, false, 0, STEP);
    expect(p.y).toBe(CEILING);
    expect(p.vy).toBe(0);
  });

  it('detects circle/rect overlap', () => {
    expect(circleRect(0, 0, 5, 3, -1, 10, 2)).toBe(true);
    expect(circleRect(0, 0, 5, 6, 6, 10, 10)).toBe(false);
  });
});

describe('spawner', () => {
  it('is deterministic for a seed', () => {
    const seq = (seed: number) => {
      const s = new Spawner(mulberry32(seed));
      const out: string[] = [];
      for (let d = 0; d < 6000; d += 5) {
        const o = s.maybeSpawn(d, d / 200, 640);
        if (o) out.push(`${o.kind}@${o.y.toFixed(2)}`);
      }
      return out;
    };
    expect(seq(42)).toEqual(seq(42));
    expect(seq(42)).not.toEqual(seq(43));
    expect(seq(42).length).toBeGreaterThan(10);
  });

  it('only spawns obstacles that leave a gap to fly through', () => {
    const s = new Spawner(mulberry32(7));
    for (let d = 0; d < 40000; d += 5) {
      const o = s.maybeSpawn(d, d / 200, 640);
      if (!o) continue;
      if (o.kind === 'kite') expect(o.y - o.h / 2).toBeGreaterThan(60);
      if (o.kind === 'cloud') expect(GROUND_Y - o.y).toBeGreaterThan(120);
    }
  });
});

describe('Game', () => {
  it('waits on the ready screen until pressed', () => {
    const g = new Game(1);
    run(g, 2);
    expect(g.state).toBe('ready');
    expect(g.distance).toBe(0);
  });

  it('crashes into the ground without input', () => {
    const g = new Game(1);
    g.setWorldWidth(640);
    g.press();
    run(g, 4);
    expect(['crashing', 'over']).toContain(g.state);
    expect(g.cause).not.toBeNull();
  });

  it('pausing freezes the world', () => {
    const g = new Game(1);
    g.setWorldWidth(640);
    g.press();
    run(g, 0.3);
    g.pause();
    const d = g.distance;
    run(g, 1);
    expect(g.distance).toBe(d);
    g.press();
    expect(g.state).toBe('playing');
  });

  it('rocket mode is invulnerable and covers ground fast', () => {
    const g = new Game(5);
    g.setWorldWidth(640);
    g.press();
    g.boost();
    run(g, 2);
    expect(g.state).toBe('playing');
    expect(g.pig.y).toBeLessThan(WORLD_H * 0.75);
    expect(g.meters).toBeGreaterThan(50);
  });

  it('a swipe dives even after the finger lifts', () => {
    const g = new Game(1);
    g.setWorldWidth(640);
    g.press(); // the tap that started the swipe flaps upward…
    g.swipeDive(); // …and the swipe overrides it
    g.dive = false; // finger already lifted
    const y0 = g.pig.y;
    run(g, 0.2);
    expect(g.pig.y).toBeGreaterThan(y0);
  });

  it('pausing forgets held controls', () => {
    const g = new Game(1);
    g.press();
    g.dive = true;
    g.swipeDive();
    g.pause();
    expect(g.diving).toBe(false);
  });

  it('reset returns to the ready screen', () => {
    const g = new Game(1);
    g.press();
    run(g, 4);
    g.reset(9);
    expect(g.state).toBe('ready');
    expect(g.obstacles).toHaveLength(0);
    expect(g.distance).toBe(0);
  });
});

describe('score', () => {
  it('converts and bounds', () => {
    expect(toMeters(1239)).toBe(123);
    expect(percentile(0)).toBe(0);
    expect(percentile(1e9)).toBe(99);
    expect(percentile(1234)).toBeGreaterThan(50);
  });
  it.each([
    ['1234', 1234],
    ['0', null],
    ['-5', null],
    ['12a', null],
    ['1234567', null],
    [null, null],
  ] as const)('parseChallenge(%s) → %s', (raw, expected) => {
    expect(parseChallenge(raw)).toBe(expected);
  });
});

describe('swipe dive window', () => {
  it('a new flap ends a running swipe dive', () => {
    const g = new Game(1);
    g.setWorldWidth(640);
    g.press();
    g.swipeDive();
    g.press(); // tap again right away
    expect(g.diving).toBe(false);
  });
});
