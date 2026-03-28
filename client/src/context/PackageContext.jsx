import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchPackages } from "../api/packages";

const PackageContext = createContext(null);

export function PackageProvider({ children }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPackages() {
      try {
        const data = await fetchPackages();
        if (isMounted) {
          setPackages(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to fetch packages.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      packages,
      loading,
      error
    }),
    [packages, loading, error]
  );

  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
}

export function usePackages() {
  const context = useContext(PackageContext);

  if (!context) {
    throw new Error("usePackages must be used within PackageProvider");
  }

  return context;
}
