import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RangeBar, TrendChart } from '../components/Charts';
import { confirmDelete } from '../components/Dialog';
import { Empty, PageHeader } from '../components/Layout';
import { Change, StatusPill, TrendLabel } from '../components/Status';
import { bandFor, buildSeries, formatNumber, prettyRange, statusOf } from '../lib/analysis';
import { categoryName } from '../lib/catalog';
import { formatDate } from '../lib/dates';
import { useData } from '../lib/store';

export function TestDetail() {
  const { testId = '' } = useParams();
  const { data, update, testById } = useData();
  const nav = useNavigate();
  const test = testById(testId);

  if (!test) return <Empty title="We couldn’t find that test" action={<Link to="/labs" className="btn">Back to lab results</Link>} />;

  const s = buildSeries(test, data.results);
  const addLink = `/labs/new?test=${test.id}`;
  const currentBand = s ? bandFor(test.bands, s.latest.value) : undefined;
  const out = s && (s.status === 'high' || s.status === 'low');

  function remove(id: string) {
    if (!confirmDelete('this result')) return;
    const remaining = data.results.filter((r) => r.id !== id);
    update((d) => ({ ...d, results: remaining }));
    if (!remaining.some((r) => r.testId === test!.id)) nav('/labs');
  }

  return (
    <>
      <Link to="/labs" className="back"><ArrowLeft size={16} /> Lab results</Link>
      <PageHeader
        sub={categoryName(test.category)}
        title={test.name}
        actions={<Link to={addLink} className="btn btn-primary"><Plus size={18} /> Add result</Link>}
      />

      {!s ? (
        <Empty title={`No ${test.short ?? test.name} results yet`} action={<Link to={addLink} className="btn btn-primary">Add a result</Link>}>
          {test.about}
        </Empty>
      ) : (
        <>
          <div className="detail-top">
            <section className={`card latest ${out ? 'is-out' : ''}`}>
              <span className="stat-label">Latest · {formatDate(s.latest.date)}</span>
              <div className="latest-value">
                <span className={out ? 'value-out' : ''}>{formatNumber(s.latest.value)}</span>
                <span className="unit">{s.latest.unit}</span>
              </div>
              <div className="row gap-sm wrap">
                <StatusPill status={s.status} />
                <TrendLabel series={s} />
              </div>
              {s.latest.range && <RangeBar value={s.latest.value} range={s.latest.range} />}
              <dl className="facts">
                <div><dt>Reference range</dt><dd>{s.latest.range ? `${prettyRange(s.latest.range)} ${s.latest.unit}` : 'Not entered'}</dd></div>
                <div><dt>Previous</dt><dd>{s.previous ? `${formatNumber(s.previous.value)} ${s.previous.unit} · ${formatDate(s.previous.date)}` : '—'}</dd></div>
                <div><dt>Change</dt><dd><Change series={s} /></dd></div>
              </dl>
            </section>

            <section className="card grow">
              <h2>{s.results.length > 1 ? `Over time · ${s.results.length} results` : 'Over time'}</h2>
              {s.results.length > 1 ? (
                <TrendChart results={s.results} unit={s.latest.unit} />
              ) : (
                <p className="muted">Add another {test.short ?? test.name} result to see how it changes over time.</p>
              )}
            </section>
          </div>

          <div className="grid-main">
            <section className="card flush">
              <div className="card-head padded"><h2>History</h2></div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th className="num">Result</th>
                      <th className="hide-sm">Range</th>
                      <th>Status</th>
                      <th className="hide-sm">Lab</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...s.results].reverse().map((r) => {
                      const st = statusOf(r.value, r.range);
                      const o = st === 'high' || st === 'low';
                      return (
                        <tr key={r.id} className={o ? 'is-out' : ''}>
                          <td className="nowrap">
                            {formatDate(r.date)}
                            {r.notes && <div className="sub">{r.notes}</div>}
                          </td>
                          <td className="num"><span className={`value ${o ? 'value-out' : ''}`}>{formatNumber(r.value)}</span> <span className="unit">{r.unit}</span></td>
                          <td className="hide-sm muted">{r.range ? prettyRange(r.range) : '—'}</td>
                          <td><StatusPill status={st} /></td>
                          <td className="hide-sm muted">{r.lab ?? '—'}</td>
                          <td className="actions">
                            <Link to={`/labs/edit/${r.id}`} className="icon-btn" aria-label={`Edit result from ${formatDate(r.date)}`}><Pencil size={16} /></Link>
                            <button className="icon-btn" onClick={() => remove(r.id)} aria-label={`Delete result from ${formatDate(r.date)}`}><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card">
              <h2>About this test</h2>
              {test.about && <p>{test.about}</p>}
              {test.bands && (
                <>
                  <h3 className="h-sub">General guideline categories</h3>
                  <ul className="bands">
                    {test.bands.map((b) => (
                      <li key={b.label} className={`tone-${b.tone} ${b === currentBand ? 'is-current' : ''}`}>
                        <span className="band-swatch" aria-hidden />
                        <span className="band-label">{b.label}</span>
                        <span className="band-text">{b.text}</span>
                        {b === currentBand && <span className="band-you">You</span>}
                      </li>
                    ))}
                  </ul>
                  {test.bandsSource && <p className="muted small">Source: {test.bandsSource}. Your status above always uses the range from your own lab report.</p>}
                </>
              )}
              <p className="muted small">Ranges differ between labs and can depend on age, sex, pregnancy and the test method. Ask your clinician what a result means for you.</p>
            </section>
          </div>
        </>
      )}
    </>
  );
}
