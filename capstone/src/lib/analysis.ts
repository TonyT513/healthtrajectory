import type { Band, LabResult, LabTest, Sex } from './types';

export interface Bound {
  value: number;
  inclusive: boolean;
}
export interface ParsedRange {
  low?: Bound;
  high?: Bound;
}

const NUM = '(-?\\d+(?:[.,]\\d+)?)';
const num = (s: string) => Number(s.replace(',', '.'));

/**
 * Parse a reference range the way it is printed on lab reports.
 * Accepts "70-99", "70 – 99", "3.5 to 5.0", "< 5.7", "<=5.7", "≤ 5.7",
 * "> 39", ">= 60", "≥60", with or without a trailing unit.
 * Returns null when the text can't be understood.
 */
export function parseRange(input: string): ParsedRange | null {
  const s = input.trim().replace(/\s+/g, ' ');
  if (!s) return null;

  let m = s.match(new RegExp(`^${NUM}\\s*(?:-|–|—|to)\\s*${NUM}(?:\\s*\\S.*)?$`, 'i'));
  if (m) {
    const a = num(m[1]);
    const b = num(m[2]);
    if (a > b) return null;
    return { low: { value: a, inclusive: true }, high: { value: b, inclusive: true } };
  }

  m = s.match(new RegExp(`^(<=|≤|=<|<|>=|≥|=>|>)\\s*${NUM}(?:\\s*\\S.*)?$`));
  if (m) {
    const v = num(m[2]);
    switch (m[1]) {
      case '<': return { high: { value: v, inclusive: false } };
      case '<=': case '≤': case '=<': return { high: { value: v, inclusive: true } };
      case '>': return { low: { value: v, inclusive: false } };
      default: return { low: { value: v, inclusive: true } };
    }
  }

  // "less than 5.7", "greater than 39", "above 60", "below 200"
  m = s.match(new RegExp(`^(less than|under|below|up to|greater than|over|above|at least)\\s*${NUM}`, 'i'));
  if (m) {
    const v = num(m[2]);
    const w = m[1].toLowerCase();
    if (w === 'up to') return { high: { value: v, inclusive: true } };
    if (w === 'at least') return { low: { value: v, inclusive: true } };
    if (['less than', 'under', 'below'].includes(w)) return { high: { value: v, inclusive: false } };
    return { low: { value: v, inclusive: false } };
  }
  return null;
}

/** Plain-language description of a parsed range. */
export function describeRange(r: ParsedRange | null): string {
  if (!r) return '';
  const f = (n: number) => formatNumber(n);
  if (r.low && r.high) return `between ${f(r.low.value)} and ${f(r.high.value)}`;
  if (r.high) return r.high.inclusive ? `${f(r.high.value)} or lower` : `below ${f(r.high.value)}`;
  if (r.low) return r.low.inclusive ? `${f(r.low.value)} or higher` : `above ${f(r.low.value)}`;
  return '';
}

export type Status = 'in' | 'high' | 'low' | 'unknown';

export function statusOf(value: number, rangeText: string): Status {
  const r = parseRange(rangeText);
  if (!r) return 'unknown';
  if (r.high && (r.high.inclusive ? value > r.high.value : value >= r.high.value)) return 'high';
  if (r.low && (r.low.inclusive ? value < r.low.value : value <= r.low.value)) return 'low';
  return 'in';
}

export const STATUS_LABEL: Record<Status, string> = {
  in: 'In range',
  high: 'High',
  low: 'Low',
  unknown: 'No range',
};

/** How far outside the range a value is, as a fraction of the range scale. 0 when inside. */
function distanceOutside(value: number, rangeText: string): number {
  const r = parseRange(rangeText);
  if (!r) return 0;
  const scale = r.low && r.high ? r.high.value - r.low.value || 1 : Math.abs((r.high ?? r.low)!.value) || 1;
  const st = statusOf(value, rangeText);
  if (st === 'high') return (value - r.high!.value) / scale;
  if (st === 'low') return (r.low!.value - value) / scale;
  return 0;
}

export type Direction = 'up' | 'down' | 'flat';
export type Trend = 'improving' | 'worsening' | 'stable' | 'single';

export interface Series {
  test: LabTest;
  /** oldest → newest */
  results: LabResult[];
  latest: LabResult;
  previous?: LabResult;
  status: Status;
  change?: number;
  direction?: Direction;
  trend: Trend;
  /** Summary bucket used for dashboard counts. */
  bucket: 'attention' | 'improving' | 'worsening' | 'stable' | 'single';
}

export function byDate(a: LabResult, b: LabResult) {
  return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
}

export function buildSeries(test: LabTest, all: LabResult[]): Series | null {
  const results = all.filter((r) => r.testId === test.id).sort(byDate);
  if (!results.length) return null;
  const latest = results[results.length - 1];
  const previous = results.length > 1 ? results[results.length - 2] : undefined;
  const status = statusOf(latest.value, latest.range);

  let change: number | undefined;
  let direction: Direction | undefined;
  let trend: Trend = 'single';

  if (previous) {
    change = round(latest.value - previous.value);
    const sig = test.sig ?? Math.max(Math.abs(previous.value) * 0.03, 1e-9);
    direction = Math.abs(change) < sig ? 'flat' : change > 0 ? 'up' : 'down';

    const prevStatus = statusOf(previous.value, previous.range);
    if (direction === 'flat') {
      trend = 'stable';
    } else if (prevStatus === 'high' || prevStatus === 'low' || status === 'high' || status === 'low') {
      // Anything outside a range: judge by whether it moved toward the range.
      const before = distanceOutside(previous.value, previous.range);
      const after = distanceOutside(latest.value, latest.range);
      trend = after < before ? 'improving' : after > before ? 'worsening' : 'stable';
    } else if (test.better === 'lower') {
      trend = direction === 'down' ? 'improving' : 'worsening';
    } else if (test.better === 'higher') {
      trend = direction === 'up' ? 'improving' : 'worsening';
    } else {
      trend = 'stable';
    }
  }

  const bucket: Series['bucket'] = status === 'high' || status === 'low' ? 'attention' : trend;
  return { test, results, latest, previous, status, change, direction, trend, bucket };
}

export function allSeries(tests: LabTest[], results: LabResult[]): Series[] {
  const ids = new Set(results.map((r) => r.testId));
  return tests
    .filter((t) => ids.has(t.id))
    .map((t) => buildSeries(t, results)!)
    .sort((a, b) => b.latest.date.localeCompare(a.latest.date));
}

export type Overall = 'Needs attention' | 'Improving' | 'Stable' | 'No data';

export function summarize(series: Series[]) {
  const counts = { attention: 0, improving: 0, worsening: 0, stable: 0, single: 0 };
  for (const s of series) counts[s.bucket]++;
  let overall: Overall = 'No data';
  if (series.length) {
    if (counts.attention > 0) overall = 'Needs attention';
    else if (counts.improving > counts.worsening) overall = 'Improving';
    else overall = 'Stable';
  }
  return { counts, overall, total: series.length };
}

export function bandFor(bands: Band[] | undefined, value: number): Band | undefined {
  return bands?.find((b) => (b.min === undefined || value >= b.min) && (b.max === undefined || value < b.max));
}

export function typicalRange(test: LabTest, sex: Sex): string {
  if (!test.typical) return '';
  if (typeof test.typical === 'string') return test.typical;
  return sex === 'female' ? test.typical.female : test.typical.male;
}

/** Display a range string consistently, e.g. "70-99" → "70–99", "<5.7" → "< 5.7". */
export function prettyRange(text: string): string {
  const r = parseRange(text);
  if (!r) return text;
  const f = formatNumber;
  if (r.low && r.high) return `${f(r.low.value)}–${f(r.high.value)}`;
  if (r.high) return `${r.high.inclusive ? '≤' : '<'} ${f(r.high.value)}`;
  if (r.low) return `${r.low.inclusive ? '≥' : '>'} ${f(r.low.value)}`;
  return text;
}

export function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : abs >= 1 ? 2 : 3;
  return Number(n.toFixed(digits)).toLocaleString('en-US', { maximumFractionDigits: digits });
}

export function formatChange(n: number): string {
  if (n === 0) return '0';
  return `${n > 0 ? '+' : '−'}${formatNumber(Math.abs(n))}`;
}
