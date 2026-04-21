import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchPackages } from "../api/packages";

const PackageContext = createContext(null);

export function PackageProvider({ children }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await fetchPackages();
      setPackages(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to fetch adventures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const value = useMemo(
    () => ({
      packages,
      loading,
      error,
      refreshPackages: loadPackages
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
