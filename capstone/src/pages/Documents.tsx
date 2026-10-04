import { Download, ExternalLink, FileImage, FileText, Trash2, Upload } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { confirmDelete, Dialog } from '../components/Dialog';
import { Empty, PageHeader } from '../components/Layout';
import { formatDate, todayISO } from '../lib/dates';
import { deleteFile, getFile, putFile, uid } from '../lib/storage';
import { useData } from '../lib/store';
import type { DocMeta } from '../lib/types';

const TYPES: DocMeta['type'][] = ['Lab report', 'Imaging', 'Visit summary', 'Prescription', 'Insurance', 'Other'];
const MAX_MB = 20;

const size = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export function Documents() {
  const { data, update } = useData();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<File | null>(null);
  const [filter, setFilter] = useState<DocMeta['type'] | ''>('');
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');

  function pick(f: File | undefined) {
    setError('');
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) return setError(`That file is over ${MAX_MB} MB.`);
    setPending(f);
  }

  async function open(d: DocMeta, download = false) {
    const blob = await getFile(d.id);
    if (!blob) return setError('That file is missing from this browser.');
    const url = URL.createObjectURL(blob);
    if (download) {
      const a = document.createElement('a');
      a.href = url;
      a.download = d.fileName;
      a.click();
    } else {
      window.open(url, '_blank', 'noopener');
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  async function remove(d: DocMeta) {
    if (!confirmDelete(`“${d.title}”`)) return;
    await deleteFile(d.id);
    update((x) => ({ ...x, documents: x.documents.filter((i) => i.id !== d.id) }));
  }

  const docs = [...data.documents].filter((d) => !filter || d.type === filter).sort((a, b) => b.date.localeCompare(a.date));
  const usedTypes = TYPES.filter((t) => data.documents.some((d) => d.type === t));

  return (
    <>
      <PageHeader
        title="Documents"
        sub="Lab reports, visit summaries and other records"
        actions={<button className="btn btn-primary" onClick={() => input.current?.click()}><Upload size={18} /> Upload</button>}
      />
      <input ref={input} type="file" hidden accept=".pdf,image/*,.txt,.doc,.docx" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />

      <div
        className={`dropzone ${drag ? 'is-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
      >
        <Upload size={20} aria-hidden />
        <span>Drop a PDF or photo here, or <button className="link-btn" onClick={() => input.current?.click()}>choose a file</button></span>
        <span className="muted small">Up to {MAX_MB} MB. Files are kept in this browser only.</span>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}

      {usedTypes.length > 1 && (
        <div className="chips" role="group" aria-label="Filter by type">
          <button className={`chip ${filter === '' ? 'is-on' : ''}`} onClick={() => setFilter('')}>All</button>
          {usedTypes.map((t) => <button key={t} className={`chip ${filter === t ? 'is-on' : ''}`} onClick={() => setFilter(t)}>{t}</button>)}
        </div>
      )}

      {!data.documents.length ? (
        <Empty title="No documents yet">Keep a copy of your lab reports here so you can check the original whenever you need to.</Empty>
      ) : (
        <ul className="card flush doc-list">
          {docs.map((d) => {
            const Icon = d.mime.startsWith('image/') ? FileImage : FileText;
            return (
              <li key={d.id} className="doc-row">
                <Icon size={20} className="doc-icon" aria-hidden />
                <button className="doc-main" onClick={() => open(d)}>
                  <span className="list-title">{d.title}</span>
                  <span className="list-sub">{d.type} · {formatDate(d.date)} · {size(d.size)}</span>
                </button>
                <span className="actions">
                  <button className="icon-btn" onClick={() => open(d)} aria-label={`Open ${d.title}`}><ExternalLink size={16} /></button>
                  <button className="icon-btn" onClick={() => open(d, true)} aria-label={`Download ${d.title}`}><Download size={16} /></button>
                  <button className="icon-btn" onClick={() => remove(d)} aria-label={`Delete ${d.title}`}><Trash2 size={16} /></button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!pending} onClose={() => setPending(null)} title="Add document">
        {pending && (
          <DocForm
            file={pending}
            onCancel={() => setPending(null)}
            onSave={async (meta) => {
              await putFile(meta.id, pending);
              update((x) => ({ ...x, documents: [...x.documents, meta] }));
              setPending(null);
            }}
          />
        )}
      </Dialog>
    </>
  );
}

function DocForm({ file, onSave, onCancel }: { file: File; onSave: (m: DocMeta) => Promise<void>; onCancel: () => void }) {
  const [title, setTitle] = useState(file.name.replace(/\.[^.]+$/, ''));
  const [type, setType] = useState<DocMeta['type']>(/lab|result|blood/i.test(file.name) ? 'Lab report' : 'Other');
  const [date, setDate] = useState(todayISO());
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await onSave({ id: uid(), title: title.trim() || file.name, type, date, fileName: file.name, mime: file.type || 'application/octet-stream', size: file.size, addedAt: new Date().toISOString() });
  }

  return (
    <form className="stack" onSubmit={submit}>
      <p className="muted small">{file.name} · {size(file.size)}</p>
      <label className="field"><span>Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus /></label>
      <div className="row gap wrap">
        <label className="field grow">
          <span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value as DocMeta['type'])}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className="field"><span>Date on document</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" disabled={busy}>Save</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
