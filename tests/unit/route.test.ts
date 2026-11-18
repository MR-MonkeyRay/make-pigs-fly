import { describe, expect, it } from 'vitest';
import { parseHash } from '../../src/route';

describe('parseHash', () => {
  it.each([
    ['', 'dare', []],
    ['#/', 'dare', []],
    ['#/ways', 'ways', []],
    ['#/ways/hype-fan', 'ways', ['hype-fan']],
    ['#/run?s=12', 'run', []],
    ['#/nope/x', 'dare', []],
    ['#/ways/%E2%9C%93', 'ways', ['✓']],
    ['#/ways/%E0%A4%A', 'ways', ['%E0%A4%A']],
    ['#/constructor', 'dare', []],
    ['#/__proto__/x', 'dare', []],
    ['#/toString', 'dare', []],
  ] as const)('%s → %s %j', (hash, mode, path) => {
    const r = parseHash(hash);
    expect(r.mode).toBe(mode);
    expect(r.path).toEqual(path);
  });

  it('parses query after the path', () => {
    expect(parseHash('#/?d=abc&x=1').query.get('d')).toBe('abc');
    expect(parseHash('#/run?s=1234').query.get('s')).toBe('1234');
  });
});
