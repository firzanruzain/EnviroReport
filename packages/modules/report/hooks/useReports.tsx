import { useState, useEffect } from "react";
import { Report } from "models";
import { supabase } from "@/packages/services";

export default function useReports () {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("reports", {});
        if (error) throw error;
        setReports(data as Report[]);
      }catch (err) {
        
        setError(err as Error);
      }      finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, []); 

  return {
    reports,
    isLoading,
    error
  };
};
