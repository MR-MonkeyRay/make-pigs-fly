import { useEffect, useRef } from 'react';
import { store } from '../engine/store';
import { sound } from '../engine/sound';
import type { FlapTone } from '../i18n/locales/en';

export interface FlapRow {
  time: string;
  flight: string;
  dest: string;
  status: string;
  tone: FlapTone;
}

const WIDE = /[ᄀ-ᇿ⺀-鿿가-힯豈-﫿＀-￯]/;
const LATIN_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CJK_POOL = '猪飞天空云月星风雨雪日山海航班登机延误取消准点到达出发';

function Cells({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`flap__f ${className ?? ''}`} aria-hidden="true">
      {Array.from(text).map((ch, i) => (
        <span key={i} className={`flap__c${WIDE.test(ch) ? ' is-wide' : ''}${ch === ' ' ? ' is-space' : ''}`} data-t={ch}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export function SplitFlap({ rows, cols, active }: { rows: FlapRow[]; cols: string[]; active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const runId = useRef(0);

  useEffect(() => {
    if (!active) return;
    const el = root.current;
    if (!el || store.get().reduced) return;
    const id = ++runId.current;
    const cells = Array.from(el.querySelectorAll<HTMLSpanElement>('.flap__c'));
    const plan = cells.map((c) => {
      const t = c.dataset.t ?? '';
      const row = Number(c.closest<HTMLElement>('[data-row]')?.dataset.row ?? 0);
      const col = Array.prototype.indexOf.call(c.parentElement?.children ?? [], c);
      return {
        c,
        t,
        stop: t === ' ' ? 0 : 6 + row * 3 + col * 0.7 + Math.random() * 7,
        pool: WIDE.test(t) ? CJK_POOL : LATIN_POOL,
      };
    });
    let tick = 0;
    const timer = window.setInterval(() => {
      if (runId.current !== id) {
        window.clearInterval(timer);
        return;
      }
      tick++;
      let busy = 0;
      for (const p of plan) {
        if (tick < p.stop) {
          busy++;
          p.c.textContent = p.pool[(Math.random() * p.pool.length) | 0];
          p.c.classList.remove('is-flip');
          void p.c.offsetWidth;
          p.c.classList.add('is-flip');
        } else if (p.c.textContent !== p.t) {
          p.c.textContent = p.t;
        }
      }
      if (busy) sound.clack();
      if (!busy) window.clearInterval(timer);
    }, 60);
    return () => {
      window.clearInterval(timer);
      plan.forEach((p) => (p.c.textContent = p.t));
    };
  }, [active, rows]);

  return (
    <div className="flap" ref={root}>
      <div className="flap__row flap__row--head" aria-hidden="true">
        {cols.map((c, i) => (
          <span key={i} className={`flap__h flap__col-${i}`}>
            {c}
          </span>
        ))}
      </div>
      <ul className="flap__rows">
        {rows.map((r, i) => (
          <li key={`${r.flight}-${i}`} className={`flap__row tone-${r.tone}`} data-row={i} aria-label={`${r.time} ${r.flight} ${r.dest} — ${r.status}`}>
            <Cells text={r.time} className="flap__col-0" />
            <Cells text={r.flight} className="flap__col-1" />
            <Cells text={r.dest} className="flap__col-2" />
            <Cells text={r.status} className="flap__col-3" />
          </li>
        ))}
      </ul>
    </div>
  );
}
