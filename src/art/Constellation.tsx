/*
 * PORCUS VOLANS, the newly registered constellation in the finale.
 * CSS (upper.css) draws each line in with --q via pathLength=1 + dasharray,
 * staggered by --i / --n, twinkles the circles and fades the labels in.
 */

const STARS: [number, number][] = [
  [120, 300],
  [190, 250],
  [300, 240],
  [390, 268],
  [430, 210],
  [470, 250],
  [455, 300],
  [380, 340],
  [250, 350],
  [170, 330],
  [240, 180],
  [300, 120],
  [60, 300],
];
const LINES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 3],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 0],
  [2, 10],
  [10, 11],
  [0, 12],
];

export function Constellation({ labels }: { labels: string[] }) {
  return (
    <svg className="constel" viewBox="0 0 520 420" aria-hidden="true">
      {LINES.map(([a, b], i) => (
        <line
          key={i}
          x1={STARS[a][0]}
          y1={STARS[a][1]}
          x2={STARS[b][0]}
          y2={STARS[b][1]}
          pathLength={1}
          style={{ '--i': i, '--n': LINES.length } as React.CSSProperties}
        />
      ))}
      {STARS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 4 || i === 0 ? 6 : 4} style={{ '--i': i } as React.CSSProperties} />
      ))}
      {[
        [470, 250, 0],
        [60, 300, 1],
        [300, 120, 2],
        [380, 340, 3],
      ].map(([x, y, k]) => (
        <text key={k} x={x + 10} y={y - 10}>
          {labels[k]}
        </text>
      ))}
    </svg>
  );
}
