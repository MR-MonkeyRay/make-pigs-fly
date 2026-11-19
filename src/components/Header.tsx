import React, { useRef } from 'react';
import { Volume2, VolumeX, Trophy, Sparkles } from 'lucide-react';
import { LOCALES, SUPPORTED_LOCALES, useI18n } from '../i18n';

interface HeaderProps {
  peakAltitude: number;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  rainbowMode: boolean;
  onSecretLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  peakAltitude,
  audioEnabled,
  onToggleAudio,
  rainbowMode,
  onSecretLogoClick,
}) => {
  const { locale, setLocale, t } = useI18n();
  const clicksRef = useRef<number[]>([]);

  const handleBrandClick = () => {
    const now = Date.now();
    clicksRef.current = [...clicksRef.current.filter((ts) => now - ts < 1800), now];
    if (clicksRef.current.length >= 5) {
      clicksRef.current = [];
      onSecretLogoClick();
    }
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <button
          type="button"
          className="brand-btn"
          onClick={handleBrandClick}
          title={t.header.agencyName}
        >
          <span className={`brand-emblem ${rainbowMode ? 'rainbow' : ''}`} aria-hidden="true">
            <svg viewBox="0 0 64 64" width="38" height="38">
              <path
                d="M14 27 C4 20, 6 12, 16 18 C20 21, 22 24, 22 28 Z"
                fill="#FFD166"
                stroke="#161A24"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="M50 27 C60 20, 58 12, 48 18 C44 21, 42 24, 42 28 Z"
                fill="#FFD166"
                stroke="#161A24"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <circle cx="32" cy="34" r="18" fill="#FFA6C4" stroke="#161A24" strokeWidth="2.8" />
              <circle cx="25" cy="24" r="5.5" fill="#E8F6FF" stroke="#E5A93C" strokeWidth="2.5" />
              <circle cx="39" cy="24" r="5.5" fill="#E8F6FF" stroke="#E5A93C" strokeWidth="2.5" />
              <circle cx="25" cy="33" r="2.2" fill="#161A24" />
              <circle cx="39" cy="33" r="2.2" fill="#161A24" />
              <ellipse cx="32" cy="40" rx="8.5" ry="6" fill="#FF7CA8" stroke="#161A24" strokeWidth="2.2" />
              <circle cx="29" cy="40" r="1.6" fill="#7A1F40" />
              <circle cx="35" cy="40" r="1.6" fill="#7A1F40" />
            </svg>
          </span>
          <span className="brand-meta">
            <span className="brand-top">
              <span className="brand-domain">makepigs.fly</span>
              <span className="brand-code">{t.header.agencyCode}</span>
            </span>
            <span className="brand-sub">{t.header.agencyName}</span>
          </span>
        </button>

        <nav className="header-nav" aria-label="Primary navigation">
          <a className="nav-link" href="#flight-lab">
            {t.header.navLab}
          </a>
          <a className="nav-link" href="#departures">
            {t.header.navBoard}
          </a>
          <a className="nav-link" href="#certifier">
            {t.header.navCertifier}
          </a>
          <a className="nav-link" href="#passport">
            {t.header.navPassport}
          </a>
        </nav>

        <div className="header-actions">
          <span className="peak-pill" title={t.header.bestAlt}>
            {rainbowMode ? <Sparkles size={13} /> : <Trophy size={13} />}
            <span>
              {t.header.bestAlt} {peakAltitude.toLocaleString()}m
            </span>
          </span>

          <button
            type="button"
            className="icon-toggle"
            onClick={onToggleAudio}
            aria-label={audioEnabled ? t.header.soundOn : t.header.soundOff}
            title={audioEnabled ? t.header.soundOn : t.header.soundOff}
          >
            {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="toggle-label">{audioEnabled ? t.header.soundOn : t.header.soundOff}</span>
          </button>

          <div className="lang-switcher" role="group" aria-label="Language switcher">
            {SUPPORTED_LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                className={`lang-btn ${locale === code ? 'active' : ''}`}
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
