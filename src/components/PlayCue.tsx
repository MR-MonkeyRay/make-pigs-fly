import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { useStore } from '../engine/store';
import { go } from '../engine/pager';
import './playcue.css';

type Mode = 'play' | 'cue';

/**
 * Bottom-centre status pill. While a section plays itself it says so (and that
 * any scroll takes over); once the scene has finished it turns into the
 * "keep climbing" cue, which also works as a button.
 */
export function PlayCue() {
  const { t } = useI18n();
  const playing = useStore((s) => s.playing);
  const cue = useStore((s) => s.cue);
  const touch = useStore((s) => s.touch);
  const falling = useStore((s) => s.falling);
  const mode: Mode | null = falling ? null : playing ? 'play' : cue ? 'cue' : null;

  // keep the last face while fading out, so the pill doesn't go blank mid-fade
  const [face, setFace] = useState<Mode>('cue');
  useEffect(() => {
    if (mode) setFace(mode);
  }, [mode]);

  return (
    <div className={`playcue${mode ? ' is-on' : ''} playcue--${face}`}>
      {face === 'play' ? (
        <p className="playcue__play" aria-hidden="true">
          <span className="playcue__rec" />
          {t.ui.playing}
        </p>
      ) : (
        <button type="button" className="playcue__cue" tabIndex={mode ? 0 : -1} onClick={() => go(1)}>
          <span className="playcue__arrow" aria-hidden="true">
            ↑
          </span>
          <span>{touch ? t.ui.cueTouch : t.ui.cueDesktop}</span>
        </button>
      )}
    </div>
  );
}
