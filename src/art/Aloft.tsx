import { useId } from 'react';
import { PigHead } from './PigMark';
import './aloft.css';

/*
 * Art for the upper floors (rooftops and above): clouds, rooftops skyline,
 * 1909 Sheppey biplane, startled farm cow, PNN cow news anchor, lunar
 * hoofprint, and embroidered astronaut mission patch.
 */

const O = '#3a2438'; // deep plum outline
const PIG_O = '#4a1d3a';
const INK = '#221e24';
const BLUE = '#0078bf';
const PINK = '#ff48b0';
const YELLOW = '#ffe800';

const useUid = () => useId().replace(/:/g, '');

/* ───────────────────────── clouds ───────────────────────── */

const CLOUD_PATH =
  'M 32,96 C 10,96 6,72 22,63 C 20,42 42,28 64,37 C 74,14 114,8 134,27 C 148,15 182,19 188,43 C 216,42 234,66 220,86 C 215,94 206,96 196,96 Z';

export function Cloud({
  className,
  style,
  tone = 'paper',
}: {
  className?: string;
  style?: React.CSSProperties;
  tone?: 'paper' | 'pink';
}) {
  const id = useUid();
  const isPink = tone === 'pink';
  const topCol = isPink ? '#fff2f8' : '#ffffff';
  const midCol = isPink ? '#ffdbed' : '#f7f4ec';
  const shade1 = isPink ? '#f8b4d6' : '#d8e7f7';
  const shade2 = isPink ? '#e691be' : '#bdd4ee';
  const bounce = isPink ? '#fff0e6' : '#fffdf7';
  const line = isPink ? '#8c3f6a' : '#4e608e';

  return (
    <svg className={className} style={style} viewBox="0 0 240 110" aria-hidden="true">
      <defs>
        <linearGradient id={`cg-${id}`} x1="0.3" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={topCol} />
          <stop offset="0.72" stopColor={midCol} />
          <stop offset="1" stopColor={shade1} />
        </linearGradient>
        <clipPath id={`cc-${id}`}>
          <path d={CLOUD_PATH} />
        </clipPath>
      </defs>

      <path d={CLOUD_PATH} fill={`url(#cg-${id})`} />
      <g clipPath={`url(#cc-${id})`}>
        {/* Scalloped mid cel-shadow band */}
        <path
          d="M 4,76 C 28,68 48,86 78,76 C 106,66 134,84 166,74 C 192,66 214,78 236,72 L 236,108 L 4,108 Z"
          fill={shade1}
        />
        {/* Deeper lower shadow */}
        <path
          d="M 4,87 C 40,81 86,93 134,86 C 176,80 206,89 236,84 L 236,108 L 4,108 Z"
          fill={shade2}
          opacity="0.75"
        />
        {/* Warm subtle bounce light along bottom edge */}
        <path d="M 30,94 Q 116,97 202,93" stroke={bounce} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.65" />
        {/* Glossy top-left puff highlights */}
        <ellipse cx="102" cy="24" rx="22" ry="7.5" fill="#ffffff" opacity="0.95" transform="rotate(-10 102 24)" />
        <ellipse cx="48" cy="43" rx="13" ry="5" fill="#ffffff" opacity="0.88" transform="rotate(-18 48 43)" />
        <ellipse cx="164" cy="31" rx="14" ry="5.5" fill="#ffffff" opacity="0.86" transform="rotate(8 164 31)" />
      </g>
      {/* Varied weight outline: bold outer contour, delicate interior curls */}
      <path d={CLOUD_PATH} fill="none" stroke={line} strokeWidth="3.6" strokeLinejoin="round" />
      <path
        d="M 56,55 C 63,46 75,47 80,55 M 134,42 C 141,34 152,36 155,44 M 176,62 C 183,55 193,57 196,64"
        stroke={line}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.52"
      />
    </svg>
  );
}

/* ───────────────────────── rooftops ───────────────────────── */

function Window({
  x,
  y,
  w = 22,
  h = 28,
  lit = true,
  arched,
  flowers,
  curtains,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  lit?: boolean;
  arched?: boolean;
  flowers?: boolean;
  curtains?: boolean;
}) {
  const fill = lit ? '#ffe285' : '#9cc8e6';
  const paneTop = lit ? '#fff5c4' : '#cae6f7';
  const d = arched
    ? `M ${x},${y + h} V ${y + w * 0.48} A ${w / 2},${w * 0.48} 0 0 1 ${x + w},${y + w * 0.48} V ${y + h} Z`
    : `M ${x},${y} H ${x + w} V ${y + h} H ${x} Z`;
  return (
    <g>
      {/* Frame recess */}
      <path d={d} fill={fill} stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
      {/* Top glass sheen */}
      <path d={`M ${x + 3},${y + 7} L ${x + w - 4},${y + 4} L ${x + w - 4},${y + 11} L ${x + 3},${y + 14} Z`} fill={paneTop} opacity="0.7" />
      {/* Little drawn curtains */}
      {curtains && (
        <g fill="#f279a6" opacity="0.82">
          <path d={`M ${x + 1.5},${y + 2} H ${x + w * 0.34} Q ${x + w * 0.28},${y + h * 0.55} ${x + 1.5},${y + h * 0.72} Z`} />
          <path d={`M ${x + w - 1.5},${y + 2} H ${x + w * 0.66} Q ${x + w * 0.72},${y + h * 0.55} ${x + w - 1.5},${y + h * 0.72} Z`} />
        </g>
      )}
      {/* Mullions */}
      <path d={`M ${x + w / 2},${y + 1} V ${y + h - 1} M ${x + 1},${y + h * 0.52} H ${x + w - 1}`} stroke={O} strokeWidth="1.7" />
      {/* Sill */}
      <rect x={x - 3} y={y + h - 1} width={w + 6} height="4.5" rx="1.5" fill="#fffaf0" stroke={O} strokeWidth="1.9" />
      {/* Optional window flower box */}
      {flowers && (
        <g transform={`translate(${x - 2} ${y + h + 2})`}>
          <path d="M 0,0 H 26 L 24,8 H 2 Z" fill="#b86048" stroke={O} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="6" cy="-1" r="3.4" fill="#32a85c" />
          <circle cx="13" cy="-2" r="3.8" fill="#32a85c" />
          <circle cx="20" cy="-1" r="3.4" fill="#32a85c" />
          <circle cx="6" cy="-2" r="1.9" fill={PINK} />
          <circle cx="13" cy="-3.4" r="2" fill={YELLOW} />
          <circle cx="20" cy="-2" r="1.9" fill="#ff7096" />
        </g>
      )}
    </g>
  );
}

function RoofPigeon({
  x,
  y,
  pose,
  flip,
}: {
  x: number;
  y: number;
  pose: 'gawk' | 'sleep' | 'coo';
  flip?: boolean;
}) {
  const sx = flip ? -1 : 1;
  if (pose === 'sleep') {
    return (
      <g transform={`translate(${x} ${y}) scale(${sx} 1)`}>
        {/* Tucked round loaf pigeon */}
        <path
          d="M -15,4 C -15,-8 -4,-13 8,-10 C 17,-8 20,2 14,7 C 6,10 -12,10 -15,4 Z"
          fill="#9aa9c4"
          stroke={O}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M -10,5 C -2,9 10,8 15,3 C 12,9 -6,10 -10,5 Z" fill="#73829e" />
        <path d="M -4,-2 C 2,-5 10,-2 12,3" stroke="#6c7b96" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Head tucked into chest */}
        <circle cx="10" cy="-8" r="6.8" fill="#a8b7d1" stroke={O} strokeWidth="2.4" />
        <path d="M 7,-7 Q 10,-4 13,-7" stroke={O} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M 16,-7 L 20,-5.5 L 16,-4 Z" fill="#f5a524" stroke={O} strokeWidth="1.4" strokeLinejoin="round" />
      </g>
    );
  }
  const gawk = pose === 'gawk';
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} 1)`}>
      <g className={pose === 'coo' ? 'aloft-coo' : undefined}>
        {/* Feet */}
        <path d="M -2,8 V 14 M 5,8 V 14 M -5,14 H 1 M 2,14 H 8" stroke="#f0981c" strokeWidth="2.4" strokeLinecap="round" />
        {/* Tail + plump body */}
        <path d="M -12,4 L -23,8 L -18,1 Z" fill="#6d7c99" stroke={O} strokeWidth="2.2" strokeLinejoin="round" />
        <path
          d="M -13,1 C -13,-10 2,-14 12,-7 C 18,-2 17,7 9,10 C -2,12 -13,9 -13,1 Z"
          fill="#a4b3cc"
          stroke={O}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Wing bar */}
        <path d="M -8,0 C -2,-5 6,-4 8,2 C 3,6 -6,6 -8,0 Z" fill="#7c8ca8" stroke={O} strokeWidth="1.8" />
        {/* Iridescent neck */}
        <path d="M 4,-8 Q 10,-5 14,-8 L 13,-3 Q 9,-1 4,-4 Z" fill="#2cb890" />
        {/* Head — gawk tilts sharply up toward the flying pig; coo puffs proudly */}
        <g transform={gawk ? 'translate(11 -13) rotate(-38)' : 'translate(11 -11)'}>
          <circle cx="0" cy="0" r="7.5" fill="#b0bed6" stroke={O} strokeWidth="2.4" />
          {/* Beak */}
          {gawk ? (
            <>
              <path d="M 6,-2 L 14,-5 L 7,1 Z" fill="#4f566b" stroke={O} strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M 6,1 L 13,4 L 6,4 Z" fill="#4f566b" stroke={O} strokeWidth="1.5" strokeLinejoin="round" />
            </>
          ) : (
            <path d="M 6,-1 L 13,1 L 6,3 Z" fill="#f5a524" stroke={O} strokeWidth="1.6" strokeLinejoin="round" />
          )}
          <circle cx="5.8" cy="-1.2" r="1.6" fill="#fffaf0" />
          {/* Eye */}
          {gawk ? (
            <>
              <circle cx="1.6" cy="-1.5" r="3.4" fill="#ffffff" stroke={O} strokeWidth="1.6" />
              <circle cx="2.5" cy="-2.2" r="1.4" fill={O} />
              <circle cx="2" cy="-2.7" r="0.6" fill="#ffffff" />
            </>
          ) : (
            <path d="M -1,-1.5 Q 2,-4.5 5,-1.5" stroke={O} strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>
    </g>
  );
}

export function Rooftops({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {/* ── Far atmospheric skyline (soft blue-lavender depth row, no heavy outlines) ── */}
      <g opacity="0.88">
        {/* Distant silhouettes */}
        <path
          d="M 0,220 V 114 L 46,84 L 94,114 V 96 H 176 V 126 L 230,90 L 284,126 V 78 L 324,52 L 364,78 V 116 H 460 L 496,86 L 538,116 V 92 H 632 V 120 L 678,86 L 724,120 V 100 H 832 L 876,74 L 920,100 V 124 H 1018 L 1068,86 L 1118,124 V 96 H 1200 V 220 Z"
          fill="#adc8e2"
        />
        {/* Distant water tower behind mid-right */}
        <g fill="#95b4d4">
          <path d="M 774,104 L 782,78 M 804,104 L 796,78 M 789,104 V 78" stroke="#95b4d4" strokeWidth="2.8" />
          <rect x="774" y="48" width="30" height="30" rx="2" />
          <path d="M 770,49 L 789,34 L 808,49 Z" />
          <path d="M 774,58 H 804 M 774,68 H 804" stroke="#bfd6ec" strokeWidth="1.5" />
        </g>
        {/* Soft distant sunlit roof highlights */}
        <path d="M 46,84 L 94,114 M 324,52 L 364,78 M 678,86 L 724,120 M 1068,86 L 1118,124" stroke="#cde0f2" strokeWidth="3" />
      </g>

      {/* ── 1. Left coral gable house (x=-8..132) ── */}
      <g>
        <rect x="96" y="64" width="18" height="44" fill="#b86048" stroke={O} strokeWidth="2.8" />
        <rect x="93" y="60" width="24" height="7" rx="1.5" fill="#9c4c38" stroke={O} strokeWidth="2.4" />
        <rect x="0" y="114" width="128" height="110" fill="#f7e6c8" stroke={O} strokeWidth="3.2" />
        <rect x="108" y="114" width="20" height="110" fill="#e6d0ae" />
        <path d="M -8,118 L 64,68 L 136,118 Z" fill="#e3564f" stroke={O} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M 64,74 L 128,116" stroke="#b83834" strokeWidth="7" strokeLinecap="round" opacity="0.45" />
        <path d="M 10,113 L 60,78" stroke="#ff968f" strokeWidth="3.5" strokeLinecap="round" opacity="0.65" />
        {/* Roof tile scallop hints */}
        <path d="M 44,98 q6,5 12,0 q6,5 12,0 q6,5 12,0" stroke="#b83834" strokeWidth="2" fill="none" opacity="0.55" />
        <Window x={24} y={136} lit flowers />
        <Window x={76} y={136} lit curtains />
        <Window x={52} y={182} w={20} h={24} lit={false} />
      </g>

      {/* ── 2. Blue mansard townhouse with TV antenna (x=122..252) ── */}
      <g>
        {/* Rooftop TV Yagi antenna */}
        <g stroke={O} strokeWidth="2.2" strokeLinecap="round">
          <path d="M 156,56 V 26 M 142,36 L 170,32 M 146,30 V 42 M 156,28 V 40 M 166,26 V 38" />
        </g>
        <rect x="128" y="88" width="120" height="136" fill="#f7d8e4" stroke={O} strokeWidth="3.2" />
        <rect x="230" y="88" width="18" height="136" fill="#e5bfd0" />
        {/* Mansard roof */}
        <path d="M 122,90 L 140,54 H 236 L 254,90 Z" fill="#3a6eb8" stroke={O} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M 136,54 H 240" stroke="#7fb0f0" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d="M 140,74 H 236" stroke="#28508c" strokeWidth="2" strokeDasharray="8 6" opacity="0.5" />
        {/* Cute oval attic dormer */}
        <ellipse cx="188" cy="72" rx="11" ry="13" fill="#ffe285" stroke={O} strokeWidth="2.4" />
        <path d="M 188,59 V 85 M 177,72 H 199" stroke={O} strokeWidth="1.6" />
        {/* Cornice */}
        <rect x="122" y="88" width="132" height="7" rx="2" fill="#fffaf0" stroke={O} strokeWidth="2.2" />
        <Window x={146} y={114} lit curtains />
        <Window x={198} y={114} lit={false} />
        <Window x={146} y={164} lit />
        <Window x={198} y={164} lit flowers />
      </g>

      {/* ── 3. Warm orange pitched cottage with smoking chimney (ends cleanly behind house 4) ── */}
      <g>
        {/* Stylized cartoon smoke puffs */}
        <g fill="#fffef8" stroke="#9eb8d6" strokeWidth="2">
          <circle className="aloft-smoke" cx="344" cy="70" r="8" />
          <circle className="aloft-smoke aloft-smoke--2" cx="356" cy="56" r="11" />
          <circle className="aloft-smoke aloft-smoke--3" cx="368" cy="40" r="7" />
        </g>
        <rect x="330" y="76" width="20" height="44" fill="#b86048" stroke={O} strokeWidth="2.8" />
        <rect x="327" y="72" width="26" height="7" rx="1.5" fill="#9c4c38" stroke={O} strokeWidth="2.4" />
        <rect x="252" y="124" width="132" height="100" fill="#e4efe1" stroke={O} strokeWidth="3.2" />
        <path d="M 244,128 L 316,84 L 384,128 Z" fill="#e88638" stroke={O} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M 258,122 L 313,90" stroke="#ffc285" strokeWidth="3.2" strokeLinecap="round" opacity="0.65" />
        <path d="M 294,110 q7,5 14,0 q7,5 14,0 q7,5 14,0" stroke="#bd601c" strokeWidth="2" fill="none" opacity="0.55" />
        <Window x={270} y={146} lit flowers />
        <Window x={332} y={146} lit curtains />
      </g>

      {/* ── 4. Tall plum Victorian gable (cleanly spans left edge of 390px phone crop x≈385.5) ── */}
      <g>
        <rect x="468" y="34" width="18" height="40" fill="#b86048" stroke={O} strokeWidth="2.8" />
        <rect x="465" y="30" width="24" height="7" rx="1.5" fill="#9c4c38" stroke={O} strokeWidth="2.4" />
        <rect x="382" y="76" width="120" height="148" fill="#fff0c4" stroke={O} strokeWidth="3.2" />
        <rect x="484" y="76" width="18" height="148" fill="#ebd69e" />
        <path d="M 374,80 L 442,34 L 510,80 Z" fill="#7752a3" stroke={O} strokeWidth="3.4" strokeLinejoin="round" />
        {/* Roof spire & scalloped shingle band */}
        <path d="M 442,34 V 20" stroke={O} strokeWidth="3" strokeLinecap="round" />
        <circle cx="442" cy="20" r="3" fill={YELLOW} stroke={O} strokeWidth="1.8" />
        <path d="M 412,64 q7,5 14,0 q7,5 14,0 q7,5 14,0 q7,5 14,0" stroke="#53357a" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 390,74 L 438,41" stroke="#ab88d6" strokeWidth="3.2" strokeLinecap="round" opacity="0.6" />
        {/* Gutter downpipe */}
        <path d="M 496,80 V 220" stroke="#7d8da6" strokeWidth="3.5" />
        <Window x={406} y={96} arched lit curtains />
        <Window x={452} y={96} arched lit={false} />
        <Window x={406} y={150} lit flowers />
        <Window x={452} y={150} lit />
        {/* Pigeon #1: gawking straight UP at the flying pig! */}
        <RoofPigeon x={422} y={36} pose="gawk" />
      </g>

      {/* ── Festive string of riso bunting between building 4 & building 6 (center of phone!) ── */}
      <g>
        <path d="M 502,74 Q 578,104 652,70" stroke={O} strokeWidth="2" fill="none" />
        {[
          [522, 82, PINK, 14],
          [544, 88, YELLOW, 8],
          [566, 90, BLUE, 2],
          [588, 89, '#fffaf0', -4],
          [610, 85, PINK, -10],
          [632, 79, YELLOW, -16],
        ].map(([bx, by, col, rot], i) => (
          <path
            key={i}
            d="M -7,0 L 7,0 L 0,13 Z"
            fill={col as string}
            stroke={O}
            strokeWidth="1.8"
            strokeLinejoin="round"
            transform={`translate(${bx} ${by}) rotate(${rot})`}
          />
        ))}
      </g>

      {/* ── 5. Centerpiece coral-red townhouse (center of phone crop, x=500..650) ── */}
      <g>
        <rect x="506" y="114" width="138" height="110" fill="#f9e9ce" stroke={O} strokeWidth="3.2" />
        <rect x="626" y="114" width="18" height="110" fill="#e6d2b0" />
        <path d="M 498,118 L 575,78 L 652,118 Z" fill="#e34f56" stroke={O} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M 512,112 L 572,84" stroke="#ff969c" strokeWidth="3.2" strokeLinecap="round" opacity="0.65" />
        <path d="M 544,102 q7,5 14,0 q7,5 14,0 q7,5 14,0 q7,5 14,0" stroke="#b33039" strokeWidth="2" fill="none" opacity="0.55" />
        {/* Cute dormer window */}
        <path d="M 562,108 V 92 L 575,84 L 588,92 V 108 Z" fill="#fffaf0" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="568" y="94" width="14" height="12" fill="#ffe285" stroke={O} strokeWidth="1.8" />
        <Window x={524} y={136} lit flowers />
        <Window x={564} y={136} lit curtains />
        <Window x={604} y={136} lit={false} />
        <Window x={544} y={182} w={24} h={24} lit />
        <Window x={588} y={182} w={24} h={24} lit />
      </g>

      {/* ── 6. Tall emerald-teal mansard with satellite dish & cooing pigeon (x=642..766) ── */}
      <g>
        {/* Little satellite dish angled skyward */}
        <g transform="translate(736 38) rotate(-28)">
          <path d="M 0,14 V 2" stroke={O} strokeWidth="2.8" />
          <path d="M -13,-4 C -8,8 8,8 13,-4 Z" fill="#eaf2fa" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 0,4 L 0,-10" stroke={O} strokeWidth="2" />
          <circle cx="0" cy="-11" r="2.4" fill={PINK} stroke={O} strokeWidth="1.4" />
        </g>
        <rect x="648" y="72" width="112" height="152" fill="#fae0e8" stroke={O} strokeWidth="3.2" />
        <rect x="742" y="72" width="18" height="152" fill="#e6c4cf" />
        <path d="M 642,74 L 660,42 H 748 L 766,74 Z" fill="#2d9473" stroke={O} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M 662,48 H 746" stroke="#75d4b4" strokeWidth="2.6" strokeLinecap="round" opacity="0.6" />
        <rect x="642" y="72" width="124" height="6.5" rx="2" fill="#fffaf0" stroke={O} strokeWidth="2.2" />
        <Window x={666} y={96} lit curtains />
        <Window x={714} y={96} lit flowers />
        <Window x={666} y={150} lit={false} />
        <Window x={714} y={150} lit />
        {/* Pigeon #2: mid-coo, puffed chest, happy eyes */}
        <RoofPigeon x={688} y={28} pose="coo" />
      </g>

      {/* ── 7. Riso-blue tiled cottage with sleeping pigeon (x=758..902) ── */}
      <g>
        <rect x="764" y="118" width="132" height="106" fill="#f9e8c5" stroke={O} strokeWidth="3.2" />
        <path d="M 756,122 L 830,78 L 904,122 Z" fill="#3570bd" stroke={O} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M 770,116 L 826,84" stroke="#85b5f2" strokeWidth="3.2" strokeLinecap="round" opacity="0.65" />
        {/* Skylight */}
        <path d="M 852,98 L 872,110 L 858,116 L 838,104 Z" fill="#a8d8f5" stroke={O} strokeWidth="2.2" strokeLinejoin="round" />
        <Window x={786} y={140} lit flowers />
        <Window x={846} y={140} lit curtains />
        {/* Pigeon #3: fast asleep loaf */}
        <RoofPigeon x={828} y={71} pose="sleep" />
      </g>

      {/* ── 8. Ochre-amber tall townhouse (x=894..1038) ── */}
      <g>
        <rect x="996" y="42" width="18" height="44" fill="#b86048" stroke={O} strokeWidth="2.8" />
        <rect x="993" y="38" width="24" height="7" rx="1.5" fill="#9c4c38" stroke={O} strokeWidth="2.4" />
        <rect x="900" y="88" width="132" height="136" fill="#ece6f5" stroke={O} strokeWidth="3.2" />
        <rect x="1014" y="88" width="18" height="136" fill="#d7cee6" />
        <path d="M 892,92 L 966,46 L 1040,92 Z" fill="#e69232" stroke={O} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M 906,86 L 962,52" stroke="#ffd08a" strokeWidth="3.2" strokeLinecap="round" opacity="0.65" />
        <path d="M 936,74 q7,5 14,0 q7,5 14,0 q7,5 14,0" stroke="#ba6b16" strokeWidth="2" fill="none" opacity="0.55" />
        <Window x={920} y={108} arched lit />
        <Window x={976} y={108} arched lit={false} />
        <Window x={920} y={162} lit curtains />
        <Window x={976} y={162} lit flowers />
      </g>

      {/* ── 9. Right berry-plum corner house with gawking pigeon (x=1030..1208) ── */}
      <g>
        <rect x="1036" y="106" width="166" height="118" fill="#e5f0e3" stroke={O} strokeWidth="3.2" />
        <path d="M 1028,110 L 1118,62 L 1208,110 Z" fill="#cc4b72" stroke={O} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M 1044,104 L 1114,68" stroke="#f794b2" strokeWidth="3.2" strokeLinecap="round" opacity="0.65" />
        <path d="M 1084,92 q7,5 14,0 q7,5 14,0 q7,5 14,0 q7,5 14,0" stroke="#992d4e" strokeWidth="2" fill="none" opacity="0.55" />
        <Window x={1058} y={128} lit flowers />
        <Window x={1108} y={128} lit curtains />
        <Window x={1156} y={128} lit />
        <Window x={1082} y={178} lit={false} />
        <Window x={1134} y={178} lit />
        {/* Pigeon #4: craning up left toward the pig! */}
        <RoofPigeon x={1118} y={48} pose="gawk" flip />
      </g>
    </svg>
  );
}

/* ───────────────────────── museum: 1909 Sheppey biplane ───────────────────────── */

export function Biplane1909({ className }: { className?: string }) {
  const id = useUid();
  return (
    <svg className={className} viewBox="0 0 320 220" aria-hidden="true">
      <defs>
        <linearGradient id={`bp-w-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf6" />
          <stop offset="0.65" stopColor="#f5ebd4" />
          <stop offset="1" stopColor="#dfd0b2" />
        </linearGradient>
        <linearGradient id={`bp-b-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8b87d" />
          <stop offset="0.6" stopColor="#cf9655" />
          <stop offset="1" stopColor="#a66f35" />
        </linearGradient>
      </defs>

      {/* Motion breeze lines behind the tail */}
      <g stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" opacity="0.48">
        <path d="M 4,72 H 20 M 6,88 H 24 M 4,104 H 18" />
      </g>

      {/* Whole 1909 biplane scaled generously to fill the museum case */}
      <g transform="translate(160 98) scale(1.14) rotate(-3) translate(-162 -106)">
        {/* Open wooden tail boom & box-kite rudder */}
        <g stroke={O} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 48,74 L 116,60 M 48,116 L 116,132" stroke="#a66a38" strokeWidth="4.4" />
          <path d="M 48,74 L 116,60 M 48,116 L 116,132" stroke={O} strokeWidth="1.6" />
          <path d="M 74,69 V 122 M 96,64 V 127" stroke="#8a562d" strokeWidth="2.6" />
          <path d="M 48,74 L 74,122 M 74,69 L 48,116 M 74,69 L 96,127 M 96,64 L 74,122" stroke={O} strokeWidth="1" opacity="0.45" />
          {/* Rear vertical rudder & horizontal stabilizer */}
          <path d="M 28,62 L 54,66 L 52,122 L 26,118 Z" fill={`url(#bp-w-${id})`} strokeWidth="2.8" />
          <path d="M 28,88 L 54,90" stroke="#d9c6a3" strokeWidth="2.2" />
          <path d="M 32,76 H 50 M 31,102 H 50" stroke="#d9c6a3" strokeWidth="1.6" />
          {/* Tail stripe accent */}
          <path d="M 28,62 L 36,63 L 34,119 L 26,118 Z" fill={PINK} strokeWidth="2.2" opacity="0.85" />
        </g>

        {/* Undercarriage skids & vintage wire-spoked wheels */}
        <g>
          <path d="M 122,146 L 146,166 L 216,164 L 228,154" fill="none" stroke="#8a562d" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 122,146 L 146,166 L 216,164 L 228,154" fill="none" stroke={O} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 148,144 L 154,165 M 192,144 L 194,165" stroke={O} strokeWidth="2.8" strokeLinecap="round" />
          {[154, 194].map((wx) => (
            <g key={wx} transform={`translate(${wx} 168)`}>
              <circle r="13" fill="#fffaf0" stroke={O} strokeWidth="3.6" />
              <circle r="9.5" fill="none" stroke="#c9b898" strokeWidth="1.4" />
              <path d="M -9,0 H 9 M 0,-9 V 9 M -6.5,-6.5 L 6.5,6.5 M 6.5,-6.5 L -6.5,6.5" stroke="#8c7a62" strokeWidth="1" />
              <circle r="2.8" fill={O} />
            </g>
          ))}
        </g>

        {/* Rigging cross-wires between wings */}
        <path
          d="M 106,54 L 160,136 M 160,54 L 106,136 M 160,54 L 212,136 M 212,54 L 160,136 M 212,54 L 266,136 M 266,54 L 212,136"
          stroke={O}
          strokeWidth="1.1"
          opacity="0.45"
        />

        {/* Wooden cockpit seat + tiny goggled 1909 pioneer pilot */}
        <g transform="translate(152 104)">
          {/* Engine block & brass radiator */}
          <rect x="-20" y="10" width="22" height="20" rx="3" fill="#6b758c" stroke={O} strokeWidth="2.4" />
          <path d="M -16,14 V 26 M -10,14 V 26 M -4,14 V 26" stroke="#a6b2cc" strokeWidth="1.8" />
          {/* Pilot torso & scarf */}
          <path d="M -4,30 C -4,10 6,4 16,6 C 24,8 26,18 24,30 Z" fill="#6b4436" stroke={O} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 2,10 C -8,6 -16,12 -24,8" stroke={BLUE} strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <path d="M 2,10 C -8,6 -16,12 -24,8" stroke="#64b8f2" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          {/* Pilot head + leather helmet & brass goggles */}
          <circle cx="14" cy="-4" r="10.5" fill="#f7cfb4" stroke={O} strokeWidth="2.5" />
          <path d="M 3,-4 C 3,-14 14,-16 22,-10 C 16,-9 10,-6 6,2 Z" fill="#7d4a36" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="21" cy="-6" r="4" fill="#64c8ff" stroke="#d99a14" strokeWidth="2" />
          <circle cx="20" cy="-7" r="1.2" fill="#ffffff" />
          <path d="M 16,2 Q 20,4 22,1" stroke={O} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </g>

        {/* Spruce interplane struts */}
        {[106, 160, 212, 266].map((sx) => (
          <g key={sx}>
            <rect x={sx - 3.2} y="52" width="6.4" height="84" rx="2" fill="#c78346" stroke={O} strokeWidth="2.4" />
            <path d={`M ${sx - 1},56 V 132`} stroke="#f0be82" strokeWidth="1.4" opacity="0.7" />
          </g>
        ))}

        {/* Upper & lower fabric wings with curved ribs */}
        {[40, 130].map((wy) => (
          <g key={wy}>
            <path
              d={`M 82,${wy + 8} C 82,${wy} 94,${wy - 2} 112,${wy - 2} L 278,${wy - 2} C 292,${wy - 2} 296,${wy + 6} 292,${wy + 13} C 288,${wy + 18} 278,${wy + 18} 266,${wy + 18} L 98,${wy + 18} C 86,${wy + 18} 82,${wy + 14} 82,${wy + 8} Z`}
              fill={`url(#bp-w-${id})`}
              stroke={O}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            {/* Wing cel underside */}
            <path d={`M 88,${wy + 12} H 288`} stroke="#d8c6a6" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            {/* Fabric rib stitching */}
            {[108, 136, 164, 192, 220, 248, 274].map((rx) => (
              <path key={rx} d={`M ${rx},${wy} V ${wy + 16}`} stroke="#cbb692" strokeWidth="1.6" />
            ))}
            {/* Leading edge highlight */}
            <path d={`M 96,${wy + 2} H 276`} stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.88" />
          </g>
        ))}

        {/* Spinning wooden propeller at front nose */}
        <g transform="translate(292 94)">
          <ellipse className="aloft-prop" cx="0" cy="0" rx="5.5" ry="30" fill="#d9eefc" opacity="0.55" />
          <path d="M -2,-26 C 3,-16 4,-6 0,0 C -4,6 -3,16 2,26 C -3,16 -4,6 0,0 C 4,-6 3,-16 -2,-26 Z" fill="#b87138" stroke={O} strokeWidth="2" />
          <path d="M 7,-22 A 24,24 0 0 1 7,22" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
          <circle r="4.5" fill={YELLOW} stroke={O} strokeWidth="2.2" />
        </g>

        {/* Wicker wastepaper basket lashed to the right strut, with our happy piglet! */}
        <g transform="translate(212 90) scale(1.08)">
          {/* Rope lashings around the strut */}
          <path d="M -6,2 L 46,2 M -6,7 L 46,7 M -4,30 L 44,30" stroke="#7a4c32" strokeWidth="2.8" strokeLinecap="round" />
          {/* Happy piglet peeking out (reusing PigHead from PigMark) */}
          <g transform="translate(21 -9) scale(0.64) translate(-32 -36)">
            <PigHead mood="happy" />
          </g>
          {/* Woven wicker basket body */}
          <path d="M 0,4 L 42,4 L 36,44 L 6,44 Z" fill={`url(#bp-b-${id})`} stroke={O} strokeWidth="2.8" strokeLinejoin="round" />
          {/* Basket weave grid */}
          <g stroke="#8a5628" strokeWidth="1.6" opacity="0.72">
            <path d="M 2,14 H 40 M 3,24 H 39 M 5,34 H 37" />
            <path d="M 11,5 L 13,43 M 21,5 V 43 M 31,5 L 29,43" />
          </g>
          {/* Thick braided basket rim */}
          <rect x="-3" y="0" width="48" height="7" rx="3.5" fill="#e6b67c" stroke={O} strokeWidth="2.5" />
          {/* Tiny pink pig hooves hooked playfully over the rim! */}
          <ellipse cx="9" cy="3.5" rx="4.4" ry="3.1" fill="#ffb3d1" stroke={PIG_O} strokeWidth="2" />
          <ellipse cx="33" cy="3.5" rx="4.4" ry="3.1" fill="#ffb3d1" stroke={PIG_O} strokeWidth="2" />
        </g>
      </g>

      <text x="160" y="213" textAnchor="middle" fontFamily="Space Mono, monospace" fontWeight="700" fontSize="12" letterSpacing="1.6" fill={INK} opacity="0.74">
        SHEPPEY · 1909
      </text>
    </svg>
  );
}

/* ───────────────────────── museum: startled farm cow ───────────────────────── */

export function Cow({ className, look = 'up' }: { className?: string; look?: 'up' | 'front' }) {
  const id = useUid();
  const up = look === 'up';
  return (
    <svg className={className} viewBox="0 0 140 110" aria-hidden="true">
      <defs>
        <linearGradient id={`cw-b-${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.65" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#e6dac4" />
        </linearGradient>
        <linearGradient id={`cw-m-${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffd0e8" />
          <stop offset="0.6" stopColor="#ffb3d9" />
          <stop offset="1" stopColor="#ed85ba" />
        </linearGradient>
      </defs>

      {/* Soft ground shadow */}
      <ellipse cx="62" cy="105" rx="46" ry="4.5" fill="#3a2438" opacity="0.16" />

      {/* Far legs */}
      {[36, 78].map((lx) => (
        <g key={`f${lx}`}>
          <rect x={lx - 5.5} y="80" width="11" height="22" rx="4" fill="#dfd2bc" stroke={O} strokeWidth="2.5" />
          <path d={`M ${lx - 5.5},96 H ${lx + 5.5} V 102 Q ${lx},105 ${lx - 5.5},102 Z`} fill="#593329" stroke={O} strokeWidth="2.2" />
        </g>
      ))}

      {/* Swishing tail */}
      <path
        d={up ? 'M 19,62 C 6,54 4,40 10,36' : 'M 19,64 C 8,68 7,82 11,88'}
        stroke={O}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={up ? 10 : 11} cy={up ? 35 : 89} rx="4.5" ry="3.2" fill={O} transform={up ? 'rotate(-30 10 35)' : 'rotate(20 11 89)'} />

      {/* Pink udder peeking under belly */}
      <ellipse cx="42" cy="87" rx="11" ry="7" fill="#ffb8dc" stroke={O} strokeWidth="2.4" />

      {/* Plump squishy dairy cow body */}
      <path
        d="M 18,64 C 18,40 42,35 66,37 C 90,39 102,50 101,68 C 100,86 84,92 60,92 C 34,92 18,84 18,64 Z"
        fill={`url(#cw-b-${id})`}
        stroke={O}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Cel underside shadow */}
      <path d="M 24,78 C 42,89 82,89 96,76 C 90,90 36,94 24,78 Z" fill="#dfd2bc" opacity="0.72" />
      <ellipse cx="52" cy="45" rx="14" ry="4.5" fill="#ffffff" opacity="0.88" />
      {/* Organic Holstein spots */}
      <path d="M 32,48 C 42,40 58,44 54,58 C 48,66 30,62 32,48 Z" fill="#3c273b" />
      <path d="M 68,66 C 78,58 92,62 90,74 C 84,82 68,78 68,66 Z" fill="#3c273b" />

      {/* Near legs */}
      {[26, 88].map((lx) => (
        <g key={`n${lx}`}>
          <rect x={lx - 6} y="81" width="12" height="23" rx="4.5" fill={`url(#cw-b-${id})`} stroke={O} strokeWidth="2.7" />
          <path d={`M ${lx - 6},97 H ${lx + 6} V 103 Q ${lx},106 ${lx - 6},103 Z`} fill="#6e4338" stroke={O} strokeWidth="2.3" />
        </g>
      ))}

      {/* Collar & tiny brass cowbell */}
      <path d="M 88,52 Q 96,64 90,78" stroke="#f15060" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M 86,74 L 94,74 L 96,83 L 84,83 Z" fill={YELLOW} stroke={O} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="90" cy="84" r="2" fill={O} />

      {/* Expressive Cow Head */}
      {up ? (
        <g transform="translate(106 42) rotate(-32)">
          {/* Curved cream horns */}
          <path d="M -12,-14 C -16,-24 -22,-25 -22,-20 C -20,-14 -14,-11 -10,-11" fill="#f2dfb8" stroke={O} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 10,-14 C 14,-24 20,-25 20,-20 C 18,-14 12,-11 8,-11" fill="#f2dfb8" stroke={O} strokeWidth="2.6" strokeLinejoin="round" />
          {/* Perked alarm ears */}
          <ellipse cx="-20" cy="-7" rx="8" ry="4.4" fill="#fffaf0" stroke={O} strokeWidth="2.4" transform="rotate(-24 -20 -7)" />
          <ellipse cx="18" cy="-8" rx="8" ry="4.4" fill="#fffaf0" stroke={O} strokeWidth="2.4" transform="rotate(24 18 -8)" />
          {/* Head shape */}
          <ellipse cx="0" cy="0" rx="19" ry="16" fill={`url(#cw-b-${id})`} stroke={O} strokeWidth="3" />
          <path d="M -15,-7 C -9,-14 0,-11 -2,-2 C -8,1 -16,-1 -15,-7 Z" fill="#3c273b" />
          {/* Big pink muzzle gaping open in shock */}
          <ellipse cx="9" cy="8" rx="13" ry="10.5" fill={`url(#cw-m-${id})`} stroke={O} strokeWidth="2.6" />
          <ellipse cx="6" cy="5.5" rx="1.6" ry="2.2" fill="#7a2350" />
          <ellipse cx="14" cy="5.5" rx="1.6" ry="2.2" fill="#7a2350" />
          <ellipse cx="10.5" cy="12.5" rx="4.2" ry="4.8" fill="#7a1b43" stroke={O} strokeWidth="1.8" />
          <ellipse cx="10.5" cy="14.5" rx="2.6" ry="1.8" fill="#ff7ab8" />
          {/* Wide shocked eye staring straight up */}
          <ellipse cx="-2" cy="-3.5" rx="6.2" ry="7" fill="#ffffff" stroke={O} strokeWidth="2.2" />
          <circle cx="-2.5" cy="-6" r="2.2" fill="#1d0b1e" />
          <circle cx="-3.3" cy="-6.8" r="0.9" fill="#ffffff" />
          <path d="M -9,-12 Q -2,-16 4,-11" stroke={O} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        <g transform="translate(106 54)">
          {/* Curved horns */}
          <path d="M -13,-14 C -18,-23 -23,-23 -22,-18 C -20,-13 -14,-10 -10,-10" fill="#f2dfb8" stroke={O} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 13,-14 C 18,-23 23,-23 22,-18 C 20,-13 14,-10 10,-10" fill="#f2dfb8" stroke={O} strokeWidth="2.6" strokeLinejoin="round" />
          {/* Droopy unimpressed ears */}
          <ellipse cx="-22" cy="-4" rx="8.5" ry="4.6" fill="#fffaf0" stroke={O} strokeWidth="2.5" transform="rotate(14 -22 -4)" />
          <ellipse cx="22" cy="-4" rx="8.5" ry="4.6" fill="#fffaf0" stroke={O} strokeWidth="2.5" transform="rotate(-14 22 -4)" />
          {/* Front-facing head */}
          <ellipse cx="0" cy="0" rx="20" ry="18" fill={`url(#cw-b-${id})`} stroke={O} strokeWidth="3" />
          <path d="M -16,-9 C -8,-16 2,-13 -1,-3 C -8,-1 -17,-3 -16,-9 Z" fill="#3c273b" />
          {/* Plump pink muzzle + deadpan flat mouth */}
          <ellipse cx="0" cy="11" rx="15" ry="9.5" fill={`url(#cw-m-${id})`} stroke={O} strokeWidth="2.6" />
          <ellipse cx="-5.5" cy="9.5" rx="1.8" ry="2.5" fill="#7a2350" />
          <ellipse cx="5.5" cy="9.5" rx="1.8" ry="2.5" fill="#7a2350" />
          <path d="M -5,15.5 H 6" stroke="#7a2350" strokeWidth="2.2" strokeLinecap="round" />
          {/* Deadpan half-lidded eyes staring straight at viewer */}
          {[-7.5, 7.5].map((ex) => (
            <g key={ex}>
              <ellipse cx={ex} cy="-3" rx="4.8" ry="5.5" fill="#ffffff" stroke={O} strokeWidth="2" />
              <circle cx={ex} cy="-2.2" r="2.2" fill="#1d0b1e" />
              <circle cx={ex - 0.8} cy="-3.2" r="0.8" fill="#ffffff" />
              <path d={`M ${ex - 5.5},-9 H ${ex + 5.5} V -4.2 H ${ex - 5.5} Z`} fill="#fffaf0" />
              <path d={`M ${ex - 5},-4.2 H ${ex + 5}`} stroke={O} strokeWidth="2.2" strokeLinecap="round" />
            </g>
          ))}
        </g>
      )}

      {/* Comic shock "!" and accent lines when looking up */}
      {up && (
        <g>
          <path d="M 102,16 L 106,9 M 112,18 L 118,14" stroke="#f15060" strokeWidth="2.4" strokeLinecap="round" />
          <text x="125" y="26" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="900" fontSize="26" fill="#f15060" stroke={O} strokeWidth="2.8" paintOrder="stroke">
            !
          </text>
        </g>
      )}
    </svg>
  );
}

/* ───────────────────────── TV news anchor: Daisy Moo ───────────────────────── */

export function CowAnchor({ className }: { className?: string }) {
  const id = useUid();
  return (
    <svg className={className} viewBox="0 0 220 220" aria-hidden="true">
      <defs>
        <linearGradient id={`ca-s-${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#3570b8" />
          <stop offset="0.58" stopColor="#23508a" />
          <stop offset="1" stopColor="#163561" />
        </linearGradient>
        <linearGradient id={`ca-f-${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.68" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#e6d9c3" />
        </linearGradient>
        <linearGradient id={`ca-m-${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffd1e9" />
          <stop offset="0.58" stopColor="#ffb3d9" />
          <stop offset="1" stopColor="#eb82b8" />
        </linearGradient>
        <linearGradient id={`ca-ir-${id}`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#1b071a" />
          <stop offset="0.55" stopColor="#3d173a" />
          <stop offset="1" stopColor="#7a3266" />
        </linearGradient>
      </defs>

      {/* Tailored news-anchor power blazer (subtle sky rim light separates from dark studio) */}
      <path
        d="M 24,224 C 28,166 56,144 106,144 C 156,144 184,166 188,224 Z"
        fill={`url(#ca-s-${id})`}
        stroke={O}
        strokeWidth="3.6"
        strokeLinejoin="round"
      />
      {/* Shoulder studio rim highlight */}
      <path d="M 38,176 C 46,158 64,150 82,148" stroke="#76b4f5" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" />

      {/* Crisp shirt collar & V-neck */}
      <path d="M 84,142 L 106,192 L 128,142 Z" fill="#fffef8" stroke={O} strokeWidth="2.8" strokeLinejoin="round" />
      {/* Jacket lapels */}
      <path d="M 84,142 L 70,158 L 80,168 L 74,178 L 106,196 L 84,142 Z" fill="#2d63a6" stroke={O} strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M 128,142 L 142,158 L 132,168 L 138,178 L 106,196 L 128,142 Z" fill="#2d63a6" stroke={O} strokeWidth="2.8" strokeLinejoin="round" />
      {/* Shirt collar points */}
      <path d="M 88,140 L 106,156 L 94,162 L 84,145 Z" fill="#ffffff" stroke={O} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 124,140 L 106,156 L 118,162 L 128,145 Z" fill="#ffffff" stroke={O} strokeWidth="2.2" strokeLinejoin="round" />

      {/* Bold red power tie + gold tie clip */}
      <path d="M 101,154 L 111,154 L 114,202 L 106,214 L 98,202 Z" fill="#f15060" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M 100,150 L 112,150 L 110,161 L 102,161 Z" fill="#d93848" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="100" y="176" width="13" height="3.8" rx="1.4" fill={YELLOW} stroke={O} strokeWidth="1.4" />

      {/* Coiled translucent studio earpiece wire from right ear to collar */}
      <path
        d="M 156,82 C 166,94 156,104 162,114 C 168,124 156,132 146,144"
        fill="none"
        stroke="#8ad4ff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="4 2"
        opacity="0.9"
      />

      {/* Neck */}
      <path d="M 88,128 H 124 V 150 Q 106,156 88,150 Z" fill="#efe3ce" stroke={O} strokeWidth="3" />

      {/* Curved horns */}
      <path d="M 68,42 C 56,28 48,22 50,15 C 57,16 68,24 76,34 Z" fill="#f2dfb8" stroke={O} strokeWidth="3" strokeLinejoin="round" />
      <path d="M 144,42 C 156,28 164,22 162,15 C 155,16 144,24 136,34 Z" fill="#f2dfb8" stroke={O} strokeWidth="3" strokeLinejoin="round" />

      {/* Expressive cow ears with pink inner folds */}
      <path d="M 58,64 C 36,54 28,72 42,84 C 48,88 56,84 60,78 Z" fill={`url(#ca-f-${id})`} stroke={O} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M 54,68 C 43,64 38,73 46,79 C 50,81 54,78 56,74 Z" fill="#ffb8dc" />
      <path d="M 154,64 C 176,54 184,72 170,84 C 164,88 156,84 152,78 Z" fill={`url(#ca-f-${id})`} stroke={O} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M 158,68 C 169,64 174,73 166,79 C 162,81 158,78 156,74 Z" fill="#ffb8dc" />
      {/* Earpiece bud in right ear */}
      <circle cx="156" cy="76" r="4.2" fill="#fffaf0" stroke={O} strokeWidth="2" />

      {/* Main pear-shaped sculpted cow head */}
      <path
        d="M 106,30 C 138,30 156,50 156,82 C 156,118 138,144 106,144 C 74,144 56,118 56,82 C 56,50 74,30 106,30 Z"
        fill={`url(#ca-f-${id})`}
        stroke={O}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Signature Holstein spots */}
      <path d="M 62,56 C 72,38 94,38 96,54 C 92,68 70,72 62,56 Z" fill="#3a253b" />
      <path d="M 134,74 C 148,68 156,78 152,92 C 142,96 130,86 134,74 Z" fill="#3a253b" />

      {/* Coiffed news-anchor hair swoop on top */}
      <path
        d="M 86,34 C 92,16 116,12 130,26 C 136,32 132,38 124,36 C 118,28 102,28 94,36 Z"
        fill="#3a253b"
        stroke={O}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M 98,25 Q 112,18 124,26" stroke="#7d6087" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      {/* Big expressive eyes (PigArt-level gloss & lashes) */}
      {[
        { cx: 88, dir: -1, py: 0.5 },
        { cx: 124, dir: 1, py: -0.5 },
      ].map(({ cx, dir, py }) => (
        <g key={cx}>
          <ellipse cx={cx} cy="78" rx="10" ry="12" fill="#ffffff" stroke={O} strokeWidth="2.8" />
          <ellipse cx={cx + 0.8} cy={79 + py} rx="6" ry="7.4" fill={`url(#ca-ir-${id})`} />
          <circle cx={cx + 0.8} cy={79 + py} r="3.4" fill="#170617" />
          <path
            d={`M ${cx - 3.6} ${82.5 + py} Q ${cx + 0.8} ${86 + py} ${cx + 5.2} ${82.5 + py} Q ${cx + 0.8} ${84.2 + py} ${cx - 3.6} ${82.5 + py} Z`}
            fill="#f4a4d8"
            opacity="0.82"
          />
          <circle cx={cx - 2.2} cy={75.5 + py} r="2.7" fill="#ffffff" />
          <circle cx={cx + 3.2} cy={82 + py} r="1.3" fill="#ffffff" />
          {/* Sculpted upper lash + outer flicks */}
          <path
            d={`M ${cx - 10} 74 C ${cx - 7} 64 ${cx + 7} 64 ${cx + 10} 74 C ${cx + 6} 68 ${cx - 6} 68 ${cx - 10} 74 Z`}
            fill={O}
          />
          <path d={`M ${cx + dir * 9.5} 72 L ${cx + dir * 13.5} 69`} stroke={O} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      ))}

      {/* Professional-panic eyebrows: left arched sky-high, right tightly braced */}
      <path d="M 75,58 Q 88,48 99,57" stroke={O} strokeWidth="3.6" strokeLinecap="round" fill="none" />
      <path d="M 114,61 L 136,59" stroke={O} strokeWidth="3.6" strokeLinecap="round" />

      {/* Nervous bead of sweat glistening at temple */}
      <g transform="translate(148 54)">
        <path
          d="M 0,-9 C 0,-9 7,1 6,6 C 5,9.5 -5,9.5 -6,6 C -7,1 0,-9 0,-9 Z"
          fill="#6ed0ff"
          stroke={O}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <ellipse cx="-1.8" cy="3" rx="1.5" ry="2.6" fill="#ffffff" transform="rotate(-14 -1.8 3)" />
      </g>

      {/* Soft blush cheeks */}
      <ellipse cx="69" cy="96" rx="7" ry="4" fill="#ff66a8" opacity="0.45" />
      <ellipse cx="143" cy="96" rx="7" ry="4" fill="#ff66a8" opacity="0.45" />

      {/* Plump pink muzzle + tightly strained professional anchor smile! */}
      <ellipse cx="106" cy="118" rx="38" ry="25" fill={`url(#ca-m-${id})`} stroke={O} strokeWidth="3.2" />
      <ellipse cx="96" cy="101" rx="12" ry="4.2" fill="#ffffff" opacity="0.55" transform="rotate(-10 96 101)" />
      <ellipse cx="92" cy="111" rx="4.2" ry="6" fill="#7a2350" transform="rotate(-10 92 111)" />
      <ellipse cx="120" cy="111" rx="4.2" ry="6" fill="#7a2350" transform="rotate(10 120 111)" />
      {/* Strained clenched-teeth smile */}
      <path
        d="M 86,125 Q 106,131 126,125 C 127,133 118,136 106,136 C 94,136 85,133 86,125 Z"
        fill="#ffffff"
        stroke={O}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M 88,130.5 Q 106,133 124,130.5 M 98,127 V 135 M 106,127.5 V 135.5 M 114,127 V 135" stroke={O} strokeWidth="1.2" opacity="0.65" />
      <path d="M 81,123 Q 84,126 83,130 M 131,123 Q 128,126 129,130" stroke="#9e3668" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* Anchor script paper gripped tightly in her right hoof (above the desk line!) */}
      <g transform="translate(154 140) rotate(8)">
        <path
          d="M 0,4 L 40,0 L 44,48 L 4,52 Z"
          fill="#fffef8"
          stroke={O}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M 8,14 L 32,12 M 9,22 L 34,20 M 10,30 L 28,28 M 11,38 L 33,36" stroke="#7892b8" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
        {/* Hoof clutching the left edge of the script */}
        <path
          d="M -10,20 C -2,16 10,18 11,26 C 12,34 2,38 -8,36 Z"
          fill="#6e4338"
          stroke={O}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <path d="M 4,23 L 9,26" stroke={O} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ───────────────────────── lunar hoofprint (duotone riso dust) ───────────────────────── */

export function Hoofprint({ className }: { className?: string }) {
  const id = useUid();
  // Cloven pig hoofprint: two curved almond toes + two tiny rear dewclaw marks
  const leftToe = 'M 54,18 C 34,20 18,46 21,78 C 23,98 37,108 51,105 C 58,103 57,86 57,62 C 57,38 62,17 54,18 Z';
  const rightToe = 'M 66,18 C 86,20 102,46 99,78 C 97,98 83,108 69,105 C 62,103 63,86 63,62 C 63,38 58,17 66,18 Z';
  const leftDew = 'M 33,115 C 25,116 23,127 31,130 C 39,132 45,125 43,119 C 41,115 37,114 33,115 Z';
  const rightDew = 'M 87,115 C 95,116 97,127 89,130 C 81,132 75,125 77,119 C 79,115 83,114 87,115 Z';

  return (
    <svg className={className} viewBox="0 0 120 140" aria-hidden="true">
      <defs>
        <linearGradient id={`hp-c-${id}`} x1="0.15" y1="0.1" x2="0.88" y2="0.92">
          <stop offset="0" stopColor="#090c26" />
          <stop offset="0.48" stopColor="#0e1238" />
          <stop offset="0.8" stopColor="#1b4687" />
          <stop offset="1" stopColor="#8f368c" />
        </linearGradient>
        <clipPath id={`hp-l-${id}`}>
          <path d={leftToe} />
        </clipPath>
        <clipPath id={`hp-r-${id}`}>
          <path d={rightToe} />
        </clipPath>
      </defs>

      {/* Raised outer rim of displaced lunar regolith (sunlit pink upper-left, shaded navy lower-right) */}
      <g opacity="0.72">
        <path d={leftToe} fill="none" stroke="#ff73c6" strokeWidth="10" strokeLinejoin="round" transform="translate(-2.5 -2.5)" />
        <path d={rightToe} fill="none" stroke="#ff73c6" strokeWidth="10" strokeLinejoin="round" transform="translate(-2.5 -2.5)" />
        <path d={leftToe} fill="none" stroke="#0078bf" strokeWidth="7" strokeLinejoin="round" transform="translate(2.5 2.5)" />
        <path d={rightToe} fill="none" stroke="#0078bf" strokeWidth="7" strokeLinejoin="round" transform="translate(2.5 2.5)" />
      </g>

      {/* Pressed-in cloven toe cavities */}
      <path d={leftToe} fill={`url(#hp-c-${id})`} />
      <path d={rightToe} fill={`url(#hp-c-${id})`} />

      {/* Left toe: deep upper-left shadow wall + crisp tread ridges + sunlit lower-right bevel */}
      <g clipPath={`url(#hp-l-${id})`}>
        <path d={leftToe} fill="none" stroke="#06081a" strokeWidth="10" transform="translate(5 5)" opacity="0.85" />
        {/* Tread-like grip ridges pressed into the dust */}
        {[34, 48, 62, 76, 90].map((ry) => (
          <g key={ry}>
            <path d={`M 22,${ry + 2} Q 40,${ry - 4} 57,${ry + 1}`} stroke="#ff6ec4" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.85" />
            <path d={`M 22,${ry + 5} Q 40,${ry - 1} 57,${ry + 4}`} stroke="#070a21" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.9" />
          </g>
        ))}
        <path d={leftToe} fill="none" stroke="#ff8ed0" strokeWidth="4.5" transform="translate(-2 -2)" opacity="0.7" />
      </g>

      {/* Right toe: deep upper-left shadow wall + crisp tread ridges + sunlit lower-right bevel */}
      <g clipPath={`url(#hp-r-${id})`}>
        <path d={rightToe} fill="none" stroke="#06081a" strokeWidth="10" transform="translate(5 5)" opacity="0.85" />
        {[34, 48, 62, 76, 90].map((ry) => (
          <g key={ry}>
            <path d={`M 63,${ry + 1} Q 80,${ry - 4} 98,${ry + 2}`} stroke="#ff6ec4" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.85" />
            <path d={`M 63,${ry + 4} Q 80,${ry - 1} 98,${ry + 5}`} stroke="#070a21" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.9" />
          </g>
        ))}
        <path d={rightToe} fill="none" stroke="#ff8ed0" strokeWidth="4.5" transform="translate(-2 -2)" opacity="0.7" />
      </g>

      {/* Crisp inner ridge highlight separating the two cloven toes */}
      <path d="M 60,24 V 100" stroke="#ff8ed0" strokeWidth="2.8" strokeLinecap="round" opacity="0.85" />
      <path d="M 57.5,24 V 100" stroke="#0078bf" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />

      {/* Rear dewclaw impressions */}
      {[leftDew, rightDew].map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="#ff73c6" strokeWidth="5" transform="translate(-1.5 -1.5)" opacity="0.65" />
          <path d={d} fill="#0e1238" />
          <path d={d} fill="none" stroke="#ff48b0" strokeWidth="1.8" transform="translate(-1 -1)" opacity="0.8" />
        </g>
      ))}

      {/* Scattered riso-halftone lunar dust grains around the hoofprint */}
      {[
        [14, 44, 2.2, '#ff73c6'],
        [10, 62, 1.6, '#0e1238'],
        [13, 86, 2.4, '#0078bf'],
        [20, 108, 1.8, '#ff73c6'],
        [106, 38, 2.0, '#0078bf'],
        [110, 58, 2.5, '#ff73c6'],
        [107, 82, 1.8, '#0e1238'],
        [98, 108, 2.2, '#ff73c6'],
        [52, 9, 2.0, '#ff8ed0'],
        [68, 10, 1.7, '#0078bf'],
        [59, 122, 2.2, '#0e1238'],
        [49, 131, 1.6, '#ff73c6'],
        [72, 132, 1.8, '#0078bf'],
        [18, 28, 1.5, '#0e1238'],
        [102, 24, 1.6, '#ff8ed0'],
      ].map(([cx, cy, r, fill], i) => (
        <circle key={i} cx={cx as number} cy={cy as number} r={r as number} fill={fill as string} opacity="0.85" />
      ))}
    </svg>
  );
}

/* ───────────────────────── Kármán line: embroidered mission patch ───────────────────────── */

export function MissionPatch({ className }: { className?: string }) {
  const id = useUid();
  const topArc = `mp-top-${id}`;
  const botArc = `mp-bot-${id}`;
  const twill = `mp-tw-${id}`;
  const emblemClip = `mp-ec-${id}`;
  const spaceGrad = `mp-sp-${id}`;
  const earthGrad = `mp-ea-${id}`;
  const glassGrad = `mp-gl-${id}`;
  const flameGrad = `mp-fl-${id}`;

  return (
    <svg className={className} viewBox="0 0 240 240" aria-hidden="true">
      <defs>
        <path id={topArc} d="M 35,120 A 85,85 0 0 1 205,120" />
        <path id={botArc} d="M 22,120 A 98,98 0 0 0 218,120" />
        {/* Subtle embroidered twill weave pattern */}
        <pattern id={twill} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <path d="M 0,0 V 6" stroke="#ffffff" strokeWidth="1.2" opacity="0.12" />
          <path d="M 3,0 V 6" stroke="#000000" strokeWidth="1" opacity="0.16" />
        </pattern>
        <clipPath id={emblemClip}>
          <circle cx="120" cy="120" r="74" />
        </clipPath>
        <radialGradient id={spaceGrad} cx="0.42" cy="0.34" r="0.72">
          <stop offset="0" stopColor="#263c8a" />
          <stop offset="0.58" stopColor="#121a4d" />
          <stop offset="1" stopColor="#080b24" />
        </radialGradient>
        <radialGradient id={earthGrad} cx="0.5" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#35a6eb" />
          <stop offset="0.55" stopColor={BLUE} />
          <stop offset="1" stopColor="#08417a" />
        </radialGradient>
        <radialGradient id={glassGrad} cx="0.35" cy="0.3" r="0.68">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="0.65" stopColor="#b8e6ff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#5ec2ff" stopOpacity="0.46" />
        </radialGradient>
        <linearGradient id={flameGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.3" stopColor={YELLOW} />
          <stop offset="0.68" stopColor="#ff8826" />
          <stop offset="1" stopColor={PINK} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Outer merrowed embroidered yellow patch rim */}
      <circle cx="120" cy="120" r="116" fill={YELLOW} stroke={O} strokeWidth="3.6" />
      {/* Stitched overlock thread texture around the outer border */}
      <circle cx="120" cy="120" r="111.5" fill="none" stroke="#d99a00" strokeWidth="6.5" strokeDasharray="3.2 2.8" />
      <circle cx="120" cy="120" r="111.5" fill="none" stroke="#fff7a8" strokeWidth="1.8" strokeDasharray="3.2 2.8" strokeDashoffset="1.5" />

      {/* Navy outer text band with subtle twill fabric weave */}
      <circle cx="120" cy="120" r="106" fill="#0e1238" stroke={O} strokeWidth="2.8" />
      <circle cx="120" cy="120" r="105" fill={`url(#${twill})`} />

      {/* Inner stitched gold & cream medallion border */}
      <circle cx="120" cy="120" r="78" fill="none" stroke="#fffaf0" strokeWidth="4.2" />
      <circle cx="120" cy="120" r="78" fill="none" stroke="#d9c8a8" strokeWidth="1.6" strokeDasharray="2.5 2.5" />

      {/* Flanking 5-point golden mission stars */}
      {[28, 212].map((sx) => (
        <path
          key={sx}
          d="M 0,-6.5 L 1.8,-2 L 6.5,-2 L 2.7,1 L 4.1,5.5 L 0,2.8 L -4.1,5.5 L -2.7,1 L -6.5,-2 L -1.8,-2 Z"
          fill={YELLOW}
          transform={`translate(${sx} 120)`}
        />
      ))}

      {/* ── Central Embroidered Emblem (clipped to r=74) ── */}
      <g clipPath={`url(#${emblemClip})`}>
        <circle cx="120" cy="120" r="75" fill={`url(#${spaceGrad})`} />

        {/* Tiny crescent moon at upper left */}
        <path d="M 78,66 A 11,11 0 1 0 88,82 A 8.5,8.5 0 1 1 78,66 Z" fill="#fff3b0" opacity="0.92" />

        {/* Sparkle stars */}
        {[
          [156, 72, 6],
          [94, 86, 4],
          [172, 108, 4.5],
          [68, 114, 3.8],
        ].map(([x, y, s], i) => (
          <path
            key={i}
            d={`M ${x},${y - s} Q ${x},${y} ${x + s},${y} Q ${x},${y} ${x},${y + s} Q ${x},${y} ${x - s},${y} Q ${x},${y} ${x},${y - s} Z`}
            fill="#fffaf0"
          />
        ))}
        {[
          [114, 62],
          [138, 66],
          [178, 88],
          [62, 92],
        ].map(([cx, cy], i) => (
          <circle key={`d${i}`} cx={cx} cy={cy} r="1.8" fill="#fffaf0" opacity="0.85" />
        ))}

        {/* Sweeping orbital trajectory ribbon arcing up behind the pig */}
        <path d="M 46,162 C 74,116 122,90 192,84" fill="none" stroke={YELLOW} strokeWidth="6" strokeLinecap="round" opacity="0.88" />
        <path d="M 48,168 C 78,124 126,98 194,92" fill="none" stroke={PINK} strokeWidth="4.2" strokeLinecap="round" opacity="0.9" />

        {/* Dramatic Earth limb curving across bottom */}
        <circle cx="120" cy="238" r="98" fill={`url(#${earthGrad})`} stroke="#75d0ff" strokeWidth="4" />
        {/* Stylized green continents */}
        <path
          d="M 68,158 C 82,148 104,148 112,158 C 118,166 106,178 92,182 C 78,186 64,174 68,158 Z"
          fill="#00a95c"
        />
        <path
          d="M 134,154 C 150,146 174,150 182,166 C 176,184 150,188 136,178 C 128,170 128,160 134,154 Z"
          fill="#00a95c"
        />
        {/* Swirling cloud wisps over Earth */}
        <path d="M 78,150 Q 108,144 134,150 M 142,162 Q 162,158 176,166" stroke="#fffaf0" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.8" />

        {/* Hero Astronaut Pig in fishbowl helmet with borrowed rocket pack! */}
        <g transform="translate(122 114) rotate(-14)">
          {/* Blazing layered rocket flame */}
          <g transform="translate(-32 16) rotate(20)">
            <path d="M -9,0 C -13,16 -6,30 0,40 C 6,30 13,16 9,0 Z" fill={`url(#${flameGrad})`} />
            <path d="M -5,0 C -7,11 -3,20 0,27 C 3,20 7,11 5,0 Z" fill="#fff7a8" />
            <path d="M -2.5,0 C -3,7 -1,12 0,16 C 1,12 3,7 2.5,0 Z" fill="#ffffff" />
          </g>

          {/* Borrowed retro rocket pack (white/red twin tanks + yellow fin + nozzle) */}
          <g transform="translate(-28 -4) rotate(12)">
            <path d="M -11,8 L -19,20 L -9,17 Z" fill={YELLOW} stroke={PIG_O} strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M -9,16 H 7 L 9,23 H -11 Z" fill="#4f566e" stroke={PIG_O} strokeWidth="2.2" strokeLinejoin="round" />
            <rect x="-12" y="-18" width="12" height="34" rx="6" fill="#eef4fc" stroke={PIG_O} strokeWidth="2.4" />
            <rect x="-2" y="-20" width="13" height="36" rx="6.5" fill="#f1485b" stroke={PIG_O} strokeWidth="2.4" />
            <path d="M 1,-13 V 8" stroke="#ffadb6" strokeWidth="2.4" strokeLinecap="round" />
            <rect x="-13" y="-3" width="25" height="4.5" rx="1.5" fill="#5e6680" stroke={PIG_O} strokeWidth="1.8" />
          </g>

          {/* Cute curly tail + chubby pig body + hooves */}
          <path d="M -28,12 C -36,6 -33,-4 -26,-1 C -23,1 -26,7 -30,6" stroke={PIG_O} strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M -20,22 L -24,31 M -2,24 L 2,32" stroke={PIG_O} strokeWidth="7.5" strokeLinecap="round" />
          <path d="M -20,22 L -24,31 M -2,24 L 2,32" stroke="#ffb3d1" strokeWidth="4" strokeLinecap="round" />
          <path d="M -23,29 L -24,32 M 1,30 L 2,33" stroke="#6b3a2e" strokeWidth="4.2" strokeLinecap="round" />
          <ellipse cx="-10" cy="14" rx="20" ry="14" fill="#ffb3d1" stroke={PIG_O} strokeWidth="3" />
          <ellipse cx="-8" cy="19" rx="12" ry="5" fill="#ffe6ef" opacity="0.75" />
          {/* Rocket pack harness strap across chest */}
          <path d="M -18,3 Q -6,12 -14,26" stroke={YELLOW} strokeWidth="4.2" fill="none" strokeLinecap="round" />
          <path d="M -18,3 Q -6,12 -14,26" stroke={PIG_O} strokeWidth="1.4" fill="none" strokeLinecap="round" />

          {/* Reused PigHead from PigMark */}
          <g transform="translate(12 -5) scale(0.66) translate(-32 -36)">
            <PigHead mood="happy" />
          </g>

          {/* Glossy fishbowl space helmet */}
          <circle cx="12" cy="-5" r="24" fill={`url(#${glassGrad})`} stroke="#a8e0ff" strokeWidth="3" />
          <path d="M -4,-15 A 18,18 0 0 1 14,-24" fill="none" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" opacity="0.88" />
          <circle cx="-6.5" cy="-9" r="2" fill="#ffffff" opacity="0.85" />
          {/* Gold helmet collar ring */}
          <path d="M -4,12 Q 12,20 27,10" fill="none" stroke={PIG_O} strokeWidth="7" strokeLinecap="round" />
          <path d="M -4,12 Q 12,20 27,10" fill="none" stroke={YELLOW} strokeWidth="3.6" strokeLinecap="round" />
        </g>

        {/* Subtle embroidered twill sheen across whole emblem */}
        <circle cx="120" cy="120" r="75" fill={`url(#${twill})`} opacity="0.55" />
      </g>

      {/* Embroidered arc text (unique textPath ids per instance) */}
      <text fontFamily="Space Mono, monospace" fontWeight="700" fontSize="22" letterSpacing="5.5" fill="#fffaf0">
        <textPath href={`#${topArc}`} startOffset="50%" textAnchor="middle">
          SUS VOLAT
        </textPath>
      </text>
      <text fontFamily="Space Mono, monospace" fontWeight="700" fontSize="13.5" letterSpacing="2.4" fill={YELLOW}>
        <textPath href={`#${botArc}`} startOffset="50%" textAnchor="middle">
          MAKEPIGS.FLY · MMXXVI
        </textPath>
      </text>
    </svg>
  );
}
