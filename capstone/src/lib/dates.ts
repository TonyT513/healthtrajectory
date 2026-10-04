const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const toTime = (iso: string) => parse(iso).getTime();

export function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function formatDate(iso: string) {
  if (!iso) return '';
  return parse(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMonth(iso: string) {
  const d = parse(iso);
  return `${d.toLocaleDateString('en-US', { month: 'short' })} ’${String(d.getFullYear()).slice(2)}`;
}

export function daysAgo(iso: string) {
  return Math.round((Date.now() - parse(iso).getTime()) / 86400000);
}

export function relative(iso: string) {
  const n = daysAgo(iso);
  if (n <= 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n < 45) return `${n} days ago`;
  const months = Math.round(n / 30.4);
  if (months < 18) return `${months} months ago`;
  return `${Math.round(n / 365)} years ago`;
}

export function age(dob: string) {
  if (!dob) return null;
  const b = parse(dob);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}
