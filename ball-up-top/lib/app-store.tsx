"use client";

// Global client state: signed-in user, their ratings by match id, and toasts.
// initialUser comes from a server-side getUser() call in app/layout.tsx to
// avoid a flash of signed-out on load.
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "./supabase/client";
import { toRating, type RatingRow } from "./ratings-row";
import { toUser } from "./to-user";
import type { Rating, User } from "./types";

const HIDE_SCORES_KEY = "ballup_hide_scores_v1";

interface AppContextValue {
  user: User | null;
  signOut: () => Promise<void>;
  ratingsByMatch: Record<string, Rating>;
  refreshRatings: () => Promise<void>;
  toast: string | null;
  showToast: (msg: string) => void;
  hideScores: boolean;
  toggleHideScores: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [ratingsByMatch, setRatingsByMatch] = useState<Record<string, Rating>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [hideScores, setHideScores] = useState(false);

  // Reads the persisted preference after mount, not during SSR (localStorage
  // isn't available server-side), so the first client render matches SSR.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read from a browser-only store, can't run during SSR
    setHideScores(localStorage.getItem(HIDE_SCORES_KEY) === "1");
  }, []);

  const toggleHideScores = useCallback(() => {
    setHideScores((prev) => {
      const next = !prev;
      localStorage.setItem(HIDE_SCORES_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  // Re-sync whenever the server-provided user changes across a navigation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing a server-provided prop into local state
    setUser(initialUser);
  }, [initialUser]);

  // Stay reactive to client-driven auth events (sign-out, token refresh).
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session?.user ?? null));
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadRatings = useCallback(async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("ratings").select("*").eq("user_id", userId);
    const map: Record<string, Rating> = {};
    ((data as RatingRow[]) ?? []).forEach((row) => {
      map[row.match_id] = toRating(row);
    });
    setRatingsByMatch(map);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches or clears the ratings cache when the user changes
    if (user) loadRatings(user.id);
    else setRatingsByMatch({});
  }, [user, loadRatings]);

  const refreshRatings = useCallback(async () => {
    if (user) await loadRatings(user.id);
  }, [user, loadRatings]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  return (
    <AppContext.Provider value={{ user, signOut, ratingsByMatch, refreshRatings, toast, showToast, hideScores, toggleHideScores }}>
      {children}
    </AppContext.Provider>
  );
}

// Throws if used outside AppProvider.
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
