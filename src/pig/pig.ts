// The site's one and only pig: original artwork, drawn with an "outline-under" trick
// (thick ink strokes first, flat fills on top) so overlapping parts share one clean silhouette.
// Upgraded with aviation goggles, warm inner ear & belly highlights, and expressive details.

export interface PigColors {
  skin: string;
  deep: string;
  light: string;
  ink: string;
  cheek: string;
  glint: string;
}

/** Colors for in-page SVG: CSS custom properties, so light/dark themes apply. */
export const CSS_PIG: PigColors = {
  skin: 'var(--pig)',
  deep: 'var(--pig-deep)',
  light: 'var(--pig-light)',
  ink: 'var(--pig-ink)',
  cheek: 'var(--pig-cheek)',
  glint: '#fff',
};

/** Literal colors for rasterizing (canvas cannot resolve CSS variables inside an <img>). */
export const RASTER_PIG: PigColors = {
  skin: '#ff9eb6',
  deep: '#ec6b8c',
  light: '#ffd0dc',
  ink: '#231829',
  cheek: '#ff5c8a',
  glint: '#ffffff',
};

const BODY = '<ellipse cx="98" cy="95" rx="68" ry="47"/>';
const HEAD = '<circle cx="158" cy="78" r="37"/>';
const SNOUT = '<ellipse cx="194" cy="86" rx="17" ry="14"/>';
const EAR_NEAR = '<path d="M139 50 L146 16 L168 44 Z"/>';
const EAR_FAR = '<path d="M162 46 L182 22 L184 54 Z"/>';

export function pigMarkup(c: PigColors, className = 'pig-svg'): string {
  const leg = (x: number, y: number, fill: string, cls: string) =>
    `<g class="leg ${cls}">
      <rect x="${x}" y="${y}" width="17" height="30" rx="8" style="fill:${fill};stroke:${c.ink};stroke-width:5"/>
      <path d="M${x + 2} ${y + 23} H${x + 15}" style="stroke:${c.ink};stroke-width:3.5;stroke-linecap:round"/>
    </g>`;
  return `<svg class="${className}" viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <ellipse class="pig-shadow" cx="104" cy="151" rx="62" ry="9" style="fill:${c.ink};opacity:.14"/>
  <g class="pig-tail"><path d="M34 88 C16 78 10 99 23 101 C36 103 34 83 19 83" style="fill:none;stroke:${c.ink};stroke-width:5.5;stroke-linecap:round"/></g>
  <g class="pig-legs">
    ${leg(58, 116, c.deep, 'leg-far leg-back')}
    ${leg(128, 116, c.deep, 'leg-far leg-front')}
  </g>
  <g class="pig-ear-far" style="fill:${c.deep};stroke:${c.ink};stroke-width:5;stroke-linejoin:round">${EAR_FAR}</g>
  <g style="fill:${c.ink};stroke:${c.ink};stroke-width:10;stroke-linejoin:round">${BODY}${HEAD}${SNOUT}</g>
  <g class="pig-legs pig-legs-near">
    ${leg(74, 121, c.skin, 'leg-near leg-back')}
    ${leg(144, 121, c.skin, 'leg-near leg-front')}
  </g>
  <g style="fill:${c.skin}">${BODY}${HEAD}</g>
  <path d="M46 72 C68 54 114 54 134 68" style="fill:none;stroke:${c.light};stroke-width:5;stroke-linecap:round;opacity:.65"/>
  <ellipse cx="92" cy="113" rx="44" ry="19" style="fill:${c.light};opacity:.78"/>
  <g class="pig-head">
    <g style="fill:${c.skin};stroke:${c.ink};stroke-width:5;stroke-linejoin:round">${EAR_NEAR}</g>
    <path d="M144 46 L148 25 L162 42 Z" style="fill:${c.deep};opacity:.65"/>
    <!-- Aviator goggles perched on forehead -->
    <path d="M132 54 Q158 46 188 56" style="fill:none;stroke:${c.ink};stroke-width:4.5;stroke-linecap:round"/>
    <g transform="rotate(-10 165 50)">
      <rect x="148" y="40" width="18" height="14" rx="6" style="fill:#ffc425;stroke:${c.ink};stroke-width:3.5"/>
      <rect x="151" y="42.5" width="12" height="9" rx="3.5" style="fill:#7ec4ff;stroke:${c.ink};stroke-width:2"/>
      <path d="M153 45 L157 45" style="stroke:#fff;stroke-width:2;stroke-linecap:round"/>
      <rect x="167" y="40" width="17" height="14" rx="6" style="fill:#ffc425;stroke:${c.ink};stroke-width:3.5"/>
      <rect x="170" y="42.5" width="11" height="9" rx="3.5" style="fill:#7ec4ff;stroke:${c.ink};stroke-width:2"/>
      <path d="M172 45 L175 45" style="stroke:#fff;stroke-width:2;stroke-linecap:round"/>
    </g>
    <ellipse cx="194" cy="86" rx="17" ry="14" style="fill:${c.deep};stroke:${c.ink};stroke-width:4.5"/>
    <ellipse cx="191" cy="79" rx="8" ry="3" style="fill:${c.light};opacity:.45"/>
    <ellipse cx="189" cy="86" rx="3.2" ry="5.2" style="fill:${c.ink}"/>
    <ellipse cx="199" cy="86" rx="3.2" ry="5.2" style="fill:${c.ink}"/>
    <circle class="pig-eye" cx="166" cy="69" r="5.8" style="fill:${c.ink}"/>
    <circle cx="168" cy="67" r="2" style="fill:${c.glint}"/>
    <circle cx="164.5" cy="71" r="0.9" style="fill:${c.glint};opacity:.8"/>
    <path d="M174 96 Q180 101 185 96" style="fill:none;stroke:${c.ink};stroke-width:3;stroke-linecap:round"/>
    <ellipse cx="162" cy="94" rx="9.5" ry="6" style="fill:${c.cheek};opacity:.65"/>
  </g>
</svg>`;
}

export interface PigHandle {
  /** Positioned wrapper. Animate this to move the pig; append props here to make them ride along. */
  root: HTMLElement;
  svg: SVGSVGElement;
  legs: SVGElement[];
  tail: SVGElement | null;
  head: SVGElement | null;
}

export function createPig(className = 'pig'): PigHandle {
  const root = document.createElement('div');
  root.className = className;
  root.innerHTML = pigMarkup(CSS_PIG); // static, trusted markup
  const svg = root.querySelector('svg') as SVGSVGElement;
  return {
    root,
    svg,
    legs: Array.from(root.querySelectorAll<SVGElement>('.leg')),
    tail: root.querySelector<SVGElement>('.pig-tail'),
    head: root.querySelector<SVGElement>('.pig-head'),
  };
}

/** Rasterize the pig once for canvas use. */
export function loadPigImage(scale = 2): Promise<HTMLImageElement> {
  const svg = pigMarkup(RASTER_PIG).replace('<svg ', `<svg width="${220 * scale}" height="${170 * scale}" `);
  const img = new Image();
  img.decoding = 'async';
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return img.decode().then(() => img);
}
