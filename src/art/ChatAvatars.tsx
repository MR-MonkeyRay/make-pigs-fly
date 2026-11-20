import { useId } from 'react';
import { PigHead } from './PigMark';

/*
 * Round profile pictures for the intercepted bird group chat (floor 4).
 * Real on-page size is 32 px, so each character uses a bold silhouette,
 * high-contrast identity badge colour, and an unmistakable acting choice.
 */

export type Chatter = 'gary' | 'steve' | 'linda' | 'goose' | 'pig';

const O = '#3a2438';

const BADGE: Record<Chatter, { hi: string; mid: string; lo: string; halo: string; rim: string }> = {
  gary: { hi: '#e8f7ff', mid: '#a9d4ee', lo: '#6bb4e3', halo: '#ffffff', rim: '#ffffff' },
  steve: { hi: '#fff570', mid: '#ffe800', lo: '#e8b000', halo: '#fffab8', rim: '#fffef0' },
  // a lighter indigo, so her dark plumage separates without a heavy glow
  linda: { hi: '#7a6cbc', mid: '#52458a', lo: '#2a2350', halo: '#a594e3', rim: '#cfc4fa' },
  // mint, like her green rooftop podium: white on cream lost her silhouette
  goose: { hi: '#f1fbf3', mid: '#d9f0de', lo: '#a9dbb7', halo: '#ffffff', rim: '#ffffff' },
  pig: { hi: '#ffc6e4', mid: '#ff9fd0', lo: '#f074b4', halo: '#ffe6f3', rim: '#ffffff' },
};

function GaryPigeon({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`gp-b-${uid}`} x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#8597b5" />
          <stop offset="0.55" stopColor="#586988" />
          <stop offset="1" stopColor="#3c4966" />
        </linearGradient>
        <linearGradient id={`gp-n-${uid}`} x1="0" y1="0" x2="1" y2="0.7">
          <stop offset="0" stopColor="#2ee6a8" />
          <stop offset="0.5" stopColor="#16b89e" />
          <stop offset="1" stopColor="#eb4db8" />
        </linearGradient>
      </defs>

      {/* Puffed panicky chest & shoulders */}
      <path
        d="M 10,64 C 10,48 16,38 28,37 C 41,36 49,47 51,64 Z"
        fill={`url(#gp-b-${uid})`}
        stroke={O}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Bright iridescent teal-magenta pigeon collar band */}
      <path
        d="M 15,48 C 24,54 39,53 47,46 C 45,40 38,37 29,37 C 20,37 16,41 15,48 Z"
        fill={`url(#gp-n-${uid})`}
        stroke={O}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M 20,45 Q 30,49 41,43" stroke="#a6ffe0" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />

      {/* Ruffled panic feathers sticking up off crown */}
      <path
        d="M 21,15 C 16,8 21,4 25,11 C 26,4 32,6 31,13"
        fill="#6b7c9c"
        stroke={O}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pigeon head — darker slate for instant contrast against sky-blue badge */}
      <path
        d="M 14,28 C 13,15 22,10 33,11 C 42,12 46,20 45,30 C 44,39 36,44 27,43 C 18,42 14,36 14,28 Z"
        fill={`url(#gp-b-${uid})`}
        stroke={O}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Cel shadow under cheek & crisp highlight on crown */}
      <path d="M 16,33 C 22,40 36,41 43,33 C 41,40 34,43 26,42 C 20,41 16,37 16,33 Z" fill="#323d57" opacity="0.65" />
      <ellipse cx="25" cy="16.5" rx="6" ry="2.5" fill="#c7d5eb" opacity="0.82" transform="rotate(-14 25 16.5)" />

      {/* Wide-open screaming beak (ALL CAPS) */}
      <path d="M 42,27 L 58,21 L 45,32 Z" fill="#3a4154" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M 43,32 L 56,39.5 L 41,37 Z" fill="#3a4154" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
      {/* High-contrast screaming mouth interior & pink tongue */}
      <path d="M 43,29 L 54,25.5 L 52,35.5 L 42,35 Z" fill="#c21f56" />
      <path d="M 44,33 Q 48,30.5 51,34.5 L 44,35.5 Z" fill="#ff85c4" />
      {/* Bright white pigeon cere at base of beak */}
      <ellipse cx="43.2" cy="27" rx="3.4" ry="2.5" fill="#ffffff" stroke={O} strokeWidth="1.8" />

      {/* Huge mismatched saucer panic eyes */}
      <g>
        <ellipse cx="25.5" cy="26.5" rx="7" ry="7.8" fill="#ffffff" stroke={O} strokeWidth="2.4" />
        <circle cx="26.8" cy="26.8" r="2.4" fill="#17081a" />
        <circle cx="25.8" cy="25.5" r="1.1" fill="#ffffff" />

        <ellipse cx="38.2" cy="25.8" rx="5.5" ry="6.6" fill="#ffffff" stroke={O} strokeWidth="2.4" />
        <circle cx="39.2" cy="26.2" r="2.1" fill="#17081a" />
        <circle cx="38.3" cy="25.1" r="0.95" fill="#ffffff" />
      </g>

      {/* Frantic raised eyebrows */}
      <path d="M 18,16.5 Q 23.5,13 29,16.5" stroke={O} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M 35,16 Q 39,13.5 43.5,17" stroke={O} strokeWidth="2.6" strokeLinecap="round" fill="none" />

      {/* Panic sweat droplet */}
      <path
        d="M 11,17 C 11,17 7.5,23 9,25.6 C 10,27.2 12,27.2 13,25.6 C 14.5,23 11,17 11,17 Z"
        fill="#38b6ff"
        stroke={O}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="10.4" cy="23.5" r="1" fill="#ffffff" />
    </g>
  );
}

function SteveSeagull({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`ss-w-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.65" stopColor="#f5f7fb" />
          <stop offset="1" stopColor="#cfdbee" />
        </linearGradient>
        <linearGradient id={`ss-b-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffca28" />
          <stop offset="0.6" stopColor="#ff9b1a" />
          <stop offset="1" stopColor="#d96b08" />
        </linearGradient>
      </defs>

      {/* Gull grey wing shoulder & chunky white neck */}
      <path
        d="M 6,64 C 8,48 16,42 26,42 L 42,64 Z"
        fill="#8c9db5"
        stroke={O}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M 13,64 C 14,48 20,38 30,38 C 41,38 45,48 45,64 Z"
        fill={`url(#ss-w-${uid})`}
        stroke={O}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      {/* Head with jaunty feather cowlick */}
      <path
        d="M 14,29 C 13,17 22,11 31,12 C 30,8 34,7 36,12 C 44,13 47,20 46,30 C 45,39 38,44 29,44 C 20,44 14,38 14,29 Z"
        fill={`url(#ss-w-${uid})`}
        stroke={O}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Cool sky cel-shade under jaw */}
      <path d="M 16,33 C 22,41 36,42 44,34 C 42,41 35,44 27,43 C 20,42 16,38 16,33 Z" fill="#c7d6ec" opacity="0.8" />
      <ellipse cx="25" cy="17.5" rx="6" ry="2.6" fill="#ffffff" opacity="0.95" transform="rotate(-14 25 17.5)" />

      {/* Crispy golden french fry clamped proudly in beak (with ketchup dip!) */}
      {/* pale gold and angled down and out, so it does not merge with the orange bill at 32 px */}
      <g transform="translate(0 4) rotate(12 46 35)">
        <rect x="40" y="30.6" width="18.5" height="7.2" rx="1.8" fill="#ffe97a" stroke={O} strokeWidth="2.6" />
        <path d="M 42,32.8 H 52.5" stroke="#fff6c4" strokeWidth="1.7" strokeLinecap="round" />
        {/* Ketchup dip on tip */}
        <path
          d="M 52,30.6 H 57.5 C 58.6,30.6 59,31.5 59,34.2 C 59,36.8 58.4,37.8 57.2,37.8 H 52.4 C 51.8,36.1 53.2,34.8 51.8,33.2 Z"
          fill="#f1384b"
          stroke={O}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle cx="55.6" cy="33.2" r="1.1" fill="#ffadb5" />
      </g>

      {/* Big hooked gull beak with iconic red lower-mandible spot */}
      <path
        d="M 41,25 C 48,25 56,27 57.5,32 C 55,34 48,34 40,33 Z"
        fill={`url(#ss-b-${uid})`}
        stroke={O}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M 41,33 L 54.5,34.5 C 52,38.5 46,39.5 40,38 Z"
        fill="#f08a14"
        stroke={O}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="50.5" cy="36.2" r="2.1" fill="#f1384b" />
      <path d="M 44,27.5 Q 50,27.5 53.5,29.5" stroke="#fff2a8" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Obsessed, half-lidded "got fries?" eyes */}
      <g>
        <ellipse cx="27.5" cy="26.5" rx="5.6" ry="6.2" fill="#ffffff" stroke={O} strokeWidth="2.1" />
        <circle cx="29.4" cy="27.6" r="2.7" fill="#241026" />
        <circle cx="28.3" cy="26.4" r="1.1" fill="#ffffff" />
        {/* Heavy hooded top lid */}
        <path d="M 21,20 H 34 V 25.5 Q 27.5,27 21,25.5 Z" fill="#f5f7fb" />
        <path d="M 21.5,25.2 Q 27.5,26.8 33.5,25.2" stroke={O} strokeWidth="2.4" strokeLinecap="round" fill="none" />

        <ellipse cx="39.5" cy="26" rx="4.6" ry="5.5" fill="#ffffff" stroke={O} strokeWidth="2.1" />
        <circle cx="41" cy="27" r="2.3" fill="#241026" />
        <circle cx="40.1" cy="25.9" r="0.9" fill="#ffffff" />
        <path d="M 34.5,20 H 44.5 V 25 Q 39.5,26.4 34.5,25 Z" fill="#f5f7fb" />
        <path d="M 34.8,24.8 Q 39.5,26.2 44.2,24.8" stroke={O} strokeWidth="2.3" strokeLinecap="round" fill="none" />
      </g>

      {/* Cheek blush */}
      <ellipse cx="23" cy="34.5" rx="3.4" ry="1.9" fill="#ff7ab8" opacity="0.5" />
    </g>
  );
}

function LindaCrow({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`lc-f-${uid}`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#6573a3" />
          <stop offset="0.42" stopColor="#3c4366" />
          <stop offset="1" stopColor="#1e2036" />
        </linearGradient>
        <linearGradient id={`lc-b-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8c9f0" />
          <stop offset="0.52" stopColor="#7787b3" />
          <stop offset="1" stopColor="#434b6b" />
        </linearGradient>
      </defs>

      {/* Cool moonlight rim glow behind Linda's head & shoulders so silhouette pops at 32px */}
      <path
        d="M 10,64 C 12,47 20,39 32,39 C 44,39 51,48 53,64 Z"
        fill="none"
        stroke="#b8d4ff"
        strokeWidth="5.4"
        strokeLinejoin="round"
        opacity="0.72"
      />
      <path
        d="M 15,28 C 14,17 20,10 31,11 C 28,8 24,8 21,10 C 26,6 34,7 39,12 C 45,15 47,22 45,31 C 43,39 36,43 27,42 C 19,41 15,36 15,28 Z"
        fill="none"
        stroke="#b8d4ff"
        strokeWidth="5.6"
        strokeLinejoin="round"
        opacity="0.88"
      />

      {/* Crow shoulders */}
      <path
        d="M 10,64 C 12,47 20,39 32,39 C 44,39 51,48 53,64 Z"
        fill={`url(#lc-f-${uid})`}
        stroke="#100d1a"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M 15,58 C 16,47 22,42 30,41" stroke="#a6b9f0" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.82" />

      {/* Sleek angular crow head + feather crest */}
      <path
        d="M 15,28 C 14,17 20,10 31,11 C 28,8 24,8 21,10 C 26,6 34,7 39,12 C 45,15 47,22 45,31 C 43,39 36,43 27,42 C 19,41 15,36 15,28 Z"
        fill={`url(#lc-f-${uid})`}
        stroke="#100d1a"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* Bright blue-grey sheen across crown & cheek */}
      <path d="M 18,22 C 20,13 29,11 38,14" stroke="#b8cbff" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M 18,30 C 19,35 23,38 29,39" stroke="#7c8ec4" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* Sharp highlighted steel-silver crow beak (pops cleanly at 32px) */}
      <path
        d="M 41,21.5 L 59,28.5 L 41,34 Z"
        fill={`url(#lc-b-${uid})`}
        stroke="#100d1a"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <path d="M 42,28.5 L 56,28.8" stroke="#100d1a" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M 43,24.2 L 54,27.2" stroke="#edf4ff" strokeWidth="1.9" strokeLinecap="round" opacity="0.95" />

      {/* Big bright deadpan investigator eye */}
      <g>
        <ellipse cx="32" cy="25" rx="7.2" ry="6.8" fill="#ffffff" stroke="#100d1a" strokeWidth="2.2" />
        <circle cx="34" cy="25.8" r="3" fill="#14091a" />
        <circle cx="32.8" cy="24.4" r="1.35" fill="#ffffff" />
        {/* Flat deadpan eyelid */}
        <path d="M 24,17.5 H 40 V 23.4 H 24 Z" fill="#3c4366" />
        <path d="M 24.8,23.4 H 39.5" stroke="#100d1a" strokeWidth="2.6" strokeLinecap="round" />
        {/* Crisp pale brow highlight */}
        <path d="M 25.5,19 L 38.5,17" stroke="#c8d6ff" strokeWidth="2.2" strokeLinecap="round" />
      </g>

      {/* Press camera strap (riso pink!) + compact camera at chest */}
      <path d="M 23,39 L 25,46 M 41,40 L 39,46" stroke="#ff48b0" strokeWidth="2.6" strokeLinecap="round" />
      <g transform="translate(20 41)">
        <rect x="0" y="3" width="24" height="15" rx="3" fill="#fffaf0" stroke="#100d1a" strokeWidth="2.2" />
        <rect x="0" y="9" width="24" height="7" fill="#463e5c" />
        <rect x="6" y="0" width="8" height="4" rx="1.2" fill="#fffaf0" stroke="#100d1a" strokeWidth="1.8" />
        <circle cx="13" cy="11" r="5.2" fill="#0078bf" stroke="#100d1a" strokeWidth="2" />
        <circle cx="13" cy="11" r="2.7" fill="#7cd8ff" />
        <circle cx="11.6" cy="9.6" r="1.2" fill="#ffffff" />
        <circle cx="20.5" cy="6.2" r="1.6" fill="#ffe800" />
      </g>
    </g>
  );
}

function TheGoose({ uid }: { uid: string }) {
  return (
    <g transform="translate(0 3.5)">
      <defs>
        <linearGradient id={`tg-w-${uid}`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.65" stopColor="#f8f6f0" />
          <stop offset="1" stopColor="#d2dfed" />
        </linearGradient>
        <linearGradient id={`tg-b-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffaa2b" />
          <stop offset="0.6" stopColor="#ff7c1a" />
          <stop offset="1" stopColor="#d45208" />
        </linearGradient>
        <linearGradient id={`tg-c-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff380" />
          <stop offset="0.55" stopColor="#ffe800" />
          <stop offset="1" stopColor="#e5a000" />
        </linearGradient>
      </defs>

      {/* Long proud S-curving white goose neck & head */}
      <path
        d="M 14,64 C 12,50 18,40 19,29 C 19,20 25,15 34,16 C 42,17 45,23 44,30 C 43,37 37,40 34,46 C 32,51 35,58 37,64 Z"
        fill={`url(#tg-w-${uid})`}
        stroke={O}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Cool cel-shadow along back/under-neck */}
      <path
        d="M 17,63 C 16,52 21,42 22,33 C 23,43 26,53 26,63 Z"
        fill="#c9d7e8"
        opacity="0.7"
      />
      <path d="M 33,40 C 37,38 41,35 43,31 C 42,37 37,41 33,44 Z" fill="#c9d7e8" opacity="0.75" />

      {/* Imperious orange goose bill, tilted slightly upward */}
      <path
        d="M 41,23 C 47,21.5 55,21.5 58,25 C 59,27 57,29.5 52,30.5 C 47,31.5 42,31 40,29.5 Z"
        fill={`url(#tg-b-${uid})`}
        stroke={O}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M 41,28.5 Q 49,28.5 56,26.8" stroke={O} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="48.5" cy="24.6" r="1.2" fill={O} />
      <path d="M 44,23.6 Q 50,22.8 54,24" stroke="#ffd885" strokeWidth="1.4" strokeLinecap="round" fill="none" />

      {/* Condescending half-lidded side-eye */}
      <ellipse cx="34.5" cy="26" rx="5.2" ry="5.4" fill="#ffffff" stroke={O} strokeWidth="2" />
      <circle cx="36" cy="26.8" r="2.4" fill="#210d24" />
      <circle cx="35.1" cy="25.6" r="1" fill="#ffffff" />
      {/* Slanted haughty upper lid */}
      <path d="M 28.5,19.5 H 40.5 V 24.4 L 28.5,25.6 Z" fill="#f8f6f0" />
      <path d="M 29,25.6 L 40.4,24.2" stroke={O} strokeWidth="2.4" strokeLinecap="round" />
      {/* Raised imperious brow */}
      <path d="M 28.5,21.5 Q 34,18.5 39.5,20.5" stroke={O} strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* Soft pink blush */}
      <ellipse cx="30" cy="33" rx="3.4" ry="1.9" fill="#ff7ab8" opacity="0.45" />

      {/* Tiny gleaming golden admin crown perched jauntily on head */}
      <g transform="translate(29 13.5) rotate(-10) scale(1.12)">
        <path
          d="M -10,2 L -11,-8 L -5,-3 L 0,-11 L 5,-3 L 11,-8 L 10,2 Z"
          fill={`url(#tg-c-${uid})`}
          stroke={O}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M -9,0 H 9" stroke="#d48800" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="0" cy="-3.2" r="1.6" fill="#ff48b0" />
        <circle cx="-5.6" cy="-1.8" r="1.2" fill="#0078bf" />
        <circle cx="5.6" cy="-1.8" r="1.2" fill="#0078bf" />
      </g>
    </g>
  );
}

export function ChatAvatar({ who, className }: { who: Chatter; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const b = BADGE[who];
  const bgId = `ca-bg-${uid}`;
  const clipId = `ca-cl-${uid}`;

  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id={bgId} cx="0.34" cy="0.28" r="0.78">
          <stop offset="0" stopColor={b.hi} />
          <stop offset="0.58" stopColor={b.mid} />
          <stop offset="1" stopColor={b.lo} />
        </radialGradient>
        <clipPath id={clipId}>
          <circle cx="32" cy="32" r="28.5" />
        </clipPath>
      </defs>

      {/* Circular identity badge fill */}
      <circle cx="32" cy="32" r="29" fill={`url(#${bgId})`} />

      {/* Subtle centre glow behind portrait for crisp 32px readability */}
      <g clipPath={`url(#${clipId})`}>
        <circle cx="32" cy="34" r="22" fill={b.halo} opacity={who === 'linda' ? 0.58 : who === 'gary' ? 0.52 : 0.36} />
        {who === 'pig' && (
          <g transform="translate(32 34) scale(0.84) translate(-32 -36)">
            <PigHead mood="smug" />
          </g>
        )}
        {who === 'gary' && <GaryPigeon uid={uid} />}
        {who === 'steve' && <SteveSeagull uid={uid} />}
        {who === 'linda' && <LindaCrow uid={uid} />}
        {who === 'goose' && <TheGoose uid={uid} />}
      </g>

      {/* Subtle inner rim + glossy top-left badge highlight + bold outer plum ring */}
      <circle cx="32" cy="32" r="26.4" fill="none" stroke={b.rim} strokeWidth={who === 'linda' ? '2.2' : '1.4'} opacity={who === 'linda' ? 0.72 : 0.35} />
      <path d="M 14,15 A 24,24 0 0 1 28,8.5" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
      <circle cx="32" cy="32" r="29" fill="none" stroke={O} strokeWidth="3.8" />
    </svg>
  );
}
