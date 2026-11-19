import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Flame, RotateCcw, Wind, Feather, Sparkles, Radio } from 'lucide-react';
import { useI18n } from '../i18n';
import type { AchievementId } from '../i18n/types';
import { FlightEngine } from '../engine/FlightEngine';
import type { FlightTelemetry, PropulsionState } from '../engine/types';

export interface FlightStageHandle {
  triggerFullSend: () => void;
  setRainbowMode: (enabled: boolean) => void;
}

interface FlightStageProps {
  initialPeakAltitude: number;
  rainbowMode: boolean;
  onTelemetryChange: (telemetry: FlightTelemetry) => void;
  onUnlockAchievement: (id: AchievementId) => void;
}

const DEFAULT_TELEMETRY: FlightTelemetry = {
  altitude: 0,
  peakAltitude: 0,
  verticalVelocity: 0,
  mach: 0,
  skepticism: 100,
  zone: 'tarmac',
  airborne: false,
  atcKey: 'ready',
};

export const FlightStage = React.forwardRef<FlightStageHandle, FlightStageProps>(
  ({ initialPeakAltitude, rainbowMode, onTelemetryChange, onUnlockAchievement }, ref) => {
    const { t } = useI18n();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<FlightEngine | null>(null);

    const [telemetry, setTelemetry] = useState<FlightTelemetry>({
      ...DEFAULT_TELEMETRY,
      peakAltitude: initialPeakAltitude,
    });

    const [propulsion, setPropulsion] = useState<PropulsionState>({
      windLevel: 0,
      balloonCount: 0,
      rocketsActive: false,
      wingsEquipped: false,
      rainbowMode,
    });

    const onTelemetryRef = useRef(onTelemetryChange);
    const onUnlockRef = useRef(onUnlockAchievement);
    onTelemetryRef.current = onTelemetryChange;
    onUnlockRef.current = onUnlockAchievement;

    // Mount 60fps FlightEngine
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const engine = new FlightEngine(canvas, t, {
        onTelemetry: (next) => {
          setTelemetry(next);
          onTelemetryRef.current(next);
        },
        onUnlockAchievement: (id) => {
          onUnlockRef.current(id);
        },
        onPropulsionSync: (next) => {
          setPropulsion(next);
        },
      });
      engine.setPeakAltitude(initialPeakAltitude);
      engine.start();
      engineRef.current = engine;

      return () => {
        engine.destroy();
        engineRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep translations in sync with canvas speech & tags
    useEffect(() => {
      engineRef.current?.updateTranslations(t);
    }, [t]);

    // Sync rainbow mode from Easter Egg
    useEffect(() => {
      setPropulsion((prev) => ({ ...prev, rainbowMode }));
      engineRef.current?.setPropulsion({ rainbowMode });
    }, [rainbowMode]);

    // Spacebar flaps wings when not typing in an input/textarea
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code !== 'Space') return;
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
        e.preventDefault();
        engineRef.current?.flapWings();
        setPropulsion((prev) => ({ ...prev, wingsEquipped: true }));
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleWindChange = useCallback((value: number) => {
      const clamped = Math.max(0, Math.min(100, value));
      setPropulsion((prev) => ({ ...prev, windLevel: clamped }));
      engineRef.current?.setPropulsion({ windLevel: clamped });
    }, []);

    const handleAddBalloon = useCallback(() => {
      const nextCount = engineRef.current?.addBalloon() ?? 0;
      setPropulsion((prev) => ({ ...prev, balloonCount: nextCount }));
    }, []);

    const handlePopBalloons = useCallback(() => {
      engineRef.current?.popAllBalloons();
      setPropulsion((prev) => ({ ...prev, balloonCount: 0 }));
    }, []);

    const handleToggleRockets = useCallback(() => {
      setPropulsion((prev) => {
        const next = !prev.rocketsActive;
        engineRef.current?.setPropulsion({ rocketsActive: next });
        return { ...prev, rocketsActive: next };
      });
    }, []);

    const handleFlap = useCallback(() => {
      engineRef.current?.flapWings();
      setPropulsion((prev) => ({ ...prev, wingsEquipped: true }));
    }, []);

    const handleFullSend = useCallback(() => {
      const next = engineRef.current?.fullSend();
      if (next) setPropulsion(next);
    }, []);

    const handleReset = useCallback(() => {
      const next = engineRef.current?.resetToRunway();
      if (next) setPropulsion(next);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        triggerFullSend: handleFullSend,
        setRainbowMode: (enabled: boolean) => {
          setPropulsion((prev) => ({ ...prev, rainbowMode: enabled }));
          engineRef.current?.setPropulsion({ rainbowMode: enabled });
        },
      }),
      [handleFullSend]
    );

    const statusLabel =
      telemetry.altitude >= 40000
        ? t.cockpit.statusSpace
        : telemetry.airborne
          ? t.cockpit.statusAirborne
          : t.cockpit.statusReady;

    return (
      <section id="flight-lab" className="section hero-section">
        <div className="container">
          <div className="hero-top">
            <div className="hero-copy">
              <div className="eyebrow">{t.hero.eyebrow}</div>
              <h1 className="hero-title">
                {t.hero.titleLine1}
                <br />
                <span className="accent">{t.hero.titleLine2}</span>
              </h1>
              <p className="hero-subtitle">{t.hero.subtitle}</p>
            </div>

            <div className="hero-quick-actions">
              <button type="button" className="btn btn-primary" onClick={handleFullSend}>
                <Sparkles size={16} />
                {t.hero.fullSend}
              </button>
              <button type="button" className="btn" onClick={handleReset}>
                <RotateCcw size={15} />
                {t.hero.resetGround}
              </button>
            </div>
          </div>

          {rainbowMode && <div className="rainbow-banner">{t.hero.rainbowBanner}</div>}

          <div className="flight-shell">
            {/* Live Aviation Telemetry HUD */}
            <div className="hud-bar">
              <div className="hud-cell">
                <span className="hud-label">{t.hud.altitude}</span>
                <span className="hud-value alt">
                  {telemetry.altitude.toLocaleString()}
                  <span className="hud-sub">m</span>
                </span>
              </div>

              <div className="hud-cell">
                <span className="hud-label">{t.hud.velocity}</span>
                <span className="hud-value vel">
                  {telemetry.verticalVelocity >= 0 ? '+' : ''}
                  {telemetry.verticalVelocity}
                  <span className="hud-sub">
                    {telemetry.mach >= 0.85 ? `${t.hud.mach} ${telemetry.mach.toFixed(1)}` : 'm/s'}
                  </span>
                </span>
              </div>

              <div className="hud-cell">
                <span className="hud-label">{t.hud.skepticism}</span>
                <span className={`hud-value ${telemetry.skepticism > 30 ? 'skeptic-high' : 'skeptic-low'}`}>
                  {telemetry.skepticism}%
                  <span className="hud-sub">
                    {telemetry.skepticism === 0
                      ? t.hud.shattered
                      : telemetry.skepticism === 100
                        ? t.hud.impossible
                        : ''}
                  </span>
                </span>
              </div>

              <div className="hud-cell">
                <span className="hud-label">{t.hud.zone}</span>
                <span className="hud-value">{t.hud.zones[telemetry.zone]}</span>
              </div>
            </div>

            {/* Interactive 60fps Sky Stage */}
            <div className="canvas-stage">
              <canvas
                ref={canvasRef}
                className="flight-canvas"
                aria-label="Interactive Captain Wilbur flight simulator canvas"
              />
              <div className="stage-chips">
                <span className="stage-chip">👆 {t.hero.pokeHint}</span>
                <span className="stage-chip">✋ {t.hero.dragHint}</span>
              </div>
            </div>

            {/* Live ATC Radio Comms */}
            <div className="atc-bar" role="status" aria-live="polite">
              <span className="atc-badge">
                <span className="atc-dot" />
                <Radio size={11} />
                {t.atc.prefix}
              </span>
              <span className="atc-text">{t.atc[telemetry.atcKey]}</span>
            </div>

            {/* 4-Module Propulsion Control Deck */}
            <div className="cockpit-deck">
              <div className="deck-header">
                <span className="deck-title">{t.cockpit.deckTitle}</span>
                <span className={`deck-status ${telemetry.altitude >= 40000 ? 'space' : ''}`}>
                  ● {statusLabel}
                </span>
              </div>

              <div className="modules-grid">
                {/* 1. Startup Hype Wind Vent */}
                <div className={`module-card ${propulsion.windLevel > 0 ? 'active' : ''}`}>
                  <div>
                    <div className="module-head">
                      <span className="module-name">
                        <span className="module-icon wind">
                          <Wind size={16} />
                        </span>
                        {t.cockpit.windTitle}
                      </span>
                      <span className="module-readout">{propulsion.windLevel}%</span>
                    </div>
                    <p className="module-desc">{t.cockpit.windDesc}</p>
                  </div>

                  <div className="wind-slider-wrap">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={propulsion.windLevel}
                      onChange={(e) => handleWindChange(Number(e.target.value))}
                      className="wind-slider"
                      aria-label={t.cockpit.windTitle}
                    />
                    <div className="module-actions">
                      <button
                        type="button"
                        className="cockpit-btn"
                        onClick={() => handleWindChange(propulsion.windLevel === 100 ? 0 : 100)}
                      >
                        {propulsion.windLevel === 100 ? t.cockpit.windOff : t.cockpit.windMax}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Compliment Balloons */}
                <div className={`module-card ${propulsion.balloonCount > 0 ? 'active' : ''}`}>
                  <div>
                    <div className="module-head">
                      <span className="module-name">
                        <span className="module-icon balloon">🎈</span>
                        {t.cockpit.balloonTitle}
                      </span>
                      <span className="module-readout">{propulsion.balloonCount}/15</span>
                    </div>
                    <p className="module-desc">{t.cockpit.balloonDesc}</p>
                  </div>

                  <div className="module-actions">
                    <button type="button" className="cockpit-btn pink" onClick={handleAddBalloon}>
                      {t.cockpit.balloonAdd}
                    </button>
                    <button
                      type="button"
                      className="cockpit-btn ghost"
                      onClick={handlePopBalloons}
                      disabled={propulsion.balloonCount === 0}
                    >
                      {t.cockpit.balloonPop}
                    </button>
                  </div>
                </div>

                {/* 3. Zero-Bacon Booster Rockets */}
                <div className={`module-card ${propulsion.rocketsActive ? 'rocket-on' : ''}`}>
                  <div>
                    <div className="module-head">
                      <span className="module-name">
                        <span className="module-icon rocket">
                          <Flame size={16} />
                        </span>
                        {t.cockpit.rocketTitle}
                      </span>
                      <span className="module-readout">
                        {propulsion.rocketsActive ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="module-desc">{t.cockpit.rocketDesc}</p>
                  </div>

                  <div className="module-actions">
                    <button
                      type="button"
                      className={`cockpit-btn ${propulsion.rocketsActive ? 'orange' : ''}`}
                      onClick={handleToggleRockets}
                    >
                      <Flame size={15} />
                      {propulsion.rocketsActive ? t.cockpit.rocketCutoff : t.cockpit.rocketIgnite}
                    </button>
                  </div>
                </div>

                {/* 4. Tiny Angel Wings */}
                <div className={`module-card ${propulsion.wingsEquipped ? 'active' : ''}`}>
                  <div>
                    <div className="module-head">
                      <span className="module-name">
                        <span className="module-icon wings">
                          <Feather size={16} />
                        </span>
                        {t.cockpit.wingsTitle}
                      </span>
                      <span className="kbd-chip">{t.cockpit.wingsKeyHint}</span>
                    </div>
                    <p className="module-desc">{t.cockpit.wingsDesc}</p>
                  </div>

                  <div className="module-actions">
                    <button type="button" className="cockpit-btn gold" onClick={handleFlap}>
                      <Feather size={15} />
                      {t.cockpit.wingsFlap}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

FlightStage.displayName = 'FlightStage';
