import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type Profile = { id: string; username: string | null; coins: number };

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = React.createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const loadProfile = React.useCallback(async (uid: string) => {
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((prof as Profile) ?? null);
    setIsAdmin(!!roles?.some((r: { role: string }) => r.role === "admin"));
  }, []);

  React.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) setTimeout(() => loadProfile(s.user.id), 0);
      else { setProfile(null); setIsAdmin(false); }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = React.useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const signOut = React.useCallback(async () => { await supabase.auth.signOut(); }, []);

  return (
    <Ctx.Provider value={{ user, session, profile, isAdmin, loading, refreshProfile, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}
