"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { checkBackendHealth, BACKEND_URL, BackendHealthResponse } from "@/lib/backendApi";

interface BackendStatusContextType {
  isOnline: boolean | null;
  isLoading: boolean;
  latencyMs: number | null;
  service: string | null;
  status: string | null;
  toolMatrix: Record<string, { library: string; dependency: string }> | null;
  error: string | null;
  lastChecked: Date | null;
  backendUrl: string;
  checkNow: () => Promise<void>;
}

const BackendStatusContext = createContext<BackendStatusContextType>({
  isOnline: null,
  isLoading: false,
  latencyMs: null,
  service: null,
  status: null,
  toolMatrix: null,
  error: null,
  lastChecked: null,
  backendUrl: BACKEND_URL,
  checkNow: async () => {},
});

export function BackendStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [toolMatrix, setToolMatrix] = useState<
    Record<string, { library: string; dependency: string }> | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkNow = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: BackendHealthResponse = await checkBackendHealth();
      setIsOnline(res.isOnline);
      setLatencyMs(res.latencyMs);
      setLastChecked(new Date());

      if (res.isOnline) {
        setService(res.service || "Simple PDF Backend Engine");
        setStatus(res.status || "online");
        setToolMatrix(res.toolMatrix || null);
        setError(null);
      } else {
        setService(null);
        setStatus("offline");
        setError(res.error || "Cannot connect to backend server");
      }
    } catch (err: any) {
      setIsOnline(false);
      setLatencyMs(null);
      setStatus("offline");
      setError(err?.message || "Connection failed");
      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll every 5 seconds for live status
  useEffect(() => {
    checkNow();

    const interval = setInterval(() => {
      checkNow();
    }, 5000);

    return () => clearInterval(interval);
  }, [checkNow]);

  return (
    <BackendStatusContext.Provider
      value={{
        isOnline,
        isLoading,
        latencyMs,
        service,
        status,
        toolMatrix,
        error,
        lastChecked,
        backendUrl: BACKEND_URL,
        checkNow,
      }}
    >
      {children}
    </BackendStatusContext.Provider>
  );
}

export function useBackendStatus() {
  return useContext(BackendStatusContext);
}
