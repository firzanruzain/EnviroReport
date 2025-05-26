import { useState, useEffect } from "react";
import { parseReport, Report } from "models";
import { supabase } from "services";

export default function useReports(initialLimit: number = 10) {
  const [reports, setReports] = useState<Report[]>([]);
  const [counts, setCounts] = useState<number>(0); // total count of reports
  const [limit, setLimit] = useState<number>(initialLimit);
  const [offset, setOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "fetch-reports",
          { method: "GET" }
        );
        if (error) throw error;
        setReports(data.data.map(parseReport) as Report[]);
        setCounts(data.count);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [limit, offset]);

  return {
    reports,
    isLoading,
    error,
  };
}
