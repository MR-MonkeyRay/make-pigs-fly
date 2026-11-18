import type { Rng } from '../../lib/rng';

/**
 * Pick the next method to play: something not yet unlocked if possible (so collecting progresses),
 * otherwise anything except the one that just played.
 */
export function nextSkitId(all: readonly string[], unlocked: ReadonlySet<string>, lastId: string | null, rng: Rng = Math.random): string {
  if (all.length === 0) throw new Error('no skits');
  const fresh = all.filter((id) => !unlocked.has(id) && id !== lastId);
  const pool = fresh.length > 0 ? fresh : all.length > 1 ? all.filter((id) => id !== lastId) : all;
  return pool[Math.floor(rng() * pool.length)] as string;
}
