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

interface AppContextValue {
  user: User | null;
  signOut: () => Promise<void>;
  ratingsByMatch: Record<string, Rating>;
  refreshRatings: () => Promise<void>;
  toast: string | null;
  showToast: (msg: string) => void;
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

  // Re-sync whenever the server-provided user changes across a navigation.
  useEffect(() => {
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
    <AppContext.Provider value={{ user, signOut, ratingsByMatch, refreshRatings, toast, showToast }}>
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
