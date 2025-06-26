import { create } from "zustand";
import { supabase } from "services";
import { Report, parseReport } from "models/report";

interface ReportsCacheStore {
  reports: Record<string, Report>;
  order: string[]; // reportId order for LRU
  isLoading: boolean;
  error: string | null;
  getReport: (reportId: string, refresh?: boolean) => Promise<Report | null>;
}

const MAX_CACHE = 5;

export const useReportsCacheStore = create<ReportsCacheStore>((set, get) => ({
  reports: {},
  order: [],
  isLoading: false,
  error: null,
  getReport: async (reportId: string, refresh = false) => {
    const { reports, order } = get();

    // If not refreshing and report exists in cache, return cached version
    if (!refresh && reports[reportId]) {
      console.log("fetching reports details from cache");
      // Move to front (most recently used)
      set({
        order: [reportId, ...order.filter((id) => id !== reportId)],
      });
      return reports[reportId];
    }

    console.log("fetching reports details from db");
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("report")
        .select(
          "*, form_template:form_template_id(*, pollution_type:pollution_type_id(*)), report_logs:report_log(log_id, created_at, event_type, event_description, created_by), feedback:feedback(*)"
        )
        .eq("report_id", reportId)
        .maybeSingle();
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
