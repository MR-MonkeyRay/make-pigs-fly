import { h } from '../../../lib/dom';
import { pick, between } from '../../../lib/rng';
import { list, t, valuation } from '../../../i18n';
import type { Skit, Stage } from '../stage';
import { FAN } from './art';
import { fadeOut, pop, prop } from './util';

function bullet(s: Stage, text: string, delay: number): void {
  const el = s.add(h('div', { class: 'prop bullet', text, style: `top:${between(6, 40).toFixed(1)}cqh` }), 'front');
  s.anim(el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-170cqw)' }], {
    duration: 2600,
    delay,
    easing: 'linear',
    fill: 'both',
  }).catch(() => {});
}

export const hypeFan: Skit = {
  id: 'hype-fan',
  nameKey: 'skit.hypeFan.name',
  async play(s) {
    const trend = pick(list('skit.hypeFan.trends'));
    const fan = s.add(prop(FAN, 'fan'));
    const sign = s.add(h('div', { class: 'prop hype-sign', text: t('skit.hypeFan.sign', { trend }) }));
    const value = h('b', { class: 'ticker-value', text: valuation(0) });
    const ticker = s.add(
      h('div', { class: 'prop ticker' }, h('span', { text: t('skit.hypeFan.valuation') }), value, h('small', { text: t('skit.hypeFan.fictional') })),
      'front',
    );
    const top = between(3e9, 9.5e9);

    s.say(t('skit.hypeFan.l1'));
    await s.anim(sign, pop, { duration: 380, easing: 'ease-out' });
    await s.wait(500);

    const blades = fan.querySelector('.fan-blades') as SVGGElement;
    const spin = s.loop(blades, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 650, easing: 'linear' });
    const winds = s.add(h('div', { class: 'prop winds' }, ...[0, 1, 2, 3, 4].map((i) => h('i', { style: `top:${10 + i * 18}%;animation-delay:${i * 0.17}s` }))));
    if (spin) await s.tween(800, (p) => (spin.playbackRate = 1 + p * 4));

    s.paddle(true);
    list('skit.hypeFan.bullets').forEach((b, i) => bullet(s, b, 150 + i * 330));
    await Promise.all([
      s.movePig({ y: -38, r: -6 }, 1700, 'cubic-bezier(.2,.8,.3,1)', [{ y: -12, r: 5 }, { y: -30, r: -9 }]),
      s.tween(1900, (p) => (value.textContent = valuation(top * p * p))),
    ]);
    await s.movePig({ y: -42, r: 4 }, 800, 'ease-in-out', [{ y: -35, r: -5 }]);

    // …and then the wind stops.
    s.say(t('skit.hypeFan.l2'));
    void s.anim(winds, fadeOut, { duration: 300 }).catch(() => {});
    if (spin) await s.tween(700, (p) => (spin.playbackRate = Math.max(0, 5 * (1 - p))));
    s.paddle(false);
    await s.wait(700); // the cartoon hang time

    await Promise.all([
      s.movePig({ y: 0, r: 0 }, 380, 'cubic-bezier(.55,0,1,.45)'),
      s.tween(380, (p) => (value.textContent = valuation(top * (1 - p)))),
    ]);
    ticker.classList.add('crashed');
    await s.movePig({ sx: 1.2, sy: 0.78 }, 110, 'ease-out');
    await s.movePig({ sx: 1, sy: 1 }, 320, 'cubic-bezier(.3,1.8,.5,1)');
    s.say(t('skit.hypeFan.l3'));
    await s.wait(1900);
  },
};
