export type ModeId = 'dare' | 'ways' | 'run';

export interface Route {
  mode: ModeId;
  /** Path segments after the mode, e.g. #/ways/hype-fan → ['hype-fan']. */
  path: string[];
  query: URLSearchParams;
}

export interface ModeContext {
  root: HTMLElement;
  route: Route;
  /** Aborted when the mode is unmounted: pass it to every addEventListener / animation. */
  signal: AbortSignal;
}

export interface Mode {
  mount(ctx: ModeContext): void | Promise<void>;
  /** Handle a route change inside the same mode without remounting. Return false to force a remount. */
  update?(route: Route): boolean;
  unmount?(): void;
}

export type ModeFactory = () => Mode;

/** Fired by the console easter egg; every mode listens for it. */
export const FLY_EVENT = 'makepigs:fly';
