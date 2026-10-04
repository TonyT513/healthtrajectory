export type CategoryId =
  | 'blood-sugar'
  | 'lipids'
  | 'cbc'
  | 'kidney'
  | 'liver'
  | 'thyroid'
  | 'iron'
  | 'vitamins'
  | 'inflammation'
  | 'electrolytes'
  | 'other';

/** Which direction is generally better once a value is inside its range. */
export type Better = 'lower' | 'higher' | 'range';

/**
 * A guideline category (e.g. ADA prediabetes 5.7–6.4 %). These are shown for
 * context only — a result's status always comes from the range on the user's
 * own lab report.
 */
export interface Band {
  label: string;
  text: string;
  /** inclusive */
  min?: number;
  /** exclusive */
  max?: number;
  tone: 'ok' | 'watch' | 'high';
}

export type SexSpecific = { male: string; female: string };

export interface LabTest {
  id: string;
  name: string;
  short?: string;
  aliases?: string[];
  category: CategoryId;
  unit: string;
  altUnits?: string[];
  /** A typical adult range, offered as a suggestion only. */
  typical?: string | SexSpecific;
  better: Better;
  /** Smallest change worth calling a trend. Defaults to 3 % of the prior value. */
  sig?: number;
  primary?: boolean;
  about?: string;
  bands?: Band[];
  bandsSource?: string;
  custom?: boolean;
}

export interface LabResult {
  id: string;
  testId: string;
  value: number;
  unit: string;
  /** Reference range exactly as the user typed it from their report, e.g. "< 5.7" or "70-99". */
  range: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  lab?: string;
  notes?: string;
  createdAt: string;
}

export type Sex = 'male' | 'female' | '';

export interface Profile {
  name: string;
  email: string;
  dob: string;
  sex: Sex;
  heightCm?: number;
  weightKg?: number;
  provider?: string;
  units: 'us' | 'metric';
}

export type HistoryKind = 'conditions' | 'medications' | 'allergies' | 'procedures' | 'family' | 'immunizations';

export interface HistoryItem {
  id: string;
  name: string;
  /** Free text: dosage, reaction, relative, etc. */
  detail?: string;
  date?: string;
  notes?: string;
  active?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  kind: 'lab' | 'habit';
  /** lab goals */
  testId?: string;
  direction?: 'below' | 'above';
  target: number;
  unit?: string;
  /** habit goals */
  current?: number;
  period?: string;
  due?: string;
  status: 'active' | 'done';
  createdAt: string;
}

export interface DocMeta {
  id: string;
  title: string;
  type: 'Lab report' | 'Imaging' | 'Visit summary' | 'Prescription' | 'Insurance' | 'Other';
  date: string;
  fileName: string;
  mime: string;
  size: number;
  addedAt: string;
}

export interface UserData {
  profile: Profile;
  results: LabResult[];
  customTests: LabTest[];
  history: Record<HistoryKind, HistoryItem[]>;
  goals: Goal[];
  documents: DocMeta[];
}
