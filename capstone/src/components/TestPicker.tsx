import { Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { categoryName, searchTests } from '../lib/catalog';
import type { CategoryId, LabTest } from '../lib/types';

interface Props {
  tests: LabTest[];
  category: CategoryId | '';
  value: LabTest | null;
  onChange: (t: LabTest) => void;
  onCreate: (name: string) => void;
  autoFocus?: boolean;
}

export function TestPicker({ tests, category, value, onChange, onCreate, autoFocus }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();

  const matches = useMemo(() => searchTests(tests, query, category).slice(0, 40), [tests, query, category]);
  const canCreate = query.trim().length > 1 && !matches.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());
  const count = matches.length + (canCreate ? 1 : 0);

  function choose(i: number) {
    if (i < matches.length) onChange(matches[i]);
    else if (canCreate) onCreate(query.trim());
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="picker">
      <div className="input-icon">
        <Search size={16} aria-hidden />
        <input
          id="test-picker"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-activedescendant={open && count ? `${id}-${active}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={value ? value.name : 'Search, e.g. A1C, LDL, TSH'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, count - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === 'Enter' && open && count) { e.preventDefault(); choose(active); }
            if (e.key === 'Escape') setOpen(false);
          }}
        />
      </div>
      {value && !query && (
        <div className="picker-chosen">
          <strong>{value.name}</strong>
          <span className="muted"> · {categoryName(value.category)}</span>
        </div>
      )}
      {open && count > 0 && (
        <ul className="picker-list" id={`${id}-list`} role="listbox">
          {matches.map((t, i) => (
            <li
              key={t.id}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'is-active' : ''}
              onMouseDown={(e) => { e.preventDefault(); choose(i); }}
              onMouseEnter={() => setActive(i)}
            >
              <span>{t.name}</span>
              <span className="muted small">{category ? t.unit : categoryName(t.category)}</span>
            </li>
          ))}
          {canCreate && (
            <li
              id={`${id}-${matches.length}`}
              role="option"
              aria-selected={active === matches.length}
              className={`picker-create${active === matches.length ? ' is-active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); choose(matches.length); }}
              onMouseEnter={() => setActive(matches.length)}
            >
              Add “{query.trim()}” as a new test
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
