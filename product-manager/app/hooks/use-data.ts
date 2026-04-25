import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { apiRequest } from "../lib/api-client";

interface UseDataOptions<TData> {
  enabled?: boolean;
  initialData?: TData;
  retries?: number;
  retryDelayMs?: number;
}

interface UseDataResult<TData> {
  data: TData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: Dispatch<SetStateAction<TData | null>>;
}

export function useData<TData>(
  path: string,
  options?: UseDataOptions<TData>,
): UseDataResult<TData> {
  const { enabled = true, initialData, retries = 6, retryDelayMs = 1000 } = options ?? {};

  const [data, setData] = useState<TData | null>(initialData ?? null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let lastError: string | null = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const result = await apiRequest<TData>(path);
        setData(result);
        setLoading(false);
        setError(null);
        return;
      } catch (requestError) {
        lastError =
          requestError instanceof Error ? requestError.message : "Erro ao carregar dados";

        if (attempt < retries) {
          await new Promise((resolve) => {
            window.setTimeout(resolve, retryDelayMs * (attempt + 1));
          });
          continue;
        }

        setError(lastError);
        setLoading(false);
      }
    }
  }, [enabled, path, retries, retryDelayMs]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  };
}
