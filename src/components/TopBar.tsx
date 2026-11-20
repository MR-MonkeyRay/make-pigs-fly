import { useEffect, useRef, useState } from 'react';
import { LOCALE_ORDER, LOCALE_TAG, LOCALES, useI18n } from '../i18n';
import type { Locale } from '../i18n/types';
import { store, useStore } from '../engine/store';
import { sound } from '../engine/sound';
import { PigMark } from '../art/PigMark';
import './topbar.css';

export function TopBar() {
  const { t, locale, setLocale } = useI18n();
  const muted = useStore((s) => s.muted);
  const clicks = useRef<number[]>([]);

  const onLogo = () => {
    const now = performance.now();
    clicks.current = [...clicks.current.filter((c) => now - c < 900), now];
    if (clicks.current.length >= 3) {
      clicks.current = [];
      store.set({ flock: Date.now() });
    }
  };

  const toggleSound = () => {
    const next = !store.get().muted;
    store.set({ muted: next });
    if (!next) sound.oink(1.1);
  };

  return (
    <header className="top">
      <button type="button" className="top__logo" onClick={onLogo} aria-label="makepigs.fly">
        <span className="top__mark" aria-hidden="true">
          <PigMark mood="smug" />
        </span>
        <span className="top__word">
          makepigs<span className="top__dot">.</span>fly
        </span>
      </button>

      <div className="top__right">
        <LangMenu label={t.ui.language} current={locale} onPick={setLocale} />
        <button
          type="button"
          className={`top__sound${muted ? '' : ' is-on'}`}
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={muted ? t.ui.soundOff : t.ui.soundOn}
          title={muted ? t.ui.soundOff : t.ui.soundOn}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
            {muted ? (
              <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            ) : (
              <path d="M16 8.5c1.6 1.8 1.6 5.2 0 7M18.6 6c3 3.3 3 8.7 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9h17M3.5 15h17" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function LangMenu({
  label,
  current,
  onPick,
}: {
  label: string;
  current: Locale;
  onPick: (l: Locale, origin?: { x: number; y: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    const i = LOCALE_ORDER.indexOf(current);
    requestAnimationFrame(() => items.current[i]?.focus());
    return () => window.removeEventListener('pointerdown', onDown);
  }, [open, current]);

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    const list = items.current.filter(Boolean) as HTMLButtonElement[];
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      btn.current?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = list.length;
      list[(i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n]?.focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      list[e.key === 'Home' ? 0 : list.length - 1]?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className={`lang${open ? ' is-open' : ''}`} ref={wrap} onKeyDown={onKey} data-own-keys={open ? '' : undefined}>
      <button
        ref={btn}
        type="button"
        className="lang__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label}: ${LOCALES[current].meta.langName}`}
        title={label}
        onClick={() => setOpen((v) => !v)}
      >
        <GlobeIcon />
        <span className="lang__code" lang={LOCALE_TAG[current]}>
          {LOCALES[current].meta.short}
        </span>
      </button>
      {open && (
        <div className="lang__menu" role="menu" aria-label={label} data-own-scroll>
          {LOCALE_ORDER.map((l, i) => (
            <button
              key={l}
              ref={(el) => {
                items.current[i] = el;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={l === current}
              lang={LOCALE_TAG[l]}
              className={`lang__item${l === current ? ' is-on' : ''}`}
              onClick={(e) => {
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setOpen(false);
                onPick(l, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
                btn.current?.focus();
              }}
            >
              <span className="lang__name">{LOCALES[l].meta.langName}</span>
              <span className="lang__short">{LOCALES[l].meta.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
