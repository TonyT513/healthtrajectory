import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Layout';
import { useData, useStore } from '../lib/store';
import type { Sex } from '../lib/types';

function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="auth">
      <div className="auth-card">
        <Logo />
        <h1>{title}</h1>
        <p className="muted">{sub}</p>
        {children}
      </div>
      <p className="auth-note">Your data is stored only in this browser in this version. Nothing is sent to a server.</p>
    </div>
  );
}

export function SignIn() {
  const { signIn } = useStore();
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await signIn(String(f.get('email')), String(f.get('password')));
      nav('/');
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Welcome back" sub="Sign in to see your results and trends.">
      <form onSubmit={submit} className="stack">
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required autoFocus />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>Sign in</button>
      </form>
      <p className="auth-switch">New here? <Link to="/signup">Create an account</Link></p>
    </AuthShell>
  );
}

export function SignUp() {
  const { signUp } = useStore();
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get('password'));
    if (password.length < 8) return setError('Use at least 8 characters for your password.');
    setBusy(true);
    try {
      await signUp(String(f.get('name')), String(f.get('email')), password);
      nav('/welcome');
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create your account" sub="Keep your lab results in one place and see how they change over time.">
      <form onSubmit={submit} className="stack">
        <label className="field">
          <span>Your name</span>
          <input name="name" autoComplete="name" required autoFocus />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="new-password" required minLength={8} />
          <small className="hint">At least 8 characters.</small>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>Create account</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/signin">Sign in</Link></p>
    </AuthShell>
  );
}

export function Welcome() {
  const { data, update } = useData();
  const nav = useNavigate();
  const [dob, setDob] = useState(data.profile.dob);
  const [sex, setSex] = useState<Sex>(data.profile.sex);

  function save(e: FormEvent) {
    e.preventDefault();
    update((d) => ({ ...d, profile: { ...d.profile, dob, sex } }));
    nav('/');
  }

  return (
    <AuthShell title={`Hi ${data.profile.name.split(' ')[0] || 'there'}`} sub="Two quick questions. We use them to suggest typical ranges when you add results. You can skip this and change it later.">
      <form onSubmit={save} className="stack">
        <label className="field">
          <span>Date of birth</span>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
        </label>
        <fieldset className="field">
          <legend>Sex assigned at birth</legend>
          <div className="segmented">
            {(['female', 'male', ''] as Sex[]).map((s) => (
              <label key={s || 'na'} className={sex === s ? 'is-on' : ''}>
                <input type="radio" name="sex" checked={sex === s} onChange={() => setSex(s)} />
                {s === '' ? 'Prefer not to say' : s[0].toUpperCase() + s.slice(1)}
              </label>
            ))}
          </div>
          <small className="hint">Some lab ranges, such as hemoglobin and creatinine, differ by sex.</small>
        </fieldset>
        <button className="btn btn-primary btn-block">Continue</button>
        <button type="button" className="btn btn-ghost btn-block" onClick={() => nav('/')}>Skip for now</button>
      </form>
    </AuthShell>
  );
}
