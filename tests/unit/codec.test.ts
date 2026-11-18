import { describe, expect, it } from 'vitest';
import { checkPromise, decodeDare, encodeDare, graphemeLength, PROMISE_MAX, sanitize, SENTENCE_MAX, splitTemplate } from '../../src/modes/dare/codec';

describe('dare codec', () => {
  it.each(['When pigs fly, I’ll close these 38 tabs.', '等猪飞了，我就十二点前睡觉。', 'ブタが飛んだら、早起きする。🐖💨👨‍👩‍👧'])('round-trips %s', (s) => {
    const encoded = encodeDare(s);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeDare(encoded)).toBe(s);
  });

  it('keeps markup as plain text (rendering uses textContent)', () => {
    const s = '<img src=x onerror="alert(1)"> <script>alert(2)</script>';
    expect(decodeDare(encodeDare(s))).toBe(s);
  });

  it('strips control and bidi-override characters', () => {
    expect(sanitize('a\u0000b‮c⁦d\n\te')).toBe('a bcd e');
  });

  it('rejects garbage, empty and over-long input', () => {
    expect(decodeDare(null)).toBeNull();
    expect(decodeDare('')).toBeNull();
    expect(decodeDare('%%%')).toBeNull();
    expect(decodeDare('////')).toBeNull();
    expect(decodeDare(encodeDare('   '))).toBeNull();
    expect(decodeDare(encodeDare('x'.repeat(SENTENCE_MAX + 1)))).toBeNull();
    // invalid UTF-8 (lone continuation byte 0x80)
    expect(decodeDare('gA')).toBeNull();
  });

  it('counts graphemes, not code units', () => {
    expect(graphemeLength('👨‍👩‍👧🐖')).toBe(2);
  });

  it('validates composer input', () => {
    expect(checkPromise('  ')).toEqual({ ok: false, reason: 'empty' });
    expect(checkPromise('猪'.repeat(PROMISE_MAX + 1))).toEqual({ ok: false, reason: 'long' });
    expect(checkPromise('  clean  the   garage ')).toEqual({ ok: true, text: 'clean the garage' });
  });

  it('splits the template around {promise}', () => {
    expect(splitTemplate('When pigs fly, I’ll {promise}.')).toEqual(['When pigs fly, I’ll ', '.']);
    expect(splitTemplate('等猪飞了，我就{promise}。')).toEqual(['等猪飞了，我就', '。']);
  });
});
