import type { Goal, HistoryItem, HistoryKind, LabResult } from './types';
import { uid } from './storage';

/** Synthetic example data so people can see how the app works before adding their own. */

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
const monthsAgo = (m: number) => daysAgo(Math.round(m * 30.4));

/** Five blood draws over two years, the latest about a week ago. */
const DRAWS = [24, 18, 12, 6, 0.25];

const SERIES: [testId: string, unit: string, range: string, values: (number | null)[]][] = [
  ['a1c', '%', '< 5.7', [6.1, 5.9, 5.8, 5.7, 5.6]],
  ['glucose-fasting', 'mg/dL', '70-99', [108, 104, 101, 97, 96]],
  ['total-chol', 'mg/dL', '< 200', [236, 224, 214, 205, 191]],
  ['ldl', 'mg/dL', '< 100', [158, 148, 139, 131, 122]],
  ['hdl', 'mg/dL', '> 39', [42, 44, 45, 47, 49]],
  ['trig', 'mg/dL', '< 150', [182, 171, 160, 148, 131]],
  ['egfr', 'mL/min/1.73m²', '>= 60', [95, null, 93, null, 94]],
  ['creatinine', 'mg/dL', '0.76-1.27', [0.96, null, 0.98, null, 0.97]],
  ['bun', 'mg/dL', '6-24', [15, null, 14, null, 16]],
  ['sodium', 'mmol/L', '134-144', [140, null, 139, null, 141]],
  ['potassium', 'mmol/L', '3.5-5.2', [4.3, null, 4.5, null, 4.2]],
  ['alt', 'U/L', '0-44', [31, null, 28, null, 24]],
  ['ast', 'U/L', '0-40', [26, null, 24, null, 22]],
  ['tsh', 'mIU/L', '0.45-4.5', [null, 2.1, null, null, 2.3]],
  ['vitd', 'ng/mL', '30-100', [null, 19, 24, null, 27]],
  ['hgb', 'g/dL', '13.0-17.7', [null, null, 14.6, null, 14.9]],
  ['wbc', '×10³/µL', '3.4-10.8', [null, null, 6.2, null, 5.8]],
  ['plt', '×10³/µL', '150-450', [null, null, 251, null, 262]],
  ['ferritin', 'ng/mL', '30-400', [null, null, 88, null, null]],
  ['b12', 'pg/mL', '232-1245', [null, null, null, null, 512]],
];

export function sampleResults(): LabResult[] {
  const out: LabResult[] = [];
  const now = new Date().toISOString();
  for (const [testId, unit, range, values] of SERIES) {
    values.forEach((value, i) => {
      if (value == null) return;
      out.push({
        id: uid(), testId, value, unit, range,
        date: monthsAgo(DRAWS[i]),
        lab: i % 2 ? 'Quest Diagnostics' : 'Labcorp',
        createdAt: now,
      });
    });
  }
  return out;
}

export function sampleHistory(): Partial<Record<HistoryKind, HistoryItem[]>> {
  return {
    conditions: [{ id: uid(), name: 'Prediabetes', date: monthsAgo(24), detail: 'Diagnosed after A1C of 6.1 %', active: true }],
    medications: [{ id: uid(), name: 'Vitamin D3', detail: '2,000 IU · once daily', date: monthsAgo(18), active: true }],
    allergies: [{ id: uid(), name: 'Penicillin', detail: 'Hives' }],
    family: [{ id: uid(), name: 'Type 2 diabetes', detail: 'Father' }],
  };
}

export function sampleGoals(): Goal[] {
  const now = new Date().toISOString();
  return [
    { id: uid(), title: 'Get LDL below 100', kind: 'lab', testId: 'ldl', direction: 'below', target: 100, status: 'active', createdAt: now },
    { id: uid(), title: 'Keep A1C under 5.7', kind: 'lab', testId: 'a1c', direction: 'below', target: 5.7, status: 'active', createdAt: now },
    { id: uid(), title: 'Walk 150 minutes a week', kind: 'habit', target: 150, current: 120, unit: 'min', period: 'week', status: 'active', createdAt: now },
  ];
}
