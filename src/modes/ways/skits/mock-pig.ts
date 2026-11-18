import { h } from '../../../lib/dom';
import { t } from '../../../i18n';
import type { Skit, Stage } from '../stage';
import { MOCK_PIG } from './art';
import { prop } from './util';

async function typeLine(s: Stage, term: HTMLElement, text: string, cls = ''): Promise<void> {
  const line = h('div', { class: `term-line ${cls}`, text });
  term.append(line);
  await s.anim(line, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 160 });
}

export const mockPig: Skit = {
  id: 'mock-pig',
  nameKey: 'skit.mock.name',
  async play(s) {
    const term = s.add(h('div', { class: 'prop terminal', 'aria-hidden': 'true' }, h('div', { class: 'term-bar' }, h('i'), h('i'), h('i'))));
    await s.anim(term, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 240 });
    await typeLine(s, term, t('skit.mock.cmd'), 'cmd');
    await s.wait(550);
    await typeLine(s, term, t('skit.mock.pass'), 'ok');
    await typeLine(s, term, t('skit.mock.summary'), 'ok');
    s.say(t('skit.mock.l1'));
    await s.wait(700);

    // A cardboard stand-in takes the flight.
    const mock = s.add(prop(MOCK_PIG, 'mock-pig'), 'front');
    mock.append(h('span', { class: 'mock-label', text: 'MOCK' }), h('i', { class: 'mock-stick' }));
    const flyby = s.anim(
      mock,
      [
        { transform: 'translate(0,0) rotate(-5deg)' },
        { transform: 'translate(45cqw,-4cqh) rotate(5deg)', offset: 0.35 },
        { transform: 'translate(90cqw,2cqh) rotate(-4deg)', offset: 0.7 },
        { transform: 'translate(150cqw,-3cqh) rotate(3deg)' },
      ],
      { duration: 2600, easing: 'linear' },
    );
    await Promise.all([flyby, s.wait(900).then(() => s.say(t('skit.mock.l2')))]);
    await s.wait(300);

    // The real pig has had enough.
    await typeLine(s, term, t('skit.mock.force'), 'cmd');
    await s.wait(400);
    const flame = s.add(h('div', { class: 'flame' }), 'pig');
    s.loop(flame, [{ transform: 'scaleY(.75)' }, { transform: 'scaleY(1.3)' }], { duration: 80, direction: 'alternate' });
    await s.movePig({ x: 0 }, 420, 'linear', [{ x: 0.7 }, { x: -0.7 }, { x: 0.7 }, { x: -0.7 }, { x: 0.5 }, { x: -0.5 }]);
    for (let i = 0; i < 4; i++) {
      const puff = s.add(h('i', { class: 'prop puff', style: `left:${38 + i * 6}cqw` }));
      s.anim(puff, [{ opacity: 0.9, transform: 'scale(.3)' }, { opacity: 0, transform: `translate(${(i - 1.5) * 6}cqw, 4cqh) scale(2.2)` }], { duration: 900, delay: i * 50, easing: 'ease-out' }).catch(() => {});
    }
    s.paddle(true);
    await s.movePig({ y: -135 }, 760, 'cubic-bezier(.6,0,.9,.4)');
    s.say(t('skit.mock.l3'));
    await s.wait(1700);
  },
};
