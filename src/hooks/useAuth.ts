import { useState, useCallback, useEffect } from "react";
import { authApi, healthApi, licenseApi, type LoginResponse, type AuthUser, ApiError } from "@/services/api";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem("authToken");
    const userJson = localStorage.getItem("authUser");
    const user = userJson ? JSON.parse(userJson) : null;
    return { token, user, isAuthenticated: !!token };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, senha: string) => {
    setLoading(true);
    setError(null);
    try {
      // Health check first
      try {
        const health = await healthApi.check();
        if (health.status === "not_configured") {
          throw new Error("Servidor não configurado. Verifique o endereço nas configurações.");
        }
      } catch (e) {
        if (e instanceof ApiError) throw e;
        throw new Error("Não foi possível conectar ao servidor. Verifique o endereço e tente novamente.");
      }

      const response = await authApi.login({ email, senha });
      localStorage.setItem("authToken", response.access_token);
      localStorage.setItem("attendantName", response.usuario.nome);

      const user: AuthUser = {
        sub: String(response.usuario.cdvend),
        nome: response.usuario.nome,
        perfil: response.usuario.perfil,
        cdvend: response.usuario.cdvend,
      };
      localStorage.setItem("authUser", JSON.stringify(user));

      setAuth({ token: response.access_token, user, isAuthenticated: true });
      return response;
    } catch (e: unknown) {
      const apiError = e instanceof ApiError ? e : null;
      const fallbackMessage = e instanceof Error ? e.message : "Erro ao fazer login.";
      const msg = apiError
        ? apiError.status === 429
          ? "Muitas tentativas. Aguarde um momento."
          : apiError.status === 403
          ? "Operador bloqueado no sistema."
          : apiError.message || fallbackMessage
        : fallbackMessage;
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("attendantName");
    setAuth({ token: null, user: null, isAuthenticated: false });
  }, []);

  const checkLicense = useCallback(async () => {
    try {
      const lic = await licenseApi.check();
      return lic;
    } catch {
      return null;
    }
  }, []);

  return { ...auth, login, logout, loading, error, checkLicense };
}
