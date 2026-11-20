import { useId } from 'react';
import type { Delegate } from '../i18n/locales/en';

/*
 * Summit delegate portrait medallions (floor 9 — International Union of Impossible Animals).
 * Shown at 92 px inside cards, so every animal has a strong silhouette, rich cel shading,
 * expressive eyes, and an immediately readable visual gag.
 */

const O = '#3a2438';
const BLUE = '#0078bf';
const PINK = '#ff48b0';
const YELLOW = '#ffe800';

const SCENE_BG: Record<Delegate, [string, string]> = {
  hen: ['#fff4d6', '#fad8ab'],
  frog: ['#d6f3ee', '#9cd7e2'],
  crayfish: ['#b5def7', '#eaf6fd'],
  fish: ['#b9e1f8', '#e6f5ec'],
  donkey: ['#cbe4f6', '#eef4ee'],
  calf: ['#d6ecfa', '#eef7fc'],
  rooster: ['#ffe6cf', '#fff6e8'],
  cat: ['#eee2f8', '#f9efe0'],
  sun: ['#58ade6', '#ffbddb'],
};

function GlossyEye({
  x,
  y,
  rx = 7,
  ry = 8.5,
  px = 1,
  py = 0.6,
  pr = 3.6,
  lid,
  lidColor = '#fffaf0',
  stroke = O,
}: {
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  px?: number;
  py?: number;
  pr?: number;
  lid?: number;
  lidColor?: string;
  stroke?: string;
}) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#ffffff" stroke={stroke} strokeWidth="2.4" />
      <circle cx={x + px} cy={y + py} r={pr} fill="#250d26" />
      <ellipse cx={x + px - pr * 0.35} cy={y + py - pr * 0.38} rx={pr * 0.36} ry={pr * 0.38} fill="#ffffff" />
      <circle cx={x + px + pr * 0.38} cy={y + py + pr * 0.38} r={pr * 0.18} fill="#ffffff" />
      {lid !== undefined && (
        <>
          <path
            d={`M ${x - rx - 1} ${y - ry - 1} H ${x + rx + 1} V ${y - ry + lid} Q ${x} ${y - ry + lid + 2.5} ${x - rx - 1} ${y - ry + lid} Z`}
            fill={lidColor}
          />
          <path
            d={`M ${x - rx} ${y - ry + lid} Q ${x} ${y - ry + lid + 2.4} ${x + rx} ${y - ry + lid}`}
            stroke={stroke}
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </g>
  );
}

function Drop({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M 0,-7 C 0,-7 6,1 5,5 C 4.2,7.8 -4.2,7.8 -5,5 C -6,1 0,-7 0,-7 Z"
        fill="#66ccff"
        stroke={BLUE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <ellipse cx="-1.5" cy="2.6" rx="1.2" ry="2" fill="#ffffff" opacity="0.9" transform="rotate(-15 -1.5 2.6)" />
    </g>
  );
}

function Blush({ x, y, rx = 6, ry = 3.2 }: { x: number; y: number; rx?: number; ry?: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#ff66a8" opacity="0.46" />
      <path d={`M ${x - 2} ${y + 1} l 1.4 -2.2 M ${x + 1} ${y + 1.1} l 1.4 -2.2`} stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
    </g>
  );
}

function HenArt({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`dh-b-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.65" stopColor="#fff8ec" />
          <stop offset="1" stopColor="#e8d8be" />
        </linearGradient>
      </defs>
      {/* Subtle proud sunburst rays */}
      <g fill="#fff8e0" opacity="0.65">
        <path d="M 80,82 L 24,14 L 50,8 Z" />
        <path d="M 80,82 L 106,8 L 134,18 Z" />
        <path d="M 80,82 L 154,60 L 156,90 Z" />
      </g>
      {/* Plump chest & feathered ruff */}
      <path
        d="M 18,162 C 18,116 42,96 74,98 C 106,100 122,122 122,162 Z"
        fill={`url(#dh-b-${uid})`}
        stroke={O}
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path d="M 28,136 C 46,124 88,124 110,140 C 100,152 46,154 28,136 Z" fill="#e6d5b8" opacity="0.65" />
      {/* Raised proud wing edge */}
      <path d="M 28,134 C 34,116 54,114 66,128 C 60,142 40,148 28,134 Z" fill="#f5ead7" stroke={O} strokeWidth="2.6" strokeLinejoin="round" />

      {/* Head & neck */}
      <path
        d="M 46,104 C 40,86 44,54 68,48 C 90,42 108,58 106,82 C 105,98 96,112 78,114 C 60,116 50,112 46,104 Z"
        fill={`url(#dh-b-${uid})`}
        stroke={O}
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      {/* Lush crimson comb */}
      <path
        d="M 52,52 C 44,36 56,26 64,37 C 66,22 82,22 82,38 C 90,28 102,36 94,50 C 82,47 64,48 52,52 Z"
        fill="#f15060"
        stroke={O}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 69,30 C 72,27 76,28 77,33" stroke="#ff9aa6" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* Bouncy wattle */}
      <path
        d="M 101,94 C 110,100 110,114 100,116 C 92,115 92,102 101,94 Z"
        fill="#f15060"
        stroke={O}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Wide open beak proudly flashing DENTURES */}
      <path d="M 98,64 L 146,72 L 102,77 Z" fill="#ffbe26" stroke={O} strokeWidth="3" strokeLinejoin="round" />
      <path d="M 98,87 L 144,96 L 98,98 Z" fill="#f09a14" stroke={O} strokeWidth="3" strokeLinejoin="round" />
      {/* Mouth cavity */}
      <path d="M 102,75 L 138,75 L 136,92 L 101,92 Z" fill="#8f1c44" />
      {/* Pink denture gums (upper & lower) */}
      <path d="M 103,75 Q 120,71 137,76 L 136,80 H 103 Z" fill="#ff73b8" stroke={O} strokeWidth="1.4" />
      <path d="M 103,89 H 136 L 135,93 Q 119,95 103,92 Z" fill="#ff73b8" stroke={O} strokeWidth="1.4" />
      {/* Gleaming pearly-white denture teeth */}
      <rect x="104" y="78" width="32" height="11.5" rx="2.2" fill="#ffffff" stroke={O} strokeWidth="2" />
      <path d="M 104,84 H 136 M 112,78 V 89.5 M 120,78 V 89.5 M 128,78 V 89.5" stroke={O} strokeWidth="1.4" />
      {/* Dazzling tooth sparkle star */}
      <path d="M 135,66 Q 135,75 144,75 Q 135,75 135,84 Q 135,75 126,75 Q 135,75 135,66 Z" fill={YELLOW} stroke={O} strokeWidth="1.2" />

      {/* Proud eye + rosy cheek */}
      <GlossyEye x={80} y={71} rx={8} ry={9.5} px={2} py={0.5} pr={4} />
      <path d="M 70,58 Q 80,52 90,58" stroke={O} strokeWidth="3" strokeLinecap="round" fill="none" />
      <Blush x={72} y={89} />
    </g>
  );
}

function FrogArt({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`df-g-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#4cd97b" />
          <stop offset="0.58" stopColor="#1eb85c" />
          <stop offset="1" stopColor="#118744" />
        </linearGradient>
        <linearGradient id={`df-w-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#fff370" />
          <stop offset="0.55" stopColor={YELLOW} />
          <stop offset="1" stopColor="#e8a800" />
        </linearGradient>
      </defs>
      {/* Pond water rim at bottom */}
      <ellipse cx="80" cy="146" rx="76" ry="20" fill="#6cc4dc" opacity="0.55" />
      <path d="M 24,146 Q 80,154 136,146" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* Chubby frog body & cheeks */}
      <path
        d="M 26,118 C 22,92 42,74 80,74 C 118,74 138,92 134,118 C 132,140 110,152 80,152 C 50,152 28,140 26,118 Z"
        fill={`url(#df-g-${uid})`}
        stroke={O}
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      {/* Pale lime chin / belly glow */}
      <ellipse cx="80" cy="134" rx="38" ry="15" fill="#bdf0a8" opacity="0.75" />
      {/* Frog eye bumps */}
      <circle cx="55" cy="76" r="16" fill={`url(#df-g-${uid})`} stroke={O} strokeWidth="3.2" />
      <circle cx="105" cy="76" r="16" fill={`url(#df-g-${uid})`} stroke={O} strokeWidth="3.2" />
      {/* Mask seam between bumps and face */}
      <ellipse cx="80" cy="100" rx="48" ry="26" fill={`url(#df-g-${uid})`} />

      {/* Big bulging frog eyes (mildly awkward side-glance) */}
      <GlossyEye x={55} y={76} rx={10.5} ry={11} px={2.4} py={1} pr={4.8} />
      <GlossyEye x={105} y={76} rx={10.5} ry={11} px={2.4} py={1} pr={4.8} />

      {/* Wide frog mouth & cute nostrils */}
      <path d="M 44,112 Q 80,129 116,112" stroke={O} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M 42,110 Q 45,113 47,114 M 118,110 Q 115,113 113,114" stroke={O} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="72" cy="96" r="2" fill="#0d6632" />
      <circle cx="88" cy="96" r="2" fill="#0d6632" />
      <Blush x={40} y={108} rx={7} ry={3.8} />
      <Blush x={120} y={108} rx={7} ry={3.8} />

      {/* Glorious slightly lopsided wet yellow bouffant wig! */}
      <path
        d="M 26,88 C 16,66 24,36 48,26 C 64,18 96,16 116,28 C 138,40 144,68 134,90 C 128,96 120,92 122,82 C 122,68 114,58 104,58 C 94,50 86,56 80,58 C 72,50 58,52 52,60 C 42,60 36,70 37,82 C 38,90 30,94 26,88 Z"
        fill={`url(#df-w-${uid})`}
        stroke={O}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Glossy wig wave highlights & curls */}
      <path d="M 46,38 Q 66,28 88,34" stroke="#fffce0" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M 52,48 Q 64,40 76,48 M 84,46 Q 98,38 112,46" stroke="#d99600" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* Dripping wet water droplets off the wig! */}
      <Drop x={27} y={100} s={0.92} />
      <Drop x={133} y={102} s={0.96} />
      <Drop x={124} y={64} s={0.78} />
      <Drop x={38} y={56} s={0.72} />
    </g>
  );
}

function CrayfishArt({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`dc-m-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8ba2c7" />
          <stop offset="1" stopColor="#566b91" />
        </linearGradient>
        <linearGradient id={`dc-r-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ff6e7b" />
          <stop offset="0.55" stopColor="#f14456" />
          <stop offset="1" stopColor="#bd2236" />
        </linearGradient>
      </defs>
      {/* Distant fluffy cloud */}
      <path d="M 16,44 C 14,35 26,30 34,36 C 40,28 54,32 52,44 Z" fill="#ffffff" opacity="0.8" />
      {/* Alpine mountain range */}
      <path d="M -6,162 L 42,96 L 80,126 L 118,90 L 166,162 Z" fill="#9fb4d4" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M 8,164 L 78,76 L 152,164 Z" fill={`url(#dc-m-${uid})`} stroke={O} strokeWidth="3.2" strokeLinejoin="round" />
      {/* Shaded right mountain face */}
      <path d="M 78,76 L 152,164 L 96,164 Z" fill="#46587c" opacity="0.55" />
      {/* Crisp snow cap */}
      <path d="M 55,104 L 78,76 L 102,104 L 90,98 L 78,107 L 66,98 Z" fill="#fffef8" stroke={O} strokeWidth="2.2" strokeLinejoin="round" />

      {/* Red crayfish perched on summit */}
      <g transform="translate(78 72)">
        {/* Long bewildered drooping antennae */}
        <path d="M -12,-10 C -26,-26 -42,-24 -48,-14 M 12,-10 C 26,-26 42,-24 48,-14" stroke={O} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {/* Little legs gripping peak */}
        <path d="M -18,14 L -26,24 M -10,16 L -16,27 M 10,16 L 16,27 M 18,14 L 26,24" stroke={O} strokeWidth="3" strokeLinecap="round" />
        {/* Shrugging left claw */}
        <path
          d="M -26,4 C -40,-2 -50,-16 -46,-26 C -42,-34 -32,-26 -35,-16 C -30,-24 -22,-22 -24,-12 C -24,-6 -22,0 -26,4 Z"
          fill={`url(#dc-r-${uid})`}
          stroke={O}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Body carapace */}
        <path
          d="M -28,2 C -28,-16 28,-16 28,2 C 28,18 16,22 0,22 C -16,22 -28,18 -28,2 Z"
          fill={`url(#dc-r-${uid})`}
          stroke={O}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <ellipse cx="-8" cy="-7" rx="9" ry="3.4" fill="#ff9ea8" opacity="0.7" transform="rotate(-10 -8 -7)" />
        {/* Stalked confused eyes */}
        <path d="M -11,-12 L -13,-20 M 11,-12 L 13,-20" stroke={O} strokeWidth="3.2" strokeLinecap="round" />
        <GlossyEye x={-13} y={-20} rx={6.2} ry={6.6} px={1.6} py={1.4} pr={2.6} />
        <GlossyEye x={13} y={-20} rx={6.2} ry={6.6} px={-1.4} py={1.4} pr={2.6} />
        {/* Confused asymmetric brows */}
        <path d="M -20,-29 Q -13,-33 -7,-28" stroke={O} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 7,-28 L 19,-31" stroke={O} strokeWidth="2.4" strokeLinecap="round" />

        {/* Right claw holding a golden whistle right up to lipless face */}
        <path
          d="M 26,4 C 38,-2 46,-10 42,-18 C 38,-24 30,-16 32,-10 C 26,-14 20,-10 24,-2 Z"
          fill={`url(#dc-r-${uid})`}
          stroke={O}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Golden referee whistle */}
        <g transform="translate(8 6) rotate(-8)">
          <circle cx="15" cy="2" r="4" fill="none" stroke={O} strokeWidth="2" />
          <path
            d="M -14,-1 L 4,-3 C 10,-3 14,1 14,5 C 14,10 9,12 4,11 C 0,10 -2,6 -4,5 L -14,5 Z"
            fill={YELLOW}
            stroke={O}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <rect x="-5" y="-2" width="4" height="2.6" fill={O} />
          <path d="M -10,1 H 2" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
        </g>

        {/* Bold confused "?" */}
        <text x="34" y="-24" fontFamily="Fraunces, serif" fontWeight="900" fontSize="28" fill={BLUE} stroke="#fffef8" strokeWidth="3.5" paintOrder="stroke">
          ?
        </text>
      </g>
    </g>
  );
}

function FishArt({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`dfi-f-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#58bdf5" />
          <stop offset="0.55" stopColor="#1b8cd6" />
          <stop offset="1" stopColor="#005d9c" />
        </linearGradient>
        <linearGradient id={`dfi-t-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9c6644" />
          <stop offset="0.6" stopColor="#7c4d32" />
          <stop offset="1" stopColor="#5c3621" />
        </linearGradient>
      </defs>
      {/* Slender tall poplar tree trunk */}
      <path d="M 46,162 L 50,24 L 68,24 L 72,162 Z" fill={`url(#dfi-t-${uid})`} stroke={O} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M 55,68 V 88 M 62,102 V 126 M 54,132 V 148" stroke="#57321d" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
      {/* Tall columnar poplar foliage crown */}
      <path
        d="M 59,4 C 40,6 28,28 32,52 C 30,66 42,76 59,74 C 76,76 88,66 86,52 C 90,28 78,6 59,4 Z"
        fill="#22a858"
        stroke={O}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path d="M 38,56 C 48,66 72,66 82,54 C 84,66 74,74 59,73 C 44,74 34,66 38,56 Z" fill="#167d3f" opacity="0.7" />
      <ellipse cx="48" cy="28" rx="9" ry="14" fill="#6ae095" opacity="0.65" transform="rotate(-12 48 28)" />

      {/* Plump fish desperately clinging halfway up the poplar trunk */}
      <g transform="translate(90 100) rotate(-72)">
        {/* Orange-yellow tail fin */}
        <path d="M -30,0 L -48,-16 C -44,-5 -44,5 -48,16 Z" fill="#ffae24" stroke={O} strokeWidth="2.8" strokeLinejoin="round" />
        {/* Dorsal fin */}
        <path d="M -12,-14 C -4,-26 10,-26 16,-14 Z" fill="#ffae24" stroke={O} strokeWidth="2.6" strokeLinejoin="round" />
        {/* Main fish body */}
        <path
          d="M -32,0 C -18,-22 20,-22 34,0 C 20,22 -18,22 -32,0 Z"
          fill={`url(#dfi-f-${uid})`}
          stroke={O}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Pale belly & curved scale hints */}
        <path d="M -20,7 C -4,17 16,16 28,4 C 16,18 -10,18 -20,7 Z" fill="#b3e5fc" opacity="0.85" />
        <path d="M -8,-6 Q -4,0 -8,6 M 2,-8 Q 6,0 2,8" stroke="#004d82" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55" />
        {/* Clinging pectoral fin gripping the tree bark */}
        <path d="M 4,10 C 0,24 14,28 18,14 Z" fill="#ffae24" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
        {/* Panicked wide eye */}
        <GlossyEye x={16} y={-5} rx={6.4} ry={6.8} px={1.4} py={0} pr={2.6} />
        {/* Worried brow */}
        <path d="M 12,-14 L 22,-11" stroke={O} strokeWidth="2.4" strokeLinecap="round" />
        {/* Gasping O-mouth */}
        <ellipse cx="32" cy="3" rx="4.5" ry="6" fill="#ff82b8" stroke={O} strokeWidth="2.4" />
        <ellipse cx="32.5" cy="3" rx="2.2" ry="3.2" fill="#7a1b43" />
      </g>

      {/* Flying water droplets & desperate sweat */}
      <Drop x={116} y={56} s={0.95} />
      <Drop x={130} y={76} s={0.82} />
      <Drop x={122} y={98} s={0.7} />
    </g>
  );
}

function DonkeyArt({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`dd-g-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#c9cfd9" />
          <stop offset="0.6" stopColor="#a6aebd" />
          <stop offset="1" stopColor="#818a9c" />
        </linearGradient>
        <linearGradient id={`dd-c-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6bc84" />
          <stop offset="1" stopColor="#b88248" />
        </linearGradient>
      </defs>

      {/* Crooked corrugated cardboard wings strapped behind shoulders */}
      <g>
        <path d="M 42,102 L 6,62 L 4,116 L 38,128 Z" fill={`url(#dd-c-${uid})`} stroke={O} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 10,76 L 38,108 M 9,94 L 36,118" stroke="#8f5d2c" strokeWidth="1.8" opacity="0.65" />
        <path d="M 118,102 L 154,62 L 156,116 L 122,128 Z" fill={`url(#dd-c-${uid})`} stroke={O} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 150,76 L 122,108 M 151,94 L 124,118" stroke="#8f5d2c" strokeWidth="1.8" opacity="0.65" />
      </g>

      {/* Donkey neck & shoulders + masking tape straps */}
      <path d="M 42,162 C 44,126 58,116 80,116 C 102,116 116,126 118,162 Z" fill={`url(#dd-g-${uid})`} stroke={O} strokeWidth="3.2" />
      {/* Translucent packing tape holding cardboard wings on */}
      <path d="M 38,120 L 60,132 L 56,142 L 34,130 Z" fill="#f7f1e0" stroke="#b5a689" strokeWidth="1.5" opacity="0.92" />
      <path d="M 122,120 L 100,132 L 104,142 L 126,130 Z" fill="#f7f1e0" stroke="#b5a689" strokeWidth="1.5" opacity="0.92" />

      {/* Tall velvety donkey ears angled back in annoyance */}
      <path d="M 52,60 C 39,44 34,24 43,21 C 52,20 60,36 66,50 Z" fill={`url(#dd-g-${uid})`} stroke={O} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M 53,53 C 45,42 42,30 46,28 C 50,27 55,38 60,48 Z" fill="#f2b6c9" />
      <path d="M 108,60 C 121,44 126,24 117,21 C 108,20 100,36 94,50 Z" fill={`url(#dd-g-${uid})`} stroke={O} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M 107,53 C 115,42 118,30 114,28 C 110,27 105,38 100,48 Z" fill="#f2b6c9" />

      {/* Head */}
      <path
        d="M 46,74 C 46,48 62,40 80,40 C 98,40 114,48 114,74 C 114,102 102,124 80,124 C 58,124 46,102 46,74 Z"
        fill={`url(#dd-g-${uid})`}
        stroke={O}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Shaggy dark mane tuft */}
      <path d="M 70,42 C 68,28 76,24 80,34 C 84,24 94,28 90,42 C 84,46 76,46 70,42 Z" fill={O} />

      {/* Cream muzzle with deep unimpressed frown */}
      <ellipse cx="80" cy="112" rx="28" ry="20" fill="#efe7da" stroke={O} strokeWidth="3" />
      <path d="M 56,118 C 66,128 94,128 104,118 C 98,129 62,129 56,118 Z" fill="#d5c8b5" />
      <ellipse cx="69" cy="107" rx="3.4" ry="4.4" fill={O} transform="rotate(-14 69 107)" />
      <ellipse cx="91" cy="107" rx="3.4" ry="4.4" fill={O} transform="rotate(14 91 107)" />
      <path d="M 67,122 Q 80,115 93,122" stroke={O} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Heavy-lidded grumpy eyes + furrowed brows */}
      <GlossyEye x={64} y={78} rx={7.4} ry={8.2} px={1.2} py={1.4} pr={3.6} lid={7} lidColor="#b0b7c6" />
      <GlossyEye x={96} y={78} rx={7.4} ry={8.2} px={1.2} py={1.4} pr={3.6} lid={7} lidColor="#b0b7c6" />
      <path d="M 55,66 L 73,72 M 105,66 L 87,72" stroke={O} strokeWidth="3.2" strokeLinecap="round" />
    </g>
  );
}

function CalfArt({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`dca-i-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7ecff" />
          <stop offset="1" stopColor="#86c9eb" />
        </linearGradient>
        <linearGradient id={`dca-t-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9cd2" />
          <stop offset="1" stopColor={PINK} />
        </linearGradient>
      </defs>
      {/* Gleaming frozen ice rink surface */}
      <ellipse cx="80" cy="144" rx="76" ry="20" fill={`url(#dca-i-${uid})`} stroke={BLUE} strokeWidth="2.4" />
      <path d="M 32,140 Q 60,134 86,144 M 96,138 Q 116,134 130,140" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* Ice skate shadow under calf */}
      <ellipse cx="78" cy="140" rx="24" ry="5.5" fill="#5da7d1" opacity="0.5" />

      {/* Wobbling calf mid-pirouette! */}
      <g transform="translate(80 86) rotate(-8)">
        {/* Balance leg planted on ice skate */}
        <path d="M -8,22 L -10,48" stroke={O} strokeWidth="10" strokeLinecap="round" />
        <path d="M -8,22 L -10,48" stroke="#fffaf0" strokeWidth="5.2" strokeLinecap="round" />
        <path d="M -10,44 L -10,50" stroke="#6e4338" strokeWidth="6" strokeLinecap="round" />
        <path d="M -20,53 L 2,53" stroke="#dce6f2" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M -20,53 L 2,53" stroke={O} strokeWidth="1.4" strokeLinecap="round" />

        {/* Kicked-up pirouette hind leg */}
        <path d="M 14,18 L 36,30" stroke={O} strokeWidth="10" strokeLinecap="round" />
        <path d="M 14,18 L 36,30" stroke="#fffaf0" strokeWidth="5.2" strokeLinecap="round" />
        <path d="M 32,28 L 38,31" stroke="#6e4338" strokeWidth="6" strokeLinecap="round" />
        <path d="M 37,22 L 42,38" stroke={O} strokeWidth="2.4" strokeLinecap="round" />

        {/* Flung-out front legs for balance */}
        <path d="M -22,2 L -44,-14 M 22,2 L 44,-10" stroke={O} strokeWidth="9" strokeLinecap="round" />
        <path d="M -22,2 L -44,-14 M 22,2 L 44,-10" stroke="#fffaf0" strokeWidth="4.6" strokeLinecap="round" />

        {/* Chubby calf torso + cute brown spots */}
        <ellipse cx="0" cy="6" rx="28" ry="26" fill="#fffaf0" stroke={O} strokeWidth="3.2" />
        <path d="M -16,-6 C -8,-14 6,-10 4,2 C 0,8 -14,6 -16,-6 Z" fill="#7d4b3a" />

        {/* Ruffled fluorescent-pink ballet tutu! */}
        <path
          d="M -32,12 C -26,24 -12,28 0,26 C 12,28 26,24 32,12 L 40,22 C 32,32 22,28 16,32 C 8,36 4,30 0,34 C -4,30 -8,36 -16,32 C -22,28 -32,32 -40,22 Z"
          fill={`url(#dca-t-${uid})`}
          stroke={O}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <path d="M -28,17 Q 0,28 28,17" stroke="#ffd2ec" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Cute calf head tilted in dizzy concentration */}
        <g transform="translate(2 -32) rotate(10)">
          {/* Tiny horn nubs + floppy ears */}
          <path d="M -14,-16 L -18,-25 M 14,-16 L 18,-25" stroke={O} strokeWidth="5.4" strokeLinecap="round" />
          <path d="M -14,-16 L -18,-25 M 14,-16 L 18,-25" stroke="#f2dfb8" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="-24" cy="-6" rx="10" ry="5.5" fill="#fffaf0" stroke={O} strokeWidth="2.8" transform="rotate(-18 -24 -6)" />
          <ellipse cx="24" cy="-6" rx="10" ry="5.5" fill="#fffaf0" stroke={O} strokeWidth="2.8" transform="rotate(18 24 -6)" />

          <ellipse cx="0" cy="0" rx="23" ry="20" fill="#fffaf0" stroke={O} strokeWidth="3.2" />
          <path d="M 4,-16 C 14,-14 20,-4 16,4 C 10,4 4,-4 4,-16 Z" fill="#7d4b3a" />
          <ellipse cx="0" cy="11" rx="15" ry="10" fill="#ffb8dc" stroke={O} strokeWidth="2.6" />
          <circle cx="-5.5" cy="10" r="2" fill="#7a2350" />
          <circle cx="5.5" cy="10" r="2" fill="#7a2350" />
          <path d="M -4,16 Q 0,14 4,16" stroke="#7a2350" strokeWidth="2" strokeLinecap="round" fill="none" />
          <GlossyEye x={-9} y={-4} rx={5.2} ry={6} px={1} py={-0.6} pr={2.2} />
          <GlossyEye x={9} y={-4} rx={5.2} ry={6} px={-1} py={0.6} pr={2.2} />
        </g>

        {/* Cartoon wobble lines */}
        <path d="M -52,6 C -56,14 -54,22 -48,26 M 50,-2 C 55,6 54,14 48,20" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.75" />
      </g>
    </g>
  );
}

function RoosterArt({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`dr-b-${uid}`} x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#ffbe73" />
          <stop offset="0.58" stopColor="#f29146" />
          <stop offset="1" stopColor="#c96520" />
        </linearGradient>
      </defs>
      {/* Coop wooden perch bar */}
      <rect x="0" y="132" width="160" height="32" fill="#d6a774" stroke={O} strokeWidth="2.8" />
      <path d="M 0,144 H 160" stroke="#b5804a" strokeWidth="2" />

      {/* Dramatic emerald-and-blue tail plumes */}
      <path
        d="M 42,102 C 14,88 8,54 24,42 C 26,56 32,68 42,74 C 28,54 30,30 48,28 C 48,46 52,62 60,72 Z"
        fill="#00a95c"
        stroke={O}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 38,98 C 18,90 12,72 20,62 C 26,72 34,80 44,84 Z"
        fill={BLUE}
        stroke={O}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Indignant puffed rooster body */}
      <path
        d="M 28,112 C 28,84 52,74 74,80 C 92,84 96,104 90,122 C 84,136 58,140 42,134 C 30,130 28,122 28,112 Z"
        fill={`url(#dr-b-${uid})`}
        stroke={O}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Head recoiling sharply back in offended shock */}
      <path
        d="M 52,88 C 46,66 56,42 78,42 C 98,42 106,58 102,78 C 98,92 84,96 68,94 Z"
        fill={`url(#dr-b-${uid})`}
        stroke={O}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Tall scarlet comb & wattle */}
      <path
        d="M 58,46 C 50,28 62,20 70,32 C 74,16 90,18 88,34 C 98,24 108,34 98,46 C 86,42 70,42 58,46 Z"
        fill="#f15060"
        stroke={O}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M 96,80 C 104,86 102,98 94,98 C 88,96 89,86 96,80 Z" fill="#f15060" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />

      {/* Open squawking beak ("Absolutely not.") */}
      <path d="M 96,60 L 122,56 L 99,70 Z" fill={YELLOW} stroke={O} strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M 97,72 L 118,78 L 95,78 Z" fill="#eba010" stroke={O} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M 98,67 L 112,67 L 110,74 L 97,74 Z" fill="#8f1c44" />

      {/* Scandalized eye + furious furrowed brow */}
      <GlossyEye x={84} y={62} rx={7.5} ry={8.5} px={2.2} py={1.4} pr={2.6} />
      <path d="M 73,48 L 94,55" stroke={O} strokeWidth="3.4" strokeLinecap="round" />

      {/* Pristine speckled egg sitting right beside him */}
      <g transform="translate(116 118)">
        <ellipse cx="0" cy="18" rx="18" ry="4.5" fill="#9c6b3b" opacity="0.55" />
        <path
          d="M 0,-22 C 13,-22 20,-4 19,8 C 18,18 10,22 0,22 C -10,22 -18,18 -19,8 C -20,-4 -13,-22 0,-22 Z"
          fill="#fffef8"
          stroke={O}
          strokeWidth="3"
        />
        <path d="M -14,8 C -6,18 10,18 16,6 C 14,17 6,21 0,21 C -8,21 -15,16 -14,8 Z" fill="#e6dcc8" />
        <ellipse cx="-6" cy="-7" rx="3.4" ry="7" fill="#ffffff" transform="rotate(-14 -6 -7)" />
      </g>

      {/* Bold "?!" floating safely above the egg */}
      <text x="122" y="88" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="900" fontSize="28" fill={BLUE} stroke="#fffef8" strokeWidth="3.5" paintOrder="stroke">
        ?!
      </text>
    </g>
  );
}

function CatArt({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`dct-b-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#3c3347" />
          <stop offset="0.55" stopColor="#261f2e" />
          <stop offset="1" stopColor="#17121c" />
        </linearGradient>
        <linearGradient id={`dct-h-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6bc84" />
          <stop offset="1" stopColor="#b57d44" />
        </linearGradient>
      </defs>
      {/* Cat shoulders */}
      <path d="M 32,162 C 34,134 52,124 80,124 C 108,124 126,134 128,162 Z" fill={`url(#dct-b-${uid})`} stroke="#0f0b14" strokeWidth="3" />

      {/* Pointed cat ears pinned slightly outward to the sides so the horns clearly tower above */}
      <path d="M 36,100 L 18,58 L 58,76 Z" fill={`url(#dct-b-${uid})`} stroke="#0f0b14" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M 36,92 L 26,68 L 50,79 Z" fill="#804a6e" />
      <path d="M 124,100 L 142,58 L 102,76 Z" fill={`url(#dct-b-${uid})`} stroke="#0f0b14" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M 124,92 L 134,68 L 110,79 Z" fill="#804a6e" />

      {/* Sleek black cat head */}
      <ellipse cx="80" cy="106" rx="46" ry="36" fill={`url(#dct-b-${uid})`} stroke="#0f0b14" strokeWidth="3.2" />
      {/* Cool violet rim light so silhouette pops */}
      <path d="M 44,90 C 50,75 64,71 80,71" stroke="#6c5c85" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.65" />

      {/* Tall askew kraft-brown corrugated cardboard horns (unmistakably taller than the ears!) */}
      <g transform="translate(60 72) rotate(-14)">
        {/* 3D corrugated cut edge along outer side */}
        <path d="M -14,2 C -12,-22 -8,-40 -2,-52 L 3,-51 C -2,-38 -5,-20 -7,2 Z" fill="#7d4f26" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M -11,-4 C -9,-22 -6,-37 -1,-48" stroke="#472810" strokeWidth="2" strokeDasharray="2.4 3.2" fill="none" />
        {/* Main kraft cone */}
        <path d="M -9,3 C -8,-18 -4,-38 2,-52 C 11,-34 15,-14 14,3 Z" fill={`url(#dct-h-${uid})`} stroke={O} strokeWidth="2.8" strokeLinejoin="round" />
        {/* Corrugation ribs & bend crease */}
        <path d="M -4,-14 H 12 M -2,-28 H 9 M 0,-40 H 5" stroke="#996432" strokeWidth="1.6" opacity="0.68" />
      </g>
      <g transform="translate(101 72) rotate(21)">
        {/* 3D corrugated cut edge */}
        <path d="M 14,2 C 12,-20 8,-38 2,-49 L -3,-48 C 2,-36 5,-18 7,2 Z" fill="#7d4f26" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M 11,-4 C 9,-20 6,-35 1,-46" stroke="#472810" strokeWidth="2" strokeDasharray="2.4 3.2" fill="none" />
        {/* Main kraft cone (slightly crooked & shorter for DIY charm) */}
        <path d="M -14,3 C -15,-14 -10,-32 -2,-49 C 5,-35 8,-16 9,3 Z" fill={`url(#dct-h-${uid})`} stroke={O} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M -12,-14 H 5 M -9,-27 H 2 M -5,-38 H 0" stroke="#996432" strokeWidth="1.6" opacity="0.68" />
      </g>

      {/* Visible criss-crossed packing tape strips holding the cardboard horns onto the forehead */}
      <g opacity="0.95">
        <g transform="translate(80 74) rotate(-3)">
          <path
            d="M -38,-6.5 L 38,-6.5 L 35.5,-3.2 L 38,0 L 35.5,3.2 L 38,6.5 L -38,6.5 L -35.5,3.2 L -38,0 L -35.5,-3.2 Z"
            fill="#f7f1e0"
            stroke="#a89472"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M -30,-2.4 H 30" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.88" />
        </g>
        <g transform="translate(57 67) rotate(24)">
          <path
            d="M -16,-4.8 L 16,-4.8 L 14.5,-1.6 L 16,1.6 L 14.5,4.8 L -16,4.8 L -14.5,1.6 L -16,-1.6 Z"
            fill="#f2ead3"
            stroke="#a89472"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M -11,-1.5 H 11" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        </g>
        <g transform="translate(103 68) rotate(-22)">
          <path
            d="M -16,-4.8 L 16,-4.8 L 14.5,-1.6 L 16,1.6 L 14.5,4.8 L -16,4.8 L -14.5,1.6 L -16,-1.6 Z"
            fill="#f2ead3"
            stroke="#a89472"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M -11,-1.5 H 11" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        </g>
      </g>

      {/* Luminous yellow deadpan cat eyes with vertical slit pupils */}
      {[62, 98].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="102" rx="11.5" ry="10.8" fill={YELLOW} stroke="#0f0b14" strokeWidth="2.4" />
          <ellipse cx={cx} cy="103" rx="3.4" ry="8.4" fill="#17121c" />
          <circle cx={cx - 3.6} cy="98.5" r="2.2" fill="#ffffff" />
          {/* Heavy unamused flat upper lid */}
          <path d={`M ${cx - 13} 90 H ${cx + 13} V 98.2 H ${cx - 13} Z`} fill="#261f2e" />
          <path d={`M ${cx - 12} 98.2 H ${cx + 12}`} stroke="#0f0b14" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      ))}

      {/* Cute pink nose, deadpan mouth & crisp white whiskers */}
      <path d="M 75,117 L 85,117 L 80,123 Z" fill="#ff7eb9" stroke="#0f0b14" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M 72,127 Q 76,130 80,125 Q 84,130 88,127" stroke="#d8cce0" strokeWidth="2" strokeLinecap="round" fill="none" />
      <g stroke="#fffaf0" strokeWidth="1.8" strokeLinecap="round" opacity="0.88">
        <path d="M 42,116 L 18,112 M 42,123 L 16,126 M 118,116 L 142,112 M 118,123 L 144,126" />
      </g>
    </g>
  );
}

function SunArt({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`ds-s-${uid}`} cx="0.38" cy="0.35" r="0.65">
          <stop offset="0" stopColor="#fff780" />
          <stop offset="0.6" stopColor={YELLOW} />
          <stop offset="1" stopColor="#ffaa00" />
        </radialGradient>
        <linearGradient id={`ds-h-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BLUE} />
          <stop offset="1" stopColor="#0f3e78" />
        </linearGradient>
      </defs>

      {/* Sun rising jauntily on the LEFT (west!) side of the horizon */}
      <g transform="translate(64 82)">
        {/* Alternating coral & golden flame rays */}
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            d={i % 2 === 0 ? 'M 0,-60 L 8,-39 L -8,-39 Z' : 'M 0,-54 L 6,-39 L -6,-39 Z'}
            fill={i % 2 === 0 ? '#f15060' : '#ff9f1c'}
            stroke={O}
            strokeWidth="2"
            strokeLinejoin="round"
            transform={`rotate(${i * 30})`}
          />
        ))}
        {/* Sun disc */}
        <circle cx="0" cy="0" r="39" fill={`url(#ds-s-${uid})`} stroke={O} strokeWidth="3.2" />
        <ellipse cx="-14" cy="-18" rx="11" ry="5" fill="#ffffff" opacity="0.7" transform="rotate(-24 -14 -18)" />
        {/* Cool raised eyebrow peeking over sunglasses */}
        <path d="M 8,-19 Q 16,-24 23,-18" stroke={O} strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* Retro wayfarer sunglasses */}
        <path d="M -34,-7 L -26,-9 H 28 L 36,-7" stroke={O} strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <rect x="-27" y="-11" width="23" height="16" rx="4.5" fill="#1f1a29" stroke={O} strokeWidth="2.4" />
        <rect x="4" y="-11" width="23" height="16" rx="4.5" fill="#1f1a29" stroke={O} strokeWidth="2.4" />
        {/* Diagonal cool lens glare stripes */}
        <path d="M -22,-8 L -14,2 M -16,-8 L -10,-1 M 9,-8 L 17,2 M 15,-8 L 21,-1" stroke="#70d0ff" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
        {/* Relaxed smug half-smirk */}
        <path d="M -10,15 Q 4,22 17,12" stroke={O} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>

      {/* Deep riso-blue horizon ridge / sea covering bottom third */}
      <path d="M 0,114 Q 44,108 86,115 T 160,112 L 160,162 L 0,162 Z" fill={`url(#ds-h-${uid})`} stroke={O} strokeWidth="3" />
      {/* Sun reflection shimmer on the water */}
      <path d="M 40,122 H 88 M 48,128 H 80" stroke={YELLOW} strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />

      {/* Clean directional marker "W ←" safely centered inside bottom horizon */}
      <g transform="translate(80 137)">
        <rect x="-28" y="-13" width="56" height="19" rx="9.5" fill="#fffaf0" stroke={O} strokeWidth="2.2" />
        <text x="0" y="1" textAnchor="middle" fontFamily="Space Mono, monospace" fontWeight="700" fontSize="13" fill={BLUE}>
          W ←
        </text>
      </g>
    </g>
  );
}

function renderDelegate(id: Delegate, uid: string) {
  switch (id) {
    case 'hen':
      return <HenArt uid={uid} />;
    case 'frog':
      return <FrogArt uid={uid} />;
    case 'crayfish':
      return <CrayfishArt uid={uid} />;
    case 'fish':
      return <FishArt uid={uid} />;
    case 'donkey':
      return <DonkeyArt uid={uid} />;
    case 'calf':
      return <CalfArt uid={uid} />;
    case 'rooster':
      return <RoosterArt uid={uid} />;
    case 'cat':
      return <CatArt uid={uid} />;
    case 'sun':
      return <SunArt uid={uid} />;
  }
}

export function DelegateArt({ id }: { id: Delegate }) {
  const uid = useId().replace(/:/g, '');
  const clipId = `dc-${uid}`;
  const bgId = `db-${uid}`;
  const [cTop, cBot] = SCENE_BG[id];

  return (
    <svg viewBox="0 0 160 160" className="delegate-art" aria-hidden="true">
      <defs>
        <linearGradient id={bgId} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={cTop} />
          <stop offset="1" stopColor={cBot} />
        </linearGradient>
        <clipPath id={clipId}>
          <circle cx="80" cy="80" r="71.5" />
        </clipPath>
      </defs>

      {/* Subtle riso-blue offset medallion shadow */}
      <circle cx="83" cy="83" r="74" fill="none" stroke={BLUE} strokeWidth="3.2" opacity="0.55" />
      {/* Cream outer medallion bevel */}
      <circle cx="80" cy="80" r="75.5" fill="#fffaf0" stroke={O} strokeWidth="3.6" />

      {/* Clipped portrait scene */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="160" height="160" fill={`url(#${bgId})`} />
        {/* Soft vignette halo */}
        <circle cx="80" cy="76" r="56" fill="#ffffff" opacity="0.26" />
        {renderDelegate(id, uid)}
      </g>

      {/* Crisp inner frame ring + glossy enamel highlight */}
      <circle cx="80" cy="80" r="71.5" fill="none" stroke={O} strokeWidth="3" />
      <path d="M 30,44 A 61,61 0 0 1 68,20" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.82" />
      <circle cx="24" cy="54" r="2.6" fill="#ffffff" opacity="0.82" />
    </svg>
  );
}

/**
 * The chair's gavel that closes the summit, mid-strike over its sound block:
 * kraft handle, pink head with paper bands, ink outlines, blue impact ticks.
 */
export function Gavel({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 100" aria-hidden="true">
      {/* sound block */}
      <path d="M 44,80 v 8 a 30,7 0 0 0 60,0 v -8 Z" fill="#c98a55" stroke={O} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="74" cy="80" rx="30" ry="7" fill="#e7b07a" stroke={O} strokeWidth="3" />
      <path d="M 56,79 Q 74,75 92,79" fill="none" stroke="#fff3df" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

      {/* impact ticks */}
      <g stroke={BLUE} strokeWidth="3.4" strokeLinecap="round">
        <path d="M 48,66 L 40,62" />
        <path d="M 52,58 L 47,50" />
        <path d="M 96,66 L 104,61" />
      </g>

      {/* the gavel, tilted up-right along its handle */}
      <g transform="translate(58 44) rotate(-37)">
        <rect x="8" y="-4.5" width="58" height="9" rx="4.5" fill="#d6a774" stroke={O} strokeWidth="3" />
        <path d="M 14,-1.5 H 60" stroke="#f3d3a8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="66" cy="0" r="6" fill="#d6a774" stroke={O} strokeWidth="3" />
        <rect x="-12" y="-26" width="24" height="52" rx="7" fill={PINK} stroke={O} strokeWidth="3" />
        <rect x="-14" y="-18" width="28" height="7" rx="2.5" fill={YELLOW} stroke={O} strokeWidth="2.4" />
        <rect x="-14" y="11" width="28" height="7" rx="2.5" fill={YELLOW} stroke={O} strokeWidth="2.4" />
        <path d="M -6,-8 V 6" stroke="#ffc2e4" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
