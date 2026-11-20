import { useId } from 'react';
import { MiniPig } from './Scenery';

/*
 * Art for the upper floors (rooftops and above): clouds, the 1909 biplane, the
 * cows, the mission patch, the lunar hoofprint. Ground-level scenery for the
 * first three floors lives in Scenery.tsx.
 */

const L = '#3a2438'; // outline
const INK = '#221e24';
const PIG = { skin: '#ffb3d1', line: '#4a1d3a' };

const useUid = () => useId().replace(/:/g, '');

/* ───────────────────────── clouds ───────────────────────── */

const CLOUD = 'M30 96 C6 96 4 66 28 62 C24 36 56 24 74 40 C82 12 126 6 138 34 C150 18 186 22 186 48 C214 44 232 70 214 90 C212 96 206 98 198 98 Z';

export function Cloud({ className, style, tone = 'paper' }: { className?: string; style?: React.CSSProperties; tone?: 'paper' | 'pink' }) {
  const id = useUid();
  const fill = tone === 'pink' ? '#ffe3f0' : '#ffffff';
  const shade = tone === 'pink' ? '#f8bcd8' : '#d5e5f6';
  const line = tone === 'pink' ? '#a2507d' : '#5b6d9c';
  return (
    <svg className={className} style={style} viewBox="0 0 240 110" aria-hidden="true">
      <defs>
        <clipPath id={`cl-${id}`}>
          <path d={CLOUD} />
        </clipPath>
      </defs>
      <path d={CLOUD} fill={fill} />
      <g clipPath={`url(#cl-${id})`}>
        <path d="M0 80 C30 70 60 90 96 80 C130 70 160 92 196 78 C214 72 230 80 240 76 L240 110 L0 110 Z" fill={shade} />
        <ellipse cx="96" cy="30" rx="24" ry="9" fill="#fff" opacity="0.95" />
      </g>
      <path d={CLOUD} fill="none" stroke={line} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M62 56 q10 -10 20 -2 M138 46 q8 -8 16 0 M178 64 q8 -6 14 2" stroke={line} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/* ───────────────────────── rooftops ───────────────────────── */

export function Rooftops({ className }: { className?: string }) {
  const houses: { x: number; w: number; h: number; roof: string; wall: string; chim?: boolean }[] = [
    { x: 0, w: 150, h: 110, roof: '#e2584f', wall: '#f3e2c4' },
    { x: 150, w: 120, h: 150, roof: '#4f7cc4', wall: '#ffe7b8', chim: true },
    { x: 270, w: 170, h: 100, roof: '#e58a3c', wall: '#f6d6e3' },
    { x: 440, w: 130, h: 160, roof: '#7b5aa6', wall: '#e6efe0', chim: true },
    { x: 570, w: 160, h: 120, roof: '#e2584f', wall: '#fbe8c8' },
    { x: 730, w: 120, h: 170, roof: '#3f9a7a', wall: '#f3e2c4', chim: true },
    { x: 850, w: 170, h: 110, roof: '#4f7cc4', wall: '#f6d6e3' },
    { x: 1020, w: 180, h: 140, roof: '#e58a3c', wall: '#e6efe0', chim: true },
  ];
  const base = 220;
  return (
    <svg className={className} viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {houses.map(({ x, w, h, roof, wall, chim }) => {
        const top = base - h;
        const peak = top - 46;
        return (
          <g key={x}>
            {chim && <rect x={x + w * 0.66} y={peak + 4} width="18" height="40" fill="#b8644f" stroke={L} strokeWidth="3" />}
            <rect x={x + 6} y={top} width={w - 12} height={h} fill={wall} stroke={L} strokeWidth="3" />
            <path d={`M${x - 4} ${top + 4} L${x + w / 2} ${peak} L${x + w + 4} ${top + 4} Z`} fill={roof} stroke={L} strokeWidth="3.2" strokeLinejoin="round" />
            <path d={`M${x + w / 2} ${peak + 10} L${x + w - 10} ${top}`} stroke="rgba(0,0,0,0.18)" strokeWidth="8" strokeLinecap="round" />
            <path d={`M${x + 14} ${top - 2} L${x + w / 2 - 6} ${peak + 10}`} stroke="rgba(255,255,255,0.35)" strokeWidth="4" strokeLinecap="round" />
            {[0.22, 0.6].map((fx) => (
              <g key={fx}>
                <rect x={x + w * fx} y={top + 20} width="24" height="28" rx="3" fill="#ffe08a" stroke={L} strokeWidth="2.6" />
                <path d={`M${x + w * fx + 12} ${top + 20} V${top + 48} M${x + w * fx} ${top + 34} H${x + w * fx + 24}`} stroke={L} strokeWidth="2" />
              </g>
            ))}
          </g>
        );
      })}
      {/* pigeons, unimpressed */}
      {[
        [228, 58],
        [520, 46],
        [1110, 64],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M-14 0 C-14 -12 4 -14 10 -6 L16 4 C6 10 -10 10 -14 0 Z" fill="#a9b4c8" stroke={L} strokeWidth="2.6" strokeLinejoin="round" />
          <circle cx="10" cy="-12" r="7" fill="#a9b4c8" stroke={L} strokeWidth="2.6" />
          <path d="M16 -12 l6 2 -6 2z" fill="#ffb627" stroke={L} strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="11" cy="-13" r="2" fill={L} />
          <path d="M7 -17 l6 1.4" stroke={L} strokeWidth="2" strokeLinecap="round" />
          <path d="M-4 -4 q-6 -4 -8 4" stroke="#8692aa" strokeWidth="2.4" fill="none" />
          <path d="M2 9 v5 M8 8 v5" stroke="#f5a524" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────────── museum / tv props ───────────────────────── */

export function Biplane1909({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 220" aria-hidden="true">
      <rect x="10" y="40" width="300" height="16" rx="7" fill="#fffaf0" stroke={L} strokeWidth="3" />
      <rect x="10" y="150" width="300" height="16" rx="7" fill="#fffaf0" stroke={L} strokeWidth="3" />
      <path d="M18 50 H302 M18 160 H302" stroke="#e6dcc8" strokeWidth="3" />
      {[60, 130, 190, 260].map((x) => (
        <line key={x} x1={x} y1="56" x2={x} y2="150" stroke={L} strokeWidth="4" strokeLinecap="round" />
      ))}
      <path d="M60 56 L130 150 M130 56 L60 150 M190 56 L260 150 M260 56 L190 150" stroke={L} strokeWidth="1.2" opacity="0.5" />
      {/* wicker basket tied to the strut */}
      <g transform="translate(228 96)">
        <path d="M-4 -8 L40 -8" stroke="#6e4338" strokeWidth="2.4" />
        <g transform="translate(20 -6) scale(0.62)">
          <MiniPig />
        </g>
        <path d="M-2 0 L42 0 L36 44 L4 44 Z" fill="#d6a774" stroke={L} strokeWidth="3" strokeLinejoin="round" />
        {[10, 20, 30].map((yy) => (
          <path key={yy} d={`M${1 + yy * 0.12} ${yy} L${39 - yy * 0.12} ${yy}`} stroke="#9a6a3c" strokeWidth="1.8" />
        ))}
        {[10, 20, 30].map((xx) => (
          <path key={`v${xx}`} d={`M${xx} 2 L${xx + (xx - 20) * 0.1} 42`} stroke="#b8844f" strokeWidth="1.4" />
        ))}
      </g>
      <path d="M0 110 L-30 106 M0 122 L-40 124 M0 98 L-26 92" stroke="#5b6d9c" strokeWidth="3" strokeLinecap="round" transform="translate(20 0)" />
      <text x="160" y="205" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="12" fill={INK} opacity="0.7">
        SHEPPEY · 1909
      </text>
    </svg>
  );
}

function CowHead({ look }: { look: 'up' | 'front' }) {
  return (
    <g transform={look === 'up' ? 'translate(108 40) rotate(-35)' : 'translate(108 52)'}>
      <path d="M-14 -12 l-8 -10 M10 -12 l8 -10" stroke={L} strokeWidth="6" strokeLinecap="round" />
      <path d="M-14 -12 l-8 -10 M10 -12 l8 -10" stroke="#f1e3c4" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="0" cy="0" rx="20" ry="16" fill="#fffaf0" stroke={L} strokeWidth="2.8" />
      <path d="M-14 -8 q6 -6 12 0 q-4 8 -12 0z" fill={L} />
      <ellipse cx="10" cy="7" rx="12" ry="9" fill="#ffc2e2" stroke={L} strokeWidth="2.4" />
      <ellipse cx="6" cy="7" rx="1.6" ry="2.4" fill="#7a2350" />
      <ellipse cx="14" cy="7" rx="1.6" ry="2.4" fill="#7a2350" />
      <ellipse cx="-4" cy="-3" rx="4" ry="5" fill="#fffdf9" stroke={L} strokeWidth="1.8" />
      <circle cx={look === 'up' ? -3 : -4} cy={look === 'up' ? -5 : -2} r={look === 'up' ? 1.6 : 2.4} fill={L} />
    </g>
  );
}

export function Cow({ className, look = 'up' }: { className?: string; look?: 'up' | 'front' }) {
  return (
    <svg className={className} viewBox="0 0 140 110" aria-hidden="true">
      {[30, 46, 78, 94].map((x) => (
        <g key={x}>
          <rect x={x - 6} y="84" width="12" height="22" rx="4" fill="#fffaf0" stroke={L} strokeWidth="2.6" />
          <rect x={x - 6} y="98" width="12" height="8" rx="3" fill="#6e4338" stroke={L} strokeWidth="2.2" />
        </g>
      ))}
      <ellipse cx="62" cy="66" rx="46" ry="28" fill="#fffaf0" stroke={L} strokeWidth="3" />
      <path d="M40 48 q12 -6 20 4 q-4 14 -20 6z M76 70 q14 -8 22 4 q-8 12 -22 2z" fill={L} />
      <path d="M18 60 q-10 4 -8 16" stroke={L} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <CowHead look={look} />
      {look === 'up' && (
        <text x="122" y="14" fontFamily="Fraunces, serif" fontWeight="900" fontSize="24" fill="#f15060" stroke={L} strokeWidth="1">
          !
        </text>
      )}
    </svg>
  );
}

export function CowAnchor({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 220" aria-hidden="true">
      <path d="M30 220 C30 160 60 140 110 140 C160 140 190 160 190 220 Z" fill="#2b4c7e" stroke={L} strokeWidth="3" />
      <path d="M96 140 L110 176 L124 140 Z" fill="#fffaf0" stroke={L} strokeWidth="2" />
      <path d="M106 150 L110 204 L114 150 Z" fill="#f15060" stroke={L} strokeWidth="1.6" />
      <path d="M70 48 l-24 -16 l10 22z M150 48 l24 -16 l-10 22z" fill="#f1e3c4" stroke={L} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M62 66 C44 60 38 78 52 84 M158 66 C176 60 182 78 168 84" fill="#fffaf0" stroke={L} strokeWidth="2.8" />
      <ellipse cx="110" cy="86" rx="50" ry="52" fill="#fffaf0" stroke={L} strokeWidth="3.2" />
      <path d="M74 54 q16 -10 26 6 q-10 18 -26 6z M128 72 q16 -6 22 10 q-12 12 -22 0z" fill={L} />
      <ellipse cx="110" cy="118" rx="34" ry="22" fill="#ffc2e2" stroke={L} strokeWidth="2.8" />
      <ellipse cx="98" cy="118" rx="4" ry="6" fill="#7a2350" />
      <ellipse cx="122" cy="118" rx="4" ry="6" fill="#7a2350" />
      <ellipse cx="92" cy="80" rx="8" ry="10" fill="#fffdf9" stroke={L} strokeWidth="2.4" />
      <ellipse cx="128" cy="80" rx="8" ry="10" fill="#fffdf9" stroke={L} strokeWidth="2.4" />
      <circle cx="93" cy="82" r="4.4" fill="#2b1431" />
      <circle cx="129" cy="82" r="4.4" fill="#2b1431" />
      <circle cx="91.6" cy="80" r="1.5" fill="#fff" />
      <circle cx="127.6" cy="80" r="1.5" fill="#fff" />
      <path d="M82 66 l14 3 M138 66 l-14 3" stroke={L} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function Hoofprint({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 140" aria-hidden="true">
      <g fill="#0e1238" opacity="0.9">
        <path d="M54 20 C36 22 22 50 24 86 C26 112 40 126 54 122 C62 118 60 96 60 70 C60 44 64 18 54 20 Z" />
        <path d="M66 20 C84 22 98 50 96 86 C94 112 80 126 66 122 C58 118 60 96 60 70 C60 44 56 18 66 20 Z" />
      </g>
      <g fill="none" stroke="#ff48b0" strokeWidth="2.5" opacity="0.85" transform="translate(-3 -3)">
        <path d="M54 20 C36 22 22 50 24 86 C26 112 40 126 54 122 C62 118 60 96 60 70 C60 44 64 18 54 20 Z" />
        <path d="M66 20 C84 22 98 50 96 86 C94 112 80 126 66 122 C58 118 60 96 60 70 C60 44 56 18 66 20 Z" />
      </g>
    </svg>
  );
}

export function MissionPatch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 240" aria-hidden="true">
      <defs>
        <path id="patch-top" d="M40 120 A80 80 0 0 1 200 120" />
        <path id="patch-bot" d="M30 120 A90 90 0 0 0 210 120" />
      </defs>
      <circle cx="120" cy="120" r="116" fill="#ffe800" stroke={L} strokeWidth="3" />
      <circle cx="120" cy="120" r="104" fill="#0e1238" stroke="#fffaf0" strokeWidth="4" />
      <circle cx="120" cy="120" r="70" fill="#0078bf" />
      <path d="M50 150 Q120 110 190 150 L190 190 L50 190 Z" fill="#00a95c" opacity="0.7" />
      {[
        [80, 90],
        [160, 80],
        [140, 60],
        [96, 64],
        [176, 120],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.4" fill="#fffaf0" />
      ))}
      {/* our pig, in the fishbowl, rocket pack lit */}
      <g transform="translate(116 126) scale(1.25)">
        <path d="M-30 6 C-36 20 -32 30 -28 38 C-24 30 -22 20 -24 6 Z" fill="#ffb627" />
        <rect x="-36" y="-22" width="14" height="30" rx="7" fill="#f2505f" stroke={PIG.line} strokeWidth="2" />
        <MiniPig />
        <circle cx="12" cy="-8" r="22" fill="rgba(180,225,255,0.25)" stroke="#a6dcff" strokeWidth="3" />
      </g>
      <text fontFamily="Space Mono, monospace" fontWeight="700" fontSize="22" letterSpacing="5" fill="#fffaf0">
        <textPath href="#patch-top" startOffset="50%" textAnchor="middle">
          SUS VOLAT
        </textPath>
      </text>
      <text fontFamily="Space Mono, monospace" fontWeight="700" fontSize="14" letterSpacing="3" fill="#ffe800">
        <textPath href="#patch-bot" startOffset="50%" textAnchor="middle">
          MAKEPIGS.FLY · MMXXVI
        </textPath>
      </text>
    </svg>
  );
}
