import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowDown, Sun, Sunset, MoonStar, X } from 'lucide-react';
import { useI18n } from '../i18n';
import type { SkyMood } from '../i18n/types';
import { soundEngine } from '../audio/soundEngine';
import { FlyingPigArt } from './FlyingPigArt';
import type { SharedPromisePayload } from '../utils/urlPromise';

interface HeroSkyProps {
  mood: SkyMood;
  onChangeMood: (next: SkyMood) => void;
  stardust: boolean;
  incomingPromise: SharedPromisePayload | null;
  onDismissIncoming: () => void;
}

const MOOD_ORDER: SkyMood[] = ['morning', 'sunset', 'aurora'];

interface SparkleBurst {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

export const HeroSky: React.FC<HeroSkyProps> = ({
  mood,
  onChangeMood,
  stardust,
  incomingPromise,
  onDismissIncoming,
}) => {
  const { t } = useI18n();
  const heroRef = useRef<HTMLElement | null>(null);

  const [soaring, setSoaring] = useState(false);
  const [happy, setHappy] = useState(false);
  const [quipIndex, setQuipIndex] = useState<number | null>(null);
  const [bursts, setBursts] = useState<SparkleBurst[]>([]);

  // Subtle mouse parallax for depth (no layout thrashing)
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handleMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty('--px', nx.toFixed(3));
      el.style.setProperty('--py', ny.toFixed(3));
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  const spawnBurst = () => {
    const symbols = stardust ? ['✨', '🌈', '⭐', '🪶', '💖'] : ['✨', '🪶', '💫', '🌸'];
    const batch: SparkleBurst[] = Array.from({ length: 7 }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      x: 34 + Math.random() * 32,
      y: 26 + Math.random() * 24,
      symbol: symbols[i % symbols.length],
    }));
    setBursts((prev) => [...prev.slice(-14), ...batch]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((item) => !batch.some((b) => b.id === item.id)));
    }, 1100);
  };

  const handlePokePig = () => {
    soundEngine.playOink(0.95 + Math.random() * 0.22);
    setHappy(true);
    setQuipIndex((prev) => (prev === null ? 0 : (prev + 1) % t.hero.pigQuips.length));
    spawnBurst();
    window.setTimeout(() => setHappy(false), 1150);
  };

  const handleSoar = () => {
    if (soaring) return;
    soundEngine.playSoarChime();
    setSoaring(true);
    setHappy(true);
    spawnBurst();

    // Gracefully cycle atmospheric sky mood mid-soar for a delightful visual surprise!
    const nextMood = MOOD_ORDER[(MOOD_ORDER.indexOf(mood) + 1) % MOOD_ORDER.length];
    window.setTimeout(() => {
      onChangeMood(nextMood);
      setQuipIndex(null);
    }, 450);

    window.setTimeout(() => {
      setSoaring(false);
      setHappy(false);
    }, 1850);
  };

  const activeCaption =
    quipIndex !== null ? t.hero.pigQuips[quipIndex % t.hero.pigQuips.length] : t.hero.moodCaptions[mood];

  return (
    <section ref={heroRef} className={`hero-sky mood-${mood} ${stardust ? 'is-stardust' : ''}`}>
      {/* Atmospheric Sky Layers */}
      <div className="sky-backdrop" aria-hidden="true">
        <div className="sky-orb" />
        <div className="sky-aurora" />
        <div className="sky-stars" />
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
        <div className="cloud cloud-4" />
      </div>

      {/* Floating Sparkle Bursts */}
      <div className="burst-layer" aria-hidden="true">
        {bursts.map((b) => (
          <span
            key={b.id}
            className="burst-particle"
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
          >
            {b.symbol}
          </span>
        ))}
      </div>

      <div className="container hero-content">
        {/* Personalized Incoming Proof Ribbon (when opened via ?promise= link) */}
        {incomingPromise && (
          <div className="incoming-ribbon" role="status">
            <div className="incoming-ribbon-top">
              <span className="incoming-badge">✈ {t.hero.incomingBadge}</span>
              <button
                type="button"
                className="incoming-close"
                onClick={onDismissIncoming}
                aria-label={t.hero.incomingDismiss}
              >
                <X size={15} />
              </button>
            </div>
            <p className="incoming-prefix">{t.hero.incomingPrefix}</p>
            <blockquote className="incoming-quote">“{incomingPromise.promise}”</blockquote>
            {incomingPromise.from && (
              <p className="incoming-from">
                — {t.hero.incomingFrom} <strong>{incomingPromise.from}</strong>
              </p>
            )}
          </div>
        )}

        {/* Centerpiece Animated Flying Pig */}
        <FlyingPigArt
          soaring={soaring}
          happy={happy}
          mood={mood}
          stardust={stardust}
          onPoke={handlePokePig}
          tapHint={t.hero.tapPigHint}
        />

        {/* Editorial Speech / Status Caption */}
        <p className="hero-caption" role="status" aria-live="polite">
          {activeCaption}
        </p>

        {/* Iconic Editorial Headline */}
        <div className="hero-text">
          <div className="hero-eyebrow">{t.hero.eyebrow}</div>
          <h1 className="hero-headline">
            <span>{t.hero.headlineLead}</span>{' '}
            <em className="hero-accent">{t.hero.headlineAccent}</em>
          </h1>
          <p className="hero-subtitle">{t.hero.subtitle}</p>
        </div>

        {/* Clean Dual Actions */}
        <div className="hero-actions">
          <button
            type="button"
            className="pill-btn primary"
            onClick={handleSoar}
            disabled={soaring}
          >
            <Sparkles size={16} />
            <span>{soaring ? t.hero.soaringBtn : t.hero.soarBtn}</span>
          </button>

          <a href="#proof" className="pill-btn secondary">
            <span>{t.hero.sendProofBtn}</span>
            <ArrowDown size={15} />
          </a>
        </div>

        {/* Subtle Atmospheric Sky Mood Switcher */}
        <div className="mood-bar" role="group" aria-label="Sky atmosphere">
          {MOOD_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              className={`mood-pill ${mood === m ? 'active' : ''}`}
              onClick={() => {
                onChangeMood(m);
                setQuipIndex(null);
                soundEngine.playSoarChime();
              }}
              aria-pressed={mood === m}
            >
              {m === 'morning' && <Sun size={13} />}
              {m === 'sunset' && <Sunset size={13} />}
              {m === 'aurora' && <MoonStar size={13} />}
              <span>{t.hero.moodLabels[m]}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
