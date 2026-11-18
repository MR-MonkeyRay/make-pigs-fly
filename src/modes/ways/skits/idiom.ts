import { h } from '../../../lib/dom';
import { t } from '../../../i18n';
import type { Skit, Stage } from '../stage';
import { COW, FLAME, HEN, SUN } from './art';
import { pop, prop } from './util';

// Every locale acts out its own "that'll never happen" idiom — then it happens.
type Kind = 'sun-west' | 'hen-teeth' | 'cow-fly' | 'hell-freezes' | 'pigs-literal';

const variants: Record<Kind, (s: Stage) => Promise<void>> = {
  async 'sun-west'(s) {
    const tint = s.add(h('div', { class: 'prop tint-west' }), 'far');
    const sun = s.add(prop(SUN, 'sun'), 'far');
    const marker = s.add(h('div', { class: 'prop compass', text: t('skit.idiom.sign') }), 'front');
    await s.anim(marker, pop, { duration: 320 });
    await s.wait(900);
    const rays = sun.querySelector('.sun-rays');
    if (rays) s.loop(rays, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 9000, easing: 'linear' });
    await Promise.all([
      s.anim(sun, [{ transform: 'translateY(45cqh)' }, { transform: 'translateY(-4cqh)' }], { duration: 2000, easing: 'cubic-bezier(.2,.7,.3,1)' }),
      s.anim(tint, [{ opacity: 0 }, { opacity: 1 }], { duration: 2000 }),
    ]);
    await s.wait(300);
  },

  async 'hen-teeth'(s) {
    const hen = s.add(prop(HEN, 'hen'));
    await s.anim(hen, [{ transform: 'translateX(-30cqw)' }, { transform: 'translateX(-14cqw) translateY(-1cqh)', offset: 0.5 }, { transform: 'none' }], { duration: 800, easing: 'ease-out' });
    s.loop(hen, [{ transform: 'rotate(-2deg)' }, { transform: 'rotate(2deg)' }], { duration: 400, direction: 'alternate' });
    await s.wait(900);
    const teeth = hen.querySelector('.hen-teeth');
    const sign = s.add(h('div', { class: 'prop idiom-sign hen-sign', text: t('skit.idiom.sign') }), 'front');
    if (teeth) await s.anim(teeth, [{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1.4)', offset: 0.6 }, { opacity: 1, transform: 'none' }], { duration: 380 });
    await s.anim(sign, pop, { duration: 320 });
    await s.wait(600);
  },

  async 'cow-fly'(s) {
    const sign = s.add(h('div', { class: 'prop signpost' }, h('span', { text: t('skit.idiom.sign') })));
    await s.anim(sign, pop, { duration: 320 });
    await s.wait(700);
    const cow = s.add(prop(COW, 'cow'), 'front');
    await s.anim(
      cow,
      [
        { transform: 'translate(0,0) rotate(-6deg)' },
        { transform: 'translate(55cqw,-4cqh) rotate(6deg)', offset: 0.4 },
        { transform: 'translate(150cqw,-12cqh) rotate(-8deg)' },
      ],
      { duration: 2400, easing: 'cubic-bezier(.3,.1,.7,.9)' },
    );
    await s.wait(200);
  },

  async 'hell-freezes'(s) {
    const fire = s.add(prop(FLAME, 'hellfire'));
    s.loop(fire, [{ transform: 'scale(1, .92)' }, { transform: 'scale(.96, 1.06)' }], { duration: 160, direction: 'alternate' });
    await s.wait(1100);
    const ice = s.add(h('div', { class: 'prop ice' }));
    await Promise.all([
      s.anim(fire, [{ opacity: 1, filter: 'none' }, { opacity: 0, filter: 'hue-rotate(160deg)', transform: 'scale(.6)' }], { duration: 420 }),
      s.anim(ice, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.1)', offset: 0.7 }, { opacity: 1, transform: 'none' }], { duration: 520 }),
    ]);
    const sign = s.add(h('div', { class: 'prop idiom-sign frozen', text: t('skit.idiom.sign') }), 'front');
    for (let i = 0; i < 7; i++) {
      const flake = s.add(h('i', { class: 'prop flake', style: `left:${8 + i * 13}cqw` }), 'front');
      s.loop(flake, [{ transform: 'translateY(-10cqh)' }, { transform: 'translateY(110cqh)' }], { duration: 2200 + i * 170, delay: i * 120, easing: 'linear' });
    }
    await s.anim(sign, pop, { duration: 320 });
    await s.wait(700);
  },

  async 'pigs-literal'(s) {
    const sign = s.add(h('div', { class: 'prop signpost wide' }, h('span', { text: t('skit.idiom.sign') })));
    await s.anim(sign, pop, { duration: 320 });
    await s.wait(500);
    await s.movePig({ sx: -1 }, 220, 'ease-out'); // turns to read the sign
    await s.wait(1500);
    await s.movePig({ sx: 1 }, 220, 'ease-out');
    await s.movePig({ y: -4 }, 160, 'ease-out'); // shrug
    await s.movePig({ y: 0 }, 160, 'ease-in');
    await s.wait(200);
  },
};

export const idiom: Skit = {
  id: 'impossible-idiom',
  nameKey: 'skit.idiom.name',
  async play(s) {
    const kind = t('skit.idiom.kind') as Kind;
    s.say(t('skit.idiom.l1'));
    await (variants[kind] ?? variants['sun-west'])(s);
    s.say(t('skit.idiom.l2'));
    await s.wait(900);
    s.paddle(true);
    await s.movePig({ x: 50, y: -125, r: -16 }, 1500, 'cubic-bezier(.45,0,.75,.5)', [{ y: -8, r: -4 }]);
    await s.wait(500);
  },
};

