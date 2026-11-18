import { h } from '../../../lib/dom';
import { t } from '../../../i18n';
import type { Skit } from '../stage';
import { fadeOut } from './util';

const slam: Keyframe[] = [
  { opacity: 0, transform: 'scale(2.6) rotate(-34deg)' },
  { opacity: 1, transform: 'scale(1) rotate(-14deg)' },
];

export const paperwork: Skit = {
  id: 'paperwork-wings',
  nameKey: 'skit.paperwork.name',
  async play(s) {
    const missing = h('span', { class: 'form-missing', text: t('skit.paperwork.missing') });
    const rejected = h('div', { class: 'stamp stamp-rejected', text: t('skit.paperwork.rejected') });
    const approved = h('div', { class: 'stamp stamp-approved', text: t('skit.paperwork.approved') });
    const form = s.add(
      h(
        'div',
        { class: 'prop form-card' },
        h('strong', { text: t('skit.paperwork.form') }),
        h('span', { text: t('skit.paperwork.applicant') }),
        missing,
        rejected,
        approved,
      ),
    );

    await s.anim(form, [{ transform: 'translateX(50cqw) rotate(10deg)' }, { transform: 'rotate(-2deg)' }], {
      duration: 480,
      easing: 'cubic-bezier(.2,.9,.3,1.15)',
    });
    await s.wait(400);
    await s.anim(rejected, slam, { duration: 200, easing: 'cubic-bezier(.6,0,1,.6)' });
    void s.anim(s.el, [{ transform: 'translate(0,0)' }, { transform: 'translate(-6px,3px)' }, { transform: 'translate(5px,-2px)' }, { transform: 'translate(0,0)' }], { duration: 220, fill: 'none' }).catch(() => {});
    await s.anim(missing, [{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 260 });
    await s.wait(450);
    s.say(t('skit.paperwork.l1'));
    await s.wait(1100);

    // Two sheets of paper fly in and become wings.
    const far = s.add(h('div', { class: 'sheet wing wing-far' }), 'pig');
    const near = s.add(h('div', { class: 'sheet wing wing-near' }), 'pig');
    await Promise.all([
      s.anim(far, [{ opacity: 0, transform: 'translate(40cqw,-45cqh) rotate(210deg)' }, { opacity: 1, transform: 'rotate(-26deg)' }], { duration: 620, easing: 'cubic-bezier(.3,.8,.4,1)' }),
      s.anim(near, [{ opacity: 0, transform: 'translate(30cqw,-60cqh) rotate(-170deg)' }, { opacity: 1, transform: 'rotate(-14deg)' }], { duration: 620, delay: 140, easing: 'cubic-bezier(.3,.8,.4,1)' }),
    ]);
    s.loop(near, [{ transform: 'rotate(-42deg)' }, { transform: 'rotate(8deg)' }], { duration: 170, direction: 'alternate', easing: 'ease-in-out' });
    s.loop(far, [{ transform: 'rotate(-50deg)' }, { transform: 'rotate(-6deg)' }], { duration: 170, direction: 'alternate', delay: 50, easing: 'ease-in-out' });

    void s.anim(rejected, fadeOut, { duration: 200 }).catch(() => {});
    await s.anim(approved, slam, { duration: 200, easing: 'cubic-bezier(.6,0,1,.6)' });
    s.say(t('skit.paperwork.l2'));
    s.paddle(true);
    await s.movePig({ x: 10, y: -24, r: -10 }, 950, 'ease-in-out', [{ y: -5, r: -3 }]);
    await s.movePig({ x: 62, y: -125, r: -20 }, 1300, 'cubic-bezier(.5,0,.8,.6)');
    await s.wait(900);
  },
};
