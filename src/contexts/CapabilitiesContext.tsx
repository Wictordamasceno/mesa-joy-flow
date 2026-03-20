import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { configApi, type Capabilities } from "@/services/api";

interface CapabilitiesContextValue {
  capabilities: Capabilities | null;
  isLoading: boolean;
  error: string | null;
  isModoComanda: boolean;
  isModoMesa: boolean;
  features: Capabilities["features"] | null;
  refetch: () => Promise<void>;
}

const CapabilitiesContext = createContext<CapabilitiesContextValue | null>(null);

export function CapabilitiesProvider({ children }: { children: ReactNode }) {
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCapabilities = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await configApi.capabilities();
      setCapabilities(data);
    } catch (e: any) {
      setError(e.message || "Erro ao carregar configurações");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCapabilities();
  }, [fetchCapabilities]);

  const isModoComanda = capabilities?.modo_comanda === "comanda";
  const isModoMesa = capabilities?.modo_comanda === "mesa";

  return (
    <CapabilitiesContext.Provider
      value={{
        capabilities,
        isLoading,
        error,
        isModoComanda,
        isModoMesa,
        features: capabilities?.features || null,
        refetch: fetchCapabilities,
      }}
    >
      {children}
    </CapabilitiesContext.Provider>
  );
}

export function useCapabilities() {
  const ctx = useContext(CapabilitiesContext);
  if (!ctx) throw new Error("useCapabilities must be used inside CapabilitiesProvider");
  return ctx;
}
