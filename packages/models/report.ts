import { FormTemplate } from "./form";
import { User } from "./user";
import { FormData } from "./form";

export type ReportStatus = "Pending" | "In Review" | "Closed";

export type EventType = "submitted" | "status_updated" | "feedback_added";

export interface ReportLog {
  log_id: string;
  created_at: Date;
  created_by: string;
  event_type: EventType;
  event_description: string;
}

export interface ReportStore {
  reports: Report[];
  latestReports: Report[];
  total: number;
  limit: number;
  offset: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  fetchReports: (options?: {
    append?: boolean;
    search?: string;
  }) => Promise<void>;
  fetchLatestReports: () => Promise<void | number>;
  resetReports: () => void;
  resetLatestReports: () => void;
  getReportById: (id: string) => Report | undefined;
  pollutionCounts: Record<string, { pending: number; total: number }>;
  fetchPollutionCounts: () => Promise<void>;
  setLimit: (newLimit: number) => void;
  lastSearch?: string;
  updateReportStatus: (
    reportId: string,
    status: ReportStatus
  ) => Promise<Report | null>;
}

export interface RawReport {
  report_id: string;
  auth_user_id: string;
  form_template_id: string;
  submission_date: string; // ISO string from Supabase
  report_status: ReportStatus;
  form_data: FormData;
  form_template?: FormTemplate;
  feedback?: Feedback[];
  user?: User;
  report_logs?: ReportLog[];
}

// Transformed interface (used in the app) with submission date as a Date object
export interface Report extends Omit<RawReport, "submission_date"> {
  submission_date: Date; // Now a Date object
}

// Utility function to convert RawReport → Report
export const parseReport = (raw: RawReport): Report => ({
  ...raw,
  submission_date: new Date(raw.submission_date),
  report_logs: raw.report_logs
    ? raw.report_logs.map((log) => ({
        ...log,
        created_at: new Date(log.created_at),
      }))
    : [],
});

export interface Feedback {
  feedback_id: string;
  report_id: string;
  auth_user_id: string;
  feedback_text: string;
  created_at: string;
  user?: User;
}
