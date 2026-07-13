"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { SEED_LOGS } from "./data";
import type { User, UserLog } from "./types";

const LOGS_KEY = "ballup_logs_v2";
const USER_KEY = "ballup_web_user_v2";

interface AppContextValue {
  user: User | null;
  signIn: (u: User) => void;
  signOut: () => void;
  logs: Record<string, UserLog>;
  saveLog: (matchId: string, log: Omit<UserLog, "ts">) => void;
  clearLogs: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<Record<string, UserLog>>(SEED_LOGS);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(USER_KEY);
      if (rawUser) setUser(JSON.parse(rawUser));
      const rawLogs = localStorage.getItem(LOGS_KEY);
      if (rawLogs) setLogs(JSON.parse(rawLogs));
      else setLogs({ ...SEED_LOGS });
    } catch {
      // fall through to defaults
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(LOGS_KEY, JSON.stringify(logs)); } catch {}
  }, [logs, loaded]);

  const signIn = useCallback((u: User) => {
    setUser(u);
    try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch {}
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem(USER_KEY); } catch {}
  }, []);

  const saveLog = useCallback((matchId: string, log: Omit<UserLog, "ts">) => {
    setLogs((prev) => ({ ...prev, [matchId]: { ...log, ts: Date.now() } }));
  }, []);

  const clearLogs = useCallback(() => {
    setLogs({});
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  return (
    <AppContext.Provider value={{ user, signIn, signOut, logs, saveLog, clearLogs, toast, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
