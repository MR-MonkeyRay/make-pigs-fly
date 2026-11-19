import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { LOCALES, SUPPORTED_LOCALES, useI18n } from '../i18n';
import type { SkyMood } from '../i18n/types';

interface HeaderProps {
  mood: SkyMood;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mood, audioEnabled, onToggleAudio }) => {
  const { locale, setLocale, t } = useI18n();

  return (
    <header className={`site-header mood-${mood}`}>
      <div className="container header-inner">
        <a href="#" className="brand-link" aria-label="makepigs.fly home">
          <span className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="28" height="28">
              <path
                d="M14 28 C5 22, 6 13, 17 19 C20 22, 22 25, 22 29 Z"
                fill="#FFF7E6"
                stroke="#24293D"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="M50 28 C59 22, 58 13, 47 19 C44 22, 42 25, 42 29 Z"
                fill="#FFF7E6"
                stroke="#24293D"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <circle cx="32" cy="34" r="17" fill="#FFA6C4" stroke="#24293D" strokeWidth="2.6" />
              <circle cx="25.5" cy="31" r="2.2" fill="#24293D" />
              <circle cx="38.5" cy="31" r="2.2" fill="#24293D" />
              <ellipse cx="32" cy="39" rx="8.2" ry="5.6" fill="#FF7CA8" stroke="#24293D" strokeWidth="2.2" />
              <circle cx="29" cy="39" r="1.5" fill="#701C3B" />
              <circle cx="35" cy="39" r="1.5" fill="#701C3B" />
            </svg>
          </span>
          <span className="brand-wordmark">makepigs.fly</span>
        </a>

        <div className="header-right">
          <a href="#proof" className="header-proof-link">
            {t.header.sendProofNav}
          </a>

          <button
            type="button"
            className="audio-pill"
            onClick={onToggleAudio}
            aria-label={audioEnabled ? t.header.soundOn : t.header.soundOff}
            title={audioEnabled ? t.header.soundOn : t.header.soundOff}
          >
            {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <div className="lang-pill" role="group" aria-label="Language">
            {SUPPORTED_LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                className={`lang-option ${locale === code ? 'active' : ''}`}
                onClick={() => setLocale(code)}
                aria-pressed={locale === code}
              >
                {LOCALES[code].meta.shortCode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
