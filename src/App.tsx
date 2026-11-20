import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useI18n } from './i18n';
import { readPersonal, fmt, type Personal } from './engine/params';
import { startEngine, subscribe } from './engine/scroll';
import { startPager } from './engine/pager';
import { SECTIONS } from './engine/specs';
import { store } from './engine/store';
import { Sky, SkyCaption } from './components/Sky';
import { PigActor } from './components/PigActor';
import { Altimeter } from './components/Altimeter';
import { TopBar } from './components/TopBar';
import { Loader } from './components/Loader';
import { PlayCue } from './components/PlayCue';
import { FallFx, Flock, Splat, TabTitle } from './components/Fx';
import { PigArt } from './art/PigArt';
import { Birds, Doubters, Ground, Science } from './sections/Lower';
import { Cruise, News, Precedents, Updraft } from './sections/Middle';
import { Karman, Moon, Space, Station, Summit } from './sections/Upper';

/** global reactions to the scroll position that aren't tied to one scene */
function Director() {
  const { t } = useI18n();
  useEffect(() => {
    const root = document.documentElement;
    const line = `${t.space.wait} ${t.space.howDown}`;
    let dark = root.classList.contains('is-dark');
    const unsub = subscribe((f) => {
      const d = f.alt > 22_000;
      if (d !== dark) {
        dark = d;
        root.classList.toggle('is-dark', d);
      }
      const st = store.get();
      const top = f.idx === SECTIONS.length - 1 && f.p > 0.6 && !st.falling;
      const want = top ? line : null;
      if (st.say !== want) store.set({ say: want });
      if (st.landed && f.idx >= 2) store.set({ landed: false });
    });
    return unsub;
  }, [t]);
  return null;
}

function PrintCert({ personal }: { personal: Personal }) {
  const { t, tag } = useI18n();
  const date = new Intl.DateTimeFormat(tag, { dateStyle: 'long' }).format(new Date());
  return (
    <div className="print-cert" aria-hidden="true">
      <div className="print-cert__frame">
        <p className="print-cert__brand">makepigs.fly</p>
        <h2>{t.print.title}</h2>
        <div className="print-cert__pig">
          <PigArt mood="smug" costume={{ wings: 'feather', goggles: true, scarf: true }} />
        </div>
        <p>{fmt(t.print.body, { date })}</p>
        <p>
          <strong>{t.print.due}</strong>
        </p>
        {personal.to && <p>{fmt(t.print.to, { to: personal.to })}</p>}
        <p className="print-cert__sign">— {t.print.sign} 🐾</p>
      </div>
    </div>
  );
}

export function App() {
  const { t } = useI18n();
  const personal = useMemo(readPersonal, []);

  useLayoutEffect(() => {
    const stopEngine = startEngine();
    const stopPager = startPager();
    return () => {
      stopPager();
      stopEngine();
    };
  }, []);

  return (
    <>
      <a className="skip" href="#space">
        {t.ui.skipToTop}
      </a>
      <Sky />
      <main className="world">
        <Ground personal={personal} />
        <Doubters />
        <Science />
        <Birds />
        <Updraft />
        <Precedents />
        <News />
        <Cruise personal={personal} />
        <Summit />
        <Karman />
        <Station />
        <Moon />
        <Space personal={personal} />
      </main>
      <PigActor />
      <Altimeter />
      <SkyCaption />
      <PlayCue />
      <TopBar />
      <FallFx />
      <Splat />
      <Flock />
      <TabTitle />
      <Director />
      <div className="grain" aria-hidden="true" />
      <Loader personal={personal} />
      <PrintCert personal={personal} />
    </>
  );
}
