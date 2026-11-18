import { t } from '../i18n';
import { FLY_EVENT } from '../modes/types';

declare global {
  interface Window {
    makePigs?: { readonly fly: () => string };
  }
}

/** The domain is a method call. So make it one: type makePigs.fly() in DevTools. */
export function installConsoleEgg(): void {
  const api = Object.freeze({
    fly(): string {
      window.dispatchEvent(new CustomEvent(FLY_EVENT));
      return `🐖💨 ${t('egg.flown')}`;
    },
  });
  try {
    Object.defineProperty(window, 'makePigs', { value: api, configurable: true });
  } catch {
    window.makePigs = api;
  }
  console.log(
    '%c makepigs.fly %c ' + t('egg.banner'),
    'background:#ff9fb6;color:#2a1e2e;font-weight:800;padding:4px 8px;border-radius:6px 0 0 6px',
    'background:#2a1e2e;color:#ffe9a8;padding:4px 8px;border-radius:0 6px 6px 0',
  );
}
