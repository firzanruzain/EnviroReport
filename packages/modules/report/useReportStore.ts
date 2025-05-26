import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "services";
import { parseReport, Report, ReportStore } from "models/report";

const DEFAULT_LIMIT = 5;

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: [],
      total: 0,
      limit: DEFAULT_LIMIT,
      offset: 0,
      isLoading: false,
      hasMore: true,
      error: null,
      pollutionCounts: {}, // Initialize empty counts

      // New method for fetching pollution stats
      fetchPollutionCounts: async () => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase.functions.invoke(
            "fetch-reports-count",
            { method: "GET" }
          );
            console.log("Fetching pollution counts:", data);
          if (error) throw error;

          set({
            pollutionCounts: data.counts,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: (err instanceof Error ? err.message : "Failed to load pollution counts"),
            isLoading: false,
          });
        }
      },

      fetchReports: async ({ append = true, forDashboard = false } = {}) => {
        const { offset, limit, reports, isLoading } = get();
        if (isLoading) return; // Prevent multiple simultaneous fetches
        if (!get().hasMore) return; // No more reports to fetch
        try {
          set({ isLoading: true, error: null });
          const params = new URLSearchParams({
            offset: forDashboard ? "0" : offset.toString(),
            limit: forDashboard ? "5" : limit.toString(),
            dashboard: forDashboard.toString(),
          });

          const { data, error } = await supabase.functions.invoke(
            `fetch-reports?${params}`,
            { method: "GET" }
          );
          console.log(
            `Querying reports (offset: ${offset}, limit: ${limit}) for dashboard: ${forDashboard}`
          );
          if (error) throw error;

          const newReports = data.data.map(parseReport);
          const total = data.total;

          set({
            reports: append ? [...reports, ...newReports] : newReports,
            offset: offset + newReports.length,
            total: total,
            hasMore: offset + newReports.length < total,
          });
        } catch (err: any) {
          set({ error: err.message || "Failed to fetch reports" });
        } finally {
          set({ isLoading: false });
        }
      },

      getReportById: (id: string) =>
        get().reports.find((r: Report) => r.report_id === id),

      resetReports: () => {
        set({
          reports: [],
          total: 0,
          offset: 0,
          limit: DEFAULT_LIMIT,
          hasMore: true,
          error: null,
        });
      },
    }),

    {
      name: "report-store-paginated",
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
