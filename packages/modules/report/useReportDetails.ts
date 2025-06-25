import { create } from "zustand";
import { supabase } from "services";
import { Report, parseReport } from "models/report";

interface ReportsCacheStore {
  reports: Record<string, Report>;
  order: string[]; // reportId order for LRU
  isLoading: boolean;
  error: string | null;
  getReport: (reportId: string) => Promise<Report | null>;
}

const MAX_CACHE = 5;

export const useReportsCacheStore = create<ReportsCacheStore>((set, get) => ({
  reports: {},
  order: [],
  isLoading: false,
  error: null,
  getReport: async (reportId: string) => {
    const { reports, order } = get();
    if (reports[reportId]) {
      // Move to front (most recently used)
      set({
        order: [reportId, ...order.filter((id) => id !== reportId)],
      });
      return reports[reportId];
    }
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({ report_id: reportId });
      const { data, error } = await supabase.functions.invoke(
        `fetch-report-details?${params}`,
        { method: "GET" }
      );
      if (error) throw error;
      if (!data) return null;
      const parsedReport = parseReport(data);
      // Insert into cache, evict LRU if needed
      let newReports = { ...get().reports, [reportId]: parsedReport };
      let newOrder = [reportId, ...get().order.filter((id) => id !== reportId)];
      if (newOrder.length > MAX_CACHE) {
        const evictId = newOrder.pop();
        if (evictId) delete newReports[evictId];
      }
      set({ reports: newReports, order: newOrder });
      return parsedReport;
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch report details" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));
