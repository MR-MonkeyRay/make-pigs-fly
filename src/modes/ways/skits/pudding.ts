import { list, t } from '../../../i18n';
import type { Skit } from '../stage';
import { BALLOONS, LAPTOP, MANUAL, PUDDING, SCARF } from './art';
import { prop } from './util';

export const pudding: Skit = {
  id: 'pudding-ballast',
  nameKey: 'skit.pudding.name',
  async play(s) {
    const balloons = s.add(prop(BALLOONS, 'balloons'), 'pig');
    const cargo = [MANUAL, LAPTOP, SCARF].map((art, i) => s.add(prop(art, `cargo cargo-${i}`), 'pig'));
    const treat = s.add(prop(PUDDING, 'cargo pudding'), 'pig');
    s.loop(balloons, [{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], { duration: 900, direction: 'alternate', easing: 'ease-in-out' });
    await s.wait(400);

    s.say(t('skit.pudding.l1'));
    for (let i = 0; i < 2; i++) {
      await s.movePig({ y: -4 }, 280, 'ease-out');
      await s.movePig({ y: 0 }, 240, 'ease-in');
    }
    await s.wait(350);

    const lines = list('skit.pudding.items');
    let y = 0;
    for (let i = 0; i < cargo.length; i++) {
      const item = cargo[i] as HTMLElement;
      const dir = i % 2 === 0 ? 1 : -1;
      s.say(lines[i] ?? '');
      await s.anim(
        item,
        [
          { transform: 'none', opacity: 1 },
          { transform: `translate(${dir * 30}cqw,-45cqh) rotate(${dir * 500}deg)`, opacity: 1, offset: 0.75 },
          { transform: `translate(${dir * 42}cqw,-30cqh) rotate(${dir * 700}deg)`, opacity: 0 },
        ],
        { duration: 620, easing: 'cubic-bezier(.2,.7,.4,1)' },
      );
      y -= 7;
      await s.movePig({ y }, 380, 'cubic-bezier(.3,1.5,.5,1)');
      await s.wait(500);
    }

    s.say(t('skit.pudding.l2'));
    await s.anim(treat, [{ transform: 'none' }, { transform: 'scale(1.3) rotate(-6deg)' }, { transform: 'none' }], { duration: 420 });
    await s.wait(1000);
    s.paddle(true);
    s.say(t('skit.pudding.l3'));
    await s.movePig({ x: 8, y: -125, r: 4 }, 2500, 'cubic-bezier(.4,0,.7,.6)', [
      { x: -3, y: y - 22, r: -5 },
      { x: 6, y: y - 55, r: 5 },
    ]);
    await s.wait(300);
  },
};
