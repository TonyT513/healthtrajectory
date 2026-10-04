import { ArrowLeft, Info } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { RangeBar } from '../components/Charts';
import { PageHeader } from '../components/Layout';
import { StatusPill } from '../components/Status';
import { TestPicker } from '../components/TestPicker';
import { bandFor, byDate, describeRange, parseRange, prettyRange, statusOf, typicalRange } from '../lib/analysis';
import { CATEGORIES, PANELS } from '../lib/catalog';
import { formatDate, todayISO } from '../lib/dates';
import { uid } from '../lib/storage';
import { useData } from '../lib/store';
import type { CategoryId, LabResult, LabTest } from '../lib/types';

function useLastUsed() {
  const { data } = useData();
  return useMemo(() => {
    const byTest = new Map<string, LabResult>();
    for (const r of [...data.results].sort(byDate)) byTest.set(r.testId, r);
    const labs = [...new Set(data.results.map((r) => r.lab).filter(Boolean))] as string[];
    return { byTest, labs };
  }, [data.results]);
}

const parseValue = (s: string) => {
  const n = Number(s.replace(',', '.').trim());
  return s.trim() && Number.isFinite(n) ? n : null;
};

export function AddResult() {
  const [params] = useSearchParams();
  const { id } = useParams();
  const [mode, setMode] = useState<'single' | 'panel'>(params.get('mode') === 'panel' && !id ? 'panel' : 'single');

  return (
    <>
      <Link to="/labs" className="back"><ArrowLeft size={16} /> Lab results</Link>
      <PageHeader title={id ? 'Edit lab result' : 'Add lab result'} />
      {!id && (
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === 'single'} className={mode === 'single' ? 'is-on' : ''} onClick={() => setMode('single')}>One test</button>
          <button role="tab" aria-selected={mode === 'panel'} className={mode === 'panel' ? 'is-on' : ''} onClick={() => setMode('panel')}>A full panel</button>
        </div>
      )}
      {mode === 'single' ? <SingleForm editId={id} initialTest={params.get('test') ?? ''} /> : <PanelForm />}
    </>
  );
}

// ── One test ───────────────────────────────────────────────────────────────

function SingleForm({ editId, initialTest }: { editId?: string; initialTest: string }) {
  const { data, update, tests, testById } = useData();
  const nav = useNavigate();
  const last = useLastUsed();
  const editing = editId ? data.results.find((r) => r.id === editId) : undefined;

  const [category, setCategory] = useState<CategoryId | ''>(() => (editing ? testById(editing.testId)?.category : testById(initialTest)?.category) ?? '');
  const [test, setTest] = useState<LabTest | null>(() => testById(editing?.testId ?? initialTest) ?? null);
  const [pendingCustom, setPendingCustom] = useState<LabTest | null>(null);
  const [value, setValue] = useState(editing ? String(editing.value) : '');
  const [unit, setUnit] = useState(editing?.unit ?? (test ? last.byTest.get(test.id)?.unit ?? test.unit : ''));
  const [range, setRange] = useState(editing?.range ?? (test ? last.byTest.get(test.id)?.range ?? '' : ''));
  const [date, setDate] = useState(editing?.date ?? [...data.results].sort(byDate).at(-1)?.date ?? todayISO());
  const [lab, setLab] = useState(editing?.lab ?? last.labs[0] ?? '');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const chosen = pendingCustom ?? test;
  const num = parseValue(value);
  const parsed = parseRange(range);
  const status = num !== null ? statusOf(num, range) : null;
  const prev = chosen ? last.byTest.get(chosen.id) : undefined;
  const typical = chosen ? typicalRange(chosen, data.profile.sex) : '';
  const band = num !== null ? bandFor(chosen?.bands, num) : undefined;
  const unitMismatch = prev && unit && prev.unit !== unit && !editing;

  function pick(t: LabTest) {
    setPendingCustom(null);
    setTest(t);
    setCategory(t.category);
    const prevResult = last.byTest.get(t.id);
    setUnit(prevResult?.unit ?? t.unit);
    setRange(prevResult?.range ?? '');
    setError('');
  }

  function createCustom(name: string) {
    const t: LabTest = { id: `custom-${uid()}`, name, category: category || 'other', unit: '', better: 'range', custom: true };
    setPendingCustom(t);
    setTest(null);
    setCategory(t.category);
    setUnit('');
    setRange('');
  }

  function save(e: FormEvent, again: boolean) {
    e.preventDefault();
    if (!chosen) return setError('Choose which test this is.');
    if (num === null) return setError('Enter the result as a number, e.g. 5.6');
    if (!date) return setError('Enter the date the sample was taken.');
    const result: LabResult = {
      id: editing?.id ?? uid(),
      testId: chosen.id,
      value: num,
      unit: unit.trim(),
      range: range.trim(),
      date,
      lab: lab.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };
    update((d) => ({
      ...d,
      customTests: pendingCustom ? [...d.customTests, { ...pendingCustom, unit: result.unit }] : d.customTests,
      results: editing ? d.results.map((r) => (r.id === editing.id ? result : r)) : [...d.results, result],
    }));
    if (again) {
      setSaved(`Saved ${chosen.short ?? chosen.name}.`);
      setTest(null);
      setPendingCustom(null);
      setValue('');
      setRange('');
      setUnit('');
      setNotes('');
      setError('');
      document.getElementById('test-picker')?.focus();
    } else {
      nav(`/labs/test/${chosen.id}`);
    }
  }

  const units = chosen && !chosen.custom ? [...new Set([chosen.unit, ...(chosen.altUnits ?? []), ...(prev ? [prev.unit] : [])])] : [];

  return (
    <form className="form-layout" onSubmit={(e) => save(e, false)}>
      <div className="card form-card">
        {saved && <p className="form-ok" role="status">{saved} Add the next one below.</p>}

        <fieldset className="form-section">
          <legend>Test information</legend>
          <label className="field">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId | '')}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <div className="field">
            <label htmlFor="test-picker">Laboratory test</label>
            <TestPicker tests={tests} category={category} value={chosen} onChange={pick} onCreate={createCustom} autoFocus={!editing && !chosen} />
            {pendingCustom && <small className="hint">New test. It will be added to your list when you save.</small>}
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Result</legend>
          <div className="row gap wrap">
            <label className="field grow">
              <span>Result</span>
              <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 5.6" className="input-lg" />
            </label>
            <label className="field unit-field">
              <span>Unit</span>
              {units.length > 1 ? (
                <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {units.map((u) => <option key={u}>{u}</option>)}
                </select>
              ) : (
                <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. mg/dL" />
              )}
            </label>
          </div>
          {unitMismatch && (
            <p className="note warn">Your earlier {chosen!.short ?? chosen!.name} results are in {prev!.unit}. Mixing units will make the trend misleading.</p>
          )}

          <label className="field">
            <span>Reference range <span className="muted">(as printed on your report)</span></span>
            <input value={range} onChange={(e) => setRange(e.target.value)} placeholder="e.g. 70-99 or < 5.7" />
            {range && !parsed && <small className="hint is-error">We couldn’t read that range. Try a format like 70-99, &lt; 5.7 or &gt;= 60.</small>}
            {parsed && <small className="hint">In range means {describeRange(parsed)} {unit}.</small>}
          </label>
          {!range && (typical || prev?.range) && (
            <div className="suggest">
              {prev?.range && <button type="button" className="chip" onClick={() => setRange(prev.range)}>Use last range: {prettyRange(prev.range)}</button>}
              {typical && typical !== prev?.range && (
                <button type="button" className="chip" onClick={() => setRange(typical)}>Use a typical adult range: {prettyRange(typical)}</button>
              )}
              <span className="muted small">Ranges vary by lab. If your report prints one, use that.</span>
            </div>
          )}
        </fieldset>

        <fieldset className="form-section">
          <legend>Details</legend>
          <div className="row gap wrap">
            <label className="field">
              <span>Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} required />
            </label>
            <label className="field grow">
              <span>Lab or provider <span className="muted">(optional)</span></span>
              <input value={lab} onChange={(e) => setLab(e.target.value)} list="labs" placeholder="e.g. Quest Diagnostics" />
              <datalist id="labs">{last.labs.map((l) => <option key={l} value={l} />)}</datalist>
            </label>
          </div>
          <label className="field">
            <span>Notes <span className="muted">(optional)</span></span>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. fasting 12 hours, started new medication" />
          </label>
        </fieldset>

        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="btn btn-primary">{editing ? 'Save changes' : 'Save result'}</button>
          {!editing && <button type="button" className="btn" onClick={(e) => save(e, true)}>Save and add another</button>}
          <Link to={editing ? `/labs/test/${editing.testId}` : '/labs'} className="btn btn-ghost">Cancel</Link>
        </div>
      </div>

      <aside className="card preview" aria-live="polite">
        <h3>Preview</h3>
        {chosen && num !== null && status ? (
          <>
            <div className="preview-name">{chosen.name}</div>
            <div className="preview-value">
              <span className={status === 'high' || status === 'low' ? 'value-out' : ''}>{value}</span> <span className="unit">{unit}</span>
            </div>
            <StatusPill status={status} />
            {parsed && <RangeBar value={num} range={range} />}
            {status === 'unknown' && <p className="muted small">Add a reference range to see whether this is in range.</p>}
            {band && (
              <p className="small band-note">
                <Info size={14} aria-hidden /> Guideline category: <strong className={`tone-${band.tone}`}>{band.label}</strong> ({band.text} {chosen.unit}).
              </p>
            )}
            {prev && !editing && (
              <p className="small muted">Last time: {prev.value} {prev.unit} on {formatDate(prev.date)}</p>
            )}
          </>
        ) : (
          <p className="muted small">Choose a test and enter a result to see how it compares with its range.</p>
        )}
        {chosen?.about && <p className="small about">{chosen.about}</p>}
      </aside>
    </form>
  );
}

// ── A full panel ───────────────────────────────────────────────────────────

function PanelForm() {
  const { data, update, testById } = useData();
  const nav = useNavigate();
  const last = useLastUsed();
  const [panelId, setPanelId] = useState(PANELS[0].id);
  const [date, setDate] = useState(todayISO());
  const [lab, setLab] = useState(last.labs[0] ?? '');
  const [rows, setRows] = useState<Record<string, { value: string; range: string; unit: string }>>({});
  const [error, setError] = useState('');

  const panel = PANELS.find((p) => p.id === panelId)!;
  const panelTests = panel.tests.map((id) => testById(id)!);

  const row = (t: LabTest) =>
    rows[t.id] ?? { value: '', range: last.byTest.get(t.id)?.range ?? '', unit: last.byTest.get(t.id)?.unit ?? t.unit };
  const setRow = (t: LabTest, patch: Partial<{ value: string; range: string; unit: string }>) =>
    setRows((r) => ({ ...r, [t.id]: { ...row(t), ...patch } }));

  const filled = panelTests.filter((t) => parseValue(row(t).value) !== null);

  function fillTypical() {
    setRows((r) => {
      const next = { ...r };
      for (const t of panelTests) {
        const cur = next[t.id] ?? row(t);
        if (!cur.range) next[t.id] = { ...cur, range: typicalRange(t, data.profile.sex) };
      }
      return next;
    });
  }

  function save(e: FormEvent) {
    e.preventDefault();
    const bad = panelTests.find((t) => row(t).value.trim() && parseValue(row(t).value) === null);
    if (bad) return setError(`The value for ${bad.short ?? bad.name} isn’t a number.`);
    if (!filled.length) return setError('Enter at least one result.');
    const now = new Date().toISOString();
    const results: LabResult[] = filled.map((t) => ({
      id: uid(), testId: t.id, value: parseValue(row(t).value)!, unit: row(t).unit, range: row(t).range.trim(),
      date, lab: lab.trim() || undefined, createdAt: now,
    }));
    update((d) => ({ ...d, results: [...d.results, ...results] }));
    nav('/labs');
  }

  return (
    <form className="card form-card panel-form" onSubmit={save}>
      <div className="row gap wrap">
        <label className="field grow">
          <span>Panel</span>
          <select value={panelId} onChange={(e) => { setPanelId(e.target.value); setError(''); }}>
            {PANELS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} required />
        </label>
        <label className="field grow">
          <span>Lab or provider <span className="muted">(optional)</span></span>
          <input value={lab} onChange={(e) => setLab(e.target.value)} list="labs-p" />
          <datalist id="labs-p">{last.labs.map((l) => <option key={l} value={l} />)}</datalist>
        </label>
      </div>

      <p className="muted small">
        Leave a row blank if it isn’t on your report. Ranges you’ve used before are filled in.{' '}
        <button type="button" className="link-btn" onClick={fillTypical}>Fill empty ranges with typical adult values</button>
      </p>

      <div className="table-wrap">
        <table className="table panel-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Result</th>
              <th>Unit</th>
              <th>Reference range</th>
              <th aria-label="Status" />
            </tr>
          </thead>
          <tbody>
            {panelTests.map((t) => {
              const r = row(t);
              const n = parseValue(r.value);
              const st = n !== null ? statusOf(n, r.range) : null;
              return (
                <tr key={t.id} className={st === 'high' || st === 'low' ? 'is-out' : ''}>
                  <td><label htmlFor={`v-${t.id}`}>{t.short ?? t.name}</label></td>
                  <td><input id={`v-${t.id}`} inputMode="decimal" className="input-sm" value={r.value} onChange={(e) => setRow(t, { value: e.target.value })} /></td>
                  <td className="muted small nowrap">{r.unit}</td>
                  <td>
                    <input
                      className={`input-sm ${r.range && !parseRange(r.range) ? 'is-invalid' : ''}`}
                      value={r.range}
                      placeholder={prettyRange(typicalRange(t, data.profile.sex))}
                      onChange={(e) => setRow(t, { range: e.target.value })}
                      aria-label={`${t.name} reference range`}
                    />
                  </td>
                  <td>{st && <StatusPill status={st} />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button className="btn btn-primary">Save {filled.length || ''} {filled.length === 1 ? 'result' : 'results'}</button>
        <Link to="/labs" className="btn btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
