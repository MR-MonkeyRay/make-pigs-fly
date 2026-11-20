import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { store, useStore } from '../engine/store';
import { frame } from '../engine/scroll';
import { fractionOf, SECTION_INDEX } from '../engine/specs';
import { bringHome } from '../engine/fall';
import { buildShareUrl, fmt, type Personal } from '../engine/params';
import { sound } from '../engine/sound';
import { DelegateArt, Gavel } from '../art/Delegates';
import { Hoofprint, MissionPatch } from '../art/Aloft';
import { Constellation } from '../art/Constellation';
import { freeBand, holdPlayback, provideStops, refreshStops } from '../engine/pager';
import { Section, Typewriter, useSectionFrame, useSectionStep } from './Section';
import './upper.css';

const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}`;

/** scripts with no italic of their own: a synthetic slant only distorts them */
const UPRIGHT = /[\u0600-\u06ff\u0750-\u077f\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/;

/* ─────────────────────────── 8 · SUMMIT ─────────────────────────── */

export function Summit() {
  const { t } = useI18n();
  const s = t.summit;
  const track = useRef<HTMLOListElement>(null);
  const span = useRef(0);

  useEffect(() => {
    const m = () => {
      const el = track.current;
      if (!el) return;
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      span.current = Math.max(0, el.scrollWidth - window.innerWidth + pad * 0.5);
    };
    const again = () => {
      m();
      refreshStops();
    };
    m();
    const tm = window.setTimeout(again, 400);
    window.addEventListener('resize', m);
    document.fonts?.ready.then(again);
    return () => {
      window.clearTimeout(tm);
      window.removeEventListener('resize', m);
    };
  }, [t]);

  // On a phone one card fills the screen, so stop on each card, centred,
  // instead of at fixed fractions that land between two of them.
  useEffect(
    () =>
      provideStops('summit', ({ narrow, vw }) => {
        const el = track.current;
        if (!narrow || !el) return null;
        const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
        const span = Math.max(0, el.scrollWidth - vw + pad * 0.5);
        if (span < 1) return null;
        const pps = [...el.children].map((c) => {
          const li = c as HTMLElement;
          const u = Math.min(1, Math.max(0, (li.offsetLeft - el.offsetLeft + li.offsetWidth / 2 - vw / 2) / span));
          return 0.08 + u * 0.84;
        });
        return [0, ...pps.slice(1)].filter((v, i, a) => i === 0 || v - a[i - 1] > 0.01);
      }),
    [t],
  );

  useSectionFrame('summit', (_q, pp) => {
    const el = track.current;
    if (!el) return;
    const u = Math.min(1, Math.max(0, (pp - 0.08) / 0.84));
    el.style.transform = `translate3d(${(-u * span.current).toFixed(1)}px,0,0)`;
  });

  return (
    <Section id="summit" h={3.2} hm={3.6} label={t.layers[8]}>
      <div className="sticky summit__stage">
        <header className="summit__head sec__inner">
          <p className="kicker">{s.kicker}</p>
          <h2 className="display summit__title riso--paper">{s.title}</h2>
          <p className="summit__agenda">{s.agenda}</p>
        </header>
        <div className="summit__window">
          <ol className="summit__track" ref={track}>
            {s.delegates.map((d) => (
              <li key={d.id} className={`delegate${d.id === 'sun' ? ' is-observer' : ''}`}>
                <div className="delegate__top">
                  <DelegateArt id={d.id} />
                  <div className="delegate__plate">
                    <small>{d.id === 'sun' ? s.observer : s.delegate}</small>
                    <strong>{d.name}</strong>
                    <span>{d.lang}</span>
                  </div>
                </div>
                <p className={`delegate__idiom${UPRIGHT.test(d.idiom) ? ' is-upright' : ''}`} dir="auto">
                  {d.idiom}
                </p>
                {d.roman && <p className="delegate__roman">{d.roman}</p>}
                <p className="delegate__lit">
                  <b>{s.literally}:</b> {d.literal}
                </p>
                <p className="delegate__said">
                  <b>{s.statement}:</b> “{d.statement}”
                </p>
              </li>
            ))}
            <li className="summit__close">
              <Gavel className="summit__gavel" />
              <p className="display">{s.closing}</p>
            </li>
          </ol>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 9 · KÁRMÁN ─────────────────────────── */

export function Karman() {
  const { t } = useI18n();
  const k = t.karman;
  const line = fractionOf(SECTION_INDEX.karman, 100_000);
  const stamped = useSectionStep('karman', () => (frame.idx >= SECTION_INDEX.karman && frame.alt >= 100_000 ? 1 : 0));
  const prev = useRef(0);
  useEffect(() => {
    if (stamped && !prev.current) sound.thump();
    prev.current = stamped;
  }, [stamped]);

  return (
    <Section id="karman" h={1.85} hm={1.8} className="dark" label={t.layers[9]}>
      <figure className="karman__earth">
        <img src={img('earth-limb.webp')} alt={k.photo} loading="lazy" decoding="async" width={1500} height={955} />
        <figcaption className="fig">{k.photo}</figcaption>
      </figure>
      <div className="karman__line" style={{ bottom: `${(line * 100).toFixed(2)}%` }}>
        <span>{k.line}</span>
      </div>
      <div className={`sec__inner karman__inner${stamped ? ' is-stamped' : ''}`} style={{ '--line': `${(line * 100).toFixed(2)}%` } as React.CSSProperties}>
        <div className="karman__text">
          <h2 className="display riso--paper karman__title">{k.title}</h2>
          <p className="karman__body">{k.body}</p>
          <p className="fig">{k.helmet}</p>
        </div>
        <div className="karman__patch">
          <MissionPatch />
          <p className="fig">{k.patchNote}</p>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 10 · ISS ─────────────────────────── */

export function Station() {
  const { t } = useI18n();
  const s = t.iss;
  const n = s.log.length;
  // The radio log plays itself once the station is in sight: one transmission
  // at a time, each starting a beat after the previous one finished typing.
  const reached = useSectionStep('iss', (q) => (q > 0.36 ? 1 : 0));
  const [shown, setShown] = useState(0);
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    if (reached && shown === 0) setShown(1);
  }, [reached, shown]);
  useEffect(() => {
    if (!shown || typed < shown || shown >= n) return;
    const id = window.setTimeout(() => setShown((x) => Math.min(n, x + 1)), 420);
    return () => window.clearTimeout(id);
  }, [typed, shown, n]);
  const talking = shown > 0 && typed < n;
  useEffect(() => {
    if (!talking) return;
    return holdPlayback('iss');
  }, [talking]);

  return (
    <Section id="iss" h={1.6} hm={1.9} className="dark" label={t.layers[10]}>
      <div className="sec__inner iss__inner">
        <figure className="iss__photo">
          <img src={img('iss.webp')} alt={s.photoCap} loading="lazy" decoding="async" width={1100} height={628} />
          <figcaption className="fig">{s.photoCap}</figcaption>
        </figure>
        <div className="radio">
          <p className="kicker">{s.kicker}</p>
          <div className="radio__term">
            {/* a mission-control strip, not a desktop window's traffic lights */}
            <div className="radio__bar">
              <b className="radio__rec">REC</b>
              <span>{s.title}</span>
              <em className="radio__band">S-band · 2287.5 MHz</em>
            </div>
            <ol className="radio__log">
              {s.log.map((l, i) => (
                <li key={i} className={`${i < shown ? 'is-on' : ''} ${/HOUSTON|休斯顿|休士頓|ヒューストン|휴스턴|ХЬЮСТОН/i.test(l.who) ? 'is-ground' : ''}`}>
                  <span className="radio__t">[{l.t}]</span> <b>{l.who}:</b> <Typewriter text={l.text} active={i < shown} speed={24} onDone={() => setTyped((x) => Math.max(x, i + 1))} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 11 · MOON ─────────────────────────── */

export function Moon() {
  const { t } = useI18n();
  const m = t.moon;
  const stamped = useSectionStep('moon', (q) => (q > 0.42 ? 1 : 0));
  const prev = useRef(0);
  useEffect(() => {
    if (stamped && !prev.current) sound.thump();
    prev.current = stamped;
  }, [stamped]);

  return (
    <Section id="moon" vars=".moon__disc" h={1.7} hm={1} className="dark" label={t.layers[11]}>
      <img className="moon__disc" src={img('moon.webp')} alt="" loading="lazy" decoding="async" width={820} height={820} />
      <div className="sec__inner moon__inner">
        <p className="kicker">{m.kicker}</p>
        <figure className={`moon__print${stamped ? ' is-stamped' : ''}`}>
          <div className="moon__photo">
            <img src={img('bootprint.webp')} alt={m.photo} loading="lazy" decoding="async" width={860} height={863} />
            <Hoofprint className="moon__hoof" />
            <span className="moon__tag moon__tag--l">{m.left}</span>
            <span className="moon__tag moon__tag--r">{m.right}</span>
          </div>
          <figcaption>
            <span>{m.note}</span>
            <small className="fig">{m.photo}</small>
          </figcaption>
        </figure>
        <blockquote className="display moon__quote">
          <span className="riso--paper">{m.quote1}</span>
          <span className="riso">{m.quote2}</span>
        </blockquote>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 12 · SPACE ─────────────────────────── */

export function Space({ personal }: { personal: Personal }) {
  const { t, tag } = useI18n();
  const s = t.space;
  const falling = useStore((st) => st.falling);
  const [to, setTo] = useState(personal.to);
  const [said, setSaid] = useState(personal.said);
  const [status, setStatus] = useState<'' | 'copied' | 'fail'>('');
  const [failUrl, setFailUrl] = useState('');
  const constel = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  // The constellation draws itself once most of it (name included) is on
  // screen, and resets when it has left, so a return visit draws it again.
  useEffect(() => {
    const el = constel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setDrawn(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.7) setDrawn(true);
        else if (!e.isIntersecting) setDrawn(false);
      },
      { threshold: [0, 0.7] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // autoplay waits for the drawing (and the name) before gliding on to the finale
  useEffect(() => {
    if (!drawn) return;
    const release = holdPlayback('space');
    const tm = window.setTimeout(release, 3200); // name in at ~1.5s, then a beat to read it
    return () => {
      window.clearTimeout(tm);
      release();
    };
  }, [drawn]);

  // First stop: the whole constellation and its name framed in the free band
  // (a fixed fraction left PORCUS VOLANS under the bottom edge); then the finale.
  useEffect(
    () =>
      provideStops('space', ({ vh, list }) => {
        const el = constel.current;
        const sec = document.getElementById('space');
        if (!el || !sec) return null;
        const s = sec.getBoundingClientRect();
        const c = el.getBoundingClientRect();
        if (s.height <= vh + 2 || c.height < 1) return null;
        // phones stack the small print right above the constellation: frame both
        const low = sec.querySelector('.space__footer--low')?.getBoundingClientRect();
        const r = low && low.height > 0 ? { top: Math.min(low.top, c.top), height: c.bottom - Math.min(low.top, c.top) } : c;
        const band = freeBand(vh);
        const free = band.bottom - band.top;
        // scroll offset from the section top that puts the block mid-band (or its top at the band top)
        const at = r.top - s.top - band.top - (r.height <= free ? (free - r.height) / 2 : 8);
        const pp = Math.min(1, Math.max(0, (s.height - vh - at) / (s.height - vh)));
        return [pp, ...list.slice(1)];
      }),
    [t],
  );

  const t1 = personal.to ? fmt(s.titleTo1, { to: personal.to }) : s.title1;
  const t2 = personal.to ? (personal.said ? fmt(s.titleTo2, { said: personal.said }) : s.titleTo2Plain) : s.title2;

  const url = () => buildShareUrl(to, said, tag);

  const copy = async () => {
    const u = url();
    try {
      await navigator.clipboard.writeText(u);
      setStatus('copied');
      sound.oink(1.2);
    } catch {
      setFailUrl(u);
      setStatus('fail');
    }
  };

  const share = async () => {
    const u = url();
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: t.meta.title, text: s.shareTitle, url: u });
        return;
      } catch {
        /* cancelled */
      }
    }
    void copy();
  };

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const footer = (className: string) => (
    <footer className={className}>
      <span>{fmt(t.footer.made, { year: new Date().getFullYear() })}</span>
      <span>{t.footer.credits}</span>
      <span>{t.footer.tld}</span>
      <span>{t.footer.harm}</span>
    </footer>
  );

  return (
    <Section id="space" h={2} hm={2.3} className="dark" label={t.layers[12]}>
      <div className="space__top sec__inner">
        {footer('space__footer space__footer--top')}

        <div className="space__finale">
          <h2 className="display space__title">
            <span className="riso--paper">{t1}</span>
            <span className="riso">{t2}</span>
          </h2>

          <button type="button" className="homebtn" onClick={() => bringHome(t.pig.landed)} disabled={falling}>
            <span className="homebtn__q">{s.wait}</span>
            <span className="homebtn__label">{s.bringHome}</span>
          </button>

          <form
            className="share"
            onSubmit={(e) => {
              e.preventDefault();
              void copy();
            }}
          >
            <p className="share__title">{s.shareTitle}</p>
            <div className="share__fields">
              <label>
                <span>{s.nameLabel}</span>
                <input
                  value={to}
                  maxLength={24}
                  placeholder={s.namePh}
                  onChange={(e) => {
                    setTo(e.target.value);
                    store.set({ certTo: e.target.value.trim() });
                  }}
                />
              </label>
              <label>
                <span>{s.saidLabel}</span>
                <input value={said} maxLength={40} placeholder={s.saidPh} onChange={(e) => setSaid(e.target.value)} />
              </label>
            </div>
            <div className="share__actions">
              <button type="submit" className="btn btn--pink">
                {s.copy}
              </button>
              {canShare && (
                <button type="button" className="btn" onClick={share}>
                  {s.share}
                </button>
              )}
              {/* the certificate the print stylesheet has always made, now findable */}
              <button type="button" className="btn" onClick={() => window.print()}>
                {s.print}
              </button>
            </div>
            <p className="share__status" aria-live="polite">
              {status === 'copied' && s.copied}
              {status === 'fail' && (
                <>
                  {s.copyFail} <code>{failUrl}</code>
                </>
              )}
            </p>
          </form>
        </div>
      </div>

      <div className="space__bottom">
        {/* on a phone the top of the screen belongs to the pig and its bubble, so the small print lives down here */}
        {footer('space__footer space__footer--low')}
        <div className={`space__constel${drawn ? ' is-drawn' : ''}`} ref={constel}>
          <Constellation labels={s.stars} />
          <p className="space__cname">
            <strong>{s.constellation}</strong>
            <span>{s.constellationSub}</span>
          </p>
        </div>
      </div>
    </Section>
  );
}
