import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { confirmDelete, Dialog } from '../components/Dialog';
import { PageHeader } from '../components/Layout';
import { formatDate, todayISO } from '../lib/dates';
import { uid } from '../lib/storage';
import { HISTORY_KINDS, useData } from '../lib/store';
import type { HistoryItem, HistoryKind } from '../lib/types';

const CONFIG: Record<HistoryKind, { title: string; singular: string; name: string; namePh: string; detail: string; detailPh: string; date?: string; active?: string; empty: string }> = {
  conditions: { title: 'Conditions', singular: 'condition', name: 'Condition', namePh: 'e.g. High blood pressure', detail: 'Details', detailPh: 'e.g. Diagnosed by Dr. Lee', date: 'Since', active: 'Current', empty: 'Ongoing or past diagnoses.' },
  medications: { title: 'Medications & supplements', singular: 'medication', name: 'Name', namePh: 'e.g. Atorvastatin', detail: 'Dose and how often', detailPh: 'e.g. 20 mg · once daily', date: 'Started', active: 'Still taking', empty: 'Prescriptions, over-the-counter medicines and supplements.' },
  allergies: { title: 'Allergies', singular: 'allergy', name: 'Allergic to', namePh: 'e.g. Penicillin', detail: 'Reaction', detailPh: 'e.g. Hives', empty: 'Medicines, foods or other allergies.' },
  procedures: { title: 'Surgeries & procedures', singular: 'procedure', name: 'Procedure', namePh: 'e.g. Appendectomy', detail: 'Details', detailPh: 'e.g. St. Mary’s Hospital', date: 'Date', empty: 'Past surgeries and procedures.' },
  family: { title: 'Family history', singular: 'family history item', name: 'Condition', namePh: 'e.g. Heart disease', detail: 'Relative', detailPh: 'e.g. Mother, diagnosed at 60', empty: 'Conditions that run in your family.' },
  immunizations: { title: 'Immunizations', singular: 'immunization', name: 'Vaccine', namePh: 'e.g. Flu shot', detail: 'Details', detailPh: 'e.g. Pharmacy, left arm', date: 'Date', empty: 'Vaccines and boosters.' },
};

export function History() {
  const { data, update } = useData();
  const [editing, setEditing] = useState<{ kind: HistoryKind; item?: HistoryItem } | null>(null);

  function save(kind: HistoryKind, item: HistoryItem) {
    update((d) => {
      const list = d.history[kind] ?? [];
      const exists = list.some((i) => i.id === item.id);
      return { ...d, history: { ...d.history, [kind]: exists ? list.map((i) => (i.id === item.id ? item : i)) : [...list, item] } };
    });
    setEditing(null);
  }

  function remove(kind: HistoryKind, id: string) {
    if (!confirmDelete('this item')) return;
    update((d) => ({ ...d, history: { ...d.history, [kind]: d.history[kind].filter((i) => i.id !== id) } }));
  }

  return (
    <>
      <PageHeader title="Health history" sub="Useful to have on hand at appointments" />
      <div className="history-grid">
        {HISTORY_KINDS.map((kind) => {
          const c = CONFIG[kind];
          const items = [...(data.history[kind] ?? [])].sort((a, b) => Number(b.active ?? false) - Number(a.active ?? false) || (b.date ?? '').localeCompare(a.date ?? ''));
          return (
            <section key={kind} className="card">
              <div className="card-head">
                <h2>{c.title}</h2>
                <button className="btn btn-sm" onClick={() => setEditing({ kind })}><Plus size={16} /> Add</button>
              </div>
              {items.length ? (
                <ul className="list">
                  {items.map((i) => (
                    <li key={i.id} className="list-row static">
                      <span>
                        <span className="list-title">
                          {i.name}
                          {c.active && i.active === false && <span className="tag">Past</span>}
                        </span>
                        <span className="list-sub">{[i.detail, i.date && `${c.date} ${formatDate(i.date)}`].filter(Boolean).join(' · ')}</span>
                      </span>
                      <span className="actions">
                        <button className="icon-btn" onClick={() => setEditing({ kind, item: i })} aria-label={`Edit ${i.name}`}><Pencil size={16} /></button>
                        <button className="icon-btn" onClick={() => remove(kind, i.id)} aria-label={`Delete ${i.name}`}><Trash2 size={16} /></button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted small">{c.empty}</p>
              )}
            </section>
          );
        })}
      </div>
      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing ? `${editing.item ? 'Edit' : 'Add'} ${CONFIG[editing.kind].singular}` : ''}>
        {editing && <HistoryForm kind={editing.kind} item={editing.item} onSave={(i) => save(editing.kind, i)} onCancel={() => setEditing(null)} />}
      </Dialog>
    </>
  );
}

function HistoryForm({ kind, item, onSave, onCancel }: { kind: HistoryKind; item?: HistoryItem; onSave: (i: HistoryItem) => void; onCancel: () => void }) {
  const c = CONFIG[kind];
  const [name, setName] = useState(item?.name ?? '');
  const [detail, setDetail] = useState(item?.detail ?? '');
  const [date, setDate] = useState(item?.date ?? '');
  const [active, setActive] = useState(item?.active ?? true);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: item?.id ?? uid(), name: name.trim(), detail: detail.trim() || undefined, date: date || undefined, active: c.active ? active : undefined });
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label className="field">
        <span>{c.name}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={c.namePh} required autoFocus />
      </label>
      <label className="field">
        <span>{c.detail} <span className="muted">(optional)</span></span>
        <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={c.detailPh} />
      </label>
      {c.date && (
        <label className="field">
          <span>{c.date} <span className="muted">(optional)</span></span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
        </label>
      )}
      {c.active && (
        <label className="check">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> {c.active}
        </label>
      )}
      <div className="form-actions">
        <button className="btn btn-primary">Save</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
