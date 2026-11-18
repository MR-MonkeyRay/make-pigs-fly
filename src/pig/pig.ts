// The site's one and only pig: original artwork, drawn with an "outline-under" trick
// (thick ink strokes first, flat fills on top) so overlapping parts share one clean silhouette.

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
  skin: '#ff9fb6',
  deep: '#f0718f',
  light: '#ffc6d3',
  ink: '#2a1e2e',
  cheek: '#ff7398',
  glint: '#ffffff',
};

const BODY = '<ellipse cx="98" cy="95" rx="68" ry="47"/>';
const HEAD = '<circle cx="158" cy="78" r="37"/>';
const SNOUT = '<ellipse cx="194" cy="86" rx="17" ry="14"/>';
const EAR_NEAR = '<path d="M139 50 L146 16 L168 44 Z"/>';
const EAR_FAR = '<path d="M162 46 L182 22 L184 54 Z"/>';

export function pigMarkup(c: PigColors, className = 'pig-svg'): string {
  const leg = (x: number, y: number, fill: string, cls: string) =>
    `<rect class="leg ${cls}" x="${x}" y="${y}" width="17" height="30" rx="8" style="fill:${fill};stroke:${c.ink};stroke-width:5"/>`;
  return `<svg class="${className}" viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <g class="pig-tail"><path d="M34 88 C18 80 12 98 24 100 C36 102 34 84 20 84" style="fill:none;stroke:${c.ink};stroke-width:5;stroke-linecap:round"/></g>
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
  <ellipse cx="90" cy="112" rx="42" ry="19" style="fill:${c.light};opacity:.7"/>
  <g class="pig-head">
    <g style="fill:${c.skin};stroke:${c.ink};stroke-width:5;stroke-linejoin:round">${EAR_NEAR}</g>
    <ellipse cx="194" cy="86" rx="17" ry="14" style="fill:${c.deep};stroke:${c.ink};stroke-width:4"/>
    <ellipse cx="189" cy="86" rx="3" ry="5" style="fill:${c.ink}"/>
    <ellipse cx="199" cy="86" rx="3" ry="5" style="fill:${c.ink}"/>
    <circle class="pig-eye" cx="166" cy="69" r="5.5" style="fill:${c.ink}"/>
    <circle cx="168" cy="67" r="1.8" style="fill:${c.glint}"/>
    <ellipse cx="164" cy="95" rx="9" ry="6" style="fill:${c.cheek};opacity:.55"/>
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
