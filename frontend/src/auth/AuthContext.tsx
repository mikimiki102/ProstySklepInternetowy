import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type Me } from "../api/api";

type AuthCtx = {
  user: Me | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

const LS_TOKEN = "auth_accessToken";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(LS_TOKEN)
  );
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!accessToken) {
        setUser(null);
        return;
      }
      try {
        const me = await api.auth.me(accessToken);
        setUser(me);
      } catch {
        setUser(null);
      }
    };
    run();
  }, [accessToken]);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setAccessToken(res.accessToken);
    localStorage.setItem(LS_TOKEN, res.accessToken);
    const me = await api.auth.me(res.accessToken);
    setUser(me);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {}
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(LS_TOKEN);
  };

  const value = useMemo(
    () => ({ user, accessToken, login, logout }),
    [user, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
