/*
 * PORCUS VOLANS, the newly registered constellation in the finale.
 * CSS (upper.css) draws each <line> in via pathLength=1 + dasharray once the
 * wrapper gets .is-drawn (staggered by --i / --n), twinkles the <circle> stars,
 * and fades the <text> labels in after the lines.
 *
 * IMPORTANT: Ghost atlas art uses only <path> and <ellipse> so it never triggers
 * `.constel line` or `.constel circle` selectors in upper.css.
 */

interface Star {
  x: number;
  y: number;
  r: number;
  sparkle?: boolean;
}

/*
 * Flying pig in profile facing right, gently ascending:
 *  0 snout (α)     1 forehead      2 ear tip        3 ear back / crown
 *  4 chin          5 scarf (δ)     6 wing shoulder  7 mid-back
 *  8 rump          9 hind hip     10 belly         11 chest / front hip
 * 12 back hoof    13 front hoof
 * 14..17 curly tail loop (16 = β tip)
 * 18..21 soaring wing (19 = γ tip)
 */
const STARS: Star[] = [
  { x: 422, y: 210, r: 6.4, sparkle: true }, // 0: α Snout
  { x: 400, y: 184, r: 3.8 }, // 1: forehead
  { x: 372, y: 140, r: 4.8 }, // 2: perky ear tip
  { x: 344, y: 176, r: 3.8 }, // 3: crown / ear back
  { x: 388, y: 238, r: 3.6 }, // 4: jaw / chin
  { x: 344, y: 256, r: 5.4, sparkle: true }, // 5: δ Scarf (neck)
  { x: 274, y: 182, r: 5.0 }, // 6: wing shoulder
  { x: 196, y: 192, r: 4.0 }, // 7: mid-back
  { x: 138, y: 224, r: 4.4 }, // 8: rump
  { x: 158, y: 286, r: 4.0 }, // 9: back hip
  { x: 236, y: 304, r: 4.4 }, // 10: round belly
  { x: 310, y: 290, r: 4.0 }, // 11: chest / front hip
  { x: 144, y: 334, r: 3.6 }, // 12: back hoof
  { x: 326, y: 334, r: 3.6 }, // 13: front hoof
  { x: 106, y: 218, r: 3.4 }, // 14: tail stem
  { x: 86, y: 194, r: 3.6 }, // 15: tail loop top
  { x: 66, y: 214, r: 5.6, sparkle: true }, // 16: β Curly Tail
  { x: 88, y: 232, r: 3.4 }, // 17: tail loop bottom
  { x: 236, y: 134, r: 4.2 }, // 18: wing elbow
  { x: 178, y: 78, r: 6.2, sparkle: true }, // 19: γ Left Wing (borrowed)
  { x: 174, y: 126, r: 4.0 }, // 20: wing mid-feather
  { x: 208, y: 154, r: 3.8 }, // 21: wing trailing feather
];

const LINES: [number, number][] = [
  // Head & perky ear
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 5],
  [3, 5],
  // Back & rump
  [3, 6],
  [6, 7],
  [7, 8],
  // Curly spring tail
  [8, 14],
  [14, 15],
  [15, 16],
  [16, 17],
  [17, 14],
  // Belly & kicking hooves
  [8, 9],
  [9, 12],
  [9, 10],
  [10, 11],
  [11, 13],
  [11, 5],
  // Swept borrowed wing
  [6, 18],
  [18, 19],
  [19, 20],
  [20, 21],
  [21, 7],
  [18, 21],
];

const LABEL_POS: { x: number; y: number; k: number; anchor?: 'start' | 'end' | 'middle' }[] = [
  { x: 436, y: 215, k: 0, anchor: 'start' }, // α Snout
  { x: 22, y: 174, k: 1, anchor: 'start' }, // β Curly Tail
  { x: 194, y: 76, k: 2, anchor: 'start' }, // γ Left Wing (borrowed)
  { x: 364, y: 280, k: 3, anchor: 'start' }, // δ Scarf
];

function Sparkle({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <path
      d={`M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`}
      fill="#fff7b2"
      opacity="0.72"
    />
  );
}

export function Constellation({ labels }: { labels: string[] }) {
  return (
    <svg className="constel" viewBox="0 0 520 420" aria-hidden="true">
      {/* Subtle celestial-atlas grid arcs & faint ghost engraving of the flying pig */}
      <g opacity="0.11" fill="none" stroke="#f4eedf" strokeLinecap="round" strokeLinejoin="round">
        {/* Celestial declination & right-ascension arcs */}
        <path d="M 24,132 Q 260,82 496,132" strokeWidth="1" strokeDasharray="4 7" opacity="0.65" />
        <path d="M 16,282 Q 260,232 504,282" strokeWidth="1" strokeDasharray="4 7" opacity="0.65" />
        <path d="M 140,34 Q 178,210 144,388" strokeWidth="1" strokeDasharray="4 7" opacity="0.55" />
        <path d="M 352,34 Q 388,210 356,388" strokeWidth="1" strokeDasharray="4 7" opacity="0.55" />

        {/* Ghost flying pig silhouette (atlas plate style) */}
        <path
          d="M 144,218 C 166,184 224,174 282,180 C 312,182 332,178 346,174 C 350,152 362,138 374,138 C 384,142 390,162 394,180 C 410,188 424,196 426,210 C 426,226 408,238 388,242 C 374,254 358,262 342,262 C 334,274 324,284 314,292 C 320,310 328,324 330,336 C 320,340 310,334 304,316 C 300,306 296,300 290,298 C 254,312 204,310 168,294 C 162,310 152,328 144,338 C 134,336 132,324 140,304 C 144,294 146,288 144,280 C 130,264 128,238 144,218 Z"
          fill="#f4eedf"
          fillOpacity="0.28"
          strokeWidth="1.6"
        />
        {/* Ghost snout detail & happy closed eye */}
        <ellipse cx="417" cy="212" rx="7" ry="11" strokeWidth="1.3" transform="rotate(-10 417 212)" />
        <path d="M 378,196 Q 386,190 394,196" strokeWidth="1.5" />
        {/* Ghost scarf streaming back from neck star δ */}
        <path
          d="M 344,254 C 326,262 308,262 292,254 C 276,246 258,252 246,262 C 266,264 282,262 296,268 C 314,272 332,268 346,260"
          fill="#ff48b0"
          fillOpacity="0.45"
          strokeWidth="1.3"
        />
        {/* Ghost feathered angel wing */}
        <path
          d="M 274,182 C 260,146 226,100 178,78 C 168,84 168,98 180,106 C 168,112 168,124 180,130 C 174,140 182,152 198,154 C 198,166 216,174 236,170 C 250,176 264,180 274,182 Z"
          fill="#f4eedf"
          fillOpacity="0.32"
          strokeWidth="1.5"
        />
        <path d="M 226,136 C 206,122 190,112 178,106 M 224,150 C 208,142 192,136 180,130" strokeWidth="1.1" />
        {/* Ghost curly spring tail */}
        <path
          d="M 136,224 C 118,224 102,218 94,206 C 86,194 68,198 66,214 C 66,228 84,236 96,226 C 106,218 100,206 90,210"
          strokeWidth="1.6"
        />
      </g>

      {/* Subtle distant background field star crosses (path-only, won't match .constel circle) */}
      <g fill="#f4eedf" opacity="0.28">
        {[
          [48, 86, 3.5],
          [116, 134, 2.8],
          [294, 92, 3.6],
          [462, 118, 3.2],
          [476, 306, 2.8],
          [238, 366, 3.2],
          [64, 342, 2.6],
          [414, 358, 3.0],
        ].map(([x, y, s], i) => (
          <path
            key={i}
            d={`M ${x} ${y - s} L ${x + s * 0.25} ${y - s * 0.25} L ${x + s} ${y} L ${x + s * 0.25} ${y + s * 0.25} L ${x} ${y + s} L ${x - s * 0.25} ${y + s * 0.25} L ${x - s} ${y} L ${x - s * 0.25} ${y - s * 0.25} Z`}
          />
        ))}
      </g>

      {/* Constellation connect-the-dots lines (drawn in by upper.css, staggered via --i / --n) */}
      {LINES.map(([a, b], i) => (
        <line
          key={i}
          x1={STARS[a].x}
          y1={STARS[a].y}
          x2={STARS[b].x}
          y2={STARS[b].y}
          pathLength={1}
          style={{ '--i': i, '--n': LINES.length } as React.CSSProperties}
        />
      ))}

      {/* Decorative 4-point glints on the four primary labelled stars */}
      {STARS.map((s, i) => (s.sparkle ? <Sparkle key={`sp-${i}`} x={s.x} y={s.y} s={s.r * 2.2} /> : null))}

      {/* Constellation stars (filled yellow & twinkled by upper.css) */}
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} style={{ '--i': i } as React.CSSProperties} />
      ))}

      {/* Translated labels for α Snout, β Curly Tail, γ Left Wing, δ Scarf */}
      {LABEL_POS.map(({ x, y, k, anchor }) => (
        <text key={k} x={x} y={y} textAnchor={anchor}>
          {labels[k]}
        </text>
      ))}
    </svg>
  );
}
