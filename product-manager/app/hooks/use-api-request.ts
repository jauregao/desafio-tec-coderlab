import { useCallback, useState } from "react";
import { apiRequest } from "../lib/api-client";

interface UseApiRequestResult {
  loading: boolean;
  error: string | null;
  run: <TResponse>(path: string, init?: RequestInit) => Promise<TResponse>;
  clearError: () => void;
}

export function useApiRequest(): UseApiRequestResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <TResponse>(path: string, init?: RequestInit) => {
    setLoading(true);
    setError(null);

    try {
      return await apiRequest<TResponse>(path, init);
    } catch (requestError) {
      const normalizedError =
        requestError instanceof Error ? requestError.message : "Erro ao processar requisição";

      setError(normalizedError);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    run,
    clearError,
  };
}
