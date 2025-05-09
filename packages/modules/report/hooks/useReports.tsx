import { useState, useEffect } from "react";
import { parseReport, Report } from "models";
import { supabase } from "services";

export default function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "fetch-reports",
          { body: { limit: 5 } }
        );
        if (error) throw error;
        setReports(data.map(parseReport) as Report[]);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  return {
    reports,
    isLoading,
    error,
  };
}
