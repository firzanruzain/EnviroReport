import { FormTemplate } from "./form";
import { User } from "./user";

export type ReportStatus = "Pending" | "In Review" | "Closed";

export interface RawReport {
  report_id: string;
  auth_user_id: string;
  form_template_id: string;
  submission_date: string; // ISO string from Supabase
  report_status: ReportStatus;
  form_data: Record<string, any>;
  form_template?: FormTemplate;
  feedback?: Feedback[];
  user?: User;
}

// Transformed interface (used in the app) with submission date as a Date object
export interface Report extends Omit<RawReport, "submission_date"> {
  submission_date: Date; // Now a Date object
}

// Utility function to convert RawReport → Report
export const parseReport = (raw: RawReport): Report => ({
  ...raw,
  submission_date: new Date(raw.submission_date),
});

export interface Feedback {
  feedback_id: string;
  report_id: string;
  auth_user_id: string;
  feedback_text: string;
  created_at: string;
  user?: User;
}
