import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchApprovedReviews } from "../api/reviews";

const ReviewContext = createContext(null);

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchApprovedReviews();
      setReviews(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to fetch reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const value = useMemo(
    () => ({
      reviews,
      loading,
      error,
      refreshReviews: loadReviews
    }),
    [reviews, loading, error]
  );

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

export function useReviews() {
  const context = useContext(ReviewContext);

  if (!context) {
    throw new Error("useReviews must be used within ReviewProvider");
  }

  return context;
}
