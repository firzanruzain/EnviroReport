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

// Local function to search reports directly from database
const searchReport = async ({
  offset = 0,
  limit = DEFAULT_LIMIT,
  search = "",
  dashboard = false,
}: {
  offset?: number;
  limit?: number;
  search?: string;
  dashboard?: boolean;
}) => {
  // Step 1: If filtering by form_name, get matching form_template_ids
  let templateIds = undefined;
  if (search && search.trim()) {
    const { data: matchingTemplates, error: formError } = await supabase
      .from("form_template")
      .select("form_template_id")
      .ilike("form_name", `%${search.trim()}%`);

    if (formError) {
      throw new Error("Error fetching templates: " + formError.message);
    }

    templateIds = matchingTemplates?.map((ft) => ft.form_template_id);
    if (!templateIds || templateIds.length === 0) {
      return {
        data: [],
        total: 0,
      };
    }
  }

  // Step 2: Query reports with optional template filtering
  let query = supabase.from("report").select(
    `
      *,
      form_template!inner(
        form_name,
        pollution_type!inner(
          pollution_type_name
        )
      )
    `,
    { count: "exact" }
  );

  // Apply template ID filter if we have matching templates
  if (templateIds) {
    query = query.in("form_template_id", templateIds);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  // Order by submission date (newest first)
  query = query.order("submission_date", { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
  };
};

// Local function to update report status directly in database
const updateReportStatus = async (reportId: string, status: ReportStatus) => {
  const { data, error } = await supabase
    .from("report")
    .update({ report_status: status })
    .eq("report_id", reportId)
    .select(
      `
      *,
      form_template!inner(
        form_name,
        pollution_type!inner(
          pollution_type_name
        )
      )
    `
    )
    .single();

  if (error) throw error;
  return data;
};

// Helper function to parse stoports
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
          // Query the database directly to get pollution counts
          const { data, error } = await supabase.from("report").select(`
              report_status,
              form_template!inner(
                pollution_type!inner(
                  pollution_type_name
                )
              )
            `);

          if (error) throw error;

          // Process the data to count by pollution type and status
          const counts = data.reduce((acc: any, report: any) => {
            const pollutionTypeName =
              report.form_template.pollution_type.pollution_type_name;
            const status = report.report_status;

            if (!acc[pollutionTypeName]) {
              acc[pollutionTypeName] = {
                pending: 0,
                total: 0,
              };
            }

            acc[pollutionTypeName].total += 1;

            if (status === "Pending") {
              acc[pollutionTypeName].pending += 1;
            }

            return acc;
          }, {});

          console.log({ counts });
          set({
            pollutionCounts: counts,
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

          console.log("Fetching Latest Reports", {
            isLoading,
            limit: DASHBOARD_LIMIT,
          });

          const { data, total } = await searchReport({
            offset: 0,
            limit: DASHBOARD_LIMIT,
            dashboard: true,
          });

          const newReports = data.map((raw: RawReport) => parseReport(raw));
          set({ latestReports: newReports });
          return total;
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

          const { data, total } = await searchReport({
            offset,
            limit,
            search,
            dashboard: false,
          });

          const newReports = data.map((raw: RawReport) => parseReport(raw));
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

      // Deprecated
      // fetchReportDetails: async (reportId: string) => {
      //   try {
      //     set({ isLoading: true, error: null });
      //     const params = new URLSearchParams({
      //       report_id: reportId,
      //     });

      //     const { data, error } = await supabase.functions.invoke(
      //       `fetch-report-details?${params}`,
      //       { method: "GET" }
      //     );
      //     if (error) throw error;

      //     // Update the report in both reports and latestReports arrays
      //     const updatedReport = parseReport(data);
      //     set((state) => {
      //       const updateReportInArray = (reports: Report[]) =>
      //         reports.map((report) =>
      //           report.report_id === reportId ? updatedReport : report
      //         );

      //       return {
      //         reports: updateReportInArray(state.reports),
      //         latestReports: updateReportInArray(state.latestReports),
      //       };
      //     });

      //     return updatedReport;
      //   } catch (err: any) {
      //     set({ error: err.message || "Failed to fetch report details" });
      //     throw err;
      //   } finally {
      //     set({ isLoading: false });
      //   }
      // },

      submitReport: async (reportPayload: any) => {
        try {
          set({ isLoading: true, error: null });

          console.log("Submitting: ", reportPayload);

          const { data, error } = await supabase.functions.invoke(
            "create-report",
            {
              method: "POST",
              body: JSON.stringify(reportPayload),
            }
          );

          if (error) throw error;

          // Refresh the latest reports and main reports list
          await Promise.all([
            get().fetchLatestReports(),
            get().fetchReports({ append: false }),
          ]);

          // Optionally reset any state if needed (not clearing form here)
          return data;
        } catch (err: any) {
          set({ error: err.message || "Failed to submit report" });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      updateReportStatus: async (reportId: string, status: ReportStatus) => {
        try {
          set({ isLoading: true, error: null });

          const updatedReportData = await updateReportStatus(reportId, status);
          const updatedReport = parseReport(updatedReportData);

          // Update the report in both reports and latestReports arrays
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

      /**
       * Fetch reports within a radius from a center coordinate using the edge function
       */
      fetchReportsWithinRadius: async ({
        center_lat,
        center_lng,
        radius_meters,
        limit = DEFAULT_LIMIT,
        offset = 0,
        append = false,
      }: {
        center_lat: number;
        center_lng: number;
        radius_meters: number;
        limit?: number;
        offset?: number;
        append?: boolean;
      }) => {
        set({ isLoading: true, error: null });
        try {
          console.log(
            "Fetching reports",
            JSON.stringify(
              {
                center_lat,
                center_lng,
                radius_meters,
              },
              null,
              2
            )
          );
          const params = new URLSearchParams({
            center_lat: center_lat.toString(),
            center_lng: center_lng.toString(),
            radius_meters: radius_meters.toString(),
            limit: limit.toString(),
            offset: offset.toString(),
          });
          const { data, error } = await supabase.functions.invoke(
            `find-reports-within-radius?${params}`,
            { method: "GET" }
          );
          if (error) throw error;
          const newReports = (data.data || []).map((raw: RawReport) =>
            parseReport(raw)
          );
          const total = data.total || 0;
          const newOffset = append
            ? offset + newReports.length
            : newReports.length;
          const hasMoreReports = total > newOffset;
          return {
            reports: newReports,
            total,
            offset: newOffset,
            hasMore: hasMoreReports,
          };
        } catch (err: any) {
          set({
            error: err.message || "Failed to fetch reports within radius",
          });
          return {
            reports: [],
            total: 0,
            offset: 0,
            hasMore: false,
          };
        } finally {
          set({ isLoading: false });
        }
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
