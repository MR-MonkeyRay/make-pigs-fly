import type { ModeId, Route } from './modes/types';

const MODES: Record<string, ModeId> = { '': 'dare', dare: 'dare', ways: 'ways', run: 'run' };

/** Pure hash parser: "#/ways/hype-fan?x=1" → { mode: 'ways', path: ['hype-fan'], query }. Unknown → dare. */
export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  const qIndex = raw.indexOf('?');
  const pathPart = qIndex >= 0 ? raw.slice(0, qIndex) : raw;
  const query = new URLSearchParams(qIndex >= 0 ? raw.slice(qIndex + 1) : '');
  const segments = pathPart
    .split('/')
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    });
  const first = segments[0] ?? '';
  const mode = Object.hasOwn(MODES, first) ? MODES[first] : undefined;
  if (!mode) return { mode: 'dare', path: [], query };
  return { mode, path: segments.slice(1), query };
}

export function modeHash(mode: ModeId): string {
  return mode === 'dare' ? '#/' : `#/${mode}`;
}
