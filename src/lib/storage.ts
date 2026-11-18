// localStorage can be missing or throw (private mode, blocked site data, quota). Never let that break the page.
// A write that fails to persist is kept in memory for this tab, so controls keep working; while persistence
// works, reads always go to storage, so changes made in other tabs are seen.
const PREFIX = 'mpf.';
const unsaved = new Map<string, string | null>();

export function load(key: string): string | null {
  if (unsaved.has(key)) return unsaved.get(key) ?? null;
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function save(key: string, value: string): void {
  try {
    window.localStorage.setItem(PREFIX + key, value);
    unsaved.delete(key);
  } catch {
    unsaved.set(key, value);
  }
}

export function remove(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
    unsaved.delete(key);
  } catch {
    unsaved.set(key, null);
  }
}

export function loadJSON<T>(key: string, fallback: T, guard: (v: unknown) => v is T): T {
  const raw = load(key);
  if (raw === null) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
