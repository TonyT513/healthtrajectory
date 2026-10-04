import { ChevronRight, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkline, TrendChart } from '../components/Charts';
import { PageHeader } from '../components/Layout';
import { Change, StatusPill, TrendLabel } from '../components/Status';
import { formatNumber, statusOf, type Series } from '../lib/analysis';
import { daysAgo, formatDate } from '../lib/dates';
import { useSeries } from '../lib/hooks';
import { sampleGoals, sampleHistory, sampleResults } from '../lib/sample';
import { useData } from '../lib/store';
import { goalProgress } from './Goals';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

const order: Record<Series['bucket'], number> = { attention: 0, worsening: 1, improving: 2, stable: 3, single: 4 };

export function Dashboard() {
  const { data, update, testById } = useData();
  const { series, summary } = useSeries();
  const nav = useNavigate();

  const first = data.profile.name.split(' ')[0];
  const lastDate = data.results.reduce((m, r) => (r.date > m ? r.date : m), '');
  const recent90 = data.results.filter((r) => daysAgo(r.date) <= 90);
  const recent = [...data.results].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const outside = series.filter((s) => s.bucket === 'attention');
  const activeGoals = data.goals.filter((g) => g.status === 'active');

  const key = useMemo(
    () =>
      [...series]
        .sort((a, b) => order[a.bucket] - order[b.bucket] || Number(!!b.test.primary) - Number(!!a.test.primary) || b.results.length - a.results.length)
        .slice(0, 8),
    [series],
  );

  const chartable = series.filter((s) => s.results.length > 1);
  const [chartId, setChartId] = useState<string>('');
  const featured = chartable.find((s) => s.test.id === chartId) ?? chartable.find((s) => s.bucket === 'attention') ?? chartable[0];

  const header = (
    <PageHeader
      sub={
        <>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          {lastDate && <> · Last results {formatDate(lastDate)}</>}
        </>
      }
      title={`${greeting()}${first ? `, ${first}` : ''}`}
      actions={
        <Link to="/labs/new" className="btn btn-primary">
          <Plus size={18} /> Add lab result
        </Link>
      }
    />
  );

  if (!data.results.length) {
    return (
      <>
        {header}
        <section className="card onboarding">
          <h2>Start with your most recent lab report</h2>
          <p>
            Enter results exactly as they appear on your report, including the reference range your lab prints. Once you have two results for the
            same test, you’ll see whether it’s going up, going down, or holding steady.
          </p>
          <div className="row gap">
            <Link to="/labs/new" className="btn btn-primary"><Plus size={18} /> Add a lab result</Link>
            <Link to="/labs/new?mode=panel" className="btn">Enter a full panel</Link>
          </div>
          <hr />
          <p className="muted small">
            Just looking around?{' '}
            <button
              className="link-btn"
              onClick={() =>
                update((d) => ({
                  ...d,
                  results: sampleResults(),
                  goals: d.goals.length ? d.goals : sampleGoals(),
                  history: { ...d.history, ...Object.fromEntries(Object.entries(sampleHistory()).map(([k, v]) => [k, d.history[k as keyof typeof d.history].length ? d.history[k as keyof typeof d.history] : v])) },
                }))
              }
            >
              Load example data
            </button>{' '}
            (made up, and you can clear it in Settings).
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      {header}

      <section className="summary" aria-label="Summary">
        <Link to="/trends" className={`card stat stat-overall is-${summary.overall === 'Needs attention' ? 'attention' : summary.overall === 'Improving' ? 'improving' : 'stable'}`}>
          <span className="stat-label">Overall</span>
          <span className="stat-value">{summary.overall}</span>
          <span className="stat-foot">
            {outside.length
              ? `${outside.length} of ${summary.total} tests outside your lab’s range`
              : `All ${summary.total} tracked tests within range`}
          </span>
        </Link>
        <Link to="/labs" className="card stat">
          <span className="stat-label">Recent lab results</span>
          <span className="stat-value">{recent90.length}</span>
          <span className="stat-foot">{recent90.length === 1 ? 'result' : 'results'} in the last 90 days</span>
        </Link>
        <Link to="/trends" className="card stat">
          <span className="stat-label">Health trends</span>
          <span className="stat-counts">
            <span><strong>{summary.counts.improving}</strong> Improving</span>
            <span><strong>{summary.counts.stable + summary.counts.single}</strong> Stable</span>
            <span className={summary.counts.attention ? 'is-attention' : ''}><strong>{summary.counts.attention}</strong> Needs attention</span>
          </span>
          {summary.counts.worsening > 0 && <span className="stat-foot">{summary.counts.worsening} moving the wrong way</span>}
        </Link>
        <Link to="/goals" className="card stat">
          <span className="stat-label">Goals</span>
          <span className="stat-value">{activeGoals.length}</span>
          <span className="stat-foot">{activeGoals.length === 1 ? 'active goal' : 'active goals'}</span>
        </Link>
      </section>

      {outside.length > 0 && (
        <section className="alert" aria-label="Results outside range">
          <strong>Outside your lab’s range</strong>
          <ul>
            {outside.map((s) => (
              <li key={s.test.id}>
                <Link to={`/labs/test/${s.test.id}`}>
                  {s.test.short ?? s.test.name} <span className="value-out">{formatNumber(s.latest.value)} {s.latest.unit}</span>{' '}
                  <span className="muted">({s.status === 'high' ? 'high' : 'low'}, {formatDate(s.latest.date)})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid-main">
        <section className="card flush">
          <div className="card-head padded">
            <h2>Key health metrics</h2>
            <Link to="/trends" className="card-link">View all</Link>
          </div>
          <div className="table-wrap">
            <table className="table metrics">
              <thead>
                <tr>
                  <th>Test</th>
                  <th className="num">Current</th>
                  <th className="num hide-sm">Previous</th>
                  <th className="num">Change</th>
                  <th className="hide-sm">Date</th>
                  <th>Status</th>
                  <th className="hide-md" aria-label="Trend" />
                </tr>
              </thead>
              <tbody>
                {key.map((s) => (
                  <tr key={s.test.id} className={`clickable${s.bucket === 'attention' ? ' is-out' : ''}`} onClick={() => nav(`/labs/test/${s.test.id}`)}>
                    <td>
                      <Link to={`/labs/test/${s.test.id}`} className="row-link" onClick={(e) => e.stopPropagation()}>{s.test.short ?? s.test.name}</Link>
                      <div className="sub"><TrendLabel series={s} /></div>
                    </td>
                    <td className="num">
                      <span className={`value ${s.bucket === 'attention' ? 'value-out' : ''}`}>{formatNumber(s.latest.value)}</span>{' '}
                      <span className="unit">{s.latest.unit}</span>
                    </td>
                    <td className="num hide-sm muted">{s.previous ? formatNumber(s.previous.value) : '—'}</td>
                    <td className="num"><Change series={s} /></td>
                    <td className="hide-sm muted nowrap">{formatDate(s.latest.date)}</td>
                    <td><StatusPill status={s.status} /></td>
                    <td className="hide-md"><Sparkline results={s.results} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Recent lab results</h2>
            <Link to="/labs" className="card-link">View all</Link>
          </div>
          <ul className="list">
            {recent.map((r) => {
              const t = testById(r.testId);
              const st = statusOf(r.value, r.range);
              return (
                <li key={r.id}>
                  <Link to={`/labs/test/${r.testId}`} className="list-row">
                    <span>
                      <span className="list-title">{t?.short ?? t?.name ?? 'Unknown test'}</span>
                      <span className="list-sub">{formatDate(r.date)}</span>
                    </span>
                    <span className="list-end">
                      <span className={`value ${st === 'high' || st === 'low' ? 'value-out' : ''}`}>{formatNumber(r.value)}</span>
                      <span className="unit"> {r.unit}</span>
                      <StatusPill status={st} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="grid-main">
        {featured ? (
          <section className="card">
            <div className="card-head">
              <h2>
                {featured.test.short ?? featured.test.name}
                <span className="muted light"> · {featured.results.length} results</span>
              </h2>
              <select aria-label="Choose a test to chart" value={featured.test.id} onChange={(e) => setChartId(e.target.value)} className="select-sm">
                {chartable.map((s) => <option key={s.test.id} value={s.test.id}>{s.test.short ?? s.test.name}</option>)}
              </select>
            </div>
            <TrendChart results={featured.results} unit={featured.latest.unit} />
            <p className="chart-foot">
              {featured.previous && (
                <>
                  Went from {formatNumber(featured.results[0].value)} to {formatNumber(featured.latest.value)} {featured.latest.unit} since{' '}
                  {formatDate(featured.results[0].date)}.{' '}
                </>
              )}
              <Link to={`/labs/test/${featured.test.id}`}>See full history <ChevronRight size={14} /></Link>
            </p>
          </section>
        ) : (
          <section className="card">
            <h2>Trend</h2>
            <p className="muted">Add a second result for any test to see a trend chart here.</p>
          </section>
        )}

        <section className="card">
          <div className="card-head">
            <h2>Goals</h2>
            <Link to="/goals" className="card-link">View all</Link>
          </div>
          {activeGoals.length ? (
            <ul className="goals-mini">
              {activeGoals.slice(0, 4).map((g) => {
                const p = goalProgress(g, data.results, testById);
                return (
                  <li key={g.id}>
                    <div className="goal-mini-top">
                      <span>{g.title}</span>
                      <span className="muted small">{p.label}</span>
                    </div>
                    <div className={`progress ${p.met ? 'is-met' : ''}`}><span style={{ width: `${p.pct}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">
              No goals yet. <Link to="/goals">Set one</Link>, for example “LDL below 100”.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
