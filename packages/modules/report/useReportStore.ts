import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "services";
import {
  parseReport,
  Report,
  ReportStore,
  RawReport,
  ReportStatus,
} from "models/report";

const DEFAULT_LIMIT = 10;
const DASHBOARD_LIMIT = 5;
const STORE_VERSION = 1;

// Helper function to parse stored reports
const parseStoredReports = (storedData: any) => {
  if (!storedData) return null;

  try {
    // Parse the stored data
    const parsed = JSON.parse(storedData);

    // Check version
    if (parsed.version !== STORE_VERSION) {
      return null; // Force fresh data if version mismatch
    }

    // Convert dates in reports
    if (parsed.state?.reports) {
      parsed.state.reports = parsed.state.reports.map((raw: RawReport) =>
        parseReport(raw)
      );
    }

    // Convert dates in latestReports
    if (parsed.state?.latestReports) {
      parsed.state.latestReports = parsed.state.latestReports.map(
        (raw: RawReport) => parseReport(raw)
      );
    }

    return parsed;
  } catch (error) {
    console.error("Error parsing stored reports:", error);
    return null;
  }
};

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: [],
      latestReports: [],
      total: 0,
      limit: DEFAULT_LIMIT,
      offset: 0,
      isLoading: false,
      hasMore: true,
      error: null,
      pollutionCounts: {},
      lastSearch: "",

      setLimit: (newLimit: number) => {
        set({ limit: newLimit, offset: 0, reports: [] });
        get().fetchReports({ append: false });
      },

      fetchPollutionCounts: async () => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase.functions.invoke(
            "fetch-reports-count",
            { method: "GET" }
          );
          if (error) throw error;

          console.log(data);
          set({
            pollutionCounts: data.counts,
            isLoading: false,
          });
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : "Failed to load pollution counts",
            isLoading: false,
          });
        }
      },

      fetchLatestReports: async () => {
        const { isLoading } = get();
        if (isLoading) return;

        try {
          set({ isLoading: true, error: null });
          const params = new URLSearchParams({
            offset: "0",
            limit: DASHBOARD_LIMIT.toString(),
            dashboard: "true",
          });

          console.log("Fetching Latest Reports", {
            isLoading,
            params: params,
          });

          const { data, error } = await supabase.functions.invoke(
            `search-report?${params}`,
            { method: "GET" }
          );
          if (error) throw error;

          const newReports = data.data.map((raw: RawReport) =>
            parseReport(raw)
          );
          set({ latestReports: newReports });
          return data.total;
        } catch (err: any) {
          set({ error: err.message || "Failed to fetch latest reports" });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchReports: async ({ append = true, search } = {}) => {
        const { offset, limit, reports, isLoading } = get();
        if (isLoading) return;
        if (!get().hasMore) return;

        try {
          set({ isLoading: true, error: null, lastSearch: search || "" });
          const params = new URLSearchParams({
            offset: offset.toString(),
            limit: limit.toString(),
            dashboard: "false",
          });
          if (search && search !== "") {
            const trimmedSearch = search.trim();
            if (trimmedSearch) {
              params.set("form_name", trimmedSearch);
            }
          }

          const { data, error } = await supabase.functions.invoke(
            `search-report?${params}`,
            { method: "GET" }
          );
          if (error) throw error;

          const newReports = data.data.map((raw: RawReport) =>
            parseReport(raw)
          );
          const total = data.total;
          const newOffset = append
            ? offset + newReports.length
            : newReports.length;

          // Check if there are more reports available beyond the current offset
          const hasMoreReports = total > newOffset;

          set({
            reports: append ? [...reports, ...newReports] : newReports,
            offset: newOffset,
            total: total,
            hasMore: hasMoreReports,
          });

          console.log("Fetch reports state:", {
            newOffset,
            total,
            hasMoreReports,
            newReportsLength: newReports.length,
            currentReportsLength: reports.length,
            search,
          });
        } catch (err: any) {
          set({ error: err.message || "Failed to fetch reports" });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchReportDetails: async (reportId: string) => {
        try {
          set({ isLoading: true, error: null });
          const params = new URLSearchParams({
            report_id: reportId,
          });

          const { data, error } = await supabase.functions.invoke(
            `fetch-report-details?${params}`,
            { method: "GET" }
          );
          if (error) throw error;

          // Update the report in both reports and latestReports arrays
          const updatedReport = parseReport(data);
          set((state) => {
            const updateReportInArray = (reports: Report[]) =>
              reports.map((report) =>
                report.report_id === reportId ? updatedReport : report
              );

            return {
              reports: updateReportInArray(state.reports),
              latestReports: updateReportInArray(state.latestReports),
            };
          });

          return updatedReport;
        } catch (err: any) {
          set({ error: err.message || "Failed to fetch report details" });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      updateReportStatus: async (reportId: string, status: ReportStatus) => {
        try {
          set({ isLoading: true, error: null });
          const params = new URLSearchParams({
            report_id: reportId,
            status: status,
          });

          const { data, error } = await supabase.functions.invoke(
            `update-report-status?${params}`,
            { method: "PATCH" }
          );
          if (error) throw error;

          // Update the report in both reports and latestReports arrays
          set((state) => {
            const updateReportInArray = (reports: Report[]) =>
              reports.map((report) =>
                report.report_id === reportId
                  ? { ...report, report_status: status }
                  : report
              );

            return {
              reports: updateReportInArray(state.reports),
              latestReports: updateReportInArray(state.latestReports),
            };
          });

          // Return the updated report
          const updatedReport = get().reports.find(
            (r) => r.report_id === reportId
          );
          return updatedReport || null;
        } catch (err: any) {
          set({ error: err.message || "Failed to update report status" });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      getReportById: (id: string) =>
        get().reports.find((r: Report) => r.report_id === id),

      resetReports: () => {
        console.log("Resetting reports state");
        set({
          reports: [],
          total: 0,
          offset: 0,
          limit: DEFAULT_LIMIT,
          hasMore: true,
          error: null,
          isLoading: false,
        });
      },

      resetLatestReports: () => {
        set({
          latestReports: [],
        });
      },
    }),
    {
      name: "report-store-paginated",
      version: STORE_VERSION,
      storage: {
        getItem: async (name) => {
          try {
            const value = await AsyncStorage.getItem(name);
            return parseStoredReports(value);
          } catch (error) {
            console.error("Error reading from storage:", error);
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            // Add version to stored data
            const dataToStore = {
              ...value,
              version: STORE_VERSION,
            };
            await AsyncStorage.setItem(name, JSON.stringify(dataToStore));
          } catch (error) {
            console.error("Error writing to storage:", error);
          }
        },
        removeItem: async (name) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error("Error removing from storage:", error);
          }
        },
      },
      // Only persist essential data
      partialize: (state) => {
        // Only persist reports if no search is active
        if (!state.lastSearch || state.lastSearch === "") {
          return {
            ...state,
            reports: state.reports.slice(0, DEFAULT_LIMIT), // Only store first page
            offset: DEFAULT_LIMIT, // Reset offset to match stored reports
            hasMore: state.total > DEFAULT_LIMIT, // Set hasMore based on total reports
            isLoading: false,
            error: null,
          };
        } else {
          // If search is active, do not persist reports
          return {
            ...state,
            reports: [],
            offset: 0,
            hasMore: false,
            isLoading: false,
            error: null,
          };
        }
      },
    }
  )
);
