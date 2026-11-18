import { describe, expect, it } from 'vitest';
import { nextSkitId } from '../../src/modes/ways/shuffle';
import { mulberry32 } from '../../src/lib/rng';

const ALL = ['a', 'b', 'c', 'd'];

describe('nextSkitId', () => {
  it('prefers methods that are not unlocked yet', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 50; i++) expect(['c', 'd']).toContain(nextSkitId(ALL, new Set(['a', 'b']), null, rng));
  });

  it('never repeats the last one when there is a choice', () => {
    const rng = mulberry32(2);
    for (let i = 0; i < 50; i++) expect(nextSkitId(ALL, new Set(ALL), 'b', rng)).not.toBe('b');
  });

  it('collects everything by repeatedly pressing', () => {
    const seen = new Set<string>();
    let last: string | null = null;
    const rng = mulberry32(3);
    for (let i = 0; i < ALL.length; i++) {
      last = nextSkitId(ALL, seen, last, rng);
      seen.add(last);
    }
    expect(seen.size).toBe(ALL.length);
  });

  it('handles a single method', () => {
    expect(nextSkitId(['only'], new Set(['only']), 'only')).toBe('only');
  });
});
