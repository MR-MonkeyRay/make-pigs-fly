import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { store, useStore } from '../engine/store';
import { fmt, type Personal } from '../engine/params';
import { frame } from '../engine/scroll';
import { PigArt } from '../art/PigArt';
import { Chicken, Fence, GrassEdge, Hills, MudField, RunwaySign, TreeWithPig } from '../art/Scenery';
import { Rooftops } from '../art/Aloft';
import { ChatAvatar, type Chatter } from '../art/ChatAvatars';
import { Section, useSectionFrame, useSectionStep } from './Section';
import './lower.css';

/* ─────────────────────────── 0 · GROUND ─────────────────────────── */

/** rough visual width: CJK glyphs count double */
function textWeight(s: string): number {
  let n = 0;
  for (const ch of s) n += /[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/.test(ch) ? 2 : 1;
  return n;
}

export function Ground({ personal }: { personal: Personal }) {
  const { t } = useI18n();
  const landed = useStore((s) => s.landed);
  const touch = useStore((s) => s.touch);
  const reduced = useStore((s) => s.reduced);
  const g = t.ground;
  const l1 = personal.to ? fmt(g.titleTo1, { to: personal.to }) : g.title1;
  const l2 = personal.to ? g.titleTo2 : g.title2;
  const shown1 = landed ? g.landed1 : l1;
  const shown2 = landed ? g.landed2 : l2;
  // long translations shrink the headline instead of spilling into the mud
  const fit = Math.min(1, Math.max(0.6, 52 / (textWeight(shown1) + textWeight(shown2))));

  return (
    <Section id="ground" h={1} className={landed ? 'is-landed' : ''} label={t.layers[0]}>
      <div className="ground__hills">
        <Hills />
      </div>
      <div className="ground__earth">
        <MudField className="ground__mud" />
        <div className="ground__runway" />
        <GrassEdge className="ground__grass" />
        <div className="ground__puddle" />
        <Fence className="ground__fence" />
        <RunwaySign label={g.sign} className="ground__sign" />
        <Chicken className="ground__chicken" mood={landed ? 'jealous' : 'skeptic'} />
      </div>

      <div className="sec__inner ground__inner">
        <p className="fig ground__fig">{g.fig}</p>
        <h1 className="display ground__title" style={{ '--fit': fit.toFixed(3) } as React.CSSProperties}>
          <span className="riso--ink ground__l1">{shown1}</span>
          <span className="riso ground__l2">{shown2}</span>
        </h1>
        {reduced && <p className="ground__reduced">{t.ui.reduced}</p>}
      </div>

      {landed ? (
        <div className="ground__judges" aria-live="polite">
          {g.judges.map((j, i) => (
            <div key={j.name} className="judge" style={{ '--i': i } as React.CSSProperties}>
              <span className="judge__score">{j.score}</span>
              <span className="judge__name">{j.name}</span>
              <span className="judge__note">{j.note}</span>
            </div>
          ))}
          <p className="ground__again">{g.again}</p>
        </div>
      ) : (
        <p className="ground__hint">
          <span className="ground__arrow" aria-hidden="true">
            ↑
          </span>
          <span>{touch ? g.hintTouch : g.hintDesktop}</span>
        </p>
      )}
    </Section>
  );
}

/* ─────────────────────────── 1 · DOUBTERS ─────────────────────────── */

function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function ScatterLine({ text, seed }: { text: string; seed: number }) {
  const words = useMemo(() => {
    const r = rand(seed);
    const chars = Array.from(text);
    const total = chars.length;
    let idx = 0;
    // keep latin words together; CJK breaks anywhere
    const tokens = text.match(/[A-Za-zÀ-ÿ'’.,!?¿¡-]+|\s+|./gu) ?? [];
    return tokens.map((tok) => {
      const letters = Array.from(tok).map((ch) => {
        const pos = idx++ / Math.max(1, total - 1);
        const w = Math.max(0.15, 1 - Math.abs(pos - 0.5) * 1.5);
        // Offsets are in em and stay well under half a glyph sideways, so
        // neighbouring letters can bob and tilt but never swap places.
        return {
          ch,
          dx: (r() * 2 - 1) * 0.1 * w,
          dy: ((r() * 2 - 1) * 0.5 - 0.15) * w,
          dr: (r() * 2 - 1) * 16 * w,
        };
      });
      return { tok, letters, space: /^\s+$/.test(tok) };
    });
  }, [text, seed]);

  return (
    <span className="scatter" aria-label={text}>
      {words.map((w, i) =>
        w.space ? (
          <span key={i} aria-hidden="true">
            {' '}
          </span>
        ) : (
          <span key={i} className="scatter__word" aria-hidden="true">
            {w.letters.map((l, j) => (
              <span
                key={j}
                className="scatter__ch"
                style={{ '--dx': `${l.dx.toFixed(3)}em`, '--dy': `${l.dy.toFixed(3)}em`, '--dr': `${l.dr.toFixed(1)}deg` } as React.CSSProperties}
              >
                {l.ch}
              </span>
            ))}
          </span>
        )
      )}
    </span>
  );
}

export function Doubters() {
  const { t } = useI18n();
  const secRef = useRef<HTMLDivElement>(null);
  const items = useRef<HTMLElement[]>([]);
  const geo = useRef<{ c: number[]; h: number }>({ c: [], h: 1 });

  useEffect(() => {
    const m = () => {
      const sec = secRef.current?.closest('section');
      if (!sec) return;
      const top = sec.getBoundingClientRect().top;
      geo.current = {
        h: sec.offsetHeight,
        c: items.current.map((el) => {
          const r = el.getBoundingClientRect();
          return r.top - top + r.height / 2;
        }),
      };
    };
    const tm = window.setTimeout(m, 60);
    window.addEventListener('resize', m);
    document.fonts?.ready.then(m);
    return () => {
      window.clearTimeout(tm);
      window.removeEventListener('resize', m);
    };
  }, [t]);

  // How hard the pig is ploughing through the quotes right now. Letters only get
  // knocked about while he is actually moving; once the page settles on a floor
  // this decays to 0 and every quote snaps back into a readable line.
  const energy = useRef(0);
  const lastHit = useRef<string[]>([]);

  useSectionFrame('doubters', (q) => {
    const { h, c } = geo.current;
    const vh = frame.vh;
    const secTop = q * (h + vh) - h;
    const pigY = vh * 0.5;
    const want = store.get().reduced ? 0 : Math.min(1, Math.abs(frame.climb) / 0.9);
    const rate = want > energy.current ? 14 : 5; // per second: kick in fast, settle gently
    energy.current += (want - energy.current) * Math.min(1, frame.dt * rate);
    if (energy.current < 0.002) energy.current = 0;
    items.current.forEach((el, i) => {
      const cy = secTop + (c[i] ?? 0);
      const d = Math.abs(cy - pigY) / (vh * 0.3);
      const hit = Math.max(0, 1 - d);
      const eased = hit * hit * (3 - 2 * hit);
      const v = (eased * energy.current).toFixed(3);
      if (lastHit.current[i] !== v) {
        lastHit.current[i] = v;
        el.style.setProperty('--hit', v);
      }
    });
  });

  return (
    // Two bands, each exactly one screen: the first stop shows the lower one
    // (kicker, Kevin, Management, the teenager), the second the upper one (the
    // PM, then Newton, who hands over to the physics floor). Each band leaves
    // a hole in its middle where the pig rests, so no quote sits under him or
    // under the top bar and the bottom buttons when the page stops.
    <Section id="doubters" h={2} hm={2} label={t.layers[1]}>
      <div className="sec__inner doubters__inner" ref={secRef}>
        <p className="kicker doubters__kicker">{t.doubters.kicker}</p>
        <ol className="doubters__list">
          {t.doubters.quotes.map((q, i) => (
            <li
              key={`${q.q}-${i}`}
              className={`doubt doubt--${i % 2 ? 'r' : 'l'} doubt--at${i}`}
              ref={(el) => {
                if (el) items.current[i] = el;
              }}
            >
              <blockquote className="display doubt__q">
                <ScatterLine text={q.q} seed={i * 97 + 13} />
              </blockquote>
              <cite className="doubt__by">{q.by}</cite>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 2 · SCIENCE ─────────────────────────── */

export function Science() {
  const { t } = useI18n();
  const s = t.science;
  const [vp, setVp] = useState({ w: 1200, h: 800 });
  useEffect(() => {
    const r = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    r();
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  const narrow = vp.w < 760 || vp.w / vp.h < 0.8;
  const cx = vp.w * 0.5;
  const cy = vp.h * (narrow ? 0.5 : 0.53);
  const k = narrow ? 0.62 : 1;
  // Phones get their own composition: labels stack in slots above/below the pig
  // instead of hanging off the arrow tips (there is no room sideways).
  const arrows = narrow
    ? [
        { key: 'lift', x1: cx, y1: cy - 85, x2: cx, y2: cy - 160, a: 0.04 },
        { key: 'thrust', x1: cx + 80, y1: cy + 6, x2: Math.min(cx + 165, vp.w - 30), y2: cy + 6, a: 0.42 },
        { key: 'drag', x1: cx - 85, y1: cy + 18, x2: Math.max(cx - 165, 30), y2: cy + 18, a: 0.56 },
        { key: 'gravity', x1: cx, y1: cy + 72, x2: cx, y2: cy + 200, a: 0.7 },
      ]
    : [
        { key: 'lift', x1: cx, y1: cy - 95, x2: cx, y2: cy - 200, a: 0.04 },
        { key: 'thrust', x1: cx + 120, y1: cy + 6, x2: cx + 300, y2: cy + 6, a: 0.42 },
        { key: 'drag', x1: cx - 130, y1: cy + 18, x2: cx - 300, y2: cy + 18, a: 0.56 },
        { key: 'gravity', x1: cx, y1: cy + 100, x2: cx, y2: cy + 230, a: 0.7 },
      ];
  const slot = (key: string, x2: number, y2: number): React.CSSProperties => {
    if (narrow) {
      const half = cx - 30;
      if (key === 'lift') return { left: cx + 14, top: y2 - 6, maxWidth: half };
      // right under its own arrowhead, right-aligned, so it does not read as GRAVITY's label
      if (key === 'thrust') return { right: 14, top: cy + 44, maxWidth: Math.min(half, 160), textAlign: 'right' };
      if (key === 'drag') return { left: 20, top: cy + 92, maxWidth: half };
      return { left: cx + 14, top: y2 - 12, maxWidth: half };
    }
    const left = Math.min(vp.w - 300, Math.max(12, x2 + (key === 'drag' ? -260 : key === 'thrust' ? 12 : 16)));
    const top = key === 'lift' ? y2 - 6 : key === 'gravity' ? y2 - 10 : y2 + 14;
    return { left, top };
  };
  const labels: Record<string, { title: string; body: string; note?: string }> = {
    lift: { title: s.lift, body: s.liftBody, note: s.liftNote },
    thrust: { title: s.thrust, body: s.thrustBody },
    drag: { title: s.drag, body: s.dragBody },
    gravity: { title: s.gravity, body: s.gravityBody },
  };

  return (
    <Section id="science" vars h={2.1} hm={2.1} label={t.layers[2]}>
      <div className="sticky science__stage">
        <div className="science__grid" />
        <header className="science__head">
          <p className="kicker">{s.fig}</p>
          <p className="science__review">{s.review}</p>
        </header>
        <TreeWithPig className="science__tree" />

        <svg className="science__svg" width={vp.w} height={vp.h} viewBox={`0 0 ${vp.w} ${vp.h}`} aria-hidden="true">
          <defs>
            <marker id="arrowhead" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#0078bf" />
            </marker>
          </defs>
          <circle cx={cx} cy={cy} r={150 * k} fill="none" stroke="#0078bf" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.5" />
          <path d={`M${cx - 170 * k} ${cy} H${cx + 170 * k} M${cx} ${cy - 170 * k} V${cy + 170 * k}`} stroke="#0078bf" strokeWidth="1" opacity="0.35" />
          {arrows.map((a) => (
            <line
              key={a.key}
              className="science__arrow"
              x1={a.x1}
              y1={a.y1}
              x2={a.x2}
              y2={a.y2}
              pathLength={1}
              markerEnd="url(#arrowhead)"
              style={{ '--a': a.a } as React.CSSProperties}
            />
          ))}
        </svg>

        {arrows.map((a) => {
          const L = labels[a.key];
          return (
            <div key={a.key} className={`science__label science__label--${a.key}`} style={{ ...slot(a.key, a.x2, a.y2), '--a': a.a } as React.CSSProperties}>
              <strong>{L.title}</strong>
              <span>{L.body}</span>
              {L.note && <small>{L.note}</small>}
            </div>
          );
        })}

        <div
          className="science__wings"
          // phones: narrow enough to keep clear of the LIFT arrowhead at cx
          style={narrow ? { left: 20, top: cy - 230, maxWidth: cx - 60 } : { left: cx - 260, top: cy - 190 }}
        >
          <strong>{s.wingsNew}</strong>
          <s>{s.wingsOld}</s>
          <span>{s.wingsNote}</span>
        </div>

        {/* compliments rise from below and are used up at his hooves, never behind him */}
        <div className="science__fuel" style={{ left: cx, top: cy + 110 * k }} aria-hidden="true">
          {s.compliments.map((c, i) => (
            <span key={c} style={{ '--i': i, '--n': s.compliments.length } as React.CSSProperties}>
              {c}
            </span>
          ))}
        </div>

        <p className="science__foot">{s.footnote}</p>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 3 · BIRDS ─────────────────────────── */

export function Birds() {
  const { t } = useI18n();
  const b = t.birds;
  const n = b.messages.length;
  const shown = useSectionStep('birds', (_q, pp) => Math.max(0, Math.min(n, Math.floor(pp * (n + 1.2) + 0.4))));
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown]);

  const next = b.messages[shown];
  const nextName = next && next.who !== 'sys' ? b.names[next.who].split(' · ')[0] : '';

  return (
    <Section id="birds" vars h={2.5} hm={2.6} label={t.layers[3]}>
      <div className="sticky birds__stage">
        <Rooftops className="birds__roofs" />
        <div className="birds__col">
          <p className="kicker birds__kicker">{b.kicker}</p>
          <div className="phone">
            <div className="phone__notch" />
            <header className="phone__head">
              <span className="phone__back">‹</span>
              <div>
                <strong>{b.group} 🕊️</strong>
                <small>{b.members}</small>
              </div>
              <span className="phone__dots">···</span>
            </header>
            <ol className="phone__list" ref={list} aria-live="polite">
              {b.messages.slice(0, shown).map((m, i) =>
                m.who === 'sys' ? (
                  <li key={i} className="msg msg--sys">
                    <span>{m.text}</span>
                  </li>
                ) : (
                  <li key={i} className={`msg msg--${m.who}`}>
                    <ChatAvatar who={m.who as Chatter} className="msg__av" />
                    <div className="msg__body">
                      <span className="msg__name">{b.names[m.who]}</span>
                      {m.photo ? (
                        <span className="msg__photo" role="img" aria-label="📷">
                          <PigArt mood="calm" costume={{ wings: 'feather', goggles: true }} />
                        </span>
                      ) : (
                        <span className="msg__bubble">{m.text}</span>
                      )}
                    </div>
                  </li>
                )
              )}
              {next && next.who !== 'sys' && shown > 0 && (
                <li className="msg msg--typing" aria-hidden="true">
                  <span className="msg__typing">
                    {fmt(b.typing, { name: nextName })} <i />
                    <i />
                    <i />
                  </span>
                </li>
              )}
            </ol>
            <footer className="phone__input">
              <span>{b.input}</span>
              <b>➤</b>
            </footer>
          </div>
        </div>
      </div>
    </Section>
  );
}
