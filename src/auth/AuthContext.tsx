import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { fetchSession, logout as logoutApi, type AdminRole, type AdminUser } from "../lib/api";

interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  /** Vai trò đang được dùng để hiển thị giao diện — bằng user.role, trừ khi superadmin đang "xem như" vai trò khác. */
  viewAsRole: AdminRole | null;
  setViewAsRole: (role: AdminRole | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewAsRoleState, setViewAsRoleState] = useState<AdminRole | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { user: current } = await fetchSession();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (user?.role !== "superadmin") setViewAsRoleState(null);
  }, [user]);

  async function logout() {
    await logoutApi();
    setUser(null);
    setViewAsRoleState(null);
  }

  const viewAsRole = user?.role === "superadmin" ? viewAsRoleState : null;

  function setViewAsRole(role: AdminRole | null) {
    if (user?.role === "superadmin") setViewAsRoleState(role);
  }

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, viewAsRole, setViewAsRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
