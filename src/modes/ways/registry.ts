import type { Skit } from './stage';
import { hypeFan } from './skits/hype-fan';
import { paperwork } from './skits/paperwork';
import { groundFalls } from './skits/ground-falls';
import { mockPig } from './skits/mock-pig';
import { idiom } from './skits/idiom';
import { pudding } from './skits/pudding';

/** Order defines the method numbers (#01, #02, …). Append new skits at the end. */
export const SKITS: readonly Skit[] = [hypeFan, paperwork, groundFalls, mockPig, idiom, pudding];

export const SKIT_IDS: readonly string[] = SKITS.map((s) => s.id);

export function skitById(id: string | undefined | null): Skit | undefined {
  return SKITS.find((s) => s.id === id);
}

/** 1-based method number, zero padded: "03". */
export function methodNumber(id: string): string {
  return String(SKIT_IDS.indexOf(id) + 1).padStart(2, '0');
}
