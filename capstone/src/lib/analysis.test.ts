import { describe, expect, it } from 'vitest';
import { bandFor, buildSeries, parseRange, prettyRange, statusOf, summarize } from './analysis';
import { TESTS } from './catalog';
import type { LabResult } from './types';

const test = (id: string) => TESTS.find((t) => t.id === id)!;
let n = 0;
const r = (testId: string, value: number, range: string, date: string): LabResult => ({
  id: String(n++), testId, value, range, date, unit: '', createdAt: `2026-01-01T00:00:0${n % 10}Z`,
});

describe('parseRange', () => {
  it('reads common report formats', () => {
    expect(parseRange('70-99')).toEqual({ low: { value: 70, inclusive: true }, high: { value: 99, inclusive: true } });
    expect(parseRange('3.5 – 5.0 mmol/L')).toEqual({ low: { value: 3.5, inclusive: true }, high: { value: 5, inclusive: true } });
    expect(parseRange('< 5.7 %')).toEqual({ high: { value: 5.7, inclusive: false } });
    expect(parseRange('≤5.7')).toEqual({ high: { value: 5.7, inclusive: true } });
    expect(parseRange('>39')).toEqual({ low: { value: 39, inclusive: false } });
    expect(parseRange('>= 60')).toEqual({ low: { value: 60, inclusive: true } });
    expect(parseRange('less than 200')).toEqual({ high: { value: 200, inclusive: false } });
    expect(parseRange('0.45 to 4.5')).toEqual({ low: { value: 0.45, inclusive: true }, high: { value: 4.5, inclusive: true } });
  });
  it('rejects nonsense and reversed ranges', () => {
    expect(parseRange('')).toBeNull();
    expect(parseRange('normal')).toBeNull();
    expect(parseRange('99-70')).toBeNull();
  });
  it('pretty-prints', () => {
    expect(prettyRange('70-99')).toBe('70–99');
    expect(prettyRange('<5.7')).toBe('< 5.7');
    expect(prettyRange('>=60')).toBe('≥ 60');
  });
});

describe('statusOf', () => {
  it('respects strict vs inclusive bounds', () => {
    expect(statusOf(5.7, '< 5.7')).toBe('high');
    expect(statusOf(5.6, '< 5.7')).toBe('in');
    expect(statusOf(5.7, '<= 5.7')).toBe('in');
    expect(statusOf(99, '70-99')).toBe('in');
    expect(statusOf(100, '70-99')).toBe('high');
    expect(statusOf(65, '70-99')).toBe('low');
    expect(statusOf(39, '> 39')).toBe('low');
    expect(statusOf(1, 'see note')).toBe('unknown');
  });
});

describe('buildSeries', () => {
  it('calls a falling LDL inside range improving', () => {
    const s = buildSeries(test('ldl'), [r('ldl', 98, '< 100', '2026-01-01'), r('ldl', 85, '< 100', '2026-06-01')])!;
    expect(s.direction).toBe('down');
    expect(s.trend).toBe('improving');
    expect(s.bucket).toBe('improving');
  });
  it('flags anything out of range as needing attention, but still reports the trend', () => {
    const s = buildSeries(test('ldl'), [r('ldl', 148, '< 100', '2025-10-01'), r('ldl', 122, '< 100', '2026-08-01')])!;
    expect(s.status).toBe('high');
    expect(s.trend).toBe('improving');
    expect(s.bucket).toBe('attention');
  });
  it('treats small changes as stable', () => {
    const s = buildSeries(test('a1c'), [r('a1c', 5.6, '< 5.7', '2026-01-01'), r('a1c', 5.5, '< 5.7', '2026-06-01')])!;
    expect(s.trend).toBe('stable');
  });
  it('judges range-type tests by distance to the range', () => {
    const s = buildSeries(test('tsh'), [r('tsh', 6.2, '0.45-4.5', '2026-01-01'), r('tsh', 5.0, '0.45-4.5', '2026-06-01')])!;
    expect(s.trend).toBe('improving');
  });
  it('orders by date, not entry order', () => {
    const s = buildSeries(test('hdl'), [r('hdl', 60, '> 39', '2026-06-01'), r('hdl', 45, '> 39', '2026-01-01')])!;
    expect(s.latest.value).toBe(60);
    expect(s.trend).toBe('improving');
  });
});

describe('summarize', () => {
  it('rolls up overall health', () => {
    const a = buildSeries(test('a1c'), [r('a1c', 5.6, '< 5.7', '2026-01-01')])!;
    expect(summarize([a]).overall).toBe('Stable');
    const b = buildSeries(test('ldl'), [r('ldl', 140, '< 100', '2026-01-01')])!;
    expect(summarize([a, b]).overall).toBe('Needs attention');
    expect(summarize([]).overall).toBe('No data');
  });
});

describe('bandFor', () => {
  it('finds guideline bands with inclusive min / exclusive max', () => {
    expect(bandFor(test('a1c').bands, 5.6)?.label).toBe('Normal');
    expect(bandFor(test('a1c').bands, 5.7)?.label).toBe('Prediabetes range');
    expect(bandFor(test('a1c').bands, 6.5)?.label).toBe('Diabetes range');
  });
});

describe('catalog', () => {
  it('has unique ids and parseable typical ranges', () => {
    const ids = TESTS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TESTS) {
      const ranges = typeof t.typical === 'string' ? [t.typical] : t.typical ? [t.typical.male, t.typical.female] : [];
      for (const range of ranges) expect(parseRange(range), `${t.id}: ${range}`).not.toBeNull();
    }
  });
});
