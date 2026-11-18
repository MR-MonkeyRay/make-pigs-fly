import { h } from '../../../lib/dom';
import { t } from '../../../i18n';
import type { Skit } from '../stage';
import { EARTH_CHUTE, FENCE, TREE } from './art';
import { prop } from './util';

export const groundFalls: Skit = {
  id: 'ground-falls',
  nameKey: 'skit.ground.name',
  async play(s) {
    const slab = s.add(h('div', { class: 'prop slab' }, prop(FENCE, 'slab-fence'), prop(TREE, 'slab-tree')));
    const space = s.add(h('div', { class: 'prop space' }), 'far');
    void s.anim(s.ground, [{ opacity: 0 }, { opacity: 0 }], { duration: 1 }).catch(() => {});

    s.say(t('skit.ground.l1'));
    await s.wait(1400);
    await s.anim(slab, [{ transform: 'none' }, { transform: 'translateY(5cqh)' }], { duration: 450, easing: 'cubic-bezier(.5,0,1,.5)' });
    s.say(t('skit.ground.l2'));
    s.paddle(true);
    s.loop(s.pig.svg, [{ transform: 'translateY(0)' }, { transform: 'translateY(-1.5cqh)' }], { duration: 900, direction: 'alternate', easing: 'ease-in-out' });
    await s.wait(1100);

    await Promise.all([
      s.anim(slab, [{ transform: 'translateY(5cqh)' }, { transform: 'translateY(115cqh)' }], { duration: 1300, easing: 'cubic-bezier(.55,0,1,.45)' }),
      s.anim(space, [{ opacity: 0 }, { opacity: 1 }], { duration: 1700, easing: 'ease-in' }),
    ]);

    // Zoom out: the whole planet drifts past on a parachute.
    const earth = s.add(prop(EARTH_CHUTE, 'earth'));
    s.say(t('skit.ground.l3'));
    await s.anim(
      earth,
      [
        { transform: 'translateY(0) rotate(-6deg)' },
        { transform: 'translateY(85cqh) rotate(5deg)', offset: 0.5 },
        { transform: 'translateY(175cqh) rotate(-4deg)' },
      ],
      { duration: 3600, easing: 'linear' },
    );
    await s.wait(300);
  },
};
