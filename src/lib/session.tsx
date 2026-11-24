import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Demo identity — stands in for the Identity module (built by another team member).
 * Swap this provider for the real session once login exists; pages only use `useSession()`.
 */
export type Role = "student" | "admin";
export type DemoUser = { id: string; name: string; role: Role };

export const DEMO_USERS: DemoUser[] = [
  { id: "student-anita", name: "Anita Gurung", role: "student" },
  { id: "student-rohan", name: "Rohan Shrestha", role: "student" },
  { id: "admin-sita", name: "Sita Karki", role: "admin" },
];

const STORAGE_KEY = "edusphere-demo-user";

type SessionValue = {
  user: DemoUser | null;
  isAdmin: boolean;
  ready: boolean;
  signIn: (userId: string) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const id = window.localStorage.getItem(STORAGE_KEY);
      setUser(DEMO_USERS.find((u) => u.id === id) ?? null);
    } catch {
      setUser(null);
    }
    setReady(true);
  }, []);

  const signIn = useCallback((userId: string) => {
    const next = DEMO_USERS.find((u) => u.id === userId) ?? null;
    setUser(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, next.id);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ user, isAdmin: user?.role === "admin", ready, signIn, signOut }),
    [user, ready, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
