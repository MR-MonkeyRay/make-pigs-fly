/** Personalisation via the URL: ?to=Kevin&said=pay%20me%20back&lang=en */

export interface Personal {
  to: string;
  said: string;
}

function clean(v: string | null, max: number): string {
  if (!v) return '';
  // strip control chars, collapse whitespace, cap length (counted in code points)
  const s = v.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();
  return Array.from(s).slice(0, max).join('');
}

export function readPersonal(): Personal {
  try {
    const q = new URLSearchParams(window.location.search);
    return { to: clean(q.get('to'), 24), said: clean(q.get('said'), 40) };
  } catch {
    return { to: '', said: '' };
  }
}

export function buildShareUrl(to: string, said: string, lang: string): string {
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  const t = clean(to, 24);
  const s = clean(said, 40);
  if (t) url.searchParams.set('to', t);
  if (s) url.searchParams.set('said', s);
  url.searchParams.set('lang', lang);
  return url.toString();
}

/** fill {placeholders} in a template */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
