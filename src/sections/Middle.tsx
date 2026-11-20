import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { store } from '../engine/store';
import { sound } from '../engine/sound';
import type { Personal } from '../engine/params';
import { PigArt } from '../art/PigArt';
import { Biplane1909, Cloud, Cow, CowAnchor } from '../art/Aloft';
import { SplitFlap, type FlapRow } from '../components/SplitFlap';
import { Section, Typewriter, useInView } from './Section';
import './middle.css';

/* ─────────────────────────── 4 · UPDRAFT ─────────────────────────── */

export function Updraft() {
  const { t } = useI18n();
  const u = t.updraft;
  return (
    <Section id="updraft" vars=".cloud" h={1.6} hm={1} label={t.layers[4]}>
      <Cloud className="cloud cloud--a" />
      <Cloud className="cloud cloud--b" tone="pink" />
      <div className="updraft__tunnel" aria-hidden="true">
        <svg className="updraft__streams" viewBox="0 0 400 800" preserveAspectRatio="none">
          {[40, 110, 180, 250, 320, 370].map((x, i) => (
            <path
              key={x}
              d={`M${x} 820 C${x - 30} 640 ${x + 30} 520 ${x} 400 S${x - 30} 160 ${x} -20`}
              style={{ '--i': i } as React.CSSProperties}
            />
          ))}
        </svg>
        {u.winds.map((w, i) => (
          <span
            key={w.year + w.word}
            className="gust"
            style={{ '--i': i, '--n': u.winds.length, left: `${6 + ((i * 37) % 70)}%` } as React.CSSProperties}
          >
            <small>{w.year}</small>
            {w.word}
          </span>
        ))}
      </div>
      <div className="sec__inner updraft__inner">
        <p className="kicker">{u.kicker}</p>
        <blockquote className="display updraft__quote riso--blue">{u.quote}</blockquote>
        <p className="updraft__by">{u.by}</p>
        <p className="updraft__warn">
          <span aria-hidden="true">⚠</span> {u.warning}
        </p>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 5 · PRECEDENTS ─────────────────────────── */

export function Precedents() {
  const { t } = useI18n();
  const p = t.precedents;
  const art = [
    <Biplane1909 key="a" className="exhibit__svg" />,
    <div key="b" className="exhibit__balloon">
      <PigArt auto mood="calm" costume={{ wings: 'none', balloon: true }} />
      <Cow className="exhibit__cow" look="up" />
    </div>,
    <div key="c" className="exhibit__today">
      <span>↗</span>
    </div>,
  ];
  return (
    <Section id="precedents" vars=".cloud" h={1.7} hm={2.9} label={t.layers[5]}>
      <Cloud className="cloud cloud--c" />
      <div className="sec__inner precedents__inner">
        <header className="precedents__head">
          <p className="kicker">{p.kicker}</p>
          <h2 className="display precedents__title riso--ink">{p.title}</h2>
          <p className="precedents__sub">{p.sub}</p>
        </header>
        <ol className="exhibits">
          {p.items.map((it, i) => (
            <li key={it.year} className={`exhibit exhibit--${i}`}>
              <div className="exhibit__case">{art[i]}</div>
              <div className="exhibit__plate">
                <span className="exhibit__year">{it.year}</span>
                <h3>{it.title}</h3>
                <p>{it.body}</p>
                <p className="exhibit__note">{it.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 6 · NEWS ─────────────────────────── */

function StaticNoise({ run }: { run: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!run || store.get().reduced) return;
    const cv = ref.current;
    if (!cv) return;
    const c = cv.getContext('2d');
    if (!c) return;
    const w = (cv.width = 160);
    const h = (cv.height = 100);
    const img = c.createImageData(w, h);
    let raf = 0;
    const start = performance.now();
    cv.style.opacity = '1';
    const draw = (now: number) => {
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      c.putImageData(img, 0, 0);
      if (now - start < 520) raf = requestAnimationFrame(draw);
      else cv.style.opacity = '0';
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [run]);
  return <canvas ref={ref} className="tv__static" aria-hidden="true" />;
}

export function News() {
  const { t } = useI18n();
  const n = t.news;
  const v = useInView('news');
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (v) setRun((r) => r + 1);
  }, [v]);

  const ticker = [...n.ticker, ...n.ticker];
  return (
    <Section id="news" vars=".cloud" h={1.5} hm={1.6} label={t.layers[6]}>
      <Cloud className="cloud cloud--d" />
      <Cloud className="cloud cloud--e" />
      <div className="sec__inner news__inner">
        <div className={`tv${v ? ' is-on' : ''}`}>
          <div className="tv__screen">
            <div className="tv__studio">
              <CowAnchor className="tv__anchor" />
              <div className="tv__desk" />
              <div className="tv__inset">
                <span className="tv__live">● {n.live}</span>
                <div className="tv__clouds" />
                <PigArt auto mood="thrilled" costume={{ wings: 'feather', goggles: true, scarf: true }} />
              </div>
              <div className="tv__bug">
                <b>{n.channel}</b>
                <small>{n.channelLong}</small>
              </div>
            </div>
            <div className="tv__lower">
              <span className="tv__breaking">{n.breaking}</span>
              <strong className="tv__headline">{n.headline}</strong>
              <span className="tv__name">{n.anchorName}</span>
            </div>
            <div className="tv__ticker" aria-label={n.ticker.join(' · ')}>
              <div className="tv__crawl" aria-hidden="true">
                {ticker.map((x, i) => (
                  <span key={i}>{x}</span>
                ))}
              </div>
            </div>
            <div className="tv__scan" />
            <StaticNoise run={run} />
          </div>
          <p className="tv__caption">
            <span className="tv__q">“</span>
            {n.anchor}
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 7 · CRUISE ─────────────────────────── */

export function Cruise({ personal }: { personal: Personal }) {
  const { t } = useI18n();
  const c = t.cruise;
  const v = useInView('cruise');
  const once = useInView('cruise', true);
  const dinged = useRef(false);
  useEffect(() => {
    if (v && !dinged.current) {
      dinged.current = true;
      sound.ding();
    }
  }, [v]);

  // Seat 23A's shade: pull it down and the pig knocks twice, then shoves it
  // back up and presses his snout to the glass.
  const [shade, setShade] = useState<'up' | 'down' | 'knock' | 'peek'>('up');
  const shadeTimers = useRef<number[]>([]);
  useEffect(() => () => shadeTimers.current.forEach((x) => window.clearTimeout(x)), []);
  const pullShade = () => {
    if (shade !== 'up') return;
    setShade('down');
    const at = (ms: number, fn: () => void) => shadeTimers.current.push(window.setTimeout(fn, ms));
    at(900, () => {
      setShade('knock');
      sound.thump();
    });
    at(1150, () => sound.thump());
    at(1700, () => setShade('peek'));
    at(3500, () => setShade('up'));
  };

  let rows: FlapRow[] = c.board.rows;
  if (personal.said) {
    const said = /[a-z]/i.test(personal.said) ? personal.said.toUpperCase() : personal.said;
    rows = [{ time: '00:00', flight: rows[0].flight, dest: said, status: c.board.saidStatus, tone: 'call' }, ...rows.slice(1)];
  }

  return (
    <Section id="cruise" h={1.7} hm={2.1} label={t.layers[7]}>
      <div className="sec__inner cruise__inner">
        <div className="cruise__left">
          <p className="kicker">{c.kicker}</p>
          <div className="cabin">
            <div className={`window is-${shade}`}>
              <div className="window__sky">
                <Cloud className="window__cloud window__cloud--1" />
                <Cloud className="window__cloud window__cloud--2" />
                <div className="window__pig">
                  <PigArt auto wave mood="smug" costume={{ wings: 'feather', goggles: true, scarf: true, pillow: true }} />
                </div>
              </div>
              <button type="button" className="window__shade" aria-label={c.shade} title={c.shade} onClick={pullShade}>
                <i aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="captain">
            <span className="captain__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M3 10v4h3l5 4V6L6 10H3z" fill="currentColor" />
                <path d="M15 8c1.5 1.4 1.5 6.6 0 8" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </span>
            <div>
              <strong>{c.captainLabel}</strong>
              <p>
                <Typewriter text={c.captain} active={once} speed={30} hold="cruise" />
              </p>
            </div>
          </div>
        </div>
        <div className="board">
          <header className="board__head">
            <span className="board__plane" aria-hidden="true">
              ✈
            </span>
            <div>
              <strong>{c.board.title}</strong>
              <small>{c.board.sub}</small>
            </div>
          </header>
          <SplitFlap rows={rows} cols={c.board.cols} active={v} hold="cruise" />
        </div>
      </div>
    </Section>
  );
}
