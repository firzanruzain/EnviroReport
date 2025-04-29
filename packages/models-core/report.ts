import supabase from "../utils/supabase";
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

export const ReportModel = {
  create: async (report: Omit<Report, "report_id">): Promise<Report | null> => {
    const { data, error } = await supabase
      .from("report")
      .insert(report)
      .select("*, form_template:form_template_id(*)")
      .single();
    if (error) console.error("Report creation error:", error);
    return data;
  },

  getAll: async (): Promise<Report[]> => {
    const { data, error } = await supabase
      .from("report")
      .select("*, form_template:form_template_id(*)")
      .order("submission_date", { ascending: false });
    if (error) console.error("Report list error:", error);
    return data?.map(parseReport) || [];
  },

  getById: async (id: string): Promise<Report | null> => {
    const { data, error } = await supabase
      .from("report")
      .select(
        "*, form_template:form_template_id(*, pollution_type:pollution_type_id(*)), feedback:feedback(*, user:auth_user_id(*))"
      )
      .eq("report_id", id)
      .single();
    if (error) console.error("Report fetch error:", error);
    return data;
  },

  updateStatus: async (
    id: string,
    status: ReportStatus
  ): Promise<Report | null> => {
    const { data, error } = await supabase
      .from("report")
      .update({ report_status: status })
      .eq("report_id", id)
      .select("*, form_template:form_template_id(*)")
      .single();
    if (error) console.error("Report status update error:", error);
    return data;
  },

  addFeedback: async (
    feedback: Omit<Feedback, "feedback_id">
  ): Promise<Feedback | null> => {
    const { data, error } = await supabase
      .from("feedback")
      .insert(feedback)
      .select("*, user:auth_user_id(*)")
      .single();
    if (error) console.error("Feedback creation error:", error);
    return data;
  },

  countByPollutionTypeAndStatus: async (
    pollutionTypeId: string,
    statuses: ReportStatus[] = ["Pending", "In Review"]
  ): Promise<number> => {
    const { count, error } = await supabase
      .from("report")
      .select("*", { count: "exact", head: true })
      .eq("form_template.pollution_type_id", pollutionTypeId)
      .in("report_status", statuses);

    if (error) {
      console.error("Report count error:", error);
      return 0;
    }
    return count || 0;
  },

  listFeedback: async (reportId: string): Promise<Feedback[]> => {
    const { data, error } = await supabase
      .from("feedback")
      .select("*, user:auth_user_id(*)")
      .eq("report_id", reportId)
      .order("created_at", { ascending: false });
    if (error) console.error("Feedback list error:", error);
    return data || [];
  },
};
