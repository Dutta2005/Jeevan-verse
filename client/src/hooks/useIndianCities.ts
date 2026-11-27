import { useEffect, useState } from "react";
import { getIndianCities } from "@/lib/india-locations";

interface CityResult {
  stateCode: string;
  attempt: number;
  cities: string[];
  error: string | null;
}

export function useIndianCities(stateCode: string) {
  const [result, setResult] = useState<CityResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!stateCode) return;
    let active = true;
    getIndianCities(stateCode)
      .then((cities) => {
        if (active) setResult({ stateCode, attempt, cities, error: null });
      })
      .catch(() => {
        if (active)
          setResult({
            stateCode,
            attempt,
            cities: [],
            error: "City suggestions could not be loaded.",
          });
      });
    return () => {
      active = false;
    };
  }, [stateCode, attempt]);

  const current = result?.stateCode === stateCode && result.attempt === attempt ? result : null;
  return {
    cities: current?.cities ?? [],
    isLoading: Boolean(stateCode && !current),
    error: current?.error ?? null,
    retry: () => setAttempt((value) => value + 1),
  };
}
