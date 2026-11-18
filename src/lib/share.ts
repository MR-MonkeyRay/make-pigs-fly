import { t } from '../i18n';
import { toast } from './dom';

/** Use the native share sheet when there is one (mostly phones), otherwise copy the link. */
export async function shareLink(url: string, text: string): Promise<void> {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void>; canShare?: (d: ShareData) => boolean };
  const data: ShareData = { title: t('site.title'), text, url };
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  if (coarse && nav.share && (!nav.canShare || nav.canShare(data))) {
    try {
      await nav.share(data);
      return;
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return; // user closed the sheet
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast(t('ui.copied'));
  } catch {
    toast(t('ui.copyFailed'), url);
  }
}

/** Absolute URL for an in-app hash route, relative to wherever the site is hosted. */
export function hashUrl(hash: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${hash.startsWith('#') ? hash : `#${hash}`}`;
}
