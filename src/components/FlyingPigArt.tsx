import React from 'react';
import type { SkyMood } from '../i18n/types';

interface FlyingPigArtProps {
  soaring: boolean;
  happy: boolean;
  mood: SkyMood;
  stardust: boolean;
  onPoke: () => void;
  tapHint: string;
}

export const FlyingPigArt: React.FC<FlyingPigArtProps> = ({
  soaring,
  happy,
  mood,
  stardust,
  onPoke,
  tapHint,
}) => {
  const showHalo = mood === 'aurora' || stardust || soaring;

  return (
    <div className={`pig-stage ${soaring ? 'is-soaring' : ''} ${happy ? 'is-happy' : ''}`}>
      {/* Soft floating cloud-shadow far beneath */}
      <div className="pig-ground-shadow" aria-hidden="true" />

      <button
        type="button"
        className="pig-interactive-btn"
        onClick={onPoke}
        aria-label={tapHint}
      >
        <svg
          className="pig-svg"
          viewBox="0 0 360 270"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="A serene blush-pink pig with angel wings and a flowing red scarf floating through the sky"
        >
          <defs>
            <radialGradient id="pigBodyGrad" cx="38%" cy="30%" r="68%">
              <stop offset="0%" stopColor="#FFE1EC" />
              <stop offset="52%" stopColor="#FFA7C6" />
              <stop offset="100%" stopColor="#F07CA4" />
            </radialGradient>
            <radialGradient id="pigHeadGrad" cx="35%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#FFE6EF" />
              <stop offset="55%" stopColor="#FFADC9" />
              <stop offset="100%" stopColor="#EE7EA5" />
            </radialGradient>
            <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#FFF7E8" />
              <stop offset="100%" stopColor="#FFE2A8" />
            </linearGradient>
            <linearGradient id="scarfGrad" x1="0" y1="0" x2="1" y2="0.4">
              <stop offset="0%" stopColor="#FF6B4A" />
              <stop offset="100%" stopColor="#E63946" />
            </linearGradient>
            <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255, 224, 130, 0.55)" />
              <stop offset="65%" stopColor="rgba(255, 175, 204, 0.18)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>
            <linearGradient id="lensGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#B8E4FF" stopOpacity="0.72" />
            </linearGradient>
          </defs>

          {/* Luminous Aura behind pig in Aurora / Soar / Stardust mode */}
          <circle
            cx="186"
            cy="142"
            r="112"
            fill="url(#haloGrad)"
            className={`pig-halo ${showHalo ? 'visible' : ''}`}
          />

          {/* Trailing Red Silk Aviator Scarf */}
          <g className="pig-scarf-tail">
            <path
              d="M198 156 C160 154, 128 134, 88 144 C64 150, 48 164, 34 156 C52 178, 86 176, 118 166 C148 157, 174 174, 204 171 Z"
              fill="url(#scarfGrad)"
              stroke="#24293D"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            {/* Delicate cream stripe on scarf */}
            <path
              d="M168 156 C138 152, 108 154, 72 159"
              stroke="#FFF3DB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 7"
            />
          </g>

          {/* Back Wing */}
          <g className="pig-wing-back">
            <path
              d="M164 114 C138 56, 86 44, 74 74 C66 94, 84 106, 98 103 C88 115, 102 126, 122 120 C122 132, 144 134, 166 124 Z"
              fill="url(#wingGrad)"
              stroke="#24293D"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
          </g>

          {/* Curly Ribbon Tail */}
          <g className="pig-tail">
            <path
              d="M108 148 C84 144, 74 126, 88 122 C100 119, 98 136, 82 138"
              stroke="#24293D"
              strokeWidth="6.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M108 148 C84 144, 74 126, 88 122 C100 119, 98 136, 82 138"
              stroke="#FF96BA"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Back Trotters (tucked gently in mid-air) */}
          <g className="pig-leg-back">
            <rect
              x="124"
              y="184"
              width="20"
              height="26"
              rx="9"
              transform="rotate(18 134 196)"
              fill="#EE7CA3"
              stroke="#24293D"
              strokeWidth="3"
            />
            <rect
              x="206"
              y="186"
              width="20"
              height="26"
              rx="9"
              transform="rotate(-16 216 198)"
              fill="#EE7CA3"
              stroke="#24293D"
              strokeWidth="3"
            />
          </g>

          {/* Plump Body */}
          <ellipse
            cx="176"
            cy="152"
            rx="74"
            ry="54"
            fill="url(#pigBodyGrad)"
            stroke="#24293D"
            strokeWidth="3.4"
          />

          {/* Soft belly highlight */}
          <ellipse
            cx="158"
            cy="130"
            rx="34"
            ry="15"
            transform="rotate(-10 158 130)"
            fill="#FFF0F6"
            opacity="0.55"
          />

          {/* Front Trotters */}
          <g className="pig-leg-front">
            <g transform="rotate(14 148 202)">
              <rect
                x="138"
                y="188"
                width="22"
                height="28"
                rx="10"
                fill="#FF9EC0"
                stroke="#24293D"
                strokeWidth="3.2"
              />
              <path d="M139 208 H159 V213 C159 216 155 218 149 218 C143 218 139 216 139 213 Z" fill="#46353D" />
            </g>
            <g transform="rotate(-14 224 202)">
              <rect
                x="214"
                y="188"
                width="22"
                height="28"
                rx="10"
                fill="#FF9EC0"
                stroke="#24293D"
                strokeWidth="3.2"
              />
              <path d="M215 208 H235 V213 C235 216 231 218 225 218 C219 218 215 216 215 213 Z" fill="#46353D" />
            </g>
          </g>

          {/* Front Wing (Articulated & Fluffy) */}
          <g className="pig-wing-front">
            <path
              d="M174 128 C144 62, 82 54, 68 88 C60 108, 78 122, 96 118 C84 134, 102 146, 126 136 C126 150, 152 152, 178 138 Z"
              fill="url(#wingGrad)"
              stroke="#24293D"
              strokeWidth="3.4"
              strokeLinejoin="round"
            />
            <path
              d="M150 112 C126 92, 102 88, 86 96"
              stroke="#E9C77B"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>

          {/* Silk Scarf Collar around neck */}
          <ellipse
            cx="216"
            cy="168"
            rx="28"
            ry="13"
            transform="rotate(-22 216 168)"
            fill="url(#scarfGrad)"
            stroke="#24293D"
            strokeWidth="3.2"
          />

          {/* Cute Floppy Ears */}
          <path
            d="M206 106 C198 78, 222 72, 232 96 Z"
            fill="#FF93B8"
            stroke="#24293D"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path
            d="M254 112 C270 86, 288 98, 272 122 Z"
            fill="#FF93B8"
            stroke="#24293D"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Head */}
          <circle
            cx="236"
            cy="136"
            r="42"
            fill="url(#pigHeadGrad)"
            stroke="#24293D"
            strokeWidth="3.4"
          />

          {/* Vintage Brass Aviator Goggles perched playfully on forehead */}
          <g className="pig-goggles">
            <path
              d="M198 114 Q238 103 274 116"
              stroke="#5A3D2B"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <circle cx="222" cy="112" r="12" fill="url(#lensGrad)" stroke="#E4A93C" strokeWidth="4" />
            <circle cx="222" cy="112" r="14" stroke="#24293D" strokeWidth="2" />
            <circle cx="252" cy="113" r="12" fill="url(#lensGrad)" stroke="#E4A93C" strokeWidth="4" />
            <circle cx="252" cy="113" r="14" stroke="#24293D" strokeWidth="2" />
            <path d="M216 108 A7 7 0 0 1 224 105" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M246 109 A7 7 0 0 1 254 106" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
          </g>

          {/* Rosy Blush Cheeks */}
          <ellipse
            cx="214"
            cy="150"
            rx="10"
            ry="6"
            fill="#FF5B93"
            opacity={happy || soaring ? 0.55 : 0.28}
          />
          <ellipse
            cx="263"
            cy="150"
            rx="9"
            ry="5.8"
            fill="#FF5B93"
            opacity={happy || soaring ? 0.55 : 0.28}
          />

          {/* Expressive Eyes: joyful ^ ^ when tapped/soaring, peaceful blinking eyes otherwise */}
          {happy || soaring ? (
            <g stroke="#24293D" strokeWidth="3.4" strokeLinecap="round" fill="none">
              <path d="M217 137 Q224 128 231 137" />
              <path d="M246 137 Q253 128 260 137" />
            </g>
          ) : (
            <g className="pig-eyes">
              <circle cx="224" cy="136" r="5" fill="#24293D" />
              <circle cx="222.5" cy="134" r="1.8" fill="#FFFFFF" />
              <circle cx="253" cy="136" r="5" fill="#24293D" />
              <circle cx="251.5" cy="134" r="1.8" fill="#FFFFFF" />
            </g>
          )}

          {/* Expressive Oval Snout */}
          <g className="pig-snout">
            <ellipse
              cx="244"
              cy="151"
              rx="19"
              ry="13"
              fill="#FF7CA8"
              stroke="#24293D"
              strokeWidth="3.2"
            />
            <ellipse cx="238" cy="151" rx="3" ry="4.6" fill="#701C3B" />
            <ellipse cx="250" cy="151" rx="3" ry="4.6" fill="#701C3B" />
          </g>

          {/* Serene Smile */}
          <path
            d="M235 168 Q243 174 251 168"
            stroke="#24293D"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Tiny Golden Crown in Secret Stardust Mode */}
          {stardust && (
            <path
              d="M225 95 L221 78 L231 86 L238 74 L245 86 L255 78 L251 95 Z"
              fill="#FFD166"
              stroke="#24293D"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
          )}
        </svg>

        <span className="tap-pig-pill">{tapHint}</span>
      </button>
    </div>
  );
};
