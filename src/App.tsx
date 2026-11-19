import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { FlightStage, type FlightStageHandle } from './components/FlightStage';
import { DepartureBoard } from './components/DepartureBoard';
import { PromiseCertifier } from './components/PromiseCertifier';
import { AchievementPassport } from './components/AchievementPassport';
import { IncomingPromiseModal } from './components/IncomingPromiseModal';
import { Footer } from './components/Footer';
import { useI18n } from './i18n';
import type { AchievementId, DepartureItem } from './i18n/types';
import type { FlightTelemetry } from './engine/types';
import { soundEngine } from './audio/soundEngine';
import {
  clearPromiseQueryFromUrl,
  readPromiseFromUrl,
  type SharedPromisePayload,
} from './utils/urlPromise';

const STORAGE_PEAK_KEY = 'makepigs_fly_peak_alt';
const STORAGE_ACH_KEY = 'makepigs_fly_achievements';

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

function loadSavedPeak(): number {
  try {
    const raw = Number(localStorage.getItem(STORAGE_PEAK_KEY));
    return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : 0;
  } catch {
    return 0;
  }
}

function loadSavedAchievements(): AchievementId[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACH_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AchievementId[]) : [];
  } catch {
    return [];
  }
}

interface ToastMessage {
  id: number;
  text: string;
}

export const App: React.FC = () => {
  const { t } = useI18n();
  const stageRef = useRef<FlightStageHandle | null>(null);

  const [peakAltitude, setPeakAltitude] = useState<number>(() => loadSavedPeak());
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementId[]>(() =>
    loadSavedAchievements()
  );
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [rainbowMode, setRainbowMode] = useState<boolean>(false);

  const [promiseText, setPromiseText] = useState<string>('');
  const [flightNo, setFlightNo] = useState<string>('PIG-747');
  const [incomingPromise, setIncomingPromise] = useState<SharedPromisePayload | null>(() =>
    readPromiseFromUrl()
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const konamiIndexRef = useRef(0);
  const unlockedRef = useRef<Set<AchievementId>>(new Set(unlockedAchievements));
  unlockedRef.current = new Set(unlockedAchievements);

  const pushToast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3400);
  }, []);

  const unlockAchievement = useCallback(
    (id: AchievementId) => {
      if (unlockedRef.current.has(id)) return;
      unlockedRef.current.add(id);
      setUnlockedAchievements((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        try {
          localStorage.setItem(STORAGE_ACH_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage error
        }
        return next;
      });
      const copy = t.passport.achievements[id];
      pushToast(`🏅 ${t.passport.unlocked}: ${copy.title}`);
    },
    [pushToast, t]
  );

  // Persist peak altitude
  const handleTelemetryChange = useCallback((telemetry: FlightTelemetry) => {
    if (telemetry.peakAltitude > 0) {
      setPeakAltitude((prev) => {
        if (telemetry.peakAltitude > prev) {
          try {
            localStorage.setItem(STORAGE_PEAK_KEY, String(telemetry.peakAltitude));
          } catch {
            // Ignore storage error
          }
          return telemetry.peakAltitude;
        }
        return prev;
      });
    }
  }, []);

  const toggleRainbowMode = useCallback(() => {
    setRainbowMode((prev) => {
      const next = !prev;
      if (next) {
        pushToast('🌈 NYAN-PIG HYPERDRIVE ENGAGED!');
      }
      return next;
    });
  }, [pushToast]);

  // Konami Code Easter Egg listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const expected = KONAMI_SEQUENCE[konamiIndexRef.current];
      if (e.code === expected) {
        konamiIndexRef.current += 1;
        if (konamiIndexRef.current === KONAMI_SEQUENCE.length) {
          konamiIndexRef.current = 0;
          toggleRainbowMode();
        }
      } else {
        konamiIndexRef.current = e.code === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleRainbowMode]);

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundEngine.setEnabled(next);
    if (next) {
      soundEngine.playOink(1.1);
    }
  };

  const handleSelectDeparture = (item: DepartureItem) => {
    setPromiseText(item.promiseText);
    setFlightNo(item.flight);
    soundEngine.playChime([523.25, 659.25]);
    document.getElementById('certifier')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLaunchFromCertifier = () => {
    document.getElementById('flight-lab')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      stageRef.current?.triggerFullSend();
    }, 320);
  };

  const handleWitnessIncoming = () => {
    if (incomingPromise) {
      setPromiseText(incomingPromise.promise);
      setFlightNo(incomingPromise.flightNo);
    }
    setIncomingPromise(null);
    clearPromiseQueryFromUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      stageRef.current?.triggerFullSend();
    }, 280);
  };

  const handleDismissIncoming = () => {
    setIncomingPromise(null);
    clearPromiseQueryFromUrl();
  };

  return (
    <>
      <Header
        peakAltitude={peakAltitude}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
        rainbowMode={rainbowMode}
        onSecretLogoClick={toggleRainbowMode}
      />

      <main>
        <FlightStage
          ref={stageRef}
          initialPeakAltitude={peakAltitude}
          rainbowMode={rainbowMode}
          onTelemetryChange={handleTelemetryChange}
          onUnlockAchievement={unlockAchievement}
        />

        <DepartureBoard onSelectFlight={handleSelectDeparture} />

        <PromiseCertifier
          promiseText={promiseText}
          onPromiseTextChange={setPromiseText}
          flightNo={flightNo}
          peakAltitude={peakAltitude}
          onCertified={() => unlockAchievement('promise_certified')}
          onLaunchToProve={handleLaunchFromCertifier}
        />

        <AchievementPassport unlockedIds={unlockedAchievements} />
      </main>

      <Footer />

      {incomingPromise && (
        <IncomingPromiseModal
          payload={incomingPromise}
          onWitness={handleWitnessIncoming}
          onDismiss={handleDismissIncoming}
        />
      )}

      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-item">
            {toast.text}
          </div>
        ))}
      </div>
    </>
  );
};

export default App;
