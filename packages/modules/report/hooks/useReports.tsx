import { useState, useEffect } from "react";
import { Report } from "models";

type ReportFetcher = () => Promise<Report[]>;

export default function useReports (fetcher: ReportFetcher) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await fetcher();
        setReports(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [fetcher]); // Re-runs if fetcher changes

  return {
    reports,
    isLoading,
    error,
    refetch: () => fetcher().then(setReports),
  };
};
