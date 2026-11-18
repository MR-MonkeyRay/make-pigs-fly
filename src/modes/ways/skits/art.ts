// Original prop artwork for the skits. Static, trusted SVG strings (never mixed with user input).
// Outlines use --art-ink so everything matches the pig.
import { pigMarkup, type PigColors } from '../../../pig/pig';

const INK = 'var(--art-ink)';
const S = (fill: string, w = 4) => `style="fill:${fill};stroke:${INK};stroke-width:${w};stroke-linejoin:round;stroke-linecap:round"`;

export const FAN = `<svg viewBox="0 0 120 170" aria-hidden="true">
  <rect x="53" y="92" width="14" height="58" rx="4" ${S('#8fa3cc')}/>
  <ellipse cx="60" cy="154" rx="38" ry="11" ${S('#8fa3cc')}/>
  <circle cx="60" cy="58" r="52" ${S('#e6f4ff', 5)}/>
  <g class="fan-blades">
    <path d="M60 58 C48 30 66 10 80 22 C90 32 74 50 60 58Z" ${S('#ffc83d', 3.5)}/>
    <path d="M60 58 C48 30 66 10 80 22 C90 32 74 50 60 58Z" transform="rotate(120 60 58)" ${S('#ff9f43', 3.5)}/>
    <path d="M60 58 C48 30 66 10 80 22 C90 32 74 50 60 58Z" transform="rotate(240 60 58)" ${S('#ffc83d', 3.5)}/>
  </g>
  <circle cx="60" cy="58" r="36" style="fill:none;stroke:${INK};stroke-width:2;opacity:.3"/>
  <circle cx="60" cy="58" r="20" style="fill:none;stroke:${INK};stroke-width:2;opacity:.3"/>
  <path d="M60 6V110M8 58H112M23 21L97 95M97 21L23 95" style="stroke:${INK};stroke-width:2;opacity:.25"/>
  <circle cx="60" cy="58" r="10" style="fill:${INK}"/>
</svg>`;

export const SUN = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <g class="sun-rays" style="stroke:${INK};stroke-width:4;stroke-linecap:round">
    ${Array.from({ length: 12 }, (_, i) => `<path d="M50 6V16" transform="rotate(${i * 30} 50 50)" style="stroke:#ffb020"/>`).join('')}
  </g>
  <circle cx="50" cy="50" r="27" ${S('#ffd23f', 4)}/>
  <path d="M38 47q3-4 6 0M56 47q3-4 6 0" style="fill:none;stroke:${INK};stroke-width:3;stroke-linecap:round"/>
  <path d="M41 58q9 7 18 0" style="fill:none;stroke:${INK};stroke-width:3;stroke-linecap:round"/>
  <ellipse cx="36" cy="57" rx="4" ry="2.5" style="fill:#ff8a5c;opacity:.6"/>
  <ellipse cx="64" cy="57" rx="4" ry="2.5" style="fill:#ff8a5c;opacity:.6"/>
</svg>`;

export const HEN = `<svg viewBox="0 0 130 120" aria-hidden="true">
  <path d="M30 100V114M24 114H36M58 100V114M52 114H64" style="fill:none;stroke:#f39c12;stroke-width:5;stroke-linecap:round"/>
  <path d="M18 66 L4 46 L22 52 L12 32 L30 46Z" ${S('#ffffff', 4)}/>
  <ellipse cx="50" cy="72" rx="38" ry="30" ${S('#ffffff', 4.5)}/>
  <path d="M34 70 q16 16 32 0" style="fill:#f4f0ea;stroke:${INK};stroke-width:3.5;stroke-linecap:round"/>
  <path d="M74 28 q4-12 10-4 q4-10 10 0 q6-6 6 6" ${S('#e5484d', 4)}/>
  <circle cx="86" cy="42" r="19" ${S('#ffffff', 4.5)}/>
  <path d="M84 56 q4 10 0 14 q-6-4-2-14Z" ${S('#e5484d', 3)}/>
  <path d="M103 37 L122 44 L103 51Z" ${S('#f6a821', 3.5)}/>
  <g class="hen-teeth" style="opacity:0">
    <rect x="103" y="45" width="7" height="10" rx="1.5" ${S('#ffffff', 2)}/>
    <rect x="110" y="45" width="7" height="10" rx="1.5" ${S('#ffffff', 2)}/>
    <rect x="117" y="45" width="6" height="8" rx="1.5" ${S('#ffffff', 2)}/>
  </g>
  <circle cx="90" cy="38" r="3.5" style="fill:${INK}"/>
</svg>`;

export const COW = `<svg viewBox="0 0 170 120" aria-hidden="true">
  <path d="M30 70 q-22 4 -24 26" style="fill:none;stroke:${INK};stroke-width:4;stroke-linecap:round"/>
  <rect x="40" y="82" width="13" height="30" rx="6" ${S('#ffffff')}/>
  <rect x="58" y="84" width="13" height="30" rx="6" ${S('#ffffff')}/>
  <rect x="96" y="84" width="13" height="30" rx="6" ${S('#ffffff')}/>
  <rect x="114" y="82" width="13" height="30" rx="6" ${S('#ffffff')}/>
  <rect x="26" y="40" width="114" height="56" rx="26" ${S('#ffffff', 4.5)}/>
  <path d="M50 44 q16 -2 14 16 q-12 8 -20 -4Z M92 66 q18 -6 22 10 q-10 12 -24 2Z M70 80 q10 -4 12 6 q-8 6 -12 -6Z" style="fill:${INK}"/>
  <ellipse cx="92" cy="94" rx="10" ry="6" ${S('#ffb3c4', 3)}/>
  <path d="M132 22 l-4 -14 M156 22 l6 -12" style="fill:none;stroke:#e9d8a6;stroke-width:6;stroke-linecap:round"/>
  <path d="M132 22 l-4 -14 M156 22 l6 -12" style="fill:none;stroke:${INK};stroke-width:2;stroke-linecap:round;opacity:.35"/>
  <rect x="122" y="18" width="44" height="46" rx="18" ${S('#ffffff', 4.5)}/>
  <rect x="128" y="44" width="38" height="24" rx="12" ${S('#ffb3c4', 4)}/>
  <circle cx="140" cy="56" r="2.5" style="fill:${INK}"/><circle cx="154" cy="56" r="2.5" style="fill:${INK}"/>
  <circle cx="134" cy="32" r="3.5" style="fill:${INK}"/><circle cx="156" cy="32" r="3.5" style="fill:${INK}"/>
</svg>`;

export const FLAME = `<svg viewBox="0 0 100 120" aria-hidden="true">
  <path d="M50 6 C62 34 90 44 84 80 C80 104 64 114 50 114 C30 114 14 100 16 78 C18 58 34 52 36 34 C44 44 46 54 52 56 C56 40 50 22 50 6Z" ${S('#ff6b3d', 4.5)}/>
  <path d="M52 52 C60 68 72 74 68 92 C66 104 58 108 50 108 C40 108 32 100 34 88 C36 78 44 74 46 64 C50 70 52 72 54 72 C56 66 54 60 52 52Z" style="fill:#ffd23f"/>
</svg>`;

export const EARTH_CHUTE = `<svg viewBox="0 0 120 190" aria-hidden="true">
  <path d="M10 56 C10 22 34 4 60 4 C86 4 110 22 110 56 Q97 46 85 56 Q72 46 60 56 Q48 46 35 56 Q23 46 10 56Z" ${S('#ff6b6f', 4.5)}/>
  <path d="M35 56 Q48 46 60 56 L60 6 C48 8 38 24 35 56Z" style="fill:#ffffff;opacity:.9"/>
  <path d="M85 56 Q72 46 60 56 L60 6 C72 8 82 24 85 56Z" style="fill:#ffffff;opacity:.35"/>
  <path d="M12 56 L46 126 M35 56 L54 122 M85 56 L66 122 M108 56 L74 126" style="stroke:${INK};stroke-width:2.5"/>
  <circle cx="60" cy="150" r="34" ${S('#4aa8ff', 4.5)}/>
  <path d="M38 136 q10 -10 20 -2 q8 8 -2 14 q-12 4 -18 -12Z M66 160 q12 -6 18 4 q-4 12 -16 10 q-8 -6 -2 -14Z M72 128 q6 -2 8 4 q-6 4 -8 -4Z" style="fill:#5fcf6a;stroke:${INK};stroke-width:2.5"/>
  <circle cx="50" cy="146" r="2.5" style="fill:${INK}"/><circle cx="70" cy="146" r="2.5" style="fill:${INK}"/>
  <path d="M54 156 q6 4 12 0" style="fill:none;stroke:${INK};stroke-width:2.5;stroke-linecap:round"/>
</svg>`;

export const BALLOONS = `<svg viewBox="0 0 120 150" aria-hidden="true">
  <path d="M30 56 Q44 110 60 148 M60 50 Q60 100 60 148 M90 56 Q76 110 60 148" style="fill:none;stroke:${INK};stroke-width:2"/>
  <ellipse cx="30" cy="34" rx="22" ry="27" ${S('#ff6b6f', 4)}/>
  <ellipse cx="90" cy="34" rx="22" ry="27" ${S('#ffd23f', 4)}/>
  <ellipse cx="60" cy="26" rx="23" ry="28" ${S('#4aa8ff', 4)}/>
  <ellipse cx="22" cy="24" rx="5" ry="8" style="fill:#fff;opacity:.6"/>
  <ellipse cx="52" cy="16" rx="5" ry="8" style="fill:#fff;opacity:.6"/>
  <ellipse cx="82" cy="24" rx="5" ry="8" style="fill:#fff;opacity:.6"/>
</svg>`;

export const MANUAL = `<svg viewBox="0 0 64 50" aria-hidden="true">
  <rect x="6" y="6" width="52" height="40" rx="5" ${S('#e5484d', 4)}/>
  <rect x="12" y="38" width="42" height="5" style="fill:#fff"/>
  <path d="M32 14V28" style="stroke:#fff;stroke-width:6;stroke-linecap:round"/><circle cx="32" cy="34" r="3" style="fill:#fff"/>
</svg>`;

export const LAPTOP = `<svg viewBox="0 0 76 50" aria-hidden="true">
  <rect x="12" y="4" width="52" height="34" rx="4" ${S('#c7cfdd', 4)}/>
  <rect x="18" y="10" width="40" height="22" rx="2" style="fill:#4aa8ff"/>
  <path d="M4 40H72L66 47H10Z" ${S('#9aa6ba', 4)}/>
</svg>`;

export const SCARF = `<svg viewBox="0 0 80 40" aria-hidden="true">
  <path d="M6 10 Q40 0 74 10 L72 24 Q40 14 8 24Z" ${S('#2fa866', 4)}/>
  <path d="M20 8 L22 22 M36 5 L37 19 M52 6 L52 20" style="stroke:#ffd23f;stroke-width:5"/>
  <path d="M58 22 L62 38 L70 36 L68 20" ${S('#2fa866', 4)}/>
</svg>`;

export const PUDDING = `<svg viewBox="0 0 64 60" aria-hidden="true">
  <ellipse cx="32" cy="52" rx="28" ry="6" ${S('#ffffff', 3.5)}/>
  <path d="M14 50 L18 22 Q32 14 46 22 L50 50Z" ${S('#ffd75e', 4)}/>
  <path d="M17 28 Q18 20 32 18 Q46 20 47 28 Q44 34 40 28 Q36 36 32 28 Q28 34 24 28 Q20 34 17 28Z" ${S('#9a5a2b', 3)}/>
  <circle cx="32" cy="12" r="6" ${S('#e5484d', 3)}/>
  <path d="M32 6 q2 -5 6 -5" style="fill:none;stroke:${INK};stroke-width:2.5;stroke-linecap:round"/>
</svg>`;

export const FENCE = `<svg viewBox="0 0 140 60" aria-hidden="true">
  <path d="M4 26H136M4 44H136" style="stroke:${INK};stroke-width:4"/>
  ${[10, 40, 70, 100, 128]
    .map((x) => `<path d="M${x - 7} 58 V16 L${x} 6 L${x + 7} 16 V58Z" ${S('#fff3e3', 3.5)}/>`)
    .join('')}
</svg>`;

export const TREE = `<svg viewBox="0 0 80 110" aria-hidden="true">
  <rect x="33" y="62" width="14" height="46" rx="4" ${S('#9a5a2b', 4)}/>
  <circle cx="40" cy="40" r="34" ${S('#57ad4b', 4.5)}/>
  <circle cx="28" cy="30" r="8" style="fill:#84d06f"/>
</svg>`;

export const CARDBOARD: PigColors = {
  skin: '#e7c69a',
  deep: '#cfa26d',
  light: '#f3dcbb',
  ink: '#6b4f33',
  cheek: '#d9a66b',
  glint: '#fff7ea',
};

export const MOCK_PIG = pigMarkup(CARDBOARD, 'mock-svg');
