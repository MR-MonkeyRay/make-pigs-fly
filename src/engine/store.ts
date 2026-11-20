import { useSyncExternalStore } from 'react';

export interface AppState {
  /** loader is still covering the page */
  booting: boolean;
  /** the "bring him home" free-fall is running */
  falling: boolean;
  /** underpants parachute deployed */
  chute: boolean;
  /** the ground scene shows the post-landing state */
  landed: boolean;
  /** pig carries mud after the first landing, forever */
  muddy: boolean;
  muted: boolean;
  reduced: boolean;
  touch: boolean;
  /** transient pig speech bubble (pokes, landing) */
  bubble: string | null;
  /** persistent line a scene wants the pig to say */
  say: string | null;
  /** id of the "OINK" flock run, 0 = none */
  flock: number;
  /** the current section is playing itself (autoplay) */
  playing: boolean;
  /** the scene has finished: cue the reader to keep climbing */
  cue: boolean;
}

type Listener = () => void;

function prefersReduced(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function isTouch(): boolean {
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

function readMuted(): boolean {
  try {
    return localStorage.getItem('makepigs.sound') !== 'on';
  } catch {
    return true;
  }
}

let state: AppState = {
  booting: true,
  falling: false,
  chute: false,
  landed: false,
  muddy: false,
  muted: readMuted(),
  reduced: prefersReduced(),
  touch: isTouch(),
  bubble: null,
  say: null,
  flock: 0,
  playing: false,
  cue: false,
};

const listeners = new Set<Listener>();

export const store = {
  get: (): AppState => state,
  set(patch: Partial<AppState>) {
    let changed = false;
    for (const k in patch) {
      const key = k as keyof AppState;
      if (state[key] !== patch[key]) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    state = { ...state, ...patch };
    if ('muted' in patch) {
      try {
        localStorage.setItem('makepigs.sound', state.muted ? 'off' : 'on');
      } catch {
        /* private mode */
      }
    }
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

try {
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    store.set({ reduced: e.matches });
  });
  window.matchMedia('(pointer: coarse)').addEventListener('change', (e) => {
    store.set({ touch: e.matches });
  });
} catch {
  /* old browsers */
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state)
  );
}
