import { loadJSON, save } from '../../lib/storage';

const KEY = 'unlocked';
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

/** Unlocked method ids, filtered to the ones that still exist. */
export function loadUnlocked(known: readonly string[]): Set<string> {
  return new Set(loadJSON<string[]>(KEY, [], isStringArray).filter((id) => known.includes(id)));
}

export function unlock(id: string, known: readonly string[]): Set<string> {
  const set = loadUnlocked(known);
  if (known.includes(id)) set.add(id);
  save(KEY, JSON.stringify([...set]));
  return set;
}
