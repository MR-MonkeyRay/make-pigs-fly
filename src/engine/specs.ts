/**
 * The vertical script of the page. Order = story order = DOM order.
 * Visually the list is rendered bottom-up (flex column-reverse), so index 0
 * (the mud) sits at the very bottom of the document and the user scrolls UP.
 */

export type Mood = 'calm' | 'thrilled' | 'panic' | 'smug' | 'realize' | 'dizzy';

export interface Pose {
  /** viewport fraction (0..1) of the pig's centre */
  x: number;
  y: number;
  /** scale relative to the base pig size */
  s: number;
  hide?: boolean;
}

export interface SectionSpec {
  id: string;
  /** altitude band in metres: [at section bottom, at section top] */
  alt: [number, number];
  pose: Pose;
  /** pose for narrow / portrait screens */
  poseM: Pose;
  mood: Mood;
  /**
   * Paged navigation: where one flick lands inside this section, as "page
   * progress" (0 = section bottom on the viewport bottom, 1 = section top on
   * the viewport top). Sticky sections use several stops to step through their
   * reveals; plain sections usually need one.
   */
  stops: number[];
  stopsM?: number[];
}

export const SECTIONS: SectionSpec[] = [
  { id: 'ground', alt: [0, 0], pose: { x: 0.7, y: 0.6, s: 1 }, poseM: { x: 0.45, y: 0.6, s: 0.72 }, mood: 'smug', stops: [0] },
  { id: 'doubters', alt: [0, 12], pose: { x: 0.5, y: 0.5, s: 0.95 }, poseM: { x: 0.5, y: 0.5, s: 0.66 }, mood: 'calm', stops: [0, 1] },
  { id: 'science', alt: [12, 40], pose: { x: 0.5, y: 0.53, s: 0.82 }, poseM: { x: 0.5, y: 0.5, s: 0.56 }, mood: 'calm', stops: [0.25, 0.62, 0.78, 0.95] },
  { id: 'birds', alt: [40, 180], pose: { x: 0.74, y: 0.46, s: 0.85 }, poseM: { x: 0.82, y: 0.17, s: 0.4 }, mood: 'smug', stops: [0.15, 0.4, 0.65, 0.92] },
  { id: 'updraft', alt: [180, 900], pose: { x: 0.68, y: 0.5, s: 0.88 }, poseM: { x: 0.5, y: 0.58, s: 0.58 }, mood: 'thrilled', stops: [0.5], stopsM: [0.2, 0.85] },
  { id: 'precedents', alt: [900, 2500], pose: { x: 0.86, y: 0.22, s: 0.55 }, poseM: { x: 0.84, y: 0.15, s: 0.38 }, mood: 'calm', stops: [0.5], stopsM: [0, 0.5, 1] },
  { id: 'news', alt: [2500, 8000], pose: { x: 0.87, y: 0.2, s: 0.52 }, poseM: { x: 0.84, y: 0.15, s: 0.38 }, mood: 'smug', stops: [0.5] },
  { id: 'cruise', alt: [8000, 12500], pose: { x: 0.5, y: 0.5, s: 0.7, hide: true }, poseM: { x: 0.5, y: 0.5, s: 0.5, hide: true }, mood: 'calm', stops: [0.5], stopsM: [0.25, 0.8] },
  { id: 'summit', alt: [12500, 50000], pose: { x: 0.86, y: 0.2, s: 0.52 }, poseM: { x: 0.84, y: 0.15, s: 0.38 }, mood: 'smug', stops: [0, 0.26, 0.52, 0.78, 1], stopsM: [0, 0.2, 0.4, 0.6, 0.8, 1] },
  { id: 'karman', alt: [50000, 160000], pose: { x: 0.88, y: 0.66, s: 0.72 }, poseM: { x: 0.7, y: 0.6, s: 0.58 }, mood: 'thrilled', stops: [0, 1] },
  { id: 'iss', alt: [160000, 1_000_000], pose: { x: 0.82, y: 0.3, s: 0.62 }, poseM: { x: 0.8, y: 0.16, s: 0.4 }, mood: 'calm', stops: [0.5], stopsM: [0.2, 0.85] },
  { id: 'moon', alt: [1_000_000, 384_400_000], pose: { x: 0.8, y: 0.3, s: 0.66 }, poseM: { x: 0.78, y: 0.16, s: 0.42 }, mood: 'smug', stops: [0.5], stopsM: [0.2, 0.8] },
  { id: 'space', alt: [384_400_000, 9.4607e15], pose: { x: 0.74, y: 0.42, s: 0.95 }, poseM: { x: 0.66, y: 0.27, s: 0.42 }, mood: 'calm', stops: [0.3, 1] },
];

export const SECTION_INDEX: Record<string, number> = Object.fromEntries(
  SECTIONS.map((s, i) => [s.id, i])
);

export function altitudeAt(idx: number, p: number): number {
  const spec = SECTIONS[idx];
  if (!spec) return 0;
  const [a0, a1] = spec.alt;
  if (a1 <= a0) return a0;
  const l0 = Math.log10(1 + a0);
  const l1 = Math.log10(1 + a1);
  return Math.pow(10, l0 + (l1 - l0) * Math.min(1, Math.max(0, p))) - 1;
}

/** where (0..1 from the section bottom) a given altitude falls inside a section */
export function fractionOf(idx: number, altitude: number): number {
  const [a0, a1] = SECTIONS[idx].alt;
  const l0 = Math.log10(1 + a0);
  const l1 = Math.log10(1 + a1);
  return (Math.log10(1 + altitude) - l0) / (l1 - l0);
}

const LIGHT_YEAR = 9.4607e15;

export interface AltitudeText {
  value: string;
  unit: 'm' | 'km' | 'ly';
}

export function formatAltitude(m: number, locale: string): AltitudeText {
  const nf = (d: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: d, minimumFractionDigits: d });
  if (m < 1000) return { value: nf(0).format(Math.max(0, Math.round(m))), unit: 'm' };
  const km = m / 1000;
  if (m < 1e13) {
    const d = km < 10 ? 2 : km < 100 ? 1 : 0;
    return { value: nf(d).format(km), unit: 'km' };
  }
  return { value: nf(2).format(m / LIGHT_YEAR), unit: 'ly' };
}

/** a domestic pig standing up is roughly 0.9 m tall */
export function pigsStacked(m: number, locale: string): string {
  const n = Math.max(0, Math.round(m / 0.9));
  return new Intl.NumberFormat(locale, {
    notation: n >= 1e6 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(n);
}
