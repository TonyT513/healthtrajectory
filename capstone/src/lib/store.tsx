import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TESTS } from './catalog';
import * as storage from './storage';
import type { HistoryKind, LabTest, UserData } from './types';

export const HISTORY_KINDS: HistoryKind[] = ['conditions', 'medications', 'allergies', 'procedures', 'family', 'immunizations'];

function emptyData(email: string, name: string): UserData {
  return {
    profile: { name, email, dob: '', sex: '', units: 'us' },
    results: [],
    customTests: [],
    history: Object.fromEntries(HISTORY_KINDS.map((k) => [k, []])) as unknown as UserData['history'],
    goals: [],
    documents: [],
  };
}

interface Ctx {
  email: string | null;
  data: UserData | null;
  tests: LabTest[];
  testById: (id: string) => LabTest | undefined;
  update: (fn: (d: UserData) => UserData) => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  deleteAccount: () => Promise<void>;
}

const StoreContext = createContext<Ctx | null>(null);

function load(email: string | null): UserData | null {
  if (!email) return null;
  return storage.loadData(email) ?? emptyData(email, storage.accountName(email));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(() => storage.currentSession());
  const [data, setData] = useState<UserData | null>(() => load(email));

  useEffect(() => {
    if (email && data) storage.saveData(email, data);
  }, [email, data]);

  const update = useCallback((fn: (d: UserData) => UserData) => setData((d) => (d ? fn(d) : d)), []);

  const tests = useMemo(() => [...TESTS, ...(data?.customTests ?? [])], [data?.customTests]);
  const index = useMemo(() => new Map(tests.map((t) => [t.id, t])), [tests]);

  const value: Ctx = {
    email,
    data,
    tests,
    testById: (id) => index.get(id),
    update,
    async signUp(name, mail, password) {
      const key = await storage.createAccount(name, mail, password);
      setEmail(key);
      setData(emptyData(key, name.trim()));
    },
    async signIn(mail, password) {
      const key = await storage.signIn(mail, password);
      setEmail(key);
      setData(load(key));
    },
    signOut() {
      storage.signOut();
      setEmail(null);
      setData(null);
    },
    async deleteAccount() {
      if (email) await storage.deleteAccount(email);
      setEmail(null);
      setData(null);
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** For pages behind the auth gate, where data is always present. */
export function useData() {
  const ctx = useStore();
  return { ...ctx, data: ctx.data! };
}
