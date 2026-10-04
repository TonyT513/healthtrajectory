import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { STATUS_LABEL, formatChange, type Series, type Status, type Trend } from '../lib/analysis';

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`pill pill-${status}`}>
      {status === 'high' || status === 'low' ? <span className="pill-dot" aria-hidden /> : null}
      {STATUS_LABEL[status]}
    </span>
  );
}

const TREND_LABEL: Record<Trend, string> = {
  improving: 'Improving',
  worsening: 'Worsening',
  stable: 'Stable',
  single: 'One result',
};

export function TrendLabel({ series }: { series: Series }) {
  const { trend, direction } = series;
  const Icon = trend === 'stable' ? ArrowRight : direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : ArrowRight;
  return (
    <span className={`trend trend-${trend}`}>
      {trend !== 'single' && <Icon size={14} strokeWidth={2.25} aria-hidden />}
      {TREND_LABEL[trend]}
    </span>
  );
}

export function Change({ series }: { series: Series }) {
  if (series.change === undefined) return <span className="muted">—</span>;
  return <span className={`change change-${series.trend}`}>{formatChange(series.change)}</span>;
}
