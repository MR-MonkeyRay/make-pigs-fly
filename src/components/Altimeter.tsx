import { useEffect, useRef, useState } from 'react';
import { SECTIONS, formatAltitude, pigsStacked } from '../engine/specs';
import { frame, maxScroll, scrollToSection, sectionStartY, subscribe } from '../engine/scroll';
import { stopAutoplay } from '../engine/pager';
import { useI18n } from '../i18n';
import { fmt } from '../engine/params';
import './altimeter.css';

export function Altimeter() {
  const { t, tag } = useI18n();
  const numRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const unitRef = useRef<HTMLSpanElement>(null);
  const pigsRef = useRef<HTMLSpanElement>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<number[]>([]);
  const [cur, setCur] = useState(0);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const tRef = useRef(t);
  tRef.current = t;

  // the floor list: close on a tap outside, focus the floor we are on
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    requestAnimationFrame(() => items.current[cur]?.focus());
    return () => window.removeEventListener('pointerdown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const jump = (i: number) => {
    setOpen(false);
    scrollToSection(i);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    const list = [...(menu.current?.querySelectorAll<HTMLButtonElement>('.alt__floor') ?? [])];
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

  useEffect(() => {
    let last = '';
    let lastLayer = -1;
    let lastTag = '';
    const measureMarks = () => {
      const m = maxScroll() || 1;
      setMarks(SECTIONS.map((_, i) => 1 - sectionStartY(i) / m));
    };
    const tm = window.setTimeout(measureMarks, 300);
    window.addEventListener('resize', measureMarks);
    const unsub = subscribe((f) => {
      const tt = tRef.current;
      const a = formatAltitude(f.alt, tag);
      const key = a.value + a.unit + tag;
      if (key !== last) {
        last = key;
        if (valueRef.current) valueRef.current.textContent = a.value;
        // long readings ("26,5 Mio.") shrink to stay inside the box
        numRef.current?.style.setProperty('--len', String(Math.max(7, a.value.length)));
        if (unitRef.current) unitRef.current.textContent = tt.ui.units[a.unit];
        if (pigsRef.current)
          pigsRef.current.textContent =
            Math.round(f.alt / 0.9) === 1 ? tt.ui.pigsStackedOne : fmt(tt.ui.pigsStacked, { n: pigsStacked(f.alt, tag) });
      }
      if (f.idx !== lastLayer || tag !== lastTag) {
        lastLayer = f.idx;
        lastTag = tag;
        setCur(f.idx);
        if (layerRef.current) layerRef.current.textContent = tt.layers[f.idx] ?? '';
      }
      if (markerRef.current) markerRef.current.style.transform = `translateY(${((1 - f.progress) * 100).toFixed(2)}%)`;
    });
    return () => {
      unsub();
      window.clearTimeout(tm);
      window.removeEventListener('resize', measureMarks);
    };
  }, [tag]);

  void frame;

  return (
    // arrow keys belong to the menu only while it is open; otherwise they page the site
    <aside className={`alt${open ? ' is-open' : ''}`} aria-label={t.ui.altitude} ref={wrap} onKeyDown={onKey} data-own-keys={open ? '' : undefined}>
      <button
        ref={btn}
        type="button"
        className="alt__read"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          // choosing a floor is taking the controls: autoplay must not glide on underneath
          if (!open) stopAutoplay();
          setOpen((v) => !v);
        }}
      >
        <span className="alt__label">{t.ui.altitude}</span>
        <span className="alt__num" ref={numRef}>
          <span ref={valueRef}>0</span>
          <span className="alt__unit" ref={unitRef}>
            {t.ui.units.m}
          </span>
        </span>
        <span className="alt__layer" ref={layerRef}>
          {t.layers[0]}
        </span>
        <span className="alt__pigs" ref={pigsRef} />
      </button>
      {open && (
        <div className="alt__menu" role="menu" aria-label={t.ui.altitude} ref={menu} data-own-scroll>
          {/* top floor first, in the DOM too, so arrow keys and screen readers follow what is seen */}
          {SECTIONS.map((sec, i) => ({ sec, i })).reverse().map(({ sec, i }) => {
            const a = formatAltitude(sec.alt[1], tag); // how high this floor reaches
            return (
              <button
                key={sec.id}
                ref={(el) => {
                  items.current[i] = el;
                }}
                type="button"
                role="menuitem"
                className={`alt__floor${i === cur ? ' is-on' : ''}`}
                aria-current={i === cur ? 'location' : undefined}
                onClick={() => jump(i)}
              >
                <span>{t.layers[i]}</span>
                <small>
                  {a.value} {t.ui.units[a.unit]}
                </small>
              </button>
            );
          })}
        </div>
      )}
      <nav className="alt__ruler" aria-label={t.ui.altitude}>
        <div className="alt__track">
          {marks.map((m, i) => (
            <button
              key={SECTIONS[i].id}
              type="button"
              className="alt__mark"
              style={{ bottom: `${(m * 100).toFixed(2)}%` }}
              onClick={() => scrollToSection(i)}
              aria-label={fmt(t.ui.jumpTo, { name: t.layers[i] })}
              title={t.layers[i]}
            >
              <span>{t.layers[i]}</span>
            </button>
          ))}
          <div className="alt__marker-rail">
            <div className="alt__marker" ref={markerRef}>
              <span>🐷</span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
