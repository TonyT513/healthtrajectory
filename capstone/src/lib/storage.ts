/*
 * Browser-only persistence for this version. Everything lives on the user's
 * device: account records and health data in localStorage, uploaded files in
 * IndexedDB. Swap this module for API calls when a backend exists — the rest
 * of the app only talks to the functions exported here and in store.tsx.
 */
import type { UserData } from './types';

const ACCOUNTS = 'ht.accounts';
const SESSION = 'ht.session';
const dataKey = (email: string) => `ht.data.${email.toLowerCase()}`;

interface Account {
  email: string;
  name: string;
  salt: string;
  hash: string;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function hashPassword(password: string, salt: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function uid() {
  return crypto.randomUUID();
}

export async function createAccount(name: string, email: string, password: string): Promise<string> {
  const accounts = readJSON<Account[]>(ACCOUNTS, []);
  const key = email.trim().toLowerCase();
  if (accounts.some((a) => a.email === key)) throw new Error('An account with this email already exists on this device.');
  const salt = uid();
  accounts.push({ email: key, name: name.trim(), salt, hash: await hashPassword(password, salt) });
  writeJSON(ACCOUNTS, accounts);
  localStorage.setItem(SESSION, key);
  return key;
}

export async function signIn(email: string, password: string): Promise<string> {
  const key = email.trim().toLowerCase();
  const acct = readJSON<Account[]>(ACCOUNTS, []).find((a) => a.email === key);
  if (!acct || (await hashPassword(password, acct.salt)) !== acct.hash) {
    throw new Error('That email and password don’t match an account on this device.');
  }
  localStorage.setItem(SESSION, key);
  return key;
}

export function signOut() {
  localStorage.removeItem(SESSION);
}

export function currentSession(): string | null {
  return localStorage.getItem(SESSION);
}

export function accountName(email: string) {
  return readJSON<Account[]>(ACCOUNTS, []).find((a) => a.email === email)?.name ?? '';
}

export function loadData(email: string): UserData | null {
  return readJSON<UserData | null>(dataKey(email), null);
}

export function saveData(email: string, data: UserData) {
  writeJSON(dataKey(email), data);
}

export async function deleteAccount(email: string) {
  const data = loadData(email);
  for (const d of data?.documents ?? []) await deleteFile(d.id);
  localStorage.removeItem(dataKey(email));
  writeJSON(ACCOUNTS, readJSON<Account[]>(ACCOUNTS, []).filter((a) => a.email !== email));
  signOut();
}

// ── Files (IndexedDB) ─────────────────────────────────────────────────────────

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('healthtrajectory', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('files');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const req = fn(d.transaction('files', mode).objectStore('files'));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const putFile = (id: string, blob: Blob) => tx('readwrite', (s) => s.put(blob, id));
export const getFile = (id: string) => tx<Blob | undefined>('readonly', (s) => s.get(id));
export const deleteFile = (id: string) => tx('readwrite', (s) => s.delete(id));
