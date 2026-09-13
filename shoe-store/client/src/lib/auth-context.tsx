import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiRequest, ApiError } from "./api";

type PublicUser = { id: number; email: string; name: string; role: "customer" | "admin" };

type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("GET", "/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const u = await apiRequest("POST", "/api/auth/login", { email, password });
    setUser(u);
  }

  async function register(name: string, email: string, password: string) {
    const u = await apiRequest("POST", "/api/auth/register", { name, email, password });
    setUser(u);
  }

  async function logout() {
    await apiRequest("POST", "/api/auth/logout");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
