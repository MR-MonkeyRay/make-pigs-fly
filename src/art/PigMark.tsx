import { useId } from 'react';

const O = '#4a1d3a';
const SKIN = '#ffb3d1';
const SHADE = '#f28ab5';
const HI = '#fff0f6';
const SNOUT = '#ff86bc';
const NOSTRIL = '#591439';
const INNER_EAR = '#f580b4';

const HEAD_PATH =
  'M 32,13 C 46,13 56,21 57.5,34 C 59,46 53,58 32,59 C 11,58 5,46 6.5,34 C 8,21 18,13 32,13 Z';

type MarkMood = 'smug' | 'happy';

/** The pig's head as a standalone 64×64 icon (logo, loader). */
export function PigMark({ className, mood = 'smug' }: { className?: string; mood?: MarkMood }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <PigHead mood={mood} />
    </svg>
  );
}

/** The same head as an SVG group in a 64×64 box (centre ≈ 32,36), for use inside other drawings. */
export function PigHead({ mood = 'smug' }: { mood?: MarkMood }) {
  const uid = useId().replace(/:/g, '');
  const skinId = `pm-sk-${uid}`;
  const headClip = `pm-hc-${uid}`;
  const eyeLClip = `pm-el-${uid}`;
  const eyeRClip = `pm-er-${uid}`;
  const smug = mood === 'smug';

  return (
    <g>
      <defs>
        <linearGradient id={skinId} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffc6de" />
          <stop offset="1" stopColor="#ffa2c7" />
        </linearGradient>
        <clipPath id={headClip}>
          <path d={HEAD_PATH} />
        </clipPath>
        <clipPath id={eyeLClip}>
          <ellipse cx="19.5" cy="36" rx="6.2" ry="8" />
        </clipPath>
        <clipPath id={eyeRClip}>
          <ellipse cx="44.5" cy="36" rx="6.2" ry="8" />
        </clipPath>
      </defs>

      {/* Mirror-symmetric soft leaf/teardrop ears */}
      <g>
        {/* Left ear */}
        <path
          d="M 11,22 C 6.5,17 5.5,10 8.5,6.5 C 12,3.5 18,6 21,12.5 C 23,16.5 22.5,20.5 20,22.5 Z"
          fill={`url(#${skinId})`}
          stroke={O}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 12.2,19.5 C 9.6,16 9.2,11.6 11,9.5 C 13,7.8 16.4,9.5 18.2,13.6 C 19.3,16 19,18.6 17.5,20 Z"
          fill={INNER_EAR}
        />

        {/* Right ear */}
        <path
          d="M 53,22 C 57.5,17 58.5,10 55.5,6.5 C 52,3.5 46,6 43,12.5 C 41,16.5 41.5,20.5 44,22.5 Z"
          fill={`url(#${skinId})`}
          stroke={O}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 51.8,19.5 C 54.4,16 54.8,11.6 53,9.5 C 51,7.8 47.6,9.5 45.8,13.6 C 44.7,16 45,18.6 46.5,20 Z"
          fill={INNER_EAR}
        />
      </g>

      {/* Chubby wide-cheeked head */}
      <path d={HEAD_PATH} fill={`url(#${skinId})`} />
      <g clipPath={`url(#${headClip})`}>
        <path d="M 4,41 C 14,52 50,52 60,41 L 62,62 L 2,62 Z" fill={SHADE} opacity="0.72" />
        <ellipse cx="21" cy="21.5" rx="7" ry="3" fill={HI} opacity="0.92" transform="rotate(-18 21 21.5)" />
      </g>
      <path d={HEAD_PATH} fill="none" stroke={O} strokeWidth="3.1" strokeLinejoin="round" />

      {/* Forehead cowlick tuft */}
      <path
        d="M 27.5,14 C 24.5,9.5 26,5.5 30,5 C 28.5,8 29,11 31,13.5"
        fill={SKIN}
        stroke={O}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 29,14 C 27.5,7.5 33,3.5 38.5,6 C 41.5,7.5 41,11 38,11 C 39.5,9 37.5,7.5 34.8,9 C 32.5,10.2 33,13 34,14"
        fill={SKIN}
        stroke={O}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M 28.5,14.3 Q 31.5,13.5 34.2,14.3" stroke="#ffc3dc" strokeWidth="3.6" strokeLinecap="round" fill="none" />

      {/* Soft blush cheeks with highlight hatches */}
      <ellipse cx="12" cy="45.5" rx="5.2" ry="3" fill="#ff5296" opacity="0.48" />
      <ellipse cx="52" cy="45.5" rx="5.2" ry="3" fill="#ff5296" opacity="0.48" />
      <g stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.9">
        <path d="M 9.8,46.6 L 11,44.4 M 12.6,46.8 L 13.8,44.6" />
        <path d="M 50.2,46.8 L 51.4,44.6 M 53,46.6 L 54.2,44.4" />
      </g>

      {/* Big glossy lashed eyes */}
      {[
        { cx: 19.5, clip: eyeLClip, dir: -1 },
        { cx: 44.5, clip: eyeRClip, dir: 1 },
      ].map(({ cx, clip, dir }) => (
        <g key={cx}>
          <ellipse cx={cx} cy="36" rx="6.2" ry="8" fill="#ffffff" />
          <g clipPath={`url(#${clip})`}>
            <ellipse cx={cx} cy="36.2" rx="4.7" ry="6.2" fill="#2a0d28" />
            <path
              d={`M ${cx - 3.2} 39.2 Q ${cx} 42.4 ${cx + 3.2} 39.2 Q ${cx} 40.8 ${cx - 3.2} 39.2 Z`}
              fill="#f4a4d8"
              opacity="0.85"
            />
            <circle cx={cx - 1.7} cy="33.6" r="2.2" fill="#ffffff" />
            <circle cx={cx + 1.8} cy="38.6" r="1" fill="#ffffff" />
            {smug && (
              <>
                <path d={`M ${cx - 8} 26 H ${cx + 8} V 35.4 Q ${cx} 37.2 ${cx - 8} 35.4 Z`} fill={SKIN} />
                <path d={`M ${cx - 8} 34.4 Q ${cx} 36.2 ${cx + 8} 34.4 V 35.6 Q ${cx} 37.4 ${cx - 8} 35.6 Z`} fill={SHADE} opacity="0.7" />
              </>
            )}
          </g>
          <ellipse cx={cx} cy="36" rx="6.2" ry="8" fill="none" stroke={O} strokeWidth="2.1" />
          {smug ? (
            <>
              <path
                d={`M ${cx - 6.6} 35.4 Q ${cx} 37.3 ${cx + 6.6} 35.4`}
                stroke={O}
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M ${cx + dir * 6.4} 35.4 L ${cx + dir * 9.2} 34`}
                stroke={O}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <path
                d={`M ${cx - 6.1} 33.6 C ${cx - 4.5} 26.8 ${cx + 4.5} 26.8 ${cx + 6.1} 33.6 C ${cx + 3.8} 29.2 ${cx - 3.8} 29.2 ${cx - 6.1} 33.6 Z`}
                fill={O}
              />
              <path
                d={`M ${cx + dir * 5.6} 32.2 L ${cx + dir * 8.8} 30.2 M ${cx + dir * 6.1} 34.2 L ${cx + dir * 9} 33.2`}
                stroke={O}
                strokeWidth="1.9"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}
        </g>
      ))}

      {/* Expressive floating eyebrows */}
      <g stroke={O} strokeWidth="2.6" strokeLinecap="round" fill="none">
        {smug ? (
          <>
            <path d="M 13.5,25.6 L 24.2,26" />
            <path d="M 39.8,24.4 Q 44.8,20.8 50.2,24.6" />
          </>
        ) : (
          <>
            <path d="M 14.5,24.8 Q 19.5,22.4 24.5,24.8" />
            <path d="M 39.5,24.8 Q 44.5,22.4 49.5,24.8" />
          </>
        )}
      </g>

      {/* Button snout */}
      <ellipse cx="32" cy="43.5" rx="8.4" ry="5.8" fill={SNOUT} stroke={O} strokeWidth="2.4" />
      <ellipse cx="30.4" cy="40.5" rx="3.4" ry="1.3" fill="#ffffff" opacity="0.62" />
      <ellipse cx="29.1" cy="43.8" rx="1.5" ry="2.4" fill={NOSTRIL} transform="rotate(-7 29.1 43.8)" />
      <ellipse cx="34.9" cy="43.8" rx="1.5" ry="2.4" fill={NOSTRIL} transform="rotate(7 34.9 43.8)" />

      {/* Mouth */}
      {smug ? (
        <path d="M 27,52 Q 32.5,54 37.5,49.8" stroke={O} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M 27.5,51.2 Q 32,55 36.5,51.2" stroke={O} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      )}
    </g>
  );
}
