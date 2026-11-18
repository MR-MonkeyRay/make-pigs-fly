// Dare sentences travel inside the URL hash (#/?d=…). Everything decoded here is untrusted:
// it is length-checked, stripped of control/bidi characters, and only ever rendered via textContent.

export const PROMISE_MAX = 60;
export const SENTENCE_MAX = 160;

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const BIDI = /[‪-‮⁦-⁩‎‏؜]/g;

export function graphemeLength(text: string): number {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    let n = 0;
    for (const _ of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)) n++;
    return n;
  }
  return Array.from(text).length;
}

export function sanitize(text: string): string {
  return text.replace(CONTROL, ' ').replace(BIDI, '').replace(/\s+/g, ' ').trim();
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(param: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(param)) return null;
  const b64 = param.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (param.length % 4)) % 4);
  try {
    const bin = atob(b64);
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export function encodeDare(sentence: string): string {
  return toBase64Url(new TextEncoder().encode(sanitize(sentence)));
}

/** Returns a safe sentence, or null when the parameter is missing, malformed, empty or too long. */
export function decodeDare(param: string | null | undefined): string | null {
  if (!param || param.length > SENTENCE_MAX * 8) return null;
  const bytes = fromBase64Url(param);
  if (!bytes) return null;
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
  const clean = sanitize(text);
  if (!clean || graphemeLength(clean) > SENTENCE_MAX) return null;
  return clean;
}

/** Validate what a visitor types into the composer. */
export function checkPromise(raw: string): { ok: true; text: string } | { ok: false; reason: 'empty' | 'long' } {
  const text = sanitize(raw);
  if (!text) return { ok: false, reason: 'empty' };
  if (graphemeLength(text) > PROMISE_MAX) return { ok: false, reason: 'long' };
  return { ok: true, text };
}

/** Split a template like "When pigs fly, I'll {promise}." around the placeholder. */
export function splitTemplate(template: string): [string, string] {
  const i = template.indexOf('{promise}');
  if (i < 0) return [template + ' ', ''];
  return [template.slice(0, i), template.slice(i + '{promise}'.length)];
}
