import { useId } from 'react';
import type { Mood } from '../engine/specs';
import './pig.css';

export interface Costume {
  wings?: 'cardboard' | 'feather' | 'none';
  goggles?: boolean;
  scarf?: boolean;
  pillow?: boolean;
  helmet?: boolean;
  jet?: boolean;
  flag?: boolean;
  chute?: boolean;
  undies?: boolean;
  mud?: boolean;
  balloon?: boolean;
}

interface Props {
  mood?: Mood;
  costume?: Costume;
  /** play built-in CSS idle animations (for static copies of the pig) */
  auto?: boolean;
  wave?: boolean;
  wingLabel?: string;
  className?: string;
  title?: string;
  svgRef?: React.Ref<SVGSVGElement>;
}

const on = (v?: boolean) => (v ? '' : undefined);

/* ── Palette (harmonized with riso pink #FF48B0, blue #0078BF, yellow #FFE800, paper #F4EEDF) ── */
const O = '#4a1d3a'; // deep plum outline
const SKIN = '#ffb3d1';
const SHADE = '#f28ab5';
const DEEP = '#d9628f';
const HI = '#fff0f6';
const BOUNCE = '#ffe2d1'; // warm peach-cream bounce light along bottom edges
const NOSTRIL = '#591439';
const HOOF_HI = '#9e5e4b';
const RISO_PINK = '#ff48b0';
const RISO_BLUE = '#0078bf';
const RISO_YELLOW = '#ffe800';

/* ── Organic chibi silhouettes ── */
const BODY_PATH =
  'M 14,-10 C -12,-20 -48,-18 -70,-2 C -86,10 -88,36 -72,52 C -54,66 -12,68 14,56 C 30,48 32,18 14,-10 Z';

const HEAD_PATH =
  'M 26,-64 C 58,-64 82,-44 85,-16 C 89,10 80,34 46,39 C 24,42 -2,39 -18,28 C -32,18 -33,-4 -26,-26 C -19,-48 0,-64 26,-64 Z';

interface Ids {
  bodyClip: string;
  headClip: string;
  eyeA: string;
  eyeB: string;
  skin: string;
  legSkin: string;
  belly: string;
  snout: string;
  iris: string;
  blush: string;
  feather: string;
  featherFar: string;
  card: string;
  flame: string;
  brass: string;
  lens: string;
  glass: string;
  jetWhite: string;
  pillow: string;
  hoof: string;
}

function Leg({ far, ids }: { far?: boolean; ids: Ids }) {
  return (
    <>
      {/* Astro-Boy rocket boot flame (PigActor stretches it with climb speed) */}
      <g className="c c-jet boot-flame">
        <g data-part="flame" className="jet-flame">
          <path d="M -8,26 C -11,40 -5,52 0,62 C 5,52 11,40 8,26 Z" fill={`url(#${ids.flame})`} />
          <path d="M -4.5,27 C -6,36 -2.5,44 0,51 C 2.5,44 6,36 4.5,27 Z" fill="#ffe84d" opacity="0.92" />
          <path d="M -2.4,27 C -3,33 -1.2,38 0,43 C 1.2,38 3,33 2.4,27 Z" fill="#ffffff" opacity="0.95" />
        </g>
      </g>

      {/* Chubby, softly tapered stubby leg — rounded top tucks seamlessly under the belly */}
      <path
        d="M -11.2,-3 C -11,-11 11,-11 11.2,-3 C 11.8,5 10.2,11.5 8.4,17 L -8.4,17 C -10.2,11.5 -11.8,5 -11.2,-3 Z"
        fill={far ? SHADE : `url(#${ids.legSkin})`}
      />
      {!far && (
        <>
          {/* Soft thigh cel shadow on right side & glossy highlight on left */}
          <path d="M 4.4,-1 C 5.4,5.5 5,11 4.2,15" stroke={SHADE} strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.72" />
          <path d="M -5.4,1 C -5.6,6 -5.2,10.5 -4.6,13.5" stroke={HI} strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.88" />
        </>
      )}
      {/* Open-top curved side contours so there is no stiff horizontal bar across the hip */}
      <path
        d="M -10.8,-0.5 C -11.5,5.5 -10,11.5 -8.4,17 M 10.8,-0.5 C 11.5,5.5 10,11.5 8.4,17"
        fill="none"
        stroke={O}
        strokeWidth="3.8"
        strokeLinecap="round"
      />

      {/* Split cocoa hoof */}
      <path
        d="M -8.6,15.5 Q 0,14.2 8.6,15.5 C 9.4,21 7.5,27.5 3.6,28 C 1.4,28.2 0.6,25.4 0,24.2 C -0.6,25.4 -1.4,28.2 -3.6,28 C -7.5,27.5 -9.4,21 -8.6,15.5 Z"
        fill={`url(#${ids.hoof})`}
        stroke={O}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Hoof split crease & glossy specular */}
      <path d="M 0,19.2 L 0,24.8" stroke={O} strokeWidth="2.1" strokeLinecap="round" />
      {!far && <ellipse cx="-4.2" cy="20.5" rx="1.8" ry="2.6" fill={HOOF_HI} opacity="0.78" transform="rotate(-12 -4.2 20.5)" />}

      {/* Rocket boot cuff ring */}
      <g className="c c-jet">
        <path
          d="M -11.4,10.5 C -11.4,8.5 -9.2,7.5 0,7.5 C 9.2,7.5 11.4,8.5 11.4,10.5 L 10.8,16.5 C 10.8,18.2 8.4,19 0,19 C -8.4,19 -10.8,18.2 -10.8,16.5 Z"
          fill={`url(#${ids.jetWhite})`}
          stroke={O}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <path d="M -7.4,11.5 H 7.4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.92" />
        <circle cx="-5.8" cy="14.8" r="1.4" fill="#e8384f" />
        <circle cx="5.8" cy="14.8" r="1.2" fill={O} opacity="0.65" />
      </g>
    </>
  );
}

function Eye({
  part,
  rx,
  ry,
  clip,
  irisGrad,
  side,
}: {
  part: string;
  rx: number;
  ry: number;
  clip: string;
  irisGrad: string;
  side: 'left' | 'right';
}) {
  const dir = side === 'left' ? -1 : 1;
  return (
    <>
      {/* Crisp bright sclera */}
      <ellipse rx={rx} ry={ry} fill="#ffffff" />

      <g clipPath={`url(#${clip})`}>
        {/* Subtle upper eyelid cel shadow across the sclera */}
        <ellipse cx="0" cy={-ry * 0.92} rx={rx * 1.15} ry={ry * 0.42} fill="#e2cbe3" opacity="0.62" />

        {/* Animated sloshing pupil/iris */}
        <g data-part={part}>
          <g className="iris">
            {/* Deep plum-brown gradient iris */}
            <ellipse rx={rx * 0.75} ry={ry * 0.77} fill={`url(#${irisGrad})`} />
            {/* Deep pupil core for strong small-size contrast */}
            <ellipse cx={dir * -0.5} cy={-ry * 0.04} rx={rx * 0.4} ry={ry * 0.44} fill="#140414" />
            {/* Soft warm reflection arc near the bottom of the iris */}
            <path
              d={`M ${-rx * 0.48} ${ry * 0.34} Q 0 ${ry * 0.7} ${rx * 0.48} ${ry * 0.34} Q 0 ${ry * 0.52} ${-rx * 0.48} ${ry * 0.34} Z`}
              fill="#f4a4d8"
              opacity="0.82"
            />
            {/* Standard glossy catch-lights (large top-left, small bottom-right) */}
            <g className="iris-catch-std">
              <ellipse
                cx={-rx * 0.25}
                cy={-ry * 0.27}
                rx={rx * 0.31}
                ry={ry * 0.32}
                fill="#ffffff"
                transform={`rotate(-18 ${-rx * 0.25} ${-ry * 0.27})`}
              />
              <circle cx={rx * 0.28} cy={ry * 0.27} r={rx * 0.15} fill="#ffffff" />
            </g>
            {/* Thrilled mood: dazzling 4-point star catch-lights */}
            <g className="mo mo-thrilled">
              <path
                d={`M ${-rx * 0.14} ${-ry * 0.58} Q ${-rx * 0.14} ${-ry * 0.2} ${rx * 0.24} ${-ry * 0.2} Q ${-rx * 0.14} ${-ry * 0.2} ${-rx * 0.14} ${ry * 0.18} Q ${-rx * 0.14} ${-ry * 0.2} ${-rx * 0.52} ${-ry * 0.2} Q ${-rx * 0.14} ${-ry * 0.2} ${-rx * 0.14} ${-ry * 0.58} Z`}
                fill="#ffffff"
              />
              <circle cx={rx * 0.31} cy={ry * 0.26} r={rx * 0.17} fill="#fff7b2" />
              <circle cx={-rx * 0.34} cy={ry * 0.32} r={rx * 0.1} fill="#ffffff" />
            </g>
          </g>
        </g>

        {/* Smug: heavy half-closed eyelid */}
        <g className="mo mo-smug">
          <path
            d={`M ${-rx - 3} ${-ry - 3} H ${rx + 3} V ${-ry * 0.06} Q 0 ${ry * 0.14} ${-rx - 3} ${-ry * 0.08} Z`}
            fill={SKIN}
          />
          <path
            d={`M ${-rx - 2} ${-ry * 0.16} Q 0 ${ry * 0.06} ${rx + 2} ${-ry * 0.14} V ${-ry * 0.04} Q 0 ${ry * 0.16} ${-rx - 2} ${-ry * 0.06} Z`}
            fill={SHADE}
            opacity="0.75"
          />
        </g>

        {/* Dizzy: crisp hypnotic spirals */}
        <g className="mo mo-dizzy">
          <ellipse rx={rx * 0.92} ry={ry * 0.92} fill="#fff8fc" />
          <path
            d="M 0,0 C 0,-2.4 3,-2.4 3,0 C 3,3.6 -3.6,3.6 -3.6,0 C -3.6,-5.4 5.8,-5.4 5.8,0 C 5.8,7.4 -7.6,7.4 -7.6,0 C -7.6,-9.4 9.2,-9.4 9.2,0"
            fill="none"
            stroke={O}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* Crisp lower & side eye contour (bold enough to read at 110px) */}
      <ellipse rx={rx} ry={ry} fill="none" stroke={O} strokeWidth="2.9" />

      {/* Thick sculpted upper lash line + 3 tiny outer corner lashes (open moods) */}
      <g className="eye-lash-open">
        <path
          d={`M ${-rx * 0.97} ${-ry * 0.26} C ${-rx * 0.74} ${-ry * 1.14} ${rx * 0.74} ${-ry * 1.14} ${rx * 0.97} ${-ry * 0.26} C ${rx * 0.62} ${-ry * 0.84} ${-rx * 0.62} ${-ry * 0.84} ${-rx * 0.97} ${-ry * 0.26} Z`}
          fill={O}
        />
        <g stroke={O} strokeLinecap="round" fill="none">
          <path d={`M ${dir * rx * 0.86} ${-ry * 0.44} L ${dir * (rx + 4.8)} ${-ry * 0.68}`} strokeWidth="2.7" />
          <path d={`M ${dir * rx * 0.95} ${-ry * 0.22} L ${dir * (rx + 5)} ${-ry * 0.34}`} strokeWidth="2.4" />
          <path d={`M ${dir * rx * 0.96} ${-ry * 0.02} L ${dir * (rx + 3.6)} ${-ry * 0.08}`} strokeWidth="2" />
        </g>
      </g>

      {/* Smug thick half-lidded lash line + outer flick lashes */}
      <g className="mo mo-smug">
        <path
          d={`M ${-rx - 1} ${-ry * 0.08} Q 0 ${ry * 0.14} ${rx + 1} ${-ry * 0.06}`}
          stroke={O}
          strokeWidth="4.3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${dir * (rx + 0.5)} ${-ry * 0.08} L ${dir * (rx + 4.8)} ${-ry * 0.28}`}
          stroke={O}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d={`M ${dir * (rx + 0.8)} ${ry * 0.02} L ${dir * (rx + 4.4)} ${-ry * 0.06}`}
          stroke={O}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    </>
  );
}

function FeatherWing({ far, ids }: { far?: boolean; ids: Ids }) {
  const fillGrad = far ? `url(#${ids.featherFar})` : `url(#${ids.feather})`;
  return (
    <g transform={far ? 'scale(0.84)' : undefined}>
      {/* Row 1: Primaries (outer sweeping flight feathers) */}
      <path
        d="M 0,0 C -12,-34 -40,-68 -86,-76 C -94,-77 -96,-64 -86,-57 C -94,-52 -94,-38 -82,-34 C -88,-26 -84,-14 -72,-12 C -74,-4 -66,6 -52,6 C -50,14 -36,15 -22,10 C -12,8 -4,4 0,0 Z"
        fill={fillGrad}
        stroke={O}
        strokeWidth={far ? '3.8' : '4.2'}
        strokeLinejoin="round"
      />
      {/* Subtle primary feather shadow grooves */}
      <g stroke={far ? '#8eb4de' : '#9cc4ec'} strokeWidth="2.1" strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M -46,-42 C -62,-50 -74,-54 -86,-57" />
        <path d="M -42,-28 C -56,-32 -70,-34 -82,-34" />
        <path d="M -36,-15 C -48,-15 -60,-14 -72,-12" />
        <path d="M -28,-4 C -36,0 -44,4 -52,6" />
      </g>

      {/* Soft shadow cast by secondaries onto primaries */}
      <path
        d="M -6,-2 C -18,-26 -38,-44 -62,-52 C -66,-44 -60,-34 -50,-32 C -56,-25 -52,-15 -42,-13 C -45,-6 -39,2 -28,3 C -26,9 -15,10 -6,5 Z"
        fill={far ? '#9dbfe6' : '#bad6f4'}
        opacity="0.65"
        transform="translate(-3 3)"
      />

      {/* Row 2: Secondaries (middle overlapping rounded feathers) */}
      <path
        d="M -4,-4 C -14,-28 -36,-48 -62,-56 C -67,-48 -62,-38 -52,-35 C -58,-28 -54,-18 -44,-16 C -48,-9 -42,0 -30,0 C -30,6 -18,9 -8,4 Z"
        fill={far ? '#eef5ff' : '#ffffff'}
        stroke={O}
        strokeWidth="2.2"
        strokeLinejoin="round"
        opacity="0.96"
      />
      {!far && (
        <path
          d="M -24,-22 C -34,-28 -44,-32 -52,-35 M -22,-13 C -30,-15 -38,-16 -44,-16 M -18,-4 C -22,-2 -26,-1 -30,0"
          stroke="#b0d2f2"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Soft shadow cast by coverts */}
      <path
        d="M 0,0 C -8,-18 -20,-30 -38,-36 C -41,-29 -36,-21 -28,-20 C -31,-14 -26,-7 -18,-7 C -18,-1 -10,3 0,0 Z"
        fill={far ? '#9dbfe6' : '#c2dcf7'}
        opacity="0.65"
        transform="translate(-2.5 2.5)"
      />

      {/* Row 3: Coverts (fluffy shoulder feathers) */}
      <path
        d="M 0,0 C -8,-18 -20,-30 -38,-36 C -41,-29 -36,-21 -28,-20 C -31,-14 -26,-7 -18,-7 C -18,-1 -10,3 0,0 Z"
        fill={far ? '#f5f9ff' : '#ffffff'}
        stroke={O}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Glossy leading-edge highlight */}
      {!far && (
        <path
          d="M -8,-14 C -20,-34 -38,-52 -66,-64"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
      )}
    </g>
  );
}

function CardboardWing({ far, wingLabel, ids }: { far?: boolean; wingLabel?: string; ids: Ids }) {
  if (far) {
    return (
      <g>
        {/* Exposed corrugated edge */}
        <path d="M -10,-50 L -13,-54 L -73,-46 L -70,-42 Z" fill="#80542c" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M -14,-51 L -69,-44" stroke="#4f2d14" strokeWidth="2" strokeDasharray="2.5 3.5" />
        {/* Main far cardboard panel */}
        <path d="M 0,2 L -10,-50 L -70,-42 L -56,6 Z" fill="#b47e49" stroke={O} strokeWidth="3.6" strokeLinejoin="round" />
        <path d="M -10,-32 L -62,-26 M -7,-16 L -58,-10" stroke="#946233" strokeWidth="1.6" strokeDasharray="5 4" opacity="0.7" />
        {/* Tape bit */}
        <rect x="-15" y="-12" width="20" height="8" rx="1" fill="#efe7d4" stroke="#b9ab8e" strokeWidth="1.2" opacity="0.85" transform="rotate(-24 -5 -8)" />
      </g>
    );
  }

  /* Guarantee the full stencil text always stays comfortably inside the box,
     even for long localized labels like "DIESE SEITE OBEN" or "ЭТОЙ СТОРОНОЙ ВВЕРХ". */
  const labelText = `${wingLabel ?? 'THIS SIDE UP'} ↑`;
  const maxTextW = 51;
  const labelFontSize = Math.max(3.8, Math.min(6.0, maxTextW / (Math.max(1, labelText.length) * 0.63)));
  const needsFit = labelText.length * labelFontSize * 0.63 >= maxTextW - 1;

  return (
    <g>
      {/* 3D corrugated cut edges along top and outer-left */}
      <path d="M -12,-56 L -15,-60 L -87,-50 L -84,-46 Z" fill="#9c6a3b" stroke={O} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M -84,-46 L -87,-50 L -71,7 L -68,10 Z" fill="#85562c" stroke={O} strokeWidth="2.6" strokeLinejoin="round" />
      {/* Corrugation flute notches */}
      <path d="M -17,-57.5 L -83,-48.3" stroke="#4f2d14" strokeWidth="2.2" strokeDasharray="2.4 3.4" />
      <path d="M -84.5,-44 L -70,5" stroke="#462610" strokeWidth="2.2" strokeDasharray="2.4 3.4" />

      {/* Main corrugated cardboard face */}
      <path d="M 2,4 L -12,-56 L -84,-46 L -68,10 Z" fill={`url(#${ids.card})`} stroke={O} strokeWidth="3.8" strokeLinejoin="round" />

      {/* Subtle internal corrugation ribs & shoulder fold crease */}
      <g stroke="#ad753d" strokeWidth="1.4" opacity="0.55" fill="none">
        <path d="M -12,-40 L -79,-31" />
        <path d="M -9,-26 L -75,-17" />
        <path d="M -6,-12 L -71,-3" />
      </g>
      <path d="M -13,-52 L -1,1" stroke="#8a592b" strokeWidth="1.6" strokeDasharray="4 4" opacity="0.6" />

      {/* Stamped "FRAGILE" badge + tiny wineglass icon */}
      <g transform="rotate(-8 -54 -35)" opacity="0.84">
        <rect x="-73" y="-42" width="35" height="12.5" rx="1.5" fill="none" stroke="#a62c44" strokeWidth="1.4" />
        {/* Mini fragile glass silhouette */}
        <path
          d="M -70,-39.5 H -65.5 L -66.5,-35.5 Q -67.8,-34.2 -69,-35.5 Z M -67.8,-34.8 V -32 M -69.8,-31.8 H -65.8"
          stroke="#a62c44"
          strokeWidth="1.1"
          fill="#a62c44"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="-63.5" y="-33.8" fontSize="5" fontFamily="Space Mono, monospace" fontWeight="700" fill="#a62c44" letterSpacing="0.2">
          FRAGILE
        </text>
      </g>

      {/* Stencil label — centered with generous margins on both sides */}
      <text
        x="-44"
        y="-14"
        textAnchor="middle"
        fontSize={labelFontSize.toFixed(2)}
        textLength={needsFit ? maxTextW : undefined}
        lengthAdjust={needsFit ? 'spacingAndGlyphs' : undefined}
        fontFamily="Space Mono, monospace"
        fontWeight="700"
        fill="#542c1c"
        transform="rotate(-8 -44 -14)"
      >
        {labelText}
      </text>

      {/* Two strips of translucent packing tape holding the wing onto the pig */}
      <g opacity="0.9">
        {/* Lower shoulder tape strip */}
        <g transform="rotate(-28 -1 -3)">
          <path
            d="M -13,-8.5 L 13,-8.5 L 11.5,-5.5 L 13,-2.5 L 11.5,0.5 L 13,3.5 L -13,3.5 L -11.5,0.5 L -13,-2.5 L -11.5,-5.5 Z"
            fill="#f7f1e0"
            stroke="#bfb296"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M -8,-4.5 H 8" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
        </g>
        {/* Upper shoulder tape strip */}
        <g transform="rotate(16 -13 -46)">
          <path
            d="M -24,-51 L 0,-51 L -1.5,-48 L 0,-45 L -1.5,-42 L 0,-39 L -24,-39 L -22.5,-42 L -24,-45 L -22.5,-48 Z"
            fill="#f7f1e0"
            stroke="#bfb296"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M -19,-47 H -4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        </g>
      </g>
    </g>
  );
}

/**
 * The pig: an original chibi baby-pig mascot in polished modern American 2D animation
 * style — big expressive eyes, soft cel shading with warm bounce light, layered angel or
 * taped cardboard wings, and detailed pop-in costumes. Facing right, centred near (0,0)
 * in a 260×260 viewBox that overflows for the parachute and flag.
 */
export function PigArt({ mood = 'calm', costume = {}, auto, wave, wingLabel = 'THIS SIDE UP', className, title, svgRef }: Props) {
  const uid = useId().replace(/:/g, '');
  const ids: Ids = {
    bodyClip: `bc-${uid}`,
    headClip: `hc-${uid}`,
    eyeA: `ea-${uid}`,
    eyeB: `eb-${uid}`,
    skin: `sk-${uid}`,
    legSkin: `ls-${uid}`,
    belly: `bl-${uid}`,
    snout: `sn-${uid}`,
    iris: `ir-${uid}`,
    blush: `bh-${uid}`,
    feather: `ft-${uid}`,
    featherFar: `ff-${uid}`,
    card: `cd-${uid}`,
    flame: `fg-${uid}`,
    brass: `br-${uid}`,
    lens: `ln-${uid}`,
    glass: `gl-${uid}`,
    jetWhite: `jw-${uid}`,
    pillow: `pl-${uid}`,
    hoof: `hf-${uid}`,
  };
  const wings = costume.wings ?? 'feather';

  return (
    <svg
      ref={svgRef}
      className={`pig${auto ? ' pig--auto' : ''}${wave ? ' pig--wave' : ''}${className ? ` ${className}` : ''}`}
      viewBox="-130 -130 260 260"
      data-mood={mood}
      data-wings={wings}
      data-goggles={on(costume.goggles)}
      data-scarf={on(costume.scarf)}
      data-pillow={on(costume.pillow)}
      data-helmet={on(costume.helmet)}
      data-jet={on(costume.jet)}
      data-flag={on(costume.flag)}
      data-chute={on(costume.chute)}
      data-undies={on(costume.undies)}
      data-mud={on(costume.mud)}
      data-balloon={on(costume.balloon)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <clipPath id={ids.bodyClip}>
          <path d={BODY_PATH} />
        </clipPath>
        <clipPath id={ids.headClip}>
          <path d={HEAD_PATH} />
        </clipPath>
        <clipPath id={ids.eyeA}>
          <ellipse rx="14" ry="18" />
        </clipPath>
        <clipPath id={ids.eyeB}>
          <ellipse rx="12" ry="17" />
        </clipPath>

        {/* Skin, legs, belly, snout, blush, hooves */}
        <linearGradient id={ids.skin} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffc8df" />
          <stop offset="0.55" stopColor={SKIN} />
          <stop offset="1" stopColor="#f99bc2" />
        </linearGradient>
        <linearGradient id={ids.legSkin} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#f798c0" />
          <stop offset="0.32" stopColor={SKIN} />
          <stop offset="1" stopColor="#f590ba" />
        </linearGradient>
        <radialGradient id={ids.belly} cx="0.5" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#fff2f7" />
          <stop offset="0.72" stopColor="#ffdbe9" />
          <stop offset="1" stopColor={SKIN} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.snout} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#ffa9cf" />
          <stop offset="0.55" stopColor="#ff84ba" />
          <stop offset="1" stopColor="#e8629e" />
        </linearGradient>
        <radialGradient id={ids.blush} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff4d94" stopOpacity="0.62" />
          <stop offset="0.6" stopColor="#ff68a6" stopOpacity="0.34" />
          <stop offset="1" stopColor="#ff68a6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.hoof} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#854a3b" />
          <stop offset="0.55" stopColor="#6b3a2e" />
          <stop offset="1" stopColor="#4c251c" />
        </linearGradient>

        {/* Rich high-contrast plum-brown eye iris gradient */}
        <linearGradient id={ids.iris} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#1b071a" />
          <stop offset="0.45" stopColor="#371334" />
          <stop offset="0.82" stopColor="#6a2954" />
          <stop offset="1" stopColor="#944174" />
        </linearGradient>

        {/* Wings */}
        <linearGradient id={ids.feather} x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f0f7ff" />
          <stop offset="1" stopColor="#cde2fa" />
        </linearGradient>
        <linearGradient id={ids.featherFar} x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#eef5ff" />
          <stop offset="0.6" stopColor="#d7e7fb" />
          <stop offset="1" stopColor="#b4d0f0" />
        </linearGradient>
        <linearGradient id={ids.card} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6bc84" />
          <stop offset="0.55" stopColor="#d29c5e" />
          <stop offset="1" stopColor="#b88045" />
        </linearGradient>

        {/* Rocket flame */}
        <linearGradient id={ids.flame} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.24" stopColor="#fff380" />
          <stop offset="0.58" stopColor="#ff9429" />
          <stop offset="0.85" stopColor="#ff4d6d" stopOpacity="0.65" />
          <stop offset="1" stopColor="#ff48b0" stopOpacity="0" />
        </linearGradient>

        {/* Goggles, helmet, rocket boots, pillow */}
        <linearGradient id={ids.brass} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff2a6" />
          <stop offset="0.48" stopColor="#f2ba32" />
          <stop offset="1" stopColor="#b57914" />
        </linearGradient>
        <radialGradient id={ids.lens} cx="0.35" cy="0.3" r="0.72">
          <stop offset="0" stopColor="#e8f9ff" />
          <stop offset="0.45" stopColor="#5ec2ff" />
          <stop offset="1" stopColor={RISO_BLUE} />
        </radialGradient>
        <radialGradient id={ids.glass} cx="0.42" cy="0.36" r="0.64">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="0.65" stopColor="#bfe8ff" stopOpacity="0.12" />
          <stop offset="0.9" stopColor="#85d2ff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#4db6f5" stopOpacity="0.46" />
        </radialGradient>
        <linearGradient id={ids.jetWhite} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#e8effa" />
          <stop offset="1" stopColor="#b6c4dc" />
        </linearGradient>
        <linearGradient id={ids.pillow} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#3ca6e6" />
          <stop offset="0.55" stopColor={RISO_BLUE} />
          <stop offset="1" stopColor="#005288" />
        </linearGradient>
      </defs>

      {/* ── 1. Parachute: giant domed polka-dot underpants ── */}
      <g className="c c-chute">
        <g stroke={O} strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M -54,-6 L -88,-154" />
          <path d="M -20,-14 L -32,-160" />
          <path d="M 16,-16 L 32,-160" />
          <path d="M 48,-12 L 88,-154" />
        </g>
        <g transform="translate(0 -174)">
          <path d="M -92,6 Q -52,-8 0,-6 Q 52,-8 92,6 Q 72,12 58,26 Q 32,14 0,16 Q -32,14 -58,26 Q -72,12 -92,6 Z" fill="#dbe6f2" />
          <path
            d="M -100,-38 Q 0,-70 100,-38 L 94,6 Q 72,10 58,26 Q 32,14 0,16 Q -32,14 -58,26 Q -72,10 -94,6 Z"
            fill="#fffaf0"
            stroke={O}
            strokeWidth="3.8"
            strokeLinejoin="round"
          />
          <path d="M -46,-46 Q -40,-16 -38,14 M 46,-46 Q 40,-16 38,14" stroke="#e8dfd0" strokeWidth="2.4" fill="none" />
          <path d="M -100,-38 Q 0,-70 100,-38 L 98,-23 Q 0,-55 -98,-23 Z" fill={RISO_BLUE} stroke={O} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M -88,-35 Q 0,-63 88,-35" stroke="#5ec2ff" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.7" />
          {[
            [-74, -14, 5.5],
            [-48, -24, 6],
            [-20, -10, 6.2],
            [18, -14, 6.2],
            [50, -24, 6],
            [74, -12, 5.5],
            [-40, 8, 5.8],
            [0, 5, 6.2],
            [40, 8, 5.8],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={RISO_PINK} />
          ))}
          <path d="M -92,2 Q -72,6 -58,20 M 92,2 Q 72,6 58,20" stroke={O} strokeWidth="1.6" strokeDasharray="3 3" fill="none" opacity="0.55" />
        </g>
      </g>

      {/* ── 2. Balloon tethers (1976 inflatable) ── */}
      <g className="c c-balloon">
        <path
          d="M -40,62 C -34,88 -50,104 -40,126 M 10,60 C 16,86 0,106 8,126"
          stroke={O}
          strokeWidth="2.2"
          fill="none"
          strokeDasharray="3.5 3.5"
          strokeLinecap="round"
        />
      </g>

      {/* ── 2b. Knitted scarf tail (behind body & far wing, streaming up-and-back in the wind) ── */}
      <g className="c c-scarf">
        <g data-part="scarfTail">
          <g className="scarf-tail">
            {/* Upper S-curved pennant streamer */}
            <path
              d="M -12,4 C -36,-10 -60,-34 -110,-54 C -106,-46 -108,-40 -114,-35 C -76,-22 -48,-4 -14,12 Z"
              fill={RISO_YELLOW}
            />
            <path
              d="M -112,-38 C -76,-25 -48,-7 -14,9 L -14,12 C -48,-4 -76,-22 -114,-35 Z"
              fill="#e6aa00"
              opacity="0.78"
            />
            <path
              d="M -42,-14 Q -46,-6 -48,1 M -68,-30 Q -72,-22 -74,-16 M -94,-45 Q -97,-37 -99,-30"
              stroke={RISO_PINK}
              strokeWidth="4.6"
              fill="none"
            />
            <path
              d="M -12,4 C -36,-10 -60,-34 -110,-54 C -106,-46 -108,-40 -114,-35 C -76,-22 -48,-4 -14,12 Z"
              fill="none"
              stroke={O}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            {/* Upper streamer fringe */}
            <g stroke={O} strokeWidth="2.3" strokeLinecap="round">
              <path d="M -110,-51 L -121,-55" />
              <path d="M -109,-44 L -120,-46" />
              <path d="M -113,-37 L -123,-38" />
            </g>
            <g stroke={RISO_YELLOW} strokeWidth="1.2" strokeLinecap="round">
              <path d="M -110,-51 L -120,-54.6" />
              <path d="M -113,-37 L -122,-38" />
            </g>
            <path d="M -109,-44 L -119,-45.8" stroke={RISO_PINK} strokeWidth="1.2" strokeLinecap="round" />

            {/* Lower S-curved pennant streamer */}
            <path
              d="M -14,10 C -40,2 -68,-18 -113,-24 C -107,-17 -109,-11 -115,-6 C -78,-2 -48,10 -14,20 Z"
              fill={RISO_YELLOW}
            />
            <path
              d="M -113,-9 C -78,-5 -48,7 -14,17 L -14,20 C -48,10 -78,-2 -115,-6 Z"
              fill="#e6aa00"
              opacity="0.78"
            />
            <path
              d="M -44,0 Q -47,7 -48,14 M -70,-11 Q -73,-4 -74,3 M -96,-20 Q -99,-13 -100,-5"
              stroke={RISO_PINK}
              strokeWidth="4.6"
              fill="none"
            />
            <path
              d="M -14,10 C -40,2 -68,-18 -113,-24 C -107,-17 -109,-11 -115,-6 C -78,-2 -48,10 -14,20 Z"
              fill="none"
              stroke={O}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            {/* Lower streamer fringe */}
            <g stroke={O} strokeWidth="2.3" strokeLinecap="round">
              <path d="M -112,-21 L -123,-24" />
              <path d="M -110,-14 L -121,-15" />
              <path d="M -114,-8 L -124,-7" />
            </g>
            <g stroke={RISO_YELLOW} strokeWidth="1.2" strokeLinecap="round">
              <path d="M -112,-21 L -122,-23.7" />
              <path d="M -114,-8 L -123,-7.1" />
            </g>
            <path d="M -110,-14 L -120,-14.9" stroke={RISO_PINK} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </g>
      </g>

      {/* ── 3. Far wing (behind body) ── */}
      <g transform="translate(-42 -12)">
        <g data-part="wingFar" className="part part--wing">
          <g className="c w-feather">
            <FeatherWing far ids={ids} />
          </g>
          <g className="c w-card">
            <CardboardWing far ids={ids} />
          </g>
        </g>
      </g>

      {/* ── 4. Far legs (behind body) ── */}
      <g transform="translate(-56 48)">
        <g data-part="legBF" className="part part--leg">
          <Leg far ids={ids} />
        </g>
      </g>
      <g transform="translate(0 50)">
        <g data-part="legFF" className="part part--leg">
          <Leg far ids={ids} />
        </g>
      </g>

      {/* ── 6. Springy corkscrew propeller tail (pivot local -10, 8) ── */}
      <g transform="translate(-86 10)">
        <g data-part="tail" className="part part--tail">
          <path
            d="M 4,7 C -2,-4 -18,-6 -22,6 C -26,18 -12,26 -3,19 C 5,13 -2,1 -11,4 C -17,6 -16,13 -10,12"
            fill="none"
            stroke={O}
            strokeWidth="9.2"
            strokeLinecap="round"
          />
          <path
            d="M 4,7 C -2,-4 -18,-6 -22,6 C -26,18 -12,26 -3,19 C 5,13 -2,1 -11,4 C -17,6 -16,13 -10,12"
            fill="none"
            stroke={SKIN}
            strokeWidth="4.4"
            strokeLinecap="round"
          />
          <path
            d="M -2,0 C -11,-4 -20,1 -20,9"
            fill="none"
            stroke={HI}
            strokeWidth="1.7"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>
      </g>

      {/* ── 7. Plump baby-pig bean body ── */}
      <g data-part="body">
        <path d={BODY_PATH} fill={`url(#${ids.skin})`} />
        <g clipPath={`url(#${ids.bodyClip})`}>
          <ellipse cx="-14" cy="46" rx="44" ry="25" fill={`url(#${ids.belly})`} transform="rotate(-8 -14 46)" />
          <path d="M -92,28 C -72,50 -24,56 34,36 L 36,74 L -94,74 Z" fill={SHADE} opacity="0.82" />
          <path d="M -84,48 C -60,64 -18,66 26,48 L 28,74 L -86,74 Z" fill={DEEP} opacity="0.52" />
          <path d="M -64,56 C -42,64 -12,64 12,55" fill="none" stroke={BOUNCE} strokeWidth="4.2" strokeLinecap="round" opacity="0.85" />
          <path d="M -62,-4 C -44,-14 -18,-15 4,-9" fill="none" stroke={HI} strokeWidth="3.2" strokeLinecap="round" opacity="0.78" />
          <ellipse cx="-48" cy="-4" rx="17" ry="7" fill={HI} opacity="0.92" transform="rotate(-12 -48 -4)" />
          <circle cx="-69" cy="6" r="3" fill={HI} opacity="0.9" />

          {/* Mud splotches */}
          <g className="c c-mud">
            <path d="M -68,26 C -62,16 -46,18 -44,30 C -42,40 -54,46 -64,42 C -72,39 -73,32 -68,26 Z" fill="#7c4a36" stroke={O} strokeWidth="1.8" />
            <ellipse cx="-58" cy="31" rx="6" ry="4" fill="#5e3424" opacity="0.65" />
            <circle cx="-63" cy="25" r="2.2" fill="#a8745e" opacity="0.8" />

            <path d="M -26,46 C -20,40 -10,42 -9,49 C -8,55 -16,58 -23,55 C -28,53 -29,49 -26,46 Z" fill="#7c4a36" stroke={O} strokeWidth="1.6" />
            <circle cx="-21" cy="46" r="1.5" fill="#a8745e" opacity="0.75" />

            <path d="M -76,2 C -70,-4 -62,-1 -62,6 C -62,11 -70,13 -75,9 C -78,7 -78,4 -76,2 Z" fill="#693c2b" stroke={O} strokeWidth="1.5" />
            <circle cx="-40" cy="44" r="3.4" fill="#7c4a36" />
            <circle cx="-74" cy="18" r="2.6" fill="#693c2b" />
          </g>
        </g>
        <path d={BODY_PATH} fill="none" stroke={O} strokeWidth="4.3" strokeLinejoin="round" />
      </g>

      {/* ── 9. Knitted scarf neck wrap (tucked naturally under the cheeks) ── */}
      <g className="c c-scarf">
        {/* Soft rounded knitted band wrapped around the neck, partly tucked behind the chubby cheeks */}
        <path
          d="M -27,18 C -27,36 -8,49 24,51 C 48,52 64,41 68,26 C 52,29 34,31 16,31 C -6,31 -19,25 -27,18 Z"
          fill={RISO_YELLOW}
        />
        <path d="M -23,31 C -10,44 12,49 36,48 C 50,47 60,41 65,32" fill="none" stroke="#e5a800" strokeWidth="4.2" strokeLinecap="round" opacity="0.72" />
        {/* Curved pink knit stripes wrapping around the neck */}
        <path
          d="M -13,26 C -15,34 -14,41 -11,45 M 6,32 C 4,39 5,46 8,50 M 25,33 C 24,40 25,47 27,51 M 46,32 C 47,39 47,45 45,49"
          stroke={RISO_PINK}
          strokeWidth="4.6"
          fill="none"
        />
        {/* Cozy knit rib lines */}
        <path d="M -4,32 L -5,44 M 16,35 L 16,47 M 36,35 L 36,47 M 56,33 L 55,42" stroke="#d99b00" strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />
        <path
          d="M -27,18 C -27,36 -8,49 24,51 C 48,52 64,41 68,26"
          fill="none"
          stroke={O}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* ── 10. Big chibi head, soft mirror-symmetric leaf ears, expressive face & headwear ── */}
      <g data-part="head">
        {/* Far ear (soft rounded leaf/teardrop sitting on top-right of head) */}
        <g transform="translate(53 -55)">
          <g data-part="earFar" className="part part--ear">
            <path
              d="M 8,4 C 14,-2 17,-11 16,-19 C 18,-25 16,-32 9,-33 C 1,-34 -6,-27 -10,-16 C -13,-7 -12,0 -9,4 C -4,8 3,8 8,4 Z"
              fill={`url(#${ids.skin})`}
              stroke={O}
              strokeWidth="4.2"
              strokeLinejoin="round"
            />
            <path
              d="M 8,4 C 14,-2 17,-11 16,-19 C 18,-25 16,-32 9,-33 C 1,-34 -6,-27 -10,-16 C -13,-7 -12,0 -9,4 Z"
              fill={SHADE}
              opacity="0.22"
            />
            {/* Smaller soft pink inner ear */}
            <path
              d="M 5,1 C 9,-4 10,-12 8,-18 C 6,-23 1,-24 -3,-18 C -6,-12 -6,-5 -4,1 C -1,3 2,3 5,1 Z"
              fill="#f17bb0"
            />
            <path d="M 6,-14 C 5,-19 1,-21 -2,-17 C 1,-16 4,-14 6,-11 Z" fill={DEEP} opacity="0.45" />
            <path d="M 5,-28 Q -1,-29 -5,-23" stroke={HI} strokeWidth="2.1" strokeLinecap="round" fill="none" opacity="0.65" />
          </g>
        </g>

        {/* Head base + cel shading + bounce light + rim light + specular */}
        <path d={HEAD_PATH} fill={`url(#${ids.skin})`} />
        <g clipPath={`url(#${ids.headClip})`}>
          <path d="M -36,-10 C -26,18 6,34 48,30 C 72,27 86,16 92,4 L 92,48 L -38,48 Z" fill={SHADE} opacity="0.68" />
          <path d="M -26,22 C -4,36 32,40 68,30 L 68,48 L -28,48 Z" fill={DEEP} opacity="0.42" />
          <path d="M -12,29 C 8,38 38,39 62,32" fill="none" stroke={BOUNCE} strokeWidth="4" strokeLinecap="round" opacity="0.82" />
          <path d="M 48,-58 C 68,-50 80,-34 83,-14" fill="none" stroke={HI} strokeWidth="3.4" strokeLinecap="round" opacity="0.78" />
          <ellipse cx="4" cy="-46" rx="16" ry="6.8" fill={HI} opacity="0.94" transform="rotate(-24 4 -46)" />
          <circle cx="-13" cy="-34" r="3.2" fill={HI} opacity="0.92" />
        </g>
        <path d={HEAD_PATH} fill="none" stroke={O} strokeWidth="4.3" strokeLinejoin="round" />

        {/* Forehead cowlick hair tuft */}
        <g>
          <path
            d="M 15,-62 C 8,-70 9,-79 18,-82 C 15,-75 16,-69 21,-64"
            fill={SKIN}
            stroke={O}
            strokeWidth="3.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 17,-62 C 13,-76 25,-85 37,-80 C 44,-77 43,-69 36,-69 C 40,-73 35,-77 29,-74 C 24,-71 25,-64 28,-62"
            fill={SKIN}
            stroke={O}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M 17,-61.5 Q 23,-63 27.5,-61.5" stroke="#ffc6de" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>

        {/* Soft gradient cheeks with glossy hatch strokes */}
        <ellipse cx="-4" cy="12" rx="14" ry="8.5" fill={`url(#${ids.blush})`} />
        <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.92">
          <path d="M -10.5,14 L -8,9.5" />
          <path d="M -5.5,14.8 L -3,10.3" />
          <path d="M -0.5,14.5 L 2,10" />
        </g>
        <ellipse cx="77" cy="10" rx="8.5" ry="5.5" fill={`url(#${ids.blush})`} />
        <g stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" opacity="0.85">
          <path d="M 74.5,11.5 L 76.5,8" />
          <path d="M 78.5,11.5 L 80.5,8" />
        </g>

        {/* Big glossy wide-set vertical oval eyes */}
        <g transform="translate(19 -9)">
          <Eye part="pupilA" rx={14} ry={18} clip={ids.eyeA} irisGrad={ids.iris} side="left" />
        </g>
        <g transform="translate(67 -11)">
          <Eye part="pupilB" rx={12} ry={17} clip={ids.eyeB} irisGrad={ids.iris} side="right" />
        </g>

        {/* Floating expressive eyebrows by mood (bold enough to read clearly at 110px) */}
        <g stroke={O} strokeWidth="4" strokeLinecap="round" fill="none">
          <path className="mo mo-calm" d="M 11,-33 Q 19,-37 28,-33 M 59,-35 Q 67,-39 75,-35" />
          <path className="mo mo-smug" d="M 8,-31 L 28,-30 M 57,-36 Q 67,-43 77,-34" />
          <path className="mo mo-thrilled" d="M 9,-34 Q 19,-42 29,-34 M 57,-36 Q 67,-44 76,-36" />
          <path className="mo mo-panic" d="M 9,-32 L 28,-38 M 57,-39 L 76,-33" />
          <path className="mo mo-realize" d="M 10,-32 Q 20,-35 28,-38 M 57,-39 Q 66,-36 75,-33" />
          <path className="mo mo-dizzy" d="M 10,-34 Q 19,-31 28,-36 M 58,-37 Q 67,-41 75,-35" />
        </g>

        {/* Plump button snout nestled between lower eyes */}
        <ellipse cx="49" cy="14" rx="16.5" ry="10.5" fill={DEEP} opacity="0.28" />
        <ellipse cx="50" cy="10" rx="16.5" ry="11.5" fill={`url(#${ids.snout})`} stroke={O} strokeWidth="3.5" />
        <ellipse cx="47" cy="4.2" rx="7.2" ry="2.8" fill="#ffffff" opacity="0.6" transform="rotate(-6 47 4.2)" />
        <ellipse cx="44.8" cy="10.4" rx="3.1" ry="4.8" fill={NOSTRIL} transform="rotate(-8 44.8 10.4)" />
        <ellipse cx="56.5" cy="10" rx="2.9" ry="4.6" fill={NOSTRIL} transform="rotate(8 56.5 10)" />

        {/* Expressive mouths under the snout */}
        <g stroke={O} strokeWidth="3.4" strokeLinecap="round" fill="none">
          <path className="mo mo-calm" d="M 41,26.5 Q 48,33.2 55,26.5" />
          <path className="mo mo-smug" d="M 38,27.5 Q 48,31.8 58,23.5" />
          <path className="mo mo-smug" d="M 56.5,22.4 Q 59,23 59.6,25.2" strokeWidth="2.4" />
          <path className="mo mo-realize" d="M 39,28.5 Q 43,25.5 47,28.5 T 55,28.5" />
          <path className="mo mo-dizzy" d="M 37,28.5 Q 41,24.5 45,28.5 T 53,28.5 T 60,28.5" />
        </g>
        {/* Thrilled open mouth with cute coral tongue */}
        <g className="mo mo-thrilled">
          <path d="M 37,24 Q 48,40 59,24 Q 48,26 37,24 Z" fill="#63153f" stroke={O} strokeWidth="3.1" strokeLinejoin="round" />
          <path d="M 42,32 Q 48,28 54,32 Q 48,37 42,32 Z" fill="#ff749e" />
          <ellipse cx="47.5" cy="31.5" rx="3" ry="1.2" fill="#ffa8c4" opacity="0.7" />
        </g>
        {/* Panic small "o" mouth */}
        <g className="mo mo-panic">
          <ellipse cx="48" cy="28.5" rx="5.4" ry="6.8" fill="#63153f" stroke={O} strokeWidth="3.1" />
          <ellipse cx="48" cy="31.5" rx="2.6" ry="1.8" fill="#ff749e" opacity="0.88" />
        </g>

        {/* Glossy sweat drops */}
        <g className="mo mo-panic mo-realize">
          <path d="M 81,-40 C 85,-32 88,-28 81,-24 C 74,-28 77,-32 81,-40 Z" fill="#9cdbff" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
          <ellipse cx="79.5" cy="-29.5" rx="1.4" ry="2.6" fill="#ffffff" opacity="0.92" transform="rotate(-12 79.5 -29.5)" />
        </g>
        <g className="mo mo-panic">
          <path d="M -21,-28 C -17,-20 -14,-16 -21,-12 C -28,-16 -25,-20 -21,-28 Z" fill="#9cdbff" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
          <ellipse cx="-22.5" cy="-17.5" rx="1.4" ry="2.6" fill="#ffffff" opacity="0.92" transform="rotate(-12 -22.5 -17.5)" />
        </g>

        {/* Near ear (soft rounded leaf/teardrop sitting on top-left of head, mirror-symmetric with far ear) */}
        <g transform="translate(1 -55)">
          <g data-part="earNear" className="part part--ear">
            {/* Plump rounded leaf/teardrop fill melting smoothly into crown */}
            <path
              d="M -8,4 C -14,-2 -17,-11 -16,-19 C -18,-25 -16,-32 -9,-33 C -1,-34 6,-27 10,-16 C 13,-7 12,0 9,4 C 4,8 -3,8 -8,4 Z"
              fill={`url(#${ids.skin})`}
            />
            {/* Smaller soft pink inner ear */}
            <path
              d="M -5,1 C -9,-4 -10,-12 -8,-18 C -6,-23 -1,-24 3,-18 C 6,-12 6,-5 4,1 C 1,3 -2,3 -5,1 Z"
              fill="#f780b4"
            />
            <path d="M -6,-14 C -5,-19 -1,-21 2,-17 C -1,-16 -4,-14 -6,-11 Z" fill={DEEP} opacity="0.45" />
            {/* Soft glossy highlight along upper rounded arch */}
            <path d="M -5,-28 Q 1,-29 5,-23" stroke={HI} strokeWidth="2.3" strokeLinecap="round" fill="none" opacity="0.85" />
            {/* Open-base outer outline so there are no boxy/straight edges */}
            <path
              d="M -8,4 C -14,-2 -17,-11 -16,-19 C -18,-25 -16,-32 -9,-33 C -1,-34 6,-27 10,-16 C 13,-7 12,0 9,4"
              fill="none"
              stroke={O}
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Delicate curved ear-base fold */}
            <path d="M -4,4 Q 1,6 6,3.5" fill="none" stroke={O} strokeWidth="2" strokeLinecap="round" opacity="0.48" />
          </g>
        </g>

        {/* Vintage aviator goggles pushed up on forehead */}
        <g className="c c-goggles">
          <path d="M -23,-44 Q 28,-70 81,-42" stroke={O} strokeWidth="9.5" fill="none" strokeLinecap="round" />
          <path d="M -23,-44 Q 28,-70 81,-42" stroke="#7d4930" strokeWidth="5.2" fill="none" strokeLinecap="round" />
          <path d="M -18,-46 Q 28,-69 76,-44" stroke="#b57a5a" strokeWidth="1.4" strokeDasharray="3 3.5" fill="none" opacity="0.85" />
          <rect x="-15" y="-54" width="6" height="10" rx="1.8" fill={`url(#${ids.brass})`} stroke={O} strokeWidth="2" transform="rotate(-24 -12 -49)" />
          <rect x="69" y="-52" width="6" height="10" rx="1.8" fill={`url(#${ids.brass})`} stroke={O} strokeWidth="2" transform="rotate(24 72 -47)" />
          <path d="M 35,-55 Q 40,-59 45,-56" stroke={O} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 35,-55 Q 40,-59 45,-56" stroke={`url(#${ids.brass})`} strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <circle cx="24" cy="-54" r="13.5" fill={`url(#${ids.brass})`} stroke={O} strokeWidth="2.8" />
          <circle cx="24" cy="-54" r="9.8" fill={`url(#${ids.lens})`} stroke={O} strokeWidth="2" />
          <path d="M 18,-58 A 7.5 7.5 0 0 1 25,-61.5" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.95" />
          <circle cx="28" cy="-50" r="1.6" fill="#ffffff" opacity="0.8" />
          <circle cx="55" cy="-56" r="12.5" fill={`url(#${ids.brass})`} stroke={O} strokeWidth="2.8" />
          <circle cx="55" cy="-56" r="9" fill={`url(#${ids.lens})`} stroke={O} strokeWidth="2" />
          <path d="M 49.5,-60 A 7 7 0 0 1 56,-63" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.95" />
          <circle cx="58.5" cy="-52.5" r="1.5" fill="#ffffff" opacity="0.8" />
        </g>

        {/* Polka-dot underpants worn on head after crash landing */}
        <g className="c c-undies">
          <path d="M -20,-42 Q 30,-28 80,-40 Q 52,-48 26,-44 Q 0,-48 -20,-42 Z" fill={DEEP} opacity="0.32" />
          <path
            d="M -22,-58 Q 28,-88 82,-58 L 78,-39 Q 62,-44 52,-34 Q 32,-44 12,-36 Q -2,-46 -18,-40 Z"
            fill="#fffaf0"
            stroke={O}
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <path d="M -22,-58 Q 28,-88 82,-58 L 80,-49 Q 28,-78 -20,-49 Z" fill={RISO_BLUE} stroke={O} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M -14,-56 Q 28,-80 74,-56" stroke="#62c3ff" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />
          <circle cx="2" cy="-49" r="4.2" fill={RISO_PINK} />
          <circle cx="28" cy="-56" r="4.6" fill={RISO_PINK} />
          <circle cx="54" cy="-50" r="4.2" fill={RISO_PINK} />
          <circle cx="40" cy="-42" r="3.4" fill={RISO_PINK} />
          <circle cx="14" cy="-43" r="3.2" fill={RISO_PINK} />
        </g>

        {/* Orbiting golden dizzy stars above the head */}
        <g className="mo mo-dizzy">
          <g className="dizzy-orbit">
            <circle cx="28" cy="-98" r="27" fill="none" stroke={RISO_YELLOW} strokeWidth="1.6" strokeDasharray="5 7" opacity="0.65" />
            <path
              d="M 0,-106 L 3,-99 L 10,-98 L 4.8,-93.2 L 6,-86 L 0,-89.4 L -6,-86 L -4.8,-93.2 L -10,-98 L -3,-99 Z"
              fill={RISO_YELLOW}
              stroke={O}
              strokeWidth="2.1"
              strokeLinejoin="round"
            />
            <path
              d="M 56,-102 L 58.6,-96 L 64.6,-95.2 L 60.2,-91 L 61.2,-85 L 56,-87.8 L 50.8,-85 L 51.8,-91 L 47.4,-95.2 L 53.4,-96 Z"
              fill={RISO_YELLOW}
              stroke={O}
              strokeWidth="2.1"
              strokeLinejoin="round"
            />
            <circle cx="28" cy="-124" r="2.6" fill="#ffffff" stroke={O} strokeWidth="1.4" />
            <circle cx="28" cy="-72" r="2.2" fill="#ffffff" stroke={O} strokeWidth="1.4" />
          </g>
        </g>
      </g>

      {/* ── 11. Knitted scarf front knot & tucked end (right under the chin) ── */}
      <g className="c c-scarf">
        {/* Short tucked front end peeking beneath the knot */}
        <path
          d="M 35,45 C 33,53 37,60 46,61 C 50,55 49,48 44,43 Z"
          fill={RISO_YELLOW}
          stroke={O}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M 36,53 L 47,55" stroke={RISO_PINK} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M 38,60 L 37,64 M 43,61 L 44,65" stroke={O} strokeWidth="2" strokeLinecap="round" />
        {/* Plush knitted front knot */}
        <path
          d="M 28,42 C 30,36 42,35 46,41 C 49,46 45,52 38,52 C 30,52 26,47 28,42 Z"
          fill={RISO_YELLOW}
          stroke={O}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path d="M 32,48 C 36,50 42,49 45,45" fill="none" stroke="#e5a800" strokeWidth="2.6" strokeLinecap="round" opacity="0.75" />
        <path d="M 34,39 L 41,49" stroke={RISO_PINK} strokeWidth="3.4" strokeLinecap="round" />
        <path
          d="M 28,42 C 30,36 42,35 46,41 C 49,46 45,52 38,52 C 30,52 26,47 28,42 Z"
          fill="none"
          stroke={O}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
      </g>

      {/* ── 12. Plush U-shaped blue neck pillow with yellow polka dots ── */}
      <g className="c c-pillow">
        <path
          d="M -22,2 C -32,22 -18,48 12,52 C 36,55 56,46 62,34 C 66,26 56,19 49,25 C 42,32 28,37 12,35 C -6,32 -14,18 -8,6 C -5,-1 -18,-5 -22,2 Z"
          fill={`url(#${ids.pillow})`}
          stroke={O}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M -18,12 C -20,26 -10,40 12,43 C 30,45 45,40 53,32" fill="none" stroke="#5ec2ff" strokeWidth="3.2" strokeLinecap="round" opacity="0.55" />
        {[
          [-16, 10, 2.8],
          [-16, 24, 3.1],
          [-6, 36, 3.2],
          [10, 43, 3.3],
          [27, 45, 3.2],
          [43, 41, 3.1],
          [54, 31, 2.7],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={RISO_YELLOW} />
        ))}
        <path d="M 11,36 L 10,41 M -10,20 L -14,22" stroke="#004473" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* ── 13. Fishbowl glass space helmet (over head & collar) ── */}
      <g className="c c-helmet">
        <path
          d="M -27,36 Q 28,66 83,36 L 78,47 Q 28,76 -22,47 Z"
          fill={`url(#${ids.jetWhite})`}
          stroke={O}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path d="M -23,40 Q 28,69 79,40" fill="none" stroke={RISO_BLUE} strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />
        {[-12, 8, 28, 48, 68].map((bx, i) => (
          <circle key={i} cx={bx} cy={47 + (i === 2 ? 9 : i === 1 || i === 3 ? 6 : 0)} r="2.2" fill="#4f566e" stroke={O} strokeWidth="1.2" />
        ))}
        <circle cx="28" cy="-20" r="79" fill={`url(#${ids.glass})`} stroke="#3ca0e0" strokeWidth="4.4" />
        <circle cx="28" cy="-20" r="79" fill="none" stroke={O} strokeWidth="1.9" opacity="0.65" />
        <path d="M -26,-63 A 67 67 0 0 1 20,-90" stroke="#ffffff" strokeWidth="7.5" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M -32,-44 A 67 67 0 0 1 -29,-53" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.85" />
        <path d="M 80,23 A 67 67 0 0 1 63,38" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.65" />
      </g>

      {/* ── 14. Near legs (in front of body) ── */}
      <g transform="translate(-38 54)">
        <g data-part="legBN" className="part part--leg">
          <Leg ids={ids} />
        </g>
      </g>
      <g transform="translate(18 53)">
        <g data-part="legFN" className="part part--leg part--wave">
          <Leg ids={ids} />
        </g>
      </g>

      {/* ── 15. Flag planted beside the pig ── */}
      <g className="c c-flag">
        <path d="M 110,76 L 110,-112" stroke={O} strokeWidth="6" strokeLinecap="round" />
        <path d="M 110,76 L 110,-112" stroke="#dce3f0" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="110" cy="-115" r="5" fill={RISO_YELLOW} stroke={O} strokeWidth="2.4" />
        <circle cx="108.5" cy="-116.5" r="1.5" fill="#ffffff" />

        <g className="flag-cloth">
          <path
            d="M 110,-110 Q 130,-118 146,-110 T 180,-110 L 180,-66 Q 162,-74 146,-66 T 110,-66 Z"
            fill="#fffaf0"
            stroke={O}
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <path d="M 144,-109 Q 150,-88 144,-67 L 156,-69 Q 160,-88 156,-111 Z" fill="#efe6d6" opacity="0.8" />
          <path d="M 112,-104 Q 130,-111 146,-104 T 178,-104" stroke={RISO_PINK} strokeWidth="2.4" fill="none" opacity="0.8" />
          <path d="M 112,-72 Q 130,-79 146,-72 T 178,-72" stroke={RISO_PINK} strokeWidth="2.4" fill="none" opacity="0.8" />
          <ellipse cx="145" cy="-88" rx="14.5" ry="11" fill={`url(#${ids.snout})`} stroke={O} strokeWidth="2.8" />
          <ellipse cx="142" cy="-93" rx="5.5" ry="2.2" fill="#ffffff" opacity="0.55" />
          <ellipse cx="140" cy="-88" rx="2.5" ry="3.8" fill={NOSTRIL} />
          <ellipse cx="150" cy="-88" rx="2.5" ry="3.8" fill={NOSTRIL} />
        </g>
      </g>

      {/* ── 16. Near wing (layered angel wing or home-made cardboard wing) ── */}
      <g transform="translate(-34 -2)">
        <g data-part="wingNear" className="part part--wing">
          <g className="c w-feather">
            <FeatherWing ids={ids} />
          </g>
          <g className="c w-card">
            <CardboardWing wingLabel={wingLabel} ids={ids} />
          </g>
        </g>
      </g>
    </svg>
  );
}
