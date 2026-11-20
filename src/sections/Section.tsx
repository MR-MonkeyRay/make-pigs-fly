import { useEffect, useRef, useState } from 'react';
import { SECTION_INDEX } from '../engine/specs';
import { subscribeSection } from '../engine/scroll';
import { holdPlayback } from '../engine/pager';
import { useStore } from '../engine/store';

interface Props {
  id: string;
  /** height in viewport units on wide screens */
  h: number;
  /** height in viewport units on narrow screens */
  hm?: number;
  className?: string;
  label?: string;
  /**
   * Who reads the scroll progress (--q, --pp) in CSS: `true` for the whole
   * section, or a selector for just those elements. Sections without it get no
   * per-frame custom properties (setting one restyles the whole subtree).
   */
  vars?: true | string;
  children: React.ReactNode;
}

export function Section({ id, h, hm, className, label, vars, children }: Props) {
  return (
    <section
      id={id}
      data-sec={SECTION_INDEX[id]}
      data-vars={vars === true ? '' : vars}
      className={`sec sec--${id}${className ? ` ${className}` : ''}`}
      style={{ '--h': h, '--hm': hm ?? h } as React.CSSProperties}
      aria-label={label}
    >
      {children}
    </section>
  );
}

/** per-frame progress callback for one section (no React re-render) */
export function useSectionFrame(id: string, fn: (q: number, pp: number, inview: boolean) => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => subscribeSection(SECTION_INDEX[id], (q, pp, v) => ref.current(q, pp, v)), [id]);
}

/** a stepped value derived from progress; re-renders only when the step changes */
export function useSectionStep(id: string, compute: (q: number, pp: number, inview: boolean) => number): number {
  const [step, setStep] = useState(0);
  const cur = useRef(0);
  useSectionFrame(id, (q, pp, v) => {
    const s = compute(q, pp, v);
    if (s !== cur.current) {
      cur.current = s;
      setStep(s);
    }
  });
  return step;
}

/** true once (and while) the section is on screen; `once` keeps it true */
export function useInView(id: string, once = false): boolean {
  const [v, setV] = useState(false);
  const cur = useRef(false);
  useSectionFrame(id, (_q, _pp, inview) => {
    const next = once ? cur.current || inview : inview;
    if (next !== cur.current) {
      cur.current = next;
      setV(next);
    }
  });
  return v;
}

/**
 * Reveal text progressively, character by character (CJK-safe).
 * `hold` names the section whose autoplay should wait while this is typing;
 * `onDone` fires once the whole line is out.
 */
export function Typewriter({
  text,
  active,
  speed = 26,
  className,
  hold,
  onDone,
}: {
  text: string;
  active: boolean;
  speed?: number;
  className?: string;
  hold?: string;
  onDone?: () => void;
}) {
  const [n, setN] = useState(0);
  const chars = Array.from(text);
  const reduced = useStore((st) => st.reduced);
  const typing = active && n < chars.length;
  const done = active && n >= chars.length;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    if (done) doneRef.current?.();
  }, [done]);
  useEffect(() => {
    if (!hold || !typing) return;
    return holdPlayback(hold);
  }, [hold, typing]);
  useEffect(() => {
    if (!active) return;
    if (n >= chars.length) return;
    if (reduced) {
      setN(chars.length);
      return;
    }
    const id = window.setTimeout(() => setN((x) => Math.min(chars.length, x + 1)), speed);
    return () => window.clearTimeout(id);
  }, [active, n, chars.length, speed, reduced]);
  useEffect(() => {
    setN(0);
  }, [text]);
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{chars.slice(0, n).join('')}</span>
      {active && n < chars.length ? <span className="tw-caret" aria-hidden="true" /> : null}
      {/* the untyped rest still takes its room, so the box never grows while typing
          (stops framed around it stay right, nothing below jumps) */}
      {n < chars.length ? (
        <span className="tw-rest" aria-hidden="true">
          {chars.slice(n).join('')}
        </span>
      ) : null}
    </span>
  );
}
