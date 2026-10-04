import { useLayoutEffect, useRef, useState } from 'react';
import { formatNumber, parseRange, prettyRange, statusOf, STATUS_LABEL } from '../lib/analysis';
import { formatDate, formatMonth, toTime } from '../lib/dates';
import type { LabResult } from '../lib/types';

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** y-domain covering the values and the reference range, padded and rounded. */
function domain(values: number[], rangeText: string): [number, number] {
  const r = parseRange(rangeText);
  const pts = [...values];
  if (r?.low) pts.push(r.low.value);
  if (r?.high) pts.push(r.high.value);
  let lo = Math.min(...pts);
  let hi = Math.max(...pts);
  if (lo === hi) {
    lo -= Math.abs(lo) * 0.1 || 1;
    hi += Math.abs(hi) * 0.1 || 1;
  }
  const pad = (hi - lo) * 0.15;
  lo = lo - pad;
  hi = hi + pad;
  if (Math.min(...values) >= 0 && lo < 0) lo = 0;
  return [lo, hi];
}

function niceTicks(lo: number, hi: number, count = 4) {
  const raw = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Number(v.toFixed(6)));
  return out;
}

function bandRect(rangeText: string, lo: number, hi: number) {
  const r = parseRange(rangeText);
  if (!r) return null;
  return { from: Math.max(r.low?.value ?? lo, lo), to: Math.min(r.high?.value ?? hi, hi) };
}

// ── Sparkline ───────────────────────────────────────────────────────────────

export function Sparkline({ results, width = 112, height = 32 }: { results: LabResult[]; width?: number; height?: number }) {
  if (!results.length) return null;
  const latest = results[results.length - 1];
  const values = results.map((r) => r.value);
  const [lo, hi] = domain(values, latest.range);
  const t0 = toTime(results[0].date);
  const t1 = toTime(latest.date);
  const x = (r: LabResult) => (results.length === 1 || t1 === t0 ? width / 2 : 4 + ((toTime(r.date) - t0) / (t1 - t0)) * (width - 8));
  const y = (v: number) => height - 4 - ((v - lo) / (hi - lo)) * (height - 8);
  const band = bandRect(latest.range, lo, hi);
  const st = statusOf(latest.value, latest.range);
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      {band && <rect x={0} width={width} y={y(band.to)} height={Math.max(0, y(band.from) - y(band.to))} className="spark-band" />}
      {results.length > 1 && <polyline points={results.map((r) => `${x(r)},${y(r.value)}`).join(' ')} className="spark-line" />}
      <circle cx={x(latest)} cy={y(latest.value)} r={3} className={`spark-dot ${st === 'high' || st === 'low' ? 'is-out' : ''}`} />
    </svg>
  );
}

// ── Full trend chart ────────────────────────────────────────────────────────

export function TrendChart({ results, unit, height = 280 }: { results: LabResult[]; unit: string; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const latest = results[results.length - 1];
  const values = results.map((r) => r.value);
  const [lo, hi] = domain(values, latest.range);
  const ticks = niceTicks(lo, hi);
  const m = { top: 24, right: 20, bottom: 32, left: 44 };
  const w = Math.max(0, width - m.left - m.right);
  const h = height - m.top - m.bottom;

  const t0 = toTime(results[0].date);
  const t1 = toTime(latest.date);
  const single = results.length === 1 || t0 === t1;
  const x = (r: LabResult) => m.left + (single ? w / 2 : ((toTime(r.date) - t0) / (t1 - t0)) * w);
  const y = (v: number) => m.top + h - ((v - lo) / (hi - lo)) * h;

  const band = bandRect(latest.range, lo, hi);
  const xTicks = pickXTicks(results, Math.max(2, Math.floor(w / 90)));

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const px = e.clientX - e.currentTarget.getBoundingClientRect().left + m.left;
    let best = 0;
    results.forEach((r, i) => {
      if (Math.abs(x(r) - px) < Math.abs(x(results[best]) - px)) best = i;
    });
    setHover(best);
  }

  const hovered = hover != null ? results[hover] : null;
  const hoverStatus = hovered ? statusOf(hovered.value, hovered.range) : null;

  return (
    <div className="chart" ref={ref}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={`Chart of ${results.length} results`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.left} x2={m.left + w} y1={y(t)} y2={y(t)} className="grid" />
              <text x={m.left - 10} y={y(t)} className="axis" textAnchor="end" dominantBaseline="middle">
                {formatNumber(t)}
              </text>
            </g>
          ))}
          {band && band.to > band.from && (
            <g>
              <rect x={m.left} width={w} y={y(band.to)} height={y(band.from) - y(band.to)} className="band" />
              <text x={m.left + 8} y={y(band.from) - 7} className="band-label">
                Your lab’s range {prettyRange(latest.range)} {unit}
              </text>
            </g>
          )}
          {xTicks.map((r) => (
            <text key={r.id} x={x(r)} y={height - 8} className="axis" textAnchor="middle">
              {formatMonth(r.date)}
            </text>
          ))}
          {hovered && <line x1={x(hovered)} x2={x(hovered)} y1={m.top} y2={m.top + h} className="crosshair" />}
          {results.length > 1 && <polyline className="line" points={results.map((r) => `${x(r)},${y(r.value)}`).join(' ')} />}
          {results.map((r, i) => {
            const st = statusOf(r.value, r.range);
            const out = st === 'high' || st === 'low';
            const isEnd = i === 0 || i === results.length - 1;
            return (
              <g key={r.id}>
                {out ? (
                  <rect x={x(r) - 4.5} y={y(r.value) - 4.5} width={9} height={9} transform={`rotate(45 ${x(r)} ${y(r.value)})`} className="pt is-out" />
                ) : (
                  <circle cx={x(r)} cy={y(r.value)} r={hover === i ? 5.5 : 4.5} className="pt" />
                )}
                {isEnd && hover == null && (
                  <text x={x(r)} y={y(r.value) - 12} textAnchor="middle" className="pt-label">
                    {formatNumber(r.value)}
                  </text>
                )}
              </g>
            );
          })}
          <rect x={m.left - 20} y={0} width={w + 40} height={height} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
        </svg>
      )}
      {hovered && hoverStatus && (
        <div
          className="tooltip"
          style={{ left: Math.min(Math.max(x(hovered), 80), width - 80), top: y(hovered.value) - 12 }}
          role="status"
        >
          <div className="tooltip-date">{formatDate(hovered.date)}</div>
          <div className="tooltip-value">
            <strong>{formatNumber(hovered.value)}</strong> {hovered.unit}
          </div>
          <div className={`tooltip-status is-${hoverStatus}`}>{STATUS_LABEL[hoverStatus]} · range {prettyRange(hovered.range) || '—'}</div>
        </div>
      )}
    </div>
  );
}

function pickXTicks(results: LabResult[], max: number) {
  if (results.length <= max) return results;
  const out = [results[0]];
  const step = (results.length - 1) / (max - 1);
  for (let i = 1; i < max - 1; i++) out.push(results[Math.round(i * step)]);
  out.push(results[results.length - 1]);
  return out;
}

// ── Range bar: where one value sits relative to its range ───────────────────

export function RangeBar({ value, range }: { value: number; range: string }) {
  const r = parseRange(range);
  if (!r) return null;
  let lo = r.low?.value;
  let hi = r.high?.value;
  if (lo === undefined) lo = Math.min(0, value);
  if (hi === undefined) hi = Math.max(lo * 2, value * 1.15, lo + 1);
  const span = hi - lo || 1;
  const min = Math.min(lo - span * 0.35, value);
  const max = Math.max(hi + span * 0.35, value);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const st = statusOf(value, range);
  return (
    <div className="rangebar" aria-hidden>
      <div className="rangebar-track">
        <div className="rangebar-ok" style={{ left: `${r.low ? pct(lo) : 0}%`, right: `${r.high ? 100 - pct(hi) : 0}%` }} />
        <div className={`rangebar-mark is-${st}`} style={{ left: `${Math.min(98, Math.max(2, pct(value)))}%` }} />
      </div>
      <div className="rangebar-scale">
        {r.low && <span style={{ left: `${pct(lo)}%` }}>{formatNumber(lo)}</span>}
        {r.high && <span style={{ left: `${pct(hi)}%` }}>{formatNumber(hi)}</span>}
      </div>
    </div>
  );
}
