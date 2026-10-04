import { Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkline } from '../components/Charts';
import { Empty, PageHeader } from '../components/Layout';
import { StatusPill, TrendLabel } from '../components/Status';
import { formatChange, formatNumber, type Series } from '../lib/analysis';
import { CATEGORIES } from '../lib/catalog';
import { formatDate } from '../lib/dates';
import { useSeries } from '../lib/hooks';

const FILTERS: { id: Series['bucket'] | ''; label: string }[] = [
  { id: '', label: 'All' },
  { id: 'attention', label: 'Needs attention' },
  { id: 'improving', label: 'Improving' },
  { id: 'worsening', label: 'Worsening' },
  { id: 'stable', label: 'Stable' },
];

export function Trends() {
  const { series, summary } = useSeries();
  const [params, setParams] = useSearchParams();
  const cat = params.get('category') ?? '';
  const bucket = params.get('show') ?? '';

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const matchesBucket = (s: Series) => !bucket || s.bucket === bucket || (bucket === 'stable' && s.bucket === 'single');
  const cats = CATEGORIES.filter((c) => series.some((s) => s.test.category === c.id));
  const shown = cats
    .filter((c) => !cat || c.id === cat)
    .map((c) => ({ ...c, items: series.filter((s) => s.test.category === c.id && matchesBucket(s)) }))
    .filter((c) => c.items.length);

  const count = (id: string) =>
    id === '' ? summary.total : id === 'stable' ? summary.counts.stable + summary.counts.single : summary.counts[id as Series['bucket']];

  return (
    <>
      <PageHeader title="Trends" sub="How each test has changed between your two most recent results" />

      {!series.length ? (
        <Empty title="No trends yet" action={<Link to="/labs/new" className="btn btn-primary"><Plus size={18} /> Add lab result</Link>}>
          Trends appear once you’ve added results. Two results for the same test show its direction.
        </Empty>
      ) : (
        <>
          <div className="filters">
            <div className="chips" role="group" aria-label="Filter by trend">
              {FILTERS.filter((f) => f.id === '' || count(f.id) > 0).map((f) => (
                <button key={f.id} className={`chip ${bucket === f.id ? 'is-on' : ''} ${f.id === 'attention' ? 'chip-attention' : ''}`} onClick={() => set('show', f.id)} aria-pressed={bucket === f.id}>
                  {f.label} <span className="chip-count">{count(f.id)}</span>
                </button>
              ))}
            </div>
            <select value={cat} onChange={(e) => set('category', e.target.value)} aria-label="Category">
              <option value="">All categories</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {!shown.length && <Empty title="Nothing matches that filter" />}

          {shown.map((c) => (
            <section key={c.id} className="trend-section">
              <h2 className="section-title">{c.name}</h2>
              <div className="trend-grid">
                {c.items.map((s) => (
                  <Link key={s.test.id} to={`/labs/test/${s.test.id}`} className={`card trend-card ${s.bucket === 'attention' ? 'is-out' : ''}`}>
                    <div className="trend-card-top">
                      <span className="trend-name">{s.test.short ?? s.test.name}</span>
                      <StatusPill status={s.status} />
                    </div>
                    <div className="trend-value">
                      <span className={s.bucket === 'attention' ? 'value-out' : ''}>{formatNumber(s.latest.value)}</span> <span className="unit">{s.latest.unit}</span>
                    </div>
                    <Sparkline results={s.results} width={240} height={44} />
                    <div className="trend-card-foot">
                      <TrendLabel series={s} />
                      <span className="muted small">
                        {s.previous ? `${formatChange(s.change!)} since ${formatDate(s.previous.date)}` : formatDate(s.latest.date)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </>
  );
}
