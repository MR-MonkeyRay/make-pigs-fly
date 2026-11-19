import '../../styles/skits.css';
import { fromMarkup, h } from '../../lib/dom';
import { prefersReducedMotion } from '../../lib/motion';
import { playLaunch, playOink } from '../../lib/sound';
import { createPig, type PigHandle } from '../../pig/pig';
import type { StringKey } from '../../i18n';

/** Pig pose in stage units: x in cqw, y in cqh (negative = up), r in degrees. */
export interface PigPose {
  x: number;
  y: number;
  r: number;
  sx: number;
  sy: number;
}

export type Layer = 'far' | 'back' | 'front' | 'pig';

/** What a skit gets to work with. Everything here is cancelled when the run is aborted. */
export interface Stage {
  readonly el: HTMLElement;
  readonly ground: HTMLElement;
  readonly pig: PigHandle;
  readonly reduced: boolean;
  readonly signal: AbortSignal;
  say(text: string): void;
  wait(ms: number): Promise<void>;
  anim(el: Element, frames: Keyframe[] | PropertyIndexedKeyframes, opts: KeyframeAnimationOptions): Promise<void>;
  /** Fire-and-forget animation (loops, decorations). Skipped when the visitor prefers reduced motion. */
  loop(el: Element, frames: Keyframe[] | PropertyIndexedKeyframes, opts: KeyframeAnimationOptions): Animation | null;
  tween(ms: number, fn: (p: number) => void): Promise<void>;
  add<T extends Element>(el: T, layer?: Layer): T;
  movePig(to: Partial<PigPose>, ms: number, easing?: string, via?: Partial<PigPose>[]): Promise<void>;
  paddle(on: boolean): void;
}

export interface Skit {
  id: string;
  nameKey: StringKey;
  play(stage: Stage): Promise<void>;
}

const abortError = () => new DOMException('Skit aborted', 'AbortError');

export function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

const REST: PigPose = { x: 0, y: 0, r: 0, sx: 1, sy: 1 };
const poseTransform = (p: PigPose) => `translate(${p.x}cqw, ${p.y}cqh) rotate(${p.r}deg) scale(${p.sx}, ${p.sy})`;

// Layered storybook mountain & rolling hill panorama
const HORIZON_SVG = `<svg class="stage-horizon" viewBox="0 0 800 220" preserveAspectRatio="none" aria-hidden="true">
  <path class="horizon-peak" d="M0 190 L95 104 Q120 82 148 102 L245 162 L355 86 Q388 64 420 88 L525 154 L635 94 Q672 74 708 98 L800 156 L800 220 L0 220 Z"/>
  <path class="horizon-hill-far" d="M0 164 Q130 112 275 152 T580 144 T800 156 L800 220 L0 220 Z"/>
  <path class="horizon-hill-near" d="M0 180 Q190 132 390 172 T800 162 L800 220 L0 220 Z"/>
</svg>`;

const POKE_GLYPHS = ['✦', '♥', '♪', '★'];

export interface StageController {
  /** Wrapper element to insert into the page (stage + caption). */
  readonly wrap: HTMLElement;
  readonly busy: boolean;
  /** Play a skit. Resolves true when it ran to the end, false when it was interrupted. */
  play(skit: Skit): Promise<boolean>;
  /** Stop whatever is playing and put the pig back on the ground. */
  reset(opts?: { dropIn?: boolean }): void;
}

export function createStage(outer: AbortSignal): StageController {
  const far = h(
    'div',
    { class: 'stage-far' },
    h('div', { class: 'stage-stars' }),
    h('div', { class: 'stage-orb' }),
    h('div', { class: 'cloud c1' }),
    h('div', { class: 'cloud c2' }),
    h('div', { class: 'cloud c3' }),
    fromMarkup(HORIZON_SVG),
  );
  const ground = h(
    'div',
    { class: 'stage-ground' },
    h('span', { class: 'stage-flower f1' }),
    h('span', { class: 'stage-flower f2' }),
    h('span', { class: 'stage-flower f3' }),
    h('span', { class: 'stage-flower f4' }),
    h('span', { class: 'stage-tuft t1' }),
    h('span', { class: 'stage-tuft t2' }),
    h('span', { class: 'stage-tuft t3' }),
  );
  const back = h('div', { class: 'stage-layer stage-back' });
  const front = h('div', { class: 'stage-layer stage-front' });
  const pig = createPig('pig');
  const el = h('div', { class: 'stage' }, far, ground, back, pig.root, front);
  const caption = h('p', { class: 'caption', 'aria-live': 'polite' });
  const wrap = h('div', { class: 'stage-wrap' }, el, caption);

  const tracked = new Set<Animation>();
  const props = new Set<Element>();
  const pose: PigPose = { ...REST };
  let run: AbortController | null = null;
  let busy = false;
  let paddles: Animation[] = [];
  let pokeIdx = 0;

  function spawnPokeSparkles(): void {
    const count = 3;
    for (let i = 0; i < count; i++) {
      const glyph = POKE_GLYPHS[(pokeIdx + i) % POKE_GLYPHS.length]!;
      const dx = (i - 1) * 26 + (Math.random() - 0.5) * 14;
      const spark = h('span', {
        class: `poke-spark s-${(pokeIdx + i) % 3}`,
        'aria-hidden': 'true',
        text: glyph,
      });
      pig.root.append(spark);
      const anim = spark.animate(
        [
          { transform: 'translate(-50%, 0) scale(0.4)', opacity: 0 },
          { transform: `translate(calc(-50% + ${dx * 0.6}px), -26px) scale(1.15)`, opacity: 1, offset: 0.3 },
          { transform: `translate(calc(-50% + ${dx}px), -62px) scale(0.75)`, opacity: 0 },
        ],
        { duration: 720, delay: i * 65, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
      );
      anim.finished.then(
        () => spark.remove(),
        () => spark.remove(),
      );
    }
    pokeIdx++;
  }

  // Interactive idle pig poke: cheeky oink, juicy bounce, wing flutter, tail wag & floating sparkles!
  pig.root.addEventListener(
    'click',
    () => {
      if (busy) return;
      playOink();
      if (prefersReducedMotion()) return;
      spawnPokeSparkles();
      pig.svg.animate(
        [
          { transform: 'translateY(0) scale(1, 1)' },
          { transform: 'translateY(4%) scale(1.13, 0.87)', offset: 0.2 },
          { transform: 'translateY(-20%) rotate(-6deg) scale(0.94, 1.07)', offset: 0.56 },
          { transform: 'translateY(2%) scale(1.04, 0.96)', offset: 0.84 },
          { transform: 'none' },
        ],
        { duration: 480, easing: 'cubic-bezier(.22, 1.35, .36, 1)' },
      );
      if (pig.wing) {
        pig.wing.animate(
          [{ transform: 'rotate(0deg)' }, { transform: 'rotate(26deg)' }, { transform: 'rotate(-14deg)' }, { transform: 'none' }],
          { duration: 220, iterations: 2, easing: 'ease-in-out' },
        );
      }
      if (pig.tail) {
        pig.tail.animate([{ transform: 'rotate(-24deg)' }, { transform: 'rotate(24deg)' }, { transform: 'none' }], {
          duration: 280,
          iterations: 2,
        });
      }
    },
    { signal: outer },
  );

  outer.addEventListener(
    'abort',
    () => {
      run?.abort();
      cleanup();
    },
    { once: true },
  );

  function cleanup(): void {
    tracked.forEach((a) => a.cancel());
    tracked.clear();
    props.forEach((p) => p.remove());
    props.clear();
    paddles = [];
    Object.assign(pose, REST);
  }

  function setCaption(text: string): void {
    caption.textContent = text;
    caption.classList.toggle('is-active', text.length > 0);
  }

  function makeStage(signal: AbortSignal): Stage {
    const reduced = prefersReducedMotion();

    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject(abortError());
        const id = window.setTimeout(() => {
          signal.removeEventListener('abort', onAbort);
          resolve();
        }, ms);
        const onAbort = () => {
          window.clearTimeout(id);
          reject(abortError());
        };
        signal.addEventListener('abort', onAbort, { once: true });
      });

    const anim: Stage['anim'] = (target, frames, opts) => {
      if (signal.aborted) return Promise.reject(abortError());
      const options: KeyframeAnimationOptions = { fill: 'forwards', ...opts };
      if (reduced) {
        options.duration = 1;
        options.delay = 0;
        options.iterations = 1;
      }
      const a = target.animate(frames, options);
      tracked.add(a);
      return new Promise<void>((resolve, reject) => {
        const onAbort = () => {
          a.cancel();
          reject(abortError());
        };
        signal.addEventListener('abort', onAbort, { once: true });
        a.finished.then(
          () => {
            signal.removeEventListener('abort', onAbort);
            resolve();
          },
          () => {
            signal.removeEventListener('abort', onAbort);
            reject(abortError());
          },
        );
      });
    };

    const loop: Stage['loop'] = (target, frames, opts) => {
      if (reduced || signal.aborted) return null;
      const a = target.animate(frames, { iterations: Infinity, ...opts });
      tracked.add(a);
      return a;
    };

    const tween: Stage['tween'] = (ms, fn) =>
      new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject(abortError());
        if (reduced || ms <= 0) {
          fn(1);
          return resolve();
        }
        const start = performance.now();
        let raf = 0;
        const onAbort = () => {
          cancelAnimationFrame(raf);
          reject(abortError());
        };
        signal.addEventListener('abort', onAbort, { once: true });
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / ms);
          fn(p);
          if (p < 1) raf = requestAnimationFrame(step);
          else {
            signal.removeEventListener('abort', onAbort);
            resolve();
          }
        };
        raf = requestAnimationFrame(step);
      });

    const add: Stage['add'] = (child, layer = 'back') => {
      const parent = layer === 'far' ? far : layer === 'front' ? front : layer === 'pig' ? pig.root : back;
      parent.append(child);
      props.add(child);
      return child;
    };

    const movePig: Stage['movePig'] = async (to, ms, easing = 'ease-in-out', via = []) => {
      const from = { ...pose };
      const target = { ...pose, ...to };
      const frames = [from, ...via.map((v) => ({ ...from, ...v })), target].map((p) => ({ transform: poseTransform(p) }));
      await anim(pig.root, frames, { duration: ms, easing });
      Object.assign(pose, target);
    };

    const paddle: Stage['paddle'] = (on) => {
      paddles.forEach((a) => a.cancel());
      paddles = [];
      if (!on) return;
      pig.legs.forEach((leg, i) => {
        const a = loop(leg, [{ transform: 'rotate(-28deg)' }, { transform: 'rotate(24deg)' }], {
          duration: 170,
          direction: 'alternate',
          delay: i * 45,
          easing: 'ease-in-out',
        });
        if (a) paddles.push(a);
      });
      if (pig.wing) {
        const a = loop(pig.wing, [{ transform: 'rotate(-16deg)' }, { transform: 'rotate(28deg)' }], {
          duration: 150,
          direction: 'alternate',
          easing: 'ease-in-out',
        });
        if (a) paddles.push(a);
      }
      if (pig.tail) {
        const a = loop(pig.tail, [{ transform: 'rotate(-14deg)' }, { transform: 'rotate(14deg)' }], {
          duration: 220,
          direction: 'alternate',
        });
        if (a) paddles.push(a);
      }
    };

    const say: Stage['say'] = (text) => {
      setCaption(text);
      if (!reduced) {
        caption.animate(
          [
            { transform: 'translateY(8px) scale(.96)', opacity: 0.15 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: 260, easing: 'cubic-bezier(.22, 1.35, .36, 1)' },
        );
      }
    };

    return { el, ground, pig, reduced, signal, say, wait, anim, loop, tween, add, movePig, paddle };
  }

  return {
    wrap,
    get busy() {
      return busy;
    },
    async play(skit) {
      run?.abort();
      cleanup();
      setCaption('');
      const ctrl = new AbortController();
      run = ctrl;
      if (outer.aborted) return false;
      busy = true;
      el.dataset.skit = skit.id;
      el.classList.add('is-playing');
      playLaunch();
      try {
        await skit.play(makeStage(ctrl.signal));
        return !ctrl.signal.aborted;
      } catch (err) {
        if (isAbort(err)) return false;
        console.error(err);
        return false;
      } finally {
        if (run === ctrl) {
          busy = false;
          el.classList.remove('is-playing');
        }
      }
    },
    reset({ dropIn = false } = {}) {
      run?.abort();
      run = null;
      busy = false;
      cleanup();
      setCaption('');
      delete el.dataset.skit;
      el.classList.remove('is-playing');
      if (dropIn && !prefersReducedMotion()) {
        pig.root.animate(
          [
            { transform: 'translate(0, -90cqh)' },
            { transform: 'translate(0, 2cqh) scale(1.08, .9)', offset: 0.8 },
            { transform: 'none' },
          ],
          { duration: 520, easing: 'cubic-bezier(.3,.7,.4,1)' },
        );
      }
    },
  };
}
