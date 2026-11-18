/** Small seeded PRNG (mulberry32). Same seed → same sequence; used by the game spawner and tests. */
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return (Math.random() * 2 ** 32) >>> 0;
}

export function pick<T>(items: readonly T[], rng: Rng = Math.random): T {
  if (items.length === 0) throw new Error('pick() from empty list');
  return items[Math.floor(rng() * items.length)] as T;
}

export function between(min: number, max: number, rng: Rng = Math.random): number {
  return min + (max - min) * rng();
}
