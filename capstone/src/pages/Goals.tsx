import { Check, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { confirmDelete, Dialog } from '../components/Dialog';
import { Empty, PageHeader } from '../components/Layout';
import { byDate, formatNumber } from '../lib/analysis';
import { formatDate } from '../lib/dates';
import { uid } from '../lib/storage';
import { useData } from '../lib/store';
import type { Goal, LabResult, LabTest } from '../lib/types';

export function goalProgress(g: Goal, results: LabResult[], testById: (id: string) => LabTest | undefined) {
  if (g.kind === 'habit') {
    const cur = g.current ?? 0;
    return {
      pct: Math.min(100, Math.round((cur / (g.target || 1)) * 100)),
      met: cur >= g.target,
      label: `${formatNumber(cur)} / ${formatNumber(g.target)} ${g.unit ?? ''}${g.period ? ` per ${g.period}` : ''}`,
    };
  }
  const t = testById(g.testId ?? '');
  const rs = results.filter((r) => r.testId === g.testId).sort(byDate);
  const latest = rs.at(-1);
  const unit = latest?.unit ?? t?.unit ?? '';
  const targetText = `${g.direction === 'below' ? 'below' : 'above'} ${formatNumber(g.target)} ${unit}`;
  if (!latest) return { pct: 0, met: false, label: `No results yet · target ${targetText}` };
  const met = g.direction === 'below' ? latest.value < g.target : latest.value > g.target;
  const start = rs[0].value;
  let pct = 100;
  if (!met) {
    const total = g.direction === 'below' ? start - g.target : g.target - start;
    const done = g.direction === 'below' ? start - latest.value : latest.value - start;
    pct = total > 0 ? Math.max(4, Math.min(96, Math.round((done / total) * 100))) : 4;
  }
  return { pct, met, label: `Latest ${formatNumber(latest.value)} · target ${targetText}` };
}

export function Goals() {
  const { data, update, testById } = useData();
  const [editing, setEditing] = useState<Goal | 'new' | null>(null);
  const active = data.goals.filter((g) => g.status === 'active');
  const done = data.goals.filter((g) => g.status === 'done');

  const patch = (id: string, p: Partial<Goal>) => update((d) => ({ ...d, goals: d.goals.map((g) => (g.id === id ? { ...g, ...p } : g)) }));

  function save(goal: Goal) {
    update((d) => ({ ...d, goals: d.goals.some((g) => g.id === goal.id) ? d.goals.map((g) => (g.id === goal.id ? goal : g)) : [...d.goals, goal] }));
    setEditing(null);
  }

  function remove(id: string) {
    if (confirmDelete('this goal')) update((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
  }

  const card = (g: Goal) => {
    const p = goalProgress(g, data.results, testById);
    return (
      <li key={g.id} className={`card goal ${g.status === 'done' ? 'is-done' : ''}`}>
        <div className="goal-top">
          <div>
            <h3>{g.title}</h3>
            <p className="muted small">
              {p.label}
              {g.due && ` · by ${formatDate(g.due)}`}
            </p>
          </div>
          {p.met && g.status === 'active' && <span className="pill pill-in">Target met</span>}
        </div>
        <div className={`progress ${p.met ? 'is-met' : ''}`} role="progressbar" aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${p.pct}%` }} />
        </div>
        <div className="goal-actions">
          {g.kind === 'habit' && g.status === 'active' && (
            <label className="inline-field">
              This {g.period ?? 'period'}:
              <input
                type="number"
                min={0}
                className="input-sm"
                value={g.current ?? 0}
                onChange={(e) => patch(g.id, { current: Math.max(0, Number(e.target.value) || 0) })}
                aria-label={`Progress for ${g.title}`}
              />
              {g.unit}
            </label>
          )}
          {g.kind === 'lab' && g.testId && <Link to={`/labs/test/${g.testId}`} className="small">View results</Link>}
          <span className="grow" />
          {g.status === 'active' ? (
            <button className="btn btn-sm" onClick={() => patch(g.id, { status: 'done' })}><Check size={16} /> Mark done</button>
          ) : (
            <button className="btn btn-sm" onClick={() => patch(g.id, { status: 'active' })}><RotateCcw size={16} /> Reopen</button>
          )}
          <button className="icon-btn" onClick={() => setEditing(g)} aria-label={`Edit ${g.title}`}><Pencil size={16} /></button>
          <button className="icon-btn" onClick={() => remove(g.id)} aria-label={`Delete ${g.title}`}><Trash2 size={16} /></button>
        </div>
      </li>
    );
  };

  return (
    <>
      <PageHeader title="Goals" actions={<button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={18} /> New goal</button>} />
      {!data.goals.length ? (
        <Empty title="No goals yet" action={<button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={18} /> Set a goal</button>}>
          Set a target for a lab result, like LDL below 100, or a habit, like walking 150 minutes a week. Lab goals update on their own when you add results.
        </Empty>
      ) : (
        <>
          <ul className="goal-list">{active.map(card)}</ul>
          {done.length > 0 && (
            <>
              <h2 className="section-title">Completed</h2>
              <ul className="goal-list">{done.map(card)}</ul>
            </>
          )}
        </>
      )}
      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New goal' : 'Edit goal'}>
        {editing && <GoalForm goal={editing === 'new' ? undefined : editing} onSave={save} onCancel={() => setEditing(null)} />}
      </Dialog>
    </>
  );
}

function GoalForm({ goal, onSave, onCancel }: { goal?: Goal; onSave: (g: Goal) => void; onCancel: () => void }) {
  const { data, tests } = useData();
  const [kind, setKind] = useState<Goal['kind']>(goal?.kind ?? 'lab');
  const [testId, setTestId] = useState(goal?.testId ?? '');
  const [direction, setDirection] = useState<'below' | 'above'>(goal?.direction ?? 'below');
  const [target, setTarget] = useState(goal ? String(goal.target) : '');
  const [title, setTitle] = useState(goal?.title ?? '');
  const [unit, setUnit] = useState(goal?.unit ?? 'min');
  const [period, setPeriod] = useState(goal?.period ?? 'week');
  const [due, setDue] = useState(goal?.due ?? '');

  const tracked = new Set(data.results.map((r) => r.testId));
  const withData = tests.filter((t) => tracked.has(t.id));
  const others = tests.filter((t) => !tracked.has(t.id));
  const test = tests.find((t) => t.id === testId);

  function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(target);
    if (!Number.isFinite(n) || target === '') return;
    if (kind === 'lab' && !test) return;
    const autoTitle = kind === 'lab' ? `${test!.short ?? test!.name} ${direction} ${formatNumber(n)}` : '';
    onSave({
      id: goal?.id ?? uid(),
      kind,
      title: title.trim() || autoTitle || 'Goal',
      target: n,
      testId: kind === 'lab' ? testId : undefined,
      direction: kind === 'lab' ? direction : undefined,
      unit: kind === 'habit' ? unit.trim() : undefined,
      period: kind === 'habit' ? period : undefined,
      current: kind === 'habit' ? goal?.current ?? 0 : undefined,
      due: due || undefined,
      status: goal?.status ?? 'active',
      createdAt: goal?.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    <form className="stack" onSubmit={submit}>
      <div className="segmented" role="radiogroup" aria-label="Goal type">
        <label className={kind === 'lab' ? 'is-on' : ''}><input type="radio" checked={kind === 'lab'} onChange={() => setKind('lab')} />A lab result</label>
        <label className={kind === 'habit' ? 'is-on' : ''}><input type="radio" checked={kind === 'habit'} onChange={() => setKind('habit')} />A habit</label>
      </div>

      {kind === 'lab' ? (
        <>
          <label className="field">
            <span>Test</span>
            <select value={testId} onChange={(e) => setTestId(e.target.value)} required>
              <option value="">Choose a test</option>
              {withData.length > 0 && <optgroup label="Tests you track">{withData.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>}
              <optgroup label="All tests">{others.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>
            </select>
          </label>
          <div className="row gap">
            <label className="field">
              <span>Keep it</span>
              <select value={direction} onChange={(e) => setDirection(e.target.value as 'below' | 'above')}>
                <option value="below">Below</option>
                <option value="above">Above</option>
              </select>
            </label>
            <label className="field grow">
              <span>Target {test && <span className="muted">({test.unit})</span>}</span>
              <input inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} required placeholder="e.g. 100" />
            </label>
          </div>
          <p className="muted small">Agree on targets like this with your clinician. They may differ from the lab’s range.</p>
        </>
      ) : (
        <>
          <label className="field">
            <span>Goal</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Walk 150 minutes a week" required />
          </label>
          <div className="row gap wrap">
            <label className="field">
              <span>Target</span>
              <input type="number" min={1} value={target} onChange={(e) => setTarget(e.target.value)} required className="input-num" />
            </label>
            <label className="field">
              <span>Unit</span>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="min, days, glasses" className="input-num" />
            </label>
            <label className="field">
              <span>Per</span>
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="day">day</option>
                <option value="week">week</option>
                <option value="month">month</option>
              </select>
            </label>
          </div>
        </>
      )}

      {kind === 'lab' && (
        <label className="field">
          <span>Name <span className="muted">(optional)</span></span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={test ? `${test.short ?? test.name} ${direction} ${target || '…'}` : ''} />
        </label>
      )}
      <label className="field">
        <span>Target date <span className="muted">(optional)</span></span>
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      </label>
      <div className="form-actions">
        <button className="btn btn-primary">Save goal</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
