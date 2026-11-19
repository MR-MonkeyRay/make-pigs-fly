import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSky } from './components/HeroSky';
import { FlightTheories } from './components/FlightTheories';
import { ProofPostcard } from './components/ProofPostcard';
import { Footer } from './components/Footer';
import type { SkyMood } from './i18n/types';
import { soundEngine } from './audio/soundEngine';
import {
  clearPromiseQueryFromUrl,
  readPromiseFromUrl,
  type SharedPromisePayload,
} from './utils/urlPromise';

export const App: React.FC = () => {
  const [mood, setMood] = useState<SkyMood>('morning');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [stardust, setStardust] = useState<boolean>(false);
  const [incomingPromise, setIncomingPromise] = useState<SharedPromisePayload | null>(() =>
    readPromiseFromUrl()
  );

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundEngine.setEnabled(next);
    if (next) soundEngine.playOink(1.1);
  };

  const handleDismissIncoming = () => {
    setIncomingPromise(null);
    clearPromiseQueryFromUrl();
  };

  const handleToggleStardust = () => {
    setStardust((prev) => {
      const next = !prev;
      soundEngine.playSoarChime();
      if (next) setMood('aurora');
      return next;
    });
  };

  return (
    <div className="page-root">
      <Header mood={mood} audioEnabled={audioEnabled} onToggleAudio={handleToggleAudio} />

      <main>
        <HeroSky
          mood={mood}
          onChangeMood={setMood}
          stardust={stardust}
          incomingPromise={incomingPromise}
          onDismissIncoming={handleDismissIncoming}
        />

        <FlightTheories />

        <ProofPostcard
          initialPromise={incomingPromise?.promise}
          initialFrom={incomingPromise?.from}
        />
      </main>

      <Footer stardust={stardust} onToggleStardust={handleToggleStardust} />
    </div>
  );
};

export default App;
