import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/Layout';
import { age, todayISO } from '../lib/dates';
import { useData } from '../lib/store';
import type { Profile as P, Sex, UserData } from '../lib/types';

const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;

export function Profile() {
  const { data, update } = useData();
  const us = data.profile.units === 'us';
  const [p, setP] = useState<P>(data.profile);
  const [ft, setFt] = useState(() => (p.heightCm ? String(Math.floor(p.heightCm / CM_PER_IN / 12)) : ''));
  const [inch, setInch] = useState(() => (p.heightCm ? String(Math.round((p.heightCm / CM_PER_IN) % 12)) : ''));
  const [cm, setCm] = useState(p.heightCm ? String(Math.round(p.heightCm)) : '');
  const [weight, setWeight] = useState(() => (p.weightKg ? String(Math.round(us ? p.weightKg / KG_PER_LB : p.weightKg)) : ''));
  const [saved, setSaved] = useState(false);

  function save(e: FormEvent) {
    e.preventDefault();
    const heightCm = us ? (Number(ft) * 12 + Number(inch)) * CM_PER_IN || undefined : Number(cm) || undefined;
    const weightKg = weight ? (us ? Number(weight) * KG_PER_LB : Number(weight)) : undefined;
    update((d) => ({ ...d, profile: { ...p, heightCm, weightKg } }));
    setSaved(true);
  }

  const set = <K extends keyof P>(k: K, v: P[K]) => { setP((x) => ({ ...x, [k]: v })); setSaved(false); };
  const hCm = us ? (Number(ft) * 12 + Number(inch)) * CM_PER_IN : Number(cm);
  const wKg = us ? Number(weight) * KG_PER_LB : Number(weight);
  const bmi = hCm > 0 && wKg > 0 ? wKg / (hCm / 100) ** 2 : null;

  return (
    <>
      <PageHeader title="Profile" />
      <form className="card form-card narrow" onSubmit={save}>
        <fieldset className="form-section">
          <legend>About you</legend>
          <label className="field"><span>Name</span><input value={p.name} onChange={(e) => set('name', e.target.value)} required /></label>
          <label className="field"><span>Email</span><input value={p.email} disabled /></label>
          <div className="row gap wrap">
            <label className="field">
              <span>Date of birth</span>
              <input type="date" value={p.dob} onChange={(e) => set('dob', e.target.value)} max={todayISO()} />
              {p.dob && <small className="hint">Age {age(p.dob)}</small>}
            </label>
            <label className="field">
              <span>Sex assigned at birth</span>
              <select value={p.sex} onChange={(e) => set('sex', e.target.value as Sex)}>
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
          </div>
        </fieldset>
        <fieldset className="form-section">
          <legend>Body</legend>
          <div className="row gap wrap">
            {us ? (
              <div className="field">
                <span id="h-label">Height</span>
                <div className="row gap-sm" role="group" aria-labelledby="h-label">
                  <input className="input-num" inputMode="numeric" value={ft} onChange={(e) => { setFt(e.target.value); setSaved(false); }} aria-label="Feet" /> <span className="muted">ft</span>
                  <input className="input-num" inputMode="numeric" value={inch} onChange={(e) => { setInch(e.target.value); setSaved(false); }} aria-label="Inches" /> <span className="muted">in</span>
                </div>
              </div>
            ) : (
              <label className="field"><span>Height (cm)</span><input className="input-num" inputMode="numeric" value={cm} onChange={(e) => { setCm(e.target.value); setSaved(false); }} /></label>
            )}
            <label className="field">
              <span>Weight ({us ? 'lb' : 'kg'})</span>
              <input className="input-num" inputMode="decimal" value={weight} onChange={(e) => { setWeight(e.target.value); setSaved(false); }} />
            </label>
            {bmi !== null && Number.isFinite(bmi) && <div className="field"><span>BMI</span><span className="static-value">{bmi.toFixed(1)}</span></div>}
          </div>
        </fieldset>
        <fieldset className="form-section">
          <legend>Care</legend>
          <label className="field"><span>Primary care clinician <span className="muted">(optional)</span></span><input value={p.provider ?? ''} onChange={(e) => set('provider', e.target.value)} placeholder="e.g. Dr. Maria Lopez, Eastside Clinic" /></label>
        </fieldset>
        <div className="form-actions">
          <button className="btn btn-primary">Save profile</button>
          {saved && <span className="form-ok-inline" role="status">Saved</span>}
        </div>
      </form>
    </>
  );
}

export function Settings() {
  const { data, update, signOut, deleteAccount } = useData();
  const nav = useNavigate();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  function exportData() {
    const blob = new Blob([JSON.stringify({ app: 'healthtrajectory', version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `healthtrajectory-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importData(f: File | undefined) {
    if (!f) return;
    try {
      const parsed = JSON.parse(await f.text());
      const incoming: UserData = parsed.data ?? parsed;
      if (!Array.isArray(incoming.results)) throw new Error();
      if (!window.confirm('Replace everything in this account with the imported file? Uploaded documents are not included in exports.')) return;
      update((d) => ({ ...d, ...incoming, profile: { ...incoming.profile, email: d.profile.email }, documents: d.documents }));
      setMsg(`Imported ${incoming.results.length} lab results.`);
    } catch {
      setMsg('That file isn’t a HealthTrajectory export.');
    }
  }

  return (
    <>
      <PageHeader title="Settings" />
      <div className="settings">
        <section className="card">
          <h2>Units</h2>
          <p className="muted small">Used for height and weight. Lab results always keep the units from your report.</p>
          <div className="segmented">
            {(['us', 'metric'] as const).map((u) => (
              <label key={u} className={data.profile.units === u ? 'is-on' : ''}>
                <input type="radio" checked={data.profile.units === u} onChange={() => update((d) => ({ ...d, profile: { ...d.profile, units: u } }))} />
                {u === 'us' ? 'US (lb, ft)' : 'Metric (kg, cm)'}
              </label>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Your data</h2>
          <p className="muted small">Everything is stored in this browser on this device. Export a copy to keep a backup or move to another device.</p>
          <div className="row gap wrap">
            <button className="btn" onClick={exportData}>Export data (JSON)</button>
            <button className="btn" onClick={() => file.current?.click()}>Import from file</button>
            <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { importData(e.target.files?.[0]); e.target.value = ''; }} />
          </div>
          {msg && <p className="small" role="status">{msg}</p>}
        </section>

        <section className="card">
          <h2>Account</h2>
          <div className="row gap wrap">
            <button className="btn" onClick={() => { signOut(); nav('/signin'); }}>Sign out</button>
            <button
              className="btn"
              onClick={() => {
                if (window.confirm(`Delete all ${data.results.length} lab results? Your profile, history, goals and documents stay.`)) update((d) => ({ ...d, results: [], customTests: [] }));
              }}
            >
              Clear lab results
            </button>
          </div>
        </section>

        <section className="card danger">
          <h2>Delete account</h2>
          <p className="muted small">Permanently removes your account and all of its data from this browser, including documents.</p>
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (window.prompt('Type DELETE to permanently delete your account and all data.') === 'DELETE') {
                await deleteAccount();
                nav('/signup');
              }
            }}
          >
            Delete account
          </button>
        </section>
      </div>
    </>
  );
}
