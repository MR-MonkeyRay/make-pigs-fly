import { useEffect, useRef, useState } from 'react';
import { SECTIONS, formatAltitude, pigsStacked } from '../engine/specs';
import { frame, maxScroll, scrollToSection, sectionStartY, subscribe } from '../engine/scroll';
import { useI18n } from '../i18n';
import { fmt } from '../engine/params';
import './altimeter.css';

export function Altimeter() {
  const { t, tag } = useI18n();
  const valueRef = useRef<HTMLSpanElement>(null);
  const unitRef = useRef<HTMLSpanElement>(null);
  const pigsRef = useRef<HTMLSpanElement>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<number[]>([]);
  const tRef = useRef(t);
  tRef.current = t;

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
        if (unitRef.current) unitRef.current.textContent = tt.ui.units[a.unit];
        if (pigsRef.current)
          pigsRef.current.textContent =
            Math.round(f.alt / 0.9) === 1 ? tt.ui.pigsStackedOne : fmt(tt.ui.pigsStacked, { n: pigsStacked(f.alt, tag) });
      }
      if (f.idx !== lastLayer || tag !== lastTag) {
        lastLayer = f.idx;
        lastTag = tag;
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
    <aside className="alt" aria-label={t.ui.altitude}>
      <div className="alt__read">
        <span className="alt__label">{t.ui.altitude}</span>
        <span className="alt__num">
          <span ref={valueRef}>0</span>
          <span className="alt__unit" ref={unitRef}>
            {t.ui.units.m}
          </span>
        </span>
        <span className="alt__layer" ref={layerRef}>
          {t.layers[0]}
        </span>
        <span className="alt__pigs" ref={pigsRef} />
      </div>
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
