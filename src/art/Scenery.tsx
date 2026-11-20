import { useId } from 'react';
import { PigHead } from './PigMark';

/*
 * Cel-shaded cartoon scenery. One outline colour, a base fill, a shade tone
 * clipped to the shape, and a highlight blob, so everything matches the pig.
 */

const L = '#3a2438'; // outline
const PIG = { skin: '#ffb3d1', line: '#4a1d3a' };

const useUid = () => useId().replace(/:/g, '');

/* ───────────────────────── countryside backdrop ───────────────────────── */

function Lollipop({ x, y, s = 1, tone = 0 }: { x: number; y: number; s?: number; tone?: number }) {
  const leaf = ['#3fae66', '#4bbb72', '#36a05c'][tone % 3];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-5 2 L-4 -30 L4 -30 L5 2 Z" fill="#8a5a3c" stroke={L} strokeWidth="3" strokeLinejoin="round" />
      <path d="M0 -24 C-28 -22 -36 -50 -20 -60 C-24 -82 4 -94 14 -78 C34 -86 44 -60 32 -50 C42 -34 24 -20 0 -24 Z" fill={leaf} />
      <path d="M-24 -38 C-10 -30 16 -30 34 -42 C38 -30 24 -20 0 -24 C-16 -24 -26 -30 -24 -38 Z" fill="#2c8a4e" opacity="0.6" />
      <path d="M0 -24 C-28 -22 -36 -50 -20 -60 C-24 -82 4 -94 14 -78 C34 -86 44 -60 32 -50 C42 -34 24 -20 0 -24 Z" fill="none" stroke={L} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="-6" cy="-66" rx="9" ry="5.5" fill="#8fdcaa" transform="rotate(-20 -6 -66)" />
      <path d="M14 -52 l4 4 M-10 -46 l3 4" stroke="#2c8a4e" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

const MID_HILL =
  'M0 196 C90 170 200 160 300 168 C380 150 440 140 520 140 C600 140 660 142 720 156 C800 172 880 168 960 160 C1080 148 1180 150 1280 164 C1380 176 1480 162 1600 158 L1600 270 L0 270 Z';

/** Rolling cartoon farmland with a barn (pig weathervane), silo, trees and a very limp windsock. */
export function Hills({ className }: { className?: string }) {
  const id = useUid();
  return (
    <svg className={className} viewBox="0 0 1600 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <clipPath id={`mh-${id}`}>
          <path d={MID_HILL} />
        </clipPath>
      </defs>

      {/* far hills: atmospheric, no outline */}
      <path d="M0 150 C120 112 240 100 360 128 C480 92 620 82 760 118 C880 96 1000 86 1140 114 C1260 92 1420 88 1600 124 L1600 260 L0 260 Z" fill="#c3e8d2" />
      <path d="M180 150 Q400 128 640 146 M900 140 Q1150 120 1400 138" stroke="#aedcc0" strokeWidth="5" strokeLinecap="round" fill="none" />
      {[
        [110, 128, 8],
        [140, 124, 6],
        [690, 108, 9],
        [720, 112, 6],
        [1180, 106, 8],
        [1210, 104, 6],
        [1460, 104, 7],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#a5d8b9" />
      ))}

      {/* barn + silo sit just behind the ridge */}
      <g transform="translate(790 24)">
        <path d="M592 60 L592 152 L632 152 L632 60 Z" fill="#dfe3ea" />
        <path d="M620 60 L620 152 L632 152 L632 60 Z" fill="#c2c8d4" />
        <path d="M592 84 H632 M592 108 H632 M592 132 H632" stroke="#aab2c2" strokeWidth="2.6" />
        <path d="M598 66 V144" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        <path d="M592 60 L592 152 L632 152 L632 60" fill="none" stroke={L} strokeWidth="3" strokeLinejoin="round" />
        <path d="M588 62 Q612 22 636 62 Z" fill="#8d98ad" stroke={L} strokeWidth="3" strokeLinejoin="round" />
        <path d="M598 52 Q606 40 616 36" stroke="#c4ccdb" strokeWidth="3" strokeLinecap="round" fill="none" />

        <path d="M470 152 L470 88 L480 62 L525 42 L570 62 L580 88 L580 152 Z" fill="#e5484d" />
        <path d="M554 152 L554 74 L570 62 L580 88 L580 152 Z" fill="#c4363d" />
        <path d="M478 96 V146 M490 96 V146 M560 96 V146" stroke="#cf3e45" strokeWidth="2" />
        <path d="M470 152 L470 88 L480 62 L525 42 L570 62 L580 88 L580 152 Z" fill="none" stroke={L} strokeWidth="3" strokeLinejoin="round" />
        <path d="M463 93 L477 60 L525 37 L573 60 L587 93" fill="none" stroke={L} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M463 93 L477 60 L525 37 L573 60 L587 93" fill="none" stroke="#fff6ea" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="514" y="58" width="22" height="18" fill={L} stroke="#fff6ea" strokeWidth="3" />
        <rect x="500" y="104" width="50" height="48" fill="#c4363d" stroke="#fff6ea" strokeWidth="4" />
        <path d="M500 104 L550 152 M550 104 L500 152" stroke="#fff6ea" strokeWidth="4" />
        <rect x="497" y="101" width="56" height="54" fill="none" stroke={L} strokeWidth="1.6" />
        {/* weathervane: a pig, obviously with wings */}
        <path d="M525 37 V14" stroke={L} strokeWidth="3" />
        <g fill={L}>
          <ellipse cx="524" cy="12" rx="10" ry="6" />
          <circle cx="534" cy="8" r="5.5" />
          <path d="M518 8 L510 -2 L524 4 Z" />
          <path d="M538 9 h5 v3 h-5 z" />
          <path d="M514 12 q-6 -4 -4 2" stroke={L} strokeWidth="1.6" fill="none" />
        </g>
      </g>

      {/* mid hills */}
      <path d={MID_HILL} fill="#7fcf97" />
      <g clipPath={`url(#mh-${id})`}>
        <path d="M0 230 C300 214 700 236 1000 222 C1250 212 1450 228 1600 216 L1600 270 L0 270 Z" fill="#69bf84" />
        <path d="M120 200 Q260 176 400 192 M760 196 Q900 178 1040 190 M1240 196 Q1360 182 1500 192" stroke="#5db078" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
      <path d={MID_HILL} fill="none" stroke={L} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M330 162 q40 -10 80 -4 M700 160 q30 4 54 14 M1100 156 q44 -6 90 2" stroke="#aee6bf" strokeWidth="5" strokeLinecap="round" fill="none" />

      <Lollipop x={86} y={186} s={0.9} tone={1} />
      <Lollipop x={226} y={170} s={1.12} />
      <Lollipop x={760} y={166} s={0.92} tone={2} />
      <Lollipop x={826} y={172} s={1.18} />
      <Lollipop x={1150} y={156} s={1.02} tone={1} />
      <Lollipop x={1530} y={164} s={0.86} tone={2} />

      {/* the windsock reports: no wind whatsoever */}
      <g transform="translate(-940 -14)">
        <path d="M1418 170 V94" stroke={L} strokeWidth="6" strokeLinecap="round" />
        <path d="M1418 170 V94" stroke="#e7e9ef" strokeWidth="2.5" strokeLinecap="round" />
        <g className="windsock">
          <path d="M1420 98 C1438 98 1448 112 1446 132 L1434 134 C1434 118 1430 110 1420 112 Z" fill="#ff7a2a" />
          <path d="M1432 102 C1438 108 1440 114 1440 122 L1434 122 C1434 114 1432 110 1428 106 Z" fill="#fff6ea" />
          <path d="M1420 98 C1438 98 1448 112 1446 132 L1434 134 C1434 118 1430 110 1420 112 Z" fill="none" stroke={L} strokeWidth="2.6" strokeLinejoin="round" />
        </g>
      </g>

      {/* near hill shoulders frame the edges */}
      <path d="M-10 270 L-10 214 C80 198 170 204 250 222 C306 236 344 252 380 270 Z" fill="#52b873" stroke={L} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M1610 270 L1610 204 C1520 196 1420 206 1340 226 C1300 238 1270 252 1250 270 Z" fill="#52b873" stroke={L} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M40 214 q30 -8 64 -6 M1440 212 q40 -8 80 -6" stroke="#86d7a0" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** A strip of outlined grass tufts that tiles at any width. */
export function GrassEdge({ className }: { className?: string }) {
  const id = useUid();
  const top = 'M0 22 Q6 10 12 20 Q18 4 26 18 Q32 10 38 20 Q46 6 52 19 Q58 10 64 22';
  const bot = 'M0 36 Q16 42 32 36 Q48 30 64 36';
  return (
    <svg className={className} width="100%" height="46" aria-hidden="true">
      <defs>
        <pattern id={`ge-${id}`} width="64" height="46" patternUnits="userSpaceOnUse">
          <path d={`${top} L64 36 Q48 30 32 36 Q16 42 0 36 Z`} fill="#4cbf6e" />
          <path d="M0 30 Q16 25 32 30 T64 30 L64 36 Q48 30 32 36 Q16 42 0 36 Z" fill="#36a35a" />
          <path d={top} fill="none" stroke={L} strokeWidth="3" strokeLinejoin="round" />
          <path d={bot} fill="none" stroke={L} strokeWidth="3" />
          <path d="M10 27 l2 -6 M28 25 l2 -7 M47 27 l2 -6" stroke="#8fe0a8" strokeWidth="2.2" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width="100%" height="46" fill={`url(#ge-${id})`} />
    </svg>
  );
}

/** Mud texture: lumps, pebbles and the odd puddle-glint. Tiles. */
export function MudField({ className }: { className?: string }) {
  const id = useUid();
  return (
    <svg className={className} width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={`mf-${id}`} width="240" height="150" patternUnits="userSpaceOnUse">
          <ellipse cx="34" cy="34" rx="22" ry="6" fill="#6f4234" opacity="0.55" />
          <ellipse cx="142" cy="78" rx="30" ry="8" fill="#6f4234" opacity="0.5" />
          <ellipse cx="210" cy="22" rx="14" ry="4.5" fill="#6f4234" opacity="0.5" />
          <ellipse cx="80" cy="124" rx="26" ry="7" fill="#6f4234" opacity="0.5" />
          <path d="M128 72 q10 -5 22 0 M24 30 q8 -4 18 0" stroke="#b58066" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <ellipse cx="66" cy="58" rx="6" ry="4" fill="#c7a487" stroke={L} strokeWidth="1.8" />
          <ellipse cx="176" cy="130" rx="5" ry="3.4" fill="#b8957a" stroke={L} strokeWidth="1.6" />
          <ellipse cx="222" cy="98" rx="7" ry="4.4" fill="#c7a487" stroke={L} strokeWidth="1.8" />
          <path d="M63 56 l3 -1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M219 96 l4 -1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#mf-${id})`} />
    </svg>
  );
}

/* ───────────────────────── fence ───────────────────────── */

export function Fence({ className }: { className?: string }) {
  const posts = [
    { x: 24, r: -3 },
    { x: 112, r: 2 },
    { x: 198, r: -1.5 },
    { x: 286, r: 3.5 },
  ];
  const rails = [
    { y: 44, dy: -4 },
    { y: 86, dy: 5 },
  ];
  return (
    <svg className={className} viewBox="0 0 330 140" aria-hidden="true">
      {rails.map(({ y, dy }) => {
        const d = `M-6 ${y} L336 ${y + dy} L336 ${y + 17 + dy} L-6 ${y + 17} Z`;
        return (
          <g key={y}>
            <path d={d} fill="#d99d62" />
            <path d={`M-6 ${y + 11} L336 ${y + 11 + dy} L336 ${y + 17 + dy} L-6 ${y + 17} Z`} fill="#b97b45" />
            <path d={`M30 ${y + 6} h44 M150 ${y + 7 + dy / 2} h60 M244 ${y + 5 + dy} h34`} stroke="#b47640" strokeWidth="2.2" strokeLinecap="round" />
            <ellipse cx="236" cy={y + 8 + dy * 0.7} rx="5" ry="3" fill="#8a5a3c" stroke={L} strokeWidth="1.4" />
            <path d={d} fill="none" stroke={L} strokeWidth="3.2" strokeLinejoin="round" />
          </g>
        );
      })}
      {posts.map(({ x, r }) => {
        const d = `M${x - 12} 142 L${x - 12} 24 Q${x} 8 ${x + 12} 24 L${x + 12} 142 Z`;
        return (
          <g key={x} transform={`rotate(${r} ${x} 140)`}>
            <path d={d} fill="#c98b53" />
            <path d={`M${x + 4} 142 L${x + 4} 15 Q${x + 10} 17 ${x + 12} 24 L${x + 12} 142 Z`} fill="#a86b3d" />
            <path d={`M${x - 6} 30 V62 M${x - 5} 100 V124`} stroke="#e9b582" strokeWidth="3" strokeLinecap="round" />
            <path d={`M${x - 2} 72 q3 6 0 12`} stroke="#9a6036" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d={d} fill="none" stroke={L} strokeWidth="3.2" strokeLinejoin="round" />
            <circle cx={x} cy={52} r="2.4" fill={L} />
            <circle cx={x} cy={95} r="2.4" fill={L} />
          </g>
        );
      })}
      {/* a dandelion that has seen things */}
      <path d="M150 140 q-2 -16 4 -28" stroke="#3f9a5c" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="154" cy="108" r="7" fill="#ffd93d" stroke={L} strokeWidth="2.2" />
    </svg>
  );
}

export function RunwaySign({ label, className }: { label: string; className?: string }) {
  return (
    <div className={`runway-sign ${className ?? ''}`} aria-hidden="true">
      <span>{label}</span>
      <i />
    </div>
  );
}

/* ───────────────────────── chicken ───────────────────────── */

export function Chicken({ className, mood = 'skeptic' }: { className?: string; mood?: 'skeptic' | 'jealous' }) {
  const id = useUid();
  const body = 'M30 80 C28 58 46 50 62 54 C66 36 76 26 88 26 C102 26 108 38 106 52 C104 66 100 74 96 84 C92 102 76 110 60 110 C42 110 30 98 30 80 Z';
  const tail = 'M36 70 C18 64 10 44 20 36 C24 48 30 54 38 58 C30 44 30 28 42 24 C44 40 48 50 54 56 Z';
  return (
    <svg className={className} viewBox="0 0 120 132" aria-hidden="true">
      <defs>
        <clipPath id={`ck-${id}`}>
          <path d={body} />
        </clipPath>
        <clipPath id={`ce-${id}`}>
          <ellipse cx="90" cy="46" rx="7.5" ry="9" />
        </clipPath>
      </defs>
      {/* legs */}
      <path d="M54 106 L52 122 M68 106 L70 122" stroke={L} strokeWidth="8" strokeLinecap="round" />
      <path d="M54 106 L52 122 M68 106 L70 122" stroke="#f5a524" strokeWidth="4" strokeLinecap="round" />
      <path d="M43 124 L52 122 L58 126 M64 124 L70 122 L79 124" stroke={L} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M43 124 L52 122 L58 126 M64 124 L70 122 L79 124" stroke="#f5a524" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      <path d={tail} fill="#fffaf2" stroke={L} strokeWidth="3" strokeLinejoin="round" />
      <path d="M26 44 C28 52 32 56 36 60" stroke="#e3d6c4" strokeWidth="2.4" fill="none" strokeLinecap="round" />

      <path d={body} fill="#fffaf2" />
      <g clipPath={`url(#ck-${id})`}>
        <ellipse cx="62" cy="114" rx="46" ry="18" fill="#ebdfcf" />
        <ellipse cx="80" cy="34" rx="10" ry="5" fill="#fff" />
      </g>
      <path d={body} fill="none" stroke={L} strokeWidth="3.2" strokeLinejoin="round" />

      {/* wing: on the hip, judging */}
      <path d="M40 76 C46 62 68 62 76 76 C72 90 56 96 42 92 C46 88 48 84 40 76 Z" fill="#f5ecdf" stroke={L} strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M50 88 q4 -6 2 -12 M60 90 q4 -6 2 -14" stroke="#d9c9b3" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* comb, beak, wattle */}
      <path d="M78 30 C74 18 82 12 86 20 C86 8 98 8 96 20 C102 12 110 18 104 28 C96 26 86 26 78 30 Z" fill="#f2434f" stroke={L} strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M104 46 L118 51 L104 57 Z" fill="#ffb627" stroke={L} strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M104 51 L114 51" stroke={L} strokeWidth="1.6" />
      <path d="M102 58 C107 62 107 70 101 70 C97 68 97 62 102 58 Z" fill="#f2434f" stroke={L} strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx="94" cy="60" rx="5" ry="3" fill="#ff8fb3" opacity="0.6" />

      {/* eye */}
      <ellipse cx="90" cy="46" rx="7.5" ry="9" fill="#fffdf9" />
      <g clipPath={`url(#ce-${id})`}>
        <circle cx={mood === 'jealous' ? 93 : 92} cy="48" r={mood === 'jealous' ? 3.2 : 4.4} fill="#2b1431" />
        <circle cx="90.6" cy="46" r="1.5" fill="#fff" />
        {/* skeptical half-lid / jealous squint */}
        <path d={mood === 'jealous' ? 'M80 36 H100 V47 Q90 43 80 47 Z' : 'M80 36 H100 V43 Q90 41 80 43 Z'} fill="#fffaf2" />
      </g>
      <ellipse cx="90" cy="46" rx="7.5" ry="9" fill="none" stroke={L} strokeWidth="2.6" />
      <path d={mood === 'jealous' ? 'M82 46.5 Q90 43 98 46.5' : 'M82 42.6 Q90 40.6 98 42.6'} stroke={L} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {mood === 'skeptic' ? (
        <path d="M82 30 Q90 24 98 30" stroke={L} strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <path d="M82 33 L98 37" stroke={L} strokeWidth="3" strokeLinecap="round" />
          <g fill="#fff" stroke={L} strokeWidth="2">
            <circle cx="112" cy="30" r="5" />
            <circle cx="118" cy="22" r="3.5" />
            <circle cx="121" cy="15" r="2.2" />
          </g>
        </>
      )}
    </svg>
  );
}

/* ───────────────────────── the tree (and a humbler pig) ───────────────────────── */

/** a small copy of the pig: stubby body + the same head as the logo */
export function MiniPig({ look = 'right' }: { look?: 'right' | 'up' }) {
  const o = PIG.line;
  return (
    <g>
      <path d="M-18 12 v9 M-2 13 v9" stroke={o} strokeWidth="8" strokeLinecap="round" />
      <path d="M-18 12 v9 M-2 13 v9" stroke={PIG.skin} strokeWidth="4.2" strokeLinecap="round" />
      <path d="M-18 19 v2 M-2 20 v2" stroke="#6b3a2e" strokeWidth="4.2" strokeLinecap="round" />
      <ellipse cx="-10" cy="5" rx="21" ry="14" fill={PIG.skin} stroke={o} strokeWidth="2.8" />
      <ellipse cx="-8" cy="11" rx="12" ry="5" fill="#ffe6ef" opacity="0.8" />
      <path d="M-30 0 q-7 -6 -3 -11 q5 2 0 6" stroke={o} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <g transform={`translate(12 -8) rotate(${look === 'up' ? -14 : 0}) scale(0.62) translate(-32 -36)`}>
        <PigHead mood="happy" />
      </g>
    </g>
  );
}

export function TreeWithPig({ className }: { className?: string }) {
  const id = useUid();
  const puffs: [number, number, number][] = [
    [104, 98, 68],
    [52, 132, 42],
    [162, 126, 44],
    [66, 68, 38],
    [146, 62, 40],
  ];
  return (
    <svg className={className} viewBox="0 0 220 300" aria-hidden="true">
      <defs>
        <clipPath id={`tc-${id}`}>
          {puffs.map(([x, y, r]) => (
            <circle key={x} cx={x} cy={y} r={r} />
          ))}
        </clipPath>
      </defs>
      <path
        d="M90 300 C96 250 98 210 94 172 C90 152 74 140 58 132 L66 122 C82 128 94 138 101 150 C108 138 124 128 150 122 L154 134 C130 140 116 154 112 174 C110 210 112 250 120 300 Z"
        fill="#9a6542"
        stroke={L}
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path d="M106 296 C104 250 104 214 108 182" stroke="#7c4d31" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M98 220 q4 8 0 16 M100 262 q-4 6 0 12" stroke="#6e4229" strokeWidth="2.4" fill="none" strokeLinecap="round" />

      {puffs.map(([x, y, r]) => (
        <circle key={x} cx={x} cy={y} r={r + 3.2} fill={L} />
      ))}
      {puffs.map(([x, y, r]) => (
        <circle key={`f${x}`} cx={x} cy={y} r={r} fill="#46b36b" />
      ))}
      <g clipPath={`url(#tc-${id})`}>
        <ellipse cx="108" cy="176" rx="130" ry="42" fill="#36995a" />
        {puffs.map(([x, y, r]) => (
          <ellipse key={`h${x}`} cx={x - r * 0.3} cy={y - r * 0.45} rx={r * 0.34} ry={r * 0.2} fill="#86d9a2" transform={`rotate(-20 ${x - r * 0.3} ${y - r * 0.45})`} />
        ))}
      </g>
      {[
        [80, 110],
        [130, 90],
        [60, 150],
        [170, 140],
        [104, 50],
      ].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y} l4 5 l4 -5`} stroke="#2c8a4e" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}

      {/* 豚もおだてりゃ木に登る — flatter a pig and it climbs a tree */}
      <g transform="translate(158 110) scale(0.95)">
        <MiniPig look="up" />
      </g>
      <path d="M184 76 c-4 -8 6 -12 8 -4 c2 -8 12 -4 8 4 l-8 8 z" fill="#ff48b0" stroke={L} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
