import { useEffect, useState } from "react";

/**
 * Returns true once Zustand's persist middleware has finished
 * rehydrating from localStorage. Use to avoid hydration mismatch warnings
 * when rendering personalized content.
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}