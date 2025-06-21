import { useState, useEffect, useCallback } from "react";
import { supabase } from "services";
import { Report, parseReport } from "models/report";

export function useReportDetails(reportId: string | undefined) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportDetails = useCallback(async () => {
    if (!reportId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        report_id: reportId,
      });

      const { data, error } = await supabase.functions.invoke(
        `fetch-report-details?${params}`,
        { method: "GET" }
      );

      if (error) throw error;

      const parsedReport = parseReport(data);
      setReport(parsedReport);
      console.log(JSON.stringify(report, null, 2));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch report details"
      );
      console.error("Error fetching report details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReportDetails();
  }, [fetchReportDetails]);

  return { report, isLoading, error, refetch: fetchReportDetails };
}
