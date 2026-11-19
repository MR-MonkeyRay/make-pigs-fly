import type { Locale } from '../i18n/types';

export interface SharedPromisePayload {
  promise: string;
  from: string;
}

export function buildPromiseShareUrl(payload: SharedPromisePayload, locale: Locale): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('promise', payload.promise.trim());
  if (payload.from.trim()) {
    url.searchParams.set('from', payload.from.trim());
  }
  url.searchParams.set('lang', locale);
  return url.toString();
}

export function readPromiseFromUrl(): SharedPromisePayload | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const promise = params.get('promise')?.trim();
    if (!promise) return null;
    const from = params.get('from')?.trim() || '';
    return { promise, from };
  } catch {
    return null;
  }
}

export function clearPromiseQueryFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('promise');
    url.searchParams.delete('from');
    window.history.replaceState({}, '', url.toString());
  } catch {
    // Ignore history API restrictions
  }
}
