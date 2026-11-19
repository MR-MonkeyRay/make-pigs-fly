import type { Locale } from '../i18n/types';

export interface SharedPromisePayload {
  promise: string;
  from: string;
  altitude: number;
  flightNo: string;
}

export function buildPromiseShareUrl(payload: SharedPromisePayload, locale: Locale): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('promise', payload.promise.trim());
  if (payload.from.trim()) {
    url.searchParams.set('from', payload.from.trim());
  }
  url.searchParams.set('alt', String(Math.max(1200, Math.round(payload.altitude))));
  url.searchParams.set('flt', payload.flightNo);
  url.searchParams.set('lang', locale);
  return url.toString();
}

export function readPromiseFromUrl(): SharedPromisePayload | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const promise = params.get('promise')?.trim();
    if (!promise) return null;

    const from = params.get('from')?.trim() || '';
    const altRaw = Number(params.get('alt'));
    const altitude = Number.isFinite(altRaw) && altRaw > 0 ? Math.min(altRaw, 999999) : 14280;
    const flightNo = params.get('flt')?.trim() || 'PIG-747';

    return { promise, from, altitude, flightNo };
  } catch {
    return null;
  }
}

export function clearPromiseQueryFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('promise');
    url.searchParams.delete('from');
    url.searchParams.delete('alt');
    url.searchParams.delete('flt');
    window.history.replaceState({}, '', url.toString());
  } catch {
    // Ignore history API restrictions
  }
}
