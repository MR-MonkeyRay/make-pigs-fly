import type { Delegate } from '../i18n/locales/en';

const INK = '#3a2438';
const BLUE = '#0078bf';

function Eye({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r + 3.5} ry={r + 5} fill="#fffef8" stroke={INK} strokeWidth="2.6" />
      <ellipse cx={x + 0.6} cy={y + 1.4} rx={r * 0.95} ry={r * 1.2} fill="#2b1431" />
      <circle cx={x - r * 0.25} cy={y - r * 0.2} r={r * 0.4} fill="#fff" />
    </g>
  );
}

const ART: Record<Delegate, React.ReactNode> = {
  hen: (
    <g>
      <ellipse cx="78" cy="118" rx="46" ry="34" fill="#fffaf0" stroke={INK} strokeWidth="3" />
      <circle cx="88" cy="70" r="30" fill="#fffaf0" stroke={INK} strokeWidth="3" />
      <path d="M72 44 q6 -16 12 -2 q6 -16 12 0 q8 -10 8 6" fill="#f15060" stroke={INK} strokeWidth="2" />
      <Eye x={80} y={66} />
      <path d="M110 66 L140 76 L110 88 Z" fill="#ffe800" stroke={INK} strokeWidth="3" />
      {/* dentures */}
      <rect x="112" y="74" width="22" height="9" rx="2" fill="#fffef8" stroke={INK} strokeWidth="1.5" />
      <path d="M117 74 v9 M122 74 v9 M127 74 v9" stroke={INK} strokeWidth="1" />
      <path d="M112 74 q11 -4 22 0" stroke="#ff7fc0" strokeWidth="3" fill="none" />
    </g>
  ),
  frog: (
    <g>
      <ellipse cx="80" cy="108" rx="54" ry="40" fill="#00a95c" stroke={INK} strokeWidth="3" />
      {/* the wig */}
      <path d="M30 80 C20 40 50 20 80 26 C112 18 142 40 130 80 C126 60 118 50 108 54 C100 40 88 44 80 50 C72 42 58 44 54 54 C42 50 34 62 30 80 Z" fill="#ffe800" stroke={INK} strokeWidth="3" />
      <path d="M44 56 q6 -8 12 0 M70 40 q6 -8 12 0 M98 44 q6 -8 12 0" stroke="#e8a200" strokeWidth="2" fill="none" />
      <Eye x={58} y={86} r={5} />
      <Eye x={102} y={86} r={5} />
      <path d="M50 116 Q80 132 110 116" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M118 46 q4 8 0 10 q-4 -2 0 -10z" fill="#a9d4ee" stroke={BLUE} strokeWidth="1.5" />
    </g>
  ),
  crayfish: (
    <g>
      <path d="M0 160 L60 70 L90 110 L110 84 L160 160 Z" fill="#7a8fb0" stroke={INK} strokeWidth="3" />
      <path d="M54 80 L60 70 L68 82 Z" fill="#fffaf0" />
      <g transform="translate(78 64)">
        <path d="M-30 6 C-30 -14 30 -14 30 6 C30 22 -30 22 -30 6 Z" fill="#f15060" stroke={INK} strokeWidth="3" />
        <path d="M-30 4 C-48 -6 -56 -24 -44 -30 C-36 -22 -38 -12 -30 -4" fill="#f15060" stroke={INK} strokeWidth="3" />
        <path d="M30 4 C48 -6 56 -24 44 -30 C36 -22 38 -12 30 -4" fill="#f15060" stroke={INK} strokeWidth="3" />
        <path d="M-12 -10 l-10 -18 M12 -10 l10 -18" stroke={INK} strokeWidth="2" />
        <circle cx="-10" cy="-2" r="4" fill={INK} />
        <circle cx="10" cy="-2" r="4" fill={INK} />
        {/* whistle */}
        <rect x="-6" y="10" width="20" height="8" rx="3" fill="#ffe800" stroke={INK} strokeWidth="1.5" />
        <text x="22" y="-26" fontFamily="Fraunces, serif" fontWeight="900" fontSize="20" fill={BLUE}>
          ?
        </text>
      </g>
    </g>
  ),
  fish: (
    <g>
      <rect x="66" y="10" width="20" height="150" rx="8" fill="#6e4338" />
      <ellipse cx="76" cy="40" rx="28" ry="40" fill="#00a95c" />
      <ellipse cx="76" cy="40" rx="28" ry="40" fill="none" stroke={BLUE} strokeWidth="2" opacity="0.5" transform="translate(3 3)" />
      <g transform="translate(92 104) rotate(-70)">
        <path d="M-34 0 C-20 -18 18 -18 30 0 C18 18 -20 18 -34 0 Z" fill="#3d9ad6" stroke={INK} strokeWidth="3" />
        <path d="M30 0 L46 -12 L46 12 Z" fill="#3d9ad6" stroke={INK} strokeWidth="3" />
        <circle cx="-20" cy="-4" r="4" fill="#fffef8" stroke={INK} strokeWidth="1.5" />
        <circle cx="-21" cy="-3" r="2" fill={INK} />
      </g>
      <path d="M118 62 q5 9 0 12 q-5 -3 0 -12z M128 78 q4 7 0 10 q-4 -3 0 -10z" fill="#a9d4ee" stroke={BLUE} strokeWidth="1.5" />
    </g>
  ),
  donkey: (
    <g>
      <path d="M40 60 L22 8 L56 46 Z M98 60 L116 8 L82 46 Z" fill="#9aa1ab" stroke={INK} strokeWidth="3" />
      <ellipse cx="70" cy="90" rx="40" ry="46" fill="#b9bec6" stroke={INK} strokeWidth="3" />
      <ellipse cx="70" cy="122" rx="28" ry="18" fill="#e9e4dc" stroke={INK} strokeWidth="2" />
      <circle cx="62" cy="122" r="3" fill={INK} />
      <circle cx="78" cy="122" r="3" fill={INK} />
      <Eye x={52} y={84} />
      <Eye x={88} y={84} />
      {/* cardboard wings, same supplier as the pig v1.0 */}
      <path d="M116 100 L150 64 L156 110 Z" fill="#d6a774" stroke="#6e4338" strokeWidth="2" />
      <path d="M24 100 L-6 70 L-6 112 Z" fill="#d6a774" stroke="#6e4338" strokeWidth="2" transform="translate(10 0)" />
    </g>
  ),
  calf: (
    <g>
      <ellipse cx="80" cy="146" rx="70" ry="12" fill="#a9d4ee" stroke={BLUE} strokeWidth="2" />
      <ellipse cx="80" cy="96" rx="42" ry="30" fill="#fffaf0" stroke={INK} strokeWidth="3" />
      <path d="M60 80 q12 -8 20 4 q-6 12 -20 4z" fill="#925f52" />
      {/* tutu */}
      <path d="M36 104 Q80 140 124 104 L132 116 Q80 152 28 116 Z" fill="#ff9fd0" stroke="#e2288e" strokeWidth="2" />
      <path d="M58 124 L52 142 M100 124 L106 142" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M44 144 L62 144 M96 144 L114 144" stroke={INK} strokeWidth="3" />
      <g transform="translate(114 62)">
        <ellipse cx="0" cy="0" rx="20" ry="18" fill="#fffaf0" stroke={INK} strokeWidth="3" />
        <ellipse cx="10" cy="8" rx="10" ry="7" fill="#ffc2e2" stroke={INK} strokeWidth="1.5" />
        <circle cx="-2" cy="-4" r="3" fill={INK} />
        <path d="M-16 -10 l-8 -4 M-6 -16 l-4 -8" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>
    </g>
  ),
  rooster: (
    <g>
      <ellipse cx="80" cy="140" rx="22" ry="16" fill="#fffef8" stroke={INK} strokeWidth="2" />
      <ellipse cx="70" cy="104" rx="40" ry="28" fill="#f4b183" stroke={INK} strokeWidth="3" />
      <path d="M32 96 C10 70 22 50 36 70 C30 50 44 40 50 70" fill="#00a95c" stroke={INK} strokeWidth="2" />
      <circle cx="98" cy="70" r="22" fill="#f4b183" stroke={INK} strokeWidth="3" />
      <path d="M84 50 q4 -14 10 -2 q4 -14 10 0 q6 -10 8 4" fill="#f15060" stroke={INK} strokeWidth="2" />
      <path d="M118 66 L136 72 L118 80 Z" fill="#ffe800" stroke={INK} strokeWidth="2" />
      <Eye x={100} y={66} r={3.5} />
      <path d="M92 56 l14 4" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <text x="126" y="132" fontFamily="Fraunces, serif" fontWeight="900" fontSize="26" fill={BLUE}>
        ?!
      </text>
    </g>
  ),
  cat: (
    <g>
      <ellipse cx="80" cy="112" rx="46" ry="38" fill={INK} />
      <path d="M38 80 L42 36 L70 66 Z M122 80 L118 36 L90 66 Z" fill={INK} />
      {/* taped-on cardboard horns */}
      <path d="M50 52 L40 14 L64 46 Z M110 52 L120 14 L96 46 Z" fill="#d6a774" stroke="#6e4338" strokeWidth="2" />
      <rect x="44" y="44" width="72" height="8" rx="2" fill="rgba(235,235,225,0.85)" />
      <ellipse cx="62" cy="100" rx="9" ry="10" fill="#ffe800" />
      <ellipse cx="98" cy="100" rx="9" ry="10" fill="#ffe800" />
      <ellipse cx="62" cy="102" rx="3" ry="8" fill={INK} />
      <ellipse cx="98" cy="102" rx="3" ry="8" fill={INK} />
      <path d="M76 120 l4 4 4 -4z" fill="#ff9fd0" />
      <path d="M40 124 h-24 M40 130 l-22 6 M120 124 h24 M120 130 l22 6" stroke="#fffaf0" strokeWidth="1.5" />
    </g>
  ),
  sun: (
    <g>
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M80 6 L86 30 L74 30 Z" fill="#f15060" transform={`rotate(${i * 30} 80 82)`} />
      ))}
      <circle cx="80" cy="82" r="46" fill="#ffe800" stroke={INK} strokeWidth="3" />
      {/* sunglasses */}
      <path d="M46 74 h68" stroke={INK} strokeWidth="3" />
      <rect x="50" y="70" width="24" height="16" rx="6" fill={INK} />
      <rect x="86" y="70" width="24" height="16" rx="6" fill={INK} />
      <path d="M66 104 q14 8 28 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <g transform="translate(16 140)" fontFamily="Space Mono, monospace" fontWeight="700" fontSize="14" fill={BLUE}>
        <text x="0" y="0">W ←</text>
      </g>
    </g>
  ),
};

export function DelegateArt({ id }: { id: Delegate }) {
  return (
    <svg viewBox="0 0 160 160" className="delegate-art" aria-hidden="true">
      <circle cx="80" cy="80" r="78" fill="#fffaf0" />
      <circle cx="83" cy="83" r="76" fill="none" stroke={BLUE} strokeWidth="3" opacity="0.6" />
      <clipPath id={`dc-${id}`}>
        <circle cx="80" cy="80" r="76" />
      </clipPath>
      <g clipPath={`url(#dc-${id})`}>{ART[id]}</g>
      <circle cx="80" cy="80" r="76" fill="none" stroke={INK} strokeWidth="3.6" />
      <path d="M30 40 A62 62 0 0 1 70 18" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
    </svg>
  );
}
