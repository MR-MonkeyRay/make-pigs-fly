import { afterEach, describe, expect, it, vi } from 'vitest';

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const withStorage = async (localStorage: Store) => {
  vi.stubGlobal('window', { localStorage });
  return import('../../src/lib/storage');
};

describe('storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('keeps writes for this tab when storage is blocked', async () => {
    const blocked = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    const s = await withStorage({ getItem: blocked, setItem: blocked, removeItem: blocked });
    expect(s.load('theme')).toBeNull();
    s.save('theme', 'dark');
    expect(s.load('theme')).toBe('dark');
    s.remove('theme');
    expect(s.load('theme')).toBeNull();
  });

  it('reads values written by other tabs while storage works', async () => {
    const data = new Map<string, string>();
    const s = await withStorage({
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => void data.set(k, v),
      removeItem: (k) => void data.delete(k),
    });
    s.save('unlocked', '["a"]');
    data.set('mpf.unlocked', '["a","b"]'); // another tab
    expect(s.load('unlocked')).toBe('["a","b"]');
  });
});
