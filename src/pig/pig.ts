// The site's one and only pig: storybook-illustrated aviator pig with soft gradient shading,
// warm cocoa-plum ink outlines, fluttering coral aviator scarf, glossy sky goggles, and dainty cloud wings.

export interface PigColors {
  skin: string;
  deep: string;
  light: string;
  ink: string;
  cheek: string;
  glint: string;
  scarf?: string;
  scarfDeep?: string;
}

/** Colors for in-page SVG: CSS custom properties, so light/dark themes apply seamlessly. */
export const CSS_PIG: PigColors = {
  skin: 'var(--pig)',
  deep: 'var(--pig-deep)',
  light: 'var(--pig-light)',
  ink: 'var(--pig-ink)',
  cheek: 'var(--pig-cheek)',
  glint: '#ffffff',
  scarf: '#ff5c7c',
  scarfDeep: '#d9385b',
};

/** Literal colors for rasterizing (canvas cannot resolve CSS variables inside an <img>). */
export const RASTER_PIG: PigColors = {
  skin: '#ffa8c0',
  deep: '#eb7194',
  light: '#ffe0ea',
  ink: '#3a2133',
  cheek: '#ff5d8f',
  glint: '#ffffff',
  scarf: '#ff5c7c',
  scarfDeep: '#d9385b',
};

const BODY = '<ellipse cx="98" cy="96" rx="66" ry="46"/>';
const HEAD = '<circle cx="158" cy="79" r="36"/>';
const SNOUT = '<ellipse cx="193" cy="87" rx="16.5" ry="13.5"/>';
const EAR_NEAR = '<path d="M138 52 C139 30 145 18 151 20 C158 22 165 34 167 46 Z"/>';
const EAR_FAR = '<path d="M162 47 C171 30 180 22 184 25 C188 28 187 42 184 55 Z"/>';

let nextUid = 0;

export function pigMarkup(c: PigColors, className = 'pig-svg', opts: { miniWing?: boolean } = {}): string {
  const id = `mpf-pig-${++nextUid}`;
  const miniWing = opts.miniWing ?? true;
  const scarf = c.scarf ?? c.deep;
  const scarfDeep = c.scarfDeep ?? c.ink;

  const leg = (x: number, y: number, fill: string, cls: string) =>
    `<g class="leg ${cls}">
      <rect x="${x}" y="${y}" width="16" height="29" rx="7.5" style="fill:${fill};stroke:${c.ink};stroke-width:4"/>
      <path d="M${x + 1.5} ${y + 21} Q${x + 8} ${y + 24} ${x + 14.5} ${y + 21} L${x + 14.5} ${y + 24} Q${x + 8} ${y + 29} ${x + 1.5} ${y + 24} Z" style="fill:${c.ink};opacity:.85"/>
    </g>`;

  return `<svg class="${className}" viewBox="0 0 222 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${id}-body" x1="25%" y1="5%" x2="75%" y2="95%">
      <stop offset="0%" stop-color="${c.light}"/>
      <stop offset="42%" stop-color="${c.skin}"/>
      <stop offset="100%" stop-color="${c.deep}"/>
    </linearGradient>
    <radialGradient id="${id}-cheek" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${c.cheek}" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="${c.cheek}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-lens" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d6f3ff"/>
      <stop offset="55%" stop-color="#76c4ff"/>
      <stop offset="100%" stop-color="#4895ef"/>
    </linearGradient>
    <linearGradient id="${id}-rim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffe17d"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="${id}-wing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#eef5ff"/>
    </linearGradient>
  </defs>

  <!-- Soft contact shadow -->
  <ellipse class="pig-shadow" cx="104" cy="153" rx="60" ry="8.5" style="fill:${c.ink};opacity:.12"/>

  <!-- Curly spring tail -->
  <g class="pig-tail">
    <path d="M35 89 C17 77 10 99 23 102 C35 104 34 84 19 84" style="fill:none;stroke:${c.ink};stroke-width:4.5;stroke-linecap:round"/>
    <path d="M35 89 C17 77 10 99 23 102 C35 104 34 84 19 84" style="fill:none;stroke:${c.deep};stroke-width:2.2;stroke-linecap:round;opacity:.55"/>
  </g>

  <!-- Far legs -->
  <g class="pig-legs">
    ${leg(59, 117, c.deep, 'leg-far leg-back')}
    ${leg(128, 117, c.deep, 'leg-far leg-front')}
  </g>

  <!-- Far ear -->
  <g class="pig-ear-far" style="fill:${c.deep};stroke:${c.ink};stroke-width:4;stroke-linejoin:round">${EAR_FAR}</g>

  <!-- Unified clean silhouette outline -->
  <g style="fill:${c.ink};stroke:${c.ink};stroke-width:8;stroke-linejoin:round">${BODY}${HEAD}${SNOUT}</g>

  <!-- Near legs -->
  <g class="pig-legs pig-legs-near">
    ${leg(75, 122, c.skin, 'leg-near leg-back')}
    ${leg(144, 122, c.skin, 'leg-near leg-front')}
  </g>

  <!-- Soft shaded plush body & head -->
  <g style="fill:url(#${id}-body)">${BODY}${HEAD}</g>

  <!-- Warm top sunlit rim & cozy belly highlight -->
  <path d="M52 68 C74 52 114 53 134 66" style="fill:none;stroke:${c.glint};stroke-width:4.5;stroke-linecap:round;opacity:.48"/>
  <ellipse cx="94" cy="116" rx="44" ry="18" style="fill:${c.light};opacity:.52"/>

  <!-- Fluttering aviator scarf trailing cleanly along the neck/belly -->
  <g class="pig-scarf">
    <path d="M128 112 C106 118 92 130 78 125 C86 117 98 110 119 105 Z" style="fill:${scarfDeep};stroke:${c.ink};stroke-width:3.4;stroke-linejoin:round"/>
    <path d="M126 105 C104 109 88 117 75 110 C84 102 100 98 124 97 Z" style="fill:${scarf};stroke:${c.ink};stroke-width:3.4;stroke-linejoin:round"/>
    <path d="M124 92 C133 106 146 113 162 113 C164 107 164 102 160 99 C146 99 136 93 131 84 Z" style="fill:${scarf};stroke:${c.ink};stroke-width:3.4;stroke-linejoin:round"/>
    <path d="M88 107 L99 105" style="stroke:#ffe5ec;stroke-width:2;stroke-linecap:round;opacity:.75"/>
  </g>

  ${
    miniWing
      ? `<!-- Cute perched cloud wing cleanly above the scarf -->
  <g class="pig-wing-mini">
    <path d="M108 79 C99 54 74 47 63 60 C72 63 73 69 63 74 C73 78 76 84 69 88 C84 91 98 89 108 79 Z" style="fill:url(#${id}-wing);stroke:${c.ink};stroke-width:3.5;stroke-linejoin:round"/>
    <path d="M95 76 C86 69 79 66 74 66" style="fill:none;stroke:#c4d8f2;stroke-width:2.2;stroke-linecap:round"/>
  </g>`
      : ''
  }

  <!-- Expressive head details -->
  <g class="pig-head">
    <g style="fill:url(#${id}-body);stroke:${c.ink};stroke-width:4;stroke-linejoin:round">${EAR_NEAR}</g>
    <path d="M144 47 C145 35 148 27 152 28 C156 29 160 37 161 44 Z" style="fill:${c.deep};opacity:.58"/>

    <!-- Aviator goggles perched on forehead -->
    <path d="M132 56 Q158 47 187 57" style="fill:none;stroke:${c.ink};stroke-width:4;stroke-linecap:round"/>
    <g transform="rotate(-9 165 51)">
      <rect x="147" y="40" width="18" height="14" rx="6.5" style="fill:url(#${id}-rim);stroke:${c.ink};stroke-width:3.2"/>
      <rect x="150" y="42.5" width="12" height="9" rx="3.8" style="fill:url(#${id}-lens);stroke:${c.ink};stroke-width:1.8"/>
      <path d="M152.5 48.5 L157.5 44" style="stroke:#ffffff;stroke-width:2.2;stroke-linecap:round;opacity:.9"/>
      <rect x="166.5" y="40" width="17.5" height="14" rx="6.5" style="fill:url(#${id}-rim);stroke:${c.ink};stroke-width:3.2"/>
      <rect x="169.5" y="42.5" width="11.5" height="9" rx="3.8" style="fill:url(#${id}-lens);stroke:${c.ink};stroke-width:1.8"/>
      <path d="M171.5 48.5 L176 44" style="stroke:#ffffff;stroke-width:2.2;stroke-linecap:round;opacity:.9"/>
    </g>

    <!-- Snout with soft sheen -->
    <ellipse cx="193" cy="87" rx="16.5" ry="13.5" style="fill:${c.deep};stroke:${c.ink};stroke-width:4"/>
    <ellipse cx="190" cy="79.5" rx="7.5" ry="2.8" style="fill:${c.glint};opacity:.4"/>
    <ellipse cx="188.5" cy="87" rx="3" ry="4.8" style="fill:${c.ink}"/>
    <ellipse cx="198" cy="87" rx="3" ry="4.8" style="fill:${c.ink}"/>

    <!-- Sparkling eyes -->
    <circle class="pig-eye" cx="166" cy="70" r="6" style="fill:${c.ink}"/>
    <circle cx="168.2" cy="67.8" r="2.2" style="fill:${c.glint}"/>
    <circle cx="164.2" cy="72.2" r="1" style="fill:${c.glint};opacity:.85"/>

    <!-- Warm smile & airbrushed rosy cheek -->
    <path d="M173 96 Q179.5 102 185.5 96.5" style="fill:none;stroke:${c.ink};stroke-width:2.8;stroke-linecap:round"/>
    <ellipse cx="162" cy="92" rx="12" ry="8" style="fill:url(#${id}-cheek)"/>
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
  wing: SVGElement | null;
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
    wing: root.querySelector<SVGElement>('.pig-wing-mini'),
  };
}

/** Rasterize the pig once for canvas use (Hog Wild renders its own animated flapping wings). */
export function loadPigImage(scale = 2): Promise<HTMLImageElement> {
  const svg = pigMarkup(RASTER_PIG, 'pig-svg', { miniWing: false }).replace(
    '<svg ',
    `<svg width="${222 * scale}" height="${172 * scale}" `,
  );
  const img = new Image();
  img.decoding = 'async';
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return img.decode().then(() => img);
}
