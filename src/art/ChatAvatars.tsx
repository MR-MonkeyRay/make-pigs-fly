import { PigHead } from './PigMark';

/*
 * Round profile pictures for the intercepted bird group chat (floor 4).
 * Each avatar is a self-contained square SVG; CSS sizes it (about 30 px).
 */

export type Chatter = 'gary' | 'steve' | 'linda' | 'goose' | 'pig';

const INK = '#221e24';

const FACE: Record<Exclude<Chatter, 'pig'>, { bg: string; fg: string; ch: string }> = {
  gary: { bg: '#a9d4ee', fg: '#0e1238', ch: 'G' },
  steve: { bg: '#ffe800', fg: '#221e24', ch: 'S' },
  linda: { bg: '#221e24', fg: '#f4eedf', ch: 'L' },
  goose: { bg: '#fffaf0', fg: '#221e24', ch: '♛' },
};

export function ChatAvatar({ who, className }: { who: Chatter; className?: string }) {
  if (who === 'pig') {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#ff9fd0" stroke={INK} strokeWidth="4" />
        <g transform="translate(32 34) scale(0.78) translate(-32 -36)">
          <PigHead mood="smug" />
        </g>
      </svg>
    );
  }
  const f = FACE[who];
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill={f.bg} stroke={INK} strokeWidth="4" />
      <text x="32" y="41" textAnchor="middle" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="800" fontSize="26" fill={f.fg}>
        {f.ch}
      </text>
    </svg>
  );
}
