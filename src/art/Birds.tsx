import { useId } from 'react';
import './birds.css';

/*
 * The "Sky Locals" group chat, in person: the four chatters perched on the
 * rooftops of the birds floor, drawn in viewBox units of <Rooftops> (the strip
 * is 220 tall). Each bird is drawn facing right with its feet at (0, 0).
 *
 * They act with the chat: whoever just posted hops and opens its beak, Linda's
 * camera flashes on her photo, and when "Gary left the group" lands, Gary
 * takes off. Gary, Linda and the Goose watch the pig, so they turn to face
 * left on phones, where he flies left of them; Steve only cares about fries.
 */

const O = '#3a2438';

type Uid = { uid: string };

function useUid(): string {
  return useId().replace(/[^a-zA-Z0-9_-]/g, '');
}

/** ink outline under an orange foot stroke */
function Feet({ d, color = '#f0981c' }: { d: string; color?: string }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={O} strokeWidth="3.8" />
      <path d={d} stroke={color} strokeWidth="2" />
    </g>
  );
}

/* ───────────── Gary · rock pigeon, panicking ───────────── */

function GaryArt({ uid, extra }: Uid & { extra?: boolean }) {
  const body = extra ? ['#a4b2c9', '#7d8ca7', '#5e6c88'] : ['#8fa1c0', '#61739a', '#3f4c6b'];
  return (
    <g>
      <defs>
        <linearGradient id={`gb-${uid}`} x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor={body[0]} />
          <stop offset="0.55" stopColor={body[1]} />
          <stop offset="1" stopColor={body[2]} />
        </linearGradient>
        <linearGradient id={`gh-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={extra ? '#b9c5d9' : '#a9bbd8'} />
          <stop offset="1" stopColor={extra ? '#8794ac' : '#6c7fa4'} />
        </linearGradient>
        <linearGradient id={`gn-${uid}`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor={extra ? '#5fc7a6' : '#2ee6a8'} />
          <stop offset="0.5" stopColor={extra ? '#4aa491' : '#16b89e'} />
          <stop offset="1" stopColor={extra ? '#b7779f' : '#eb4db8'} />
        </linearGradient>
      </defs>

      <Feet d="M -3,-4 V -0.5 M -6,0 H -0.5 M 4,-4 V -0.5 M 1.5,0 H 7" />

      {/* tail, with the dark band of a rock pigeon */}
      <path d="M -12,-13 L -27,-10 L -25.5,-4.5 L -11,-6.5 Z" fill={body[2]} stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M -23.6,-10.4 L -22.4,-5" stroke="#252c42" strokeWidth="3.2" />

      {/* flight wings: only shown while he leaves */}
      <g className="bird__flight">
        <path
          className="bird__flap"
          d="M -8,-20 C -16,-34 -22,-44 -16,-50 C -10,-44 -4,-34 2,-24 Z"
          fill="#9fb0cd"
          stroke={O}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path className="bird__flap" d="M -12,-36 L -6,-30 M -16,-43 L -9,-36" stroke="#252c42" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* plump pear body */}
      <path
        d="M -16,-12 C -17,-24 -6,-30 5,-28 C 13,-26.5 17,-19 15,-11 C 13,-4.5 6,-2.5 -2,-2.5 C -10,-2.5 -15.5,-6 -16,-12 Z"
        fill={`url(#gb-${uid})`}
        stroke={O}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* cel shade under the belly */}
      <path d="M -14.5,-8 C -8,-4 6,-3.6 13.2,-8.4 C 11,-4.6 5,-3 -2,-3 C -8.6,-3 -12.6,-4.8 -14.5,-8 Z" fill="#2b3550" opacity="0.4" />

      {/* folded wing with two black bars, lifted off his side in panic */}
      <g className="bird__wing">
        <path
          d="M -16,-16 C -11,-25.5 2,-25.5 8.5,-18 C 6.5,-11.5 -2,-8.5 -10,-9 C -13.5,-9.6 -16,-12 -16,-16 Z"
          fill={extra ? '#b4c0d4' : '#a7b8d4'}
          stroke={O}
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <path d="M -9,-20 C -6.4,-16 -5.6,-12.6 -6.6,-9.6 M -3,-21.6 C -0.4,-17 0.6,-13.6 -0.4,-10.2" stroke="#252c42" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M -13.5,-17.5 C -10,-22.5 -4,-23.6 1,-22.6" stroke="#e1e9f6" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>

      {/* iridescent neck */}
      <path
        d="M 1,-26.5 C 5,-30.5 13,-30 16,-26 C 15,-22 10,-20.5 5,-21.5 C 2,-22.5 0.5,-24.2 1,-26.5 Z"
        fill={`url(#gn-${uid})`}
        stroke={O}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path d="M 4,-25 Q 9,-22.6 13.4,-25.4" stroke="#b9ffe6" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.85" />

      <g className="bird__head">
        {/* crown tuft, ruffled by the shock */}
        {!extra && (
          <path
            d="M 5.6,-41.6 L 4.4,-47.4 L 7.8,-44.2 L 9.2,-49.6 L 10.8,-44 L 14,-46.8 L 13.2,-41.2 Z"
            fill="#7e90b2"
            stroke={O}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        )}
        <circle cx="10" cy="-35" r="9" fill={`url(#gh-${uid})`} stroke={O} strokeWidth="2.8" />
        <ellipse cx="6.4" cy="-40" rx="2.8" ry="1.3" fill="#ffffff" opacity="0.55" transform="rotate(-28 6.4 -40)" />
        <ellipse cx="13.4" cy="-30.4" rx="2.3" ry="1.1" fill="#ff8fb8" opacity="0.55" />

        {extra ? (
          // a bystander: calm, half asleep
          <>
            <path d="M 11.6,-36.4 Q 14,-34.4 16.4,-36.4" stroke={O} strokeWidth="1.7" fill="none" strokeLinecap="round" />
            <path d="M 7,-37 Q 8.4,-35.6 9.8,-37" stroke={O} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          // saucer eyes, the far one a size smaller, both fixed on the pig above
          <>
            <circle cx="7.6" cy="-36.4" r="3.2" fill="#fffaf0" stroke={O} strokeWidth="1.5" />
            <circle cx="8.4" cy="-37.6" r="1.4" fill={O} />
            <circle cx="14" cy="-36.2" r="4.3" fill="#fffaf0" stroke={O} strokeWidth="1.7" />
            <circle cx="15.2" cy="-37.9" r="1.9" fill={O} />
            <circle cx="15.8" cy="-38.6" r="0.65" fill="#ffffff" />
          </>
        )}

        {/* beak with the white cere of a pigeon; the open one is for posting */}
        <g className="bird__beak">
          <path d="M 17.6,-33.4 L 24.6,-31.6 L 17.6,-29.6 Z" fill="#4f566b" stroke={O} strokeWidth="1.5" strokeLinejoin="round" />
        </g>
        <g className="bird__beak-open">
          <path d="M 17.4,-34 L 25.4,-36 L 18,-31.4 Z" fill="#4f566b" stroke={O} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 17.6,-31 L 23.4,-27.2 L 17.4,-29 Z" fill="#4f566b" stroke={O} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 18,-31.4 L 22.4,-30 L 17.8,-29.6 Z" fill="#c21f56" />
        </g>
        <ellipse cx="18.4" cy="-33" rx="1.7" ry="1.15" fill="#ffffff" stroke={O} strokeWidth="0.9" />

        {!extra && (
          <path className="bird__sweat" d="M 0.6,-45 C -1,-42.2 -1.4,-40.6 0.4,-39.6 C 2,-38.9 3,-40.6 2.2,-42.4 Z" fill="#38b6ff" stroke={O} strokeWidth="1.1" />
        )}
      </g>
    </g>
  );
}

/* ───────────── Steve · herring gull, deadpan, fries ───────────── */

function SteveArt({ uid }: Uid) {
  return (
    <g>
      <defs>
        <linearGradient id={`sb-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f3f6fb" />
          <stop offset="1" stopColor="#cad7ec" />
        </linearGradient>
        <linearGradient id={`sk-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd23f" />
          <stop offset="1" stopColor="#ff9b1a" />
        </linearGradient>
      </defs>

      <Feet d="M -4,-4 V -0.5 M -7.5,0 H -0.5 M 4,-4 V -0.5 M 0.5,0 H 7.5" color="#f4a2a0" />

      {/* barrel body */}
      <path
        d="M -15,-11 C -17,-25 -6,-33 6,-31 C 15,-29.5 18,-21 16,-12 C 14.5,-4.5 7,-2 -1,-2 C -9,-2 -14,-5.5 -15,-11 Z"
        fill={`url(#sb-${uid})`}
        stroke={O}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M -13.5,-7.6 C -6,-3.2 8,-3 14.4,-8.2 C 12.4,-4.2 6,-2.4 -1,-2.4 C -7.6,-2.4 -11.6,-4.4 -13.5,-7.6 Z" fill="#9fb2d0" opacity="0.4" />

      {/* slate mantle folded down the back into black wingtips with white mirrors */}
      <path
        d="M -15,-18 C -10,-27.5 4,-28.5 10,-21.5 C 8,-14.5 0,-10.5 -9,-9.4 L -25.4,-6.2 C -27,-5.9 -27.4,-7.8 -25.8,-8.6 Z"
        fill="#8c9db5"
        stroke={O}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M -16.4,-8 L -25.4,-6.2 C -27,-5.9 -27.4,-7.8 -25.8,-8.6 L -18,-11.4 Z" fill="#262b3a" />
      <circle cx="-23.2" cy="-7.3" r="0.95" fill="#ffffff" />
      <circle cx="-20" cy="-8.4" r="0.8" fill="#ffffff" />
      <path d="M -12,-12.6 C -5,-13.4 2,-15.2 7.2,-19.6" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85" />

      <g className="bird__head">
        <circle cx="8" cy="-37" r="10.4" fill={`url(#sb-${uid})`} stroke={O} strokeWidth="2.8" />
        {/* winter streaks */}
        <path d="M 2.6,-41.4 l 2.2,1 M 1.8,-37.6 l 2.2,1 M 5,-44.6 l 2.2,0.6" stroke="#b5c1d4" strokeWidth="1.1" strokeLinecap="round" />
        <ellipse cx="4.6" cy="-42.4" rx="2.6" ry="1.2" fill="#ffffff" opacity="0.9" transform="rotate(-30 4.6 -42.4)" />
        {/* the half-lidded stare, dead level */}
        <circle cx="12.6" cy="-38.4" r="3.4" fill="#fffaf0" stroke={O} strokeWidth="1.5" />
        <circle cx="13.8" cy="-37.9" r="1.5" fill={O} />
        <path d="M 9.1,-38.4 A 3.5,3.5 0 0 1 16.1,-38.4 Z" fill="#dfe6f1" stroke={O} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M 8.8,-42.6 L 16.6,-41.6" stroke={O} strokeWidth="1.9" strokeLinecap="round" />

        {/* hooked yellow bill with the red spot */}
        <g className="bird__beak">
          <path
            d="M 16.4,-37.6 L 26,-36.2 C 28.4,-35.8 28.6,-33.4 26.4,-33.1 L 16.6,-32.8 Z"
            fill={`url(#sk-${uid})`}
            stroke={O}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M 17,-34.7 L 24.6,-34.5" stroke={O} strokeWidth="1" strokeLinecap="round" />
          <circle cx="23.6" cy="-33.6" r="1.25" fill="#f1384b" />
        </g>
        {/* the fry */}
        <g className="bird__fry" transform="translate(25.6 -34.6) rotate(-42)">
          <rect x="0" y="-1.7" width="14" height="3.4" rx="0.7" fill="#ffe97a" stroke={O} strokeWidth="1.4" />
          <rect x="11.4" y="-1.7" width="2.6" height="3.4" rx="0.6" fill="#f1384b" stroke={O} strokeWidth="1.4" />
          <path d="M 2,-0.4 H 9.4" stroke="#d98018" strokeWidth="0.9" opacity="0.7" />
        </g>
      </g>
    </g>
  );
}

/* ───────────── Linda · crow, press photographer ───────────── */

function LindaArt({ uid }: Uid) {
  return (
    <g>
      <defs>
        <linearGradient id={`lb-${uid}`} x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#6573a3" />
          <stop offset="0.5" stopColor="#3c4366" />
          <stop offset="1" stopColor="#1e2036" />
        </linearGradient>
        <linearGradient id={`lk-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c6d4f4" />
          <stop offset="1" stopColor="#7787b3" />
        </linearGradient>
      </defs>

      <Feet d="M -3,-4 V -0.5 M -6.5,0 H -0.5 M 4,-4 V -0.5 M 1,0 H 7" color="#4b5270" />

      {/* long notched tail */}
      <path
        d="M -11,-11 L -29,-6.4 L -27.4,-3.2 L -24.4,-4.6 L -22.4,-1.8 L -9.6,-6.6 Z"
        fill="#1e2036"
        stroke={O}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* sleek wedge body */}
      <path
        d="M -14,-13 C -14,-24 -5,-30 5,-29 C 13,-28 16,-21 14,-13 C 12,-6 5,-3 -3,-3 C -9,-3 -13.5,-7 -14,-13 Z"
        fill={`url(#lb-${uid})`}
        stroke={O}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M -9,-23.4 C -4,-27.4 3,-27.8 7.4,-25.6" stroke="#b8cbff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* folded wing */}
      <path
        d="M -13,-17 C -8,-26 4,-26 9,-19 C 6,-12 -2,-9 -12,-9.6 L -21,-6.2 C -22.2,-6 -22.4,-7.6 -21.2,-8.2 Z"
        fill="#2c3352"
        stroke={O}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path d="M -6,-15 L -14,-9.8 M -1,-16.6 L -9,-10.6" stroke="#5a69a3" strokeWidth="1.2" strokeLinecap="round" />

      {/* camera on a hot-pink strap */}
      <path d="M 1.6,-28 C -1.4,-22 -1,-17 3,-14.4 M 12.6,-27 C 13.6,-22 12.6,-18 10.6,-15" stroke="#ff48b0" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <g transform="translate(5 -17)">
        <rect x="-1" y="-4.6" width="13.4" height="9.2" rx="2" fill="#fffaf0" stroke={O} strokeWidth="1.7" />
        <rect x="1.4" y="-6.8" width="4.2" height="2.6" rx="0.8" fill="#fffaf0" stroke={O} strokeWidth="1.3" />
        <rect x="8.8" y="-3.4" width="2.4" height="1.6" fill="#ffe800" stroke={O} strokeWidth="0.7" />
        <circle cx="5.6" cy="0.2" r="3.4" fill="#0078bf" stroke={O} strokeWidth="1.5" />
        <circle cx="4.7" cy="-0.8" r="1.15" fill="#7cd8ff" />
      </g>

      <g className="bird__head">
        <circle cx="9" cy="-35.6" r="8.6" fill={`url(#lb-${uid})`} stroke={O} strokeWidth="2.8" />
        <path d="M 3.4,-40 C 6,-43.6 11,-44 14,-41.6" stroke="#b8cbff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75" />
        {/* flat, unimpressed lid */}
        <circle cx="12.6" cy="-36.8" r="2.9" fill="#fffaf0" stroke={O} strokeWidth="1.4" />
        <circle cx="13.4" cy="-36.4" r="1.35" fill={O} />
        <path d="M 9.6,-37.2 A 3,3 0 0 1 15.6,-37.2 Z" fill="#3c4366" stroke={O} strokeWidth="1.3" strokeLinejoin="round" />
        <g className="bird__beak">
          <path
            d="M 15.4,-37.8 L 28.6,-35.2 C 29.6,-35 29.5,-33.6 28.5,-33.5 L 15.6,-31.6 Z"
            fill={`url(#lk-${uid})`}
            stroke={O}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M 16,-34.6 L 26,-34.2" stroke={O} strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
        </g>
      </g>

      {/* the flash, shown for a blink when her photo lands */}
      <g transform="translate(15 -20.4)">
        <g className="bird__flash">
          <path d="M 0,-11 L 2,-2 L 11,0 L 2,2 L 0,11 L -2,2 L -11,0 L -2,-2 Z" fill="#fffaf0" stroke="#ffe800" strokeWidth="1.3" strokeLinejoin="round" />
          <circle r="3.2" fill="#ffffff" />
        </g>
      </g>
    </g>
  );
}

/* ───────────── The Goose · admin ───────────── */

function GooseArt({ uid }: Uid) {
  return (
    <g>
      <defs>
        <linearGradient id={`ob-${uid}`} x1="0.15" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f8f6f0" />
          <stop offset="1" stopColor="#cfdcec" />
        </linearGradient>
        <linearGradient id={`ok-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb340" />
          <stop offset="1" stopColor="#ff7c1a" />
        </linearGradient>
        <linearGradient id={`oc-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff380" />
          <stop offset="1" stopColor="#ffd400" />
        </linearGradient>
      </defs>

      <Feet d="M -5,-8 V -1 M 4,-8 V -1" color="#ff8f22" />
      <path d="M -9.4,0 L -5,-2.2 L -0.6,0 Z M -0.4,0 L 4,-2.2 L 8.4,0 Z" fill="#ff8f22" stroke={O} strokeWidth="1.3" strokeLinejoin="round" />

      <g className="bird__head">
        {/* a thick, upright neck: her height is the joke */}
        <path
          d="M 1,-27 C -1,-35 5,-39 5.4,-45 C 5.8,-49 4.6,-51 5.6,-54.4 L 16.4,-54.4 C 16.4,-50 17.2,-46 16.4,-40.4 C 15.4,-34 12.4,-31 14.4,-25 Z"
          fill={`url(#ob-${uid})`}
          stroke={O}
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M 13.4,-29 C 12,-33 14.6,-37 14.8,-42" stroke="#c4d3e8" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <ellipse cx="11" cy="-55.6" rx="8" ry="7" fill="#ffffff" stroke={O} strokeWidth="2.8" />
        <ellipse cx="7.6" cy="-58.8" rx="2.6" ry="1.2" fill="#ffffff" opacity="0.9" transform="rotate(-20 7.6 -58.8)" />
        {/* side-eye down her bill */}
        <circle cx="13" cy="-57" r="2.5" fill="#fffaf0" stroke={O} strokeWidth="1.3" />
        <circle cx="14" cy="-56.7" r="1.2" fill={O} />
        <path d="M 10,-59.2 L 16.2,-57.6" stroke={O} strokeWidth="1.8" strokeLinecap="round" />
        <g className="bird__beak">
          <path
            d="M 17.4,-58.4 L 28.6,-56.4 C 30.4,-55.8 30,-53.2 28,-53 L 17.6,-51.8 Z"
            fill={`url(#ok-${uid})`}
            stroke={O}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M 18.4,-55 L 27,-54.6" stroke={O} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        </g>
        <g className="bird__beak-open">
          <path d="M 17.4,-58.8 L 29,-61 C 30.4,-60.6 30,-58.6 28.4,-58.2 L 17.8,-55.6 Z" fill={`url(#ok-${uid})`} stroke={O} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M 17.8,-54.4 L 27.4,-51.8 C 28.6,-51.2 27.8,-50 26.4,-50.2 L 17.6,-51.8 Z" fill={`url(#ok-${uid})`} stroke={O} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M 18,-55.6 L 24.4,-54.6 L 18,-53.8 Z" fill="#c21f56" />
        </g>
        {/* the knob at the base of the bill */}
        <circle cx="17.6" cy="-58.6" r="2.7" fill="#ff8f22" stroke={O} strokeWidth="1.4" />
        {/* a small, tilted, entirely self-awarded crown */}
        <g transform="translate(8.6 -62) rotate(-14)">
          {/* CSS tilts this inner group about the crown's own base */}
          <g className="bird__crown">
            <path d="M -5.4,0 L -6,-6.4 L -2.6,-3.2 L 0,-8 L 2.6,-3.2 L 6,-6.4 L 5.4,0 Z" fill={`url(#oc-${uid})`} stroke={O} strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="0" cy="-1.8" r="1.05" fill="#ff48b0" />
            <circle cx="-3.4" cy="-1.6" r="0.8" fill="#0078bf" />
            <circle cx="3.4" cy="-1.6" r="0.8" fill="#0078bf" />
          </g>
        </g>
      </g>

      {/* plump body, chest out, tail cocked */}
      <path d="M -17,-23 L -28,-29 L -24.4,-17.6 Z" fill="#eef2f8" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
      <path
        d="M -23,-17 C -25,-24 -19,-28.6 -10,-29 C 2,-30 12,-28 16,-20 C 19,-13 14,-7.4 6,-6.6 C -4,-5.6 -14,-6.6 -19,-10 C -21.4,-11.8 -22.6,-14 -23,-17 Z"
        fill={`url(#ob-${uid})`}
        stroke={O}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M -19,-10.6 C -10,-6.8 2,-6.2 12,-9.4 C 9,-7 2,-6.4 -5,-6.4 C -11,-6.4 -16,-8 -19,-10.6 Z" fill="#a9bcd6" opacity="0.45" />
      {/* folded wing, scalloped */}
      <path
        d="M -19,-15 C -15,-23.4 -3,-25 5,-20 C 8,-17.6 7,-14 3,-12.6 C -5,-10 -14,-10.6 -19,-15 Z"
        fill="#e8eef6"
        stroke={O}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path d="M -14.4,-13.4 q 2.6,-2.6 5.2,0 q 2.6,-2.6 5.2,0 q 2.6,-2.6 5.2,0" stroke="#aebfd6" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ───────────── a sleeping loaf, one of the other 43 members ───────────── */

function LoafArt({ uid }: Uid) {
  return (
    <g>
      <defs>
        <linearGradient id={`fb-${uid}`} x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#b3c0d6" />
          <stop offset="1" stopColor="#74839f" />
        </linearGradient>
      </defs>
      <path d="M -15,-3 C -16,-13 -6,-18 5,-16.4 C 14,-15 18,-8 15,-3.4 C 10,0 -10,0.4 -15,-3 Z" fill={`url(#fb-${uid})`} stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M -10,-8 C -6,-12.6 2,-12.4 6,-8.6" stroke="#252c42" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M -6.6,-6 C -3,-9.4 2.6,-9.2 5.2,-6.4" stroke="#252c42" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M 4,-15.4 C 8,-17.4 12.6,-16.4 14.4,-12.6 C 11,-11 7,-11.4 4,-15.4 Z" fill="#3fbf9a" opacity="0.8" />
      <circle cx="10.6" cy="-17" r="6.4" fill={`url(#fb-${uid})`} stroke={O} strokeWidth="2.4" />
      <path d="M 9,-17.4 Q 11,-15.6 13.2,-17.4" stroke={O} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 16.4,-17 L 20.4,-15.6 L 16.4,-14.2 Z" fill="#4f566b" stroke={O} strokeWidth="1.2" strokeLinejoin="round" />
      <text className="bird__z" x="16" y="-26" fontFamily="var(--f-mono)" fontSize="7" fill="#5f6f8f">
        z
      </text>
    </g>
  );
}

export type BirdMessage = { who: string; photo?: boolean };

/**
 * The cast on the roofs, driven by how many chat messages are showing.
 * Rendered inside <Rooftops>, after the houses.
 */
export function BirdCast({ shown, messages }: { shown: number; messages: BirdMessage[] }) {
  const uid = useUid();
  const seen = messages.slice(0, shown);
  const latest = seen[seen.length - 1];
  // the first system line after the pig speaks is Gary leaving the group
  const leaveAt = messages.findIndex((m, i) => m.who === 'sys' && messages.slice(0, i).some((x) => x.who === 'pig'));
  const garyGone = leaveAt >= 0 && shown > leaveAt;
  const posts = (who: string) => seen.filter((m) => m.who === who).length;
  // alternate between two identical animations so each new post restarts it
  const act = (who: string) => (latest?.who === who ? ` is-post-${posts(who) % 2 ? 'a' : 'b'}` : '');
  const flash = latest?.who === 'linda' && latest.photo ? ' is-flash' : '';
  const stirred = latest && (latest.who === 'pig' || (latest.who === 'sys' && !garyGone)) ? ' is-stirred' : '';

  return (
    <g className="cast" aria-hidden="true">
      {/* far away on the water tower: some of the other 43 members */}
      <g fill="#86a6c8">
        <path d="M 783,34 c 2,-4 5,-4 6,-1 l 2,-1 l -1,2 c 0,2 -3,3 -7,2 Z" />
        <path d="M 795,34 c 1,-3 4,-4 5,-1 l 2,-0.6 l -1,1.6 c 0,2 -3,2.4 -6,1.6 Z" />
      </g>

      {/* a bystander on the coral chimney, barely awake */}
      <g transform="translate(106 60) scale(0.78)">
        <GaryArt uid={`${uid}x`} extra />
      </g>
      {/* asleep on the ochre chimney */}
      <g transform="translate(1004 38) scale(0.85)">
        <LoafArt uid={`${uid}l`} />
      </g>

      {/* Steve, back to back with Gary on the coral townhouse, looking at nothing but his fry */}
      <g transform="translate(546 93.2) scale(-1 1)">
        <g className={`bird bird--steve${act('steve')}`}>
          <SteveArt uid={`${uid}s`} />
        </g>
      </g>

      {/* the Goose holds the green mansard like a podium */}
      <g transform="translate(674 42) scale(0.92)">
        <g className="bird-face">
          <g className={`bird bird--goose${act('goose')}${stirred}`}>
            <GooseArt uid={`${uid}o`} />
          </g>
        </g>
      </g>

      {/* Linda, on the satellite dish's rim */}
      <g transform="translate(744 29.6)">
        <g className="bird-face">
          <g className={`bird bird--linda${act('linda')}${flash}`}>
            <LindaArt uid={`${uid}n`} />
          </g>
        </g>
      </g>

      {/* Gary, on the coral townhouse's other slope, until he has had enough */}
      <g transform="translate(605 94)">
        <g className={`bird-leave${garyGone ? ' is-gone' : ''}`}>
          <g className="bird-face">
            <g className={`bird bird--gary${act('gary')}${stirred}`}>
              <GaryArt uid={`${uid}g`} />
            </g>
          </g>
        </g>
        {/* what he leaves behind */}
        <g className={`bird-feathers${garyGone ? ' is-on' : ''}`}>
          <path d="M -6,-2 c 2,-4 6,-5 7,-3 c -1,2 -4,3 -7,3 Z" fill="#a7b8d4" stroke={O} strokeWidth="1" />
          <path d="M 4,-1 c 3,-2 6,-1 6,1 c -2,1 -4,1 -6,-1 Z" fill="#8fa1c0" stroke={O} strokeWidth="1" />
        </g>
      </g>
    </g>
  );
}
