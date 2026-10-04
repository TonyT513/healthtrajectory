import { Plus, Search } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Empty, PageHeader } from '../components/Layout';
import { StatusPill } from '../components/Status';
import { formatNumber, prettyRange, statusOf } from '../lib/analysis';
import { CATEGORIES, categoryName } from '../lib/catalog';
import { daysAgo, formatDate } from '../lib/dates';
import { useData } from '../lib/store';
import type { LabResult } from '../lib/types';

const PERIODS = [
  { id: 'all', label: 'All time', days: Infinity },
  { id: '90', label: 'Last 90 days', days: 90 },
  { id: '365', label: 'Last 12 months', days: 365 },
  { id: '730', label: 'Last 2 years', days: 730 },
];

export function LabResults() {
  const { data, testById } = useData();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const cat = params.get('category') ?? '';
  const period = params.get('period') ?? 'all';
  const sort = params.get('sort') ?? 'newest';
  const status = params.get('status') ?? '';

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const days = PERIODS.find((p) => p.id === period)?.days ?? Infinity;
    return data.results
      .filter((r) => {
        const t = testById(r.testId);
        if (!t) return false;
        if (cat && t.category !== cat) return false;
        if (daysAgo(r.date) > days) return false;
        if (status === 'out') {
          const st = statusOf(r.value, r.range);
          if (st !== 'high' && st !== 'low') return false;
        }
        if (needle) {
          const hay = [t.name, t.short, ...(t.aliases ?? []), r.lab, r.notes].join(' ').toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const d = a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
        return sort === 'oldest' ? d : -d;
      });
  }, [data.results, q, cat, period, sort, status, testById]);

  const groups = useMemo(() => {
    const out: { key: string; date: string; labs: Set<string>; rows: LabResult[] }[] = [];
    for (const r of rows) {
      let g = out[out.length - 1];
      if (!g || g.date !== r.date) out.push((g = { key: r.date, date: r.date, labs: new Set(), rows: [] }));
      if (r.lab) g.labs.add(r.lab);
      g.rows.push(r);
    }
    return out;
  }, [rows]);

  const filtered = !!(q || cat || period !== 'all' || status);

  return (
    <>
      <PageHeader
        title="Lab results"
        sub={`${data.results.length} results saved`}
        actions={
          <Link to="/labs/new" className="btn btn-primary"><Plus size={18} /> Add lab result</Link>
        }
      />

      <div className="toolbar" role="search">
        <div className="input-icon grow">
          <Search size={16} aria-hidden />
          <input type="search" placeholder="Search tests, e.g. A1C or cholesterol" value={q} onChange={(e) => set('q', e.target.value)} aria-label="Search lab tests" />
        </div>
        <select value={cat} onChange={(e) => set('category', e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={period} onChange={(e) => set('period', e.target.value === 'all' ? '' : e.target.value)} aria-label="Date">
          {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => set('sort', e.target.value === 'newest' ? '' : e.target.value)} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <label className="check">
          <input type="checkbox" checked={status === 'out'} onChange={(e) => set('status', e.target.checked ? 'out' : '')} />
          Only out of range
        </label>
      </div>

      {!data.results.length ? (
        <Empty title="No lab results yet" action={<Link to="/labs/new" className="btn btn-primary"><Plus size={18} /> Add your first result</Link>}>
          Copy the values from your lab report, including the reference range printed next to each result.
        </Empty>
      ) : !rows.length ? (
        <Empty title="Nothing matches those filters" action={filtered && <button className="btn" onClick={() => setParams({})}>Clear filters</button>} />
      ) : (
        <div className="card flush">
          <div className="table-wrap">
            <table className="table results">
              <thead>
                <tr>
                  <th>Test</th>
                  <th className="num">Result</th>
                  <th className="hide-sm">Reference range</th>
                  <th>Status</th>
                </tr>
              </thead>
              {groups.map((g) => (
                <tbody key={g.key}>
                  <tr className="group-row">
                    <th colSpan={4} scope="colgroup">
                      {formatDate(g.date)}
                      {g.labs.size > 0 && <span className="muted"> · {[...g.labs].join(', ')}</span>}
                    </th>
                  </tr>
                  {g.rows.map((r) => {
                    const t = testById(r.testId)!;
                    const st = statusOf(r.value, r.range);
                    const out = st === 'high' || st === 'low';
                    return (
                      <tr key={r.id} className={`clickable${out ? ' is-out' : ''}`} onClick={() => nav(`/labs/test/${t.id}`)}>
                        <td>
                          <Link to={`/labs/test/${t.id}`} className="row-link" onClick={(e) => e.stopPropagation()}>{t.name}</Link>
                          <div className="sub">{categoryName(t.category)}</div>
                        </td>
                        <td className="num">
                          <span className={`value ${out ? 'value-out' : ''}`}>{formatNumber(r.value)}</span> <span className="unit">{r.unit}</span>
                        </td>
                        <td className="hide-sm muted">{r.range ? `${prettyRange(r.range)} ${r.unit}` : '—'}</td>
                        <td><StatusPill status={st} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      )}
    </>
  );
}
