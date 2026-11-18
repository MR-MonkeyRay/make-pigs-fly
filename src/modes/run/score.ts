/** Distance in world units → meters shown to the player. */
export function toMeters(units: number): number {
  return Math.floor(units / 10);
}

/** "Higher than p% of pigs": a made-up curve that feels generous. */
export function percentile(meters: number): number {
  if (meters <= 0) return 0;
  return Math.min(99, Math.floor(100 * (1 - Math.exp(-meters / 900))));
}

/** Parse a challenge score from #/run?s=1234. Anything odd is ignored. */
export function parseChallenge(raw: string | null): number | null {
  if (!raw || !/^\d{1,6}$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}
