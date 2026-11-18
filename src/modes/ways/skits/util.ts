import { fromMarkup, h } from '../../../lib/dom';

/** Wrap trusted SVG art in a positioned prop element. */
export function prop(markup: string, className: string): HTMLElement {
  const el = h('div', { class: `prop ${className}` });
  el.append(fromMarkup(markup));
  return el;
}

export const pop: Keyframe[] = [
  { opacity: 0, transform: 'scale(.4)' },
  { opacity: 1, transform: 'scale(1.12)', offset: 0.7 },
  { opacity: 1, transform: 'none' },
];

export const fadeOut: Keyframe[] = [{ opacity: 1 }, { opacity: 0 }];
