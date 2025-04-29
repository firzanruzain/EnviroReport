import supabase from "../utils/supabase";
import { PollutionType } from "./division";

export interface FormTemplate {
  form_template_id: string;
  form_name: string;
  description?: string;
  pollution_type_id: string;
  status: "Active" | "Inactive";
  pollution_type?: PollutionType;
  fields?: FormField[];
}

export interface FormField {
  form_field_id: string;
  form_template_id: string;
  field_type_id: string;
  field_label: string;
  is_required: boolean;
  field_order: number;
  field_type?: FieldType;
  configuration?: FieldConfig;
}

interface FieldType {
  field_type_id: string;
  field_type: string;
  configuration_schema: Record<string, any>;
}

interface FieldConfig {
  configuration_id: string;
  form_field_id: string;
  field_type_id: string;
  configuration_data: Record<string, any>;
}

export const FormModel = {
  getTemplate: async (id: string): Promise<FormTemplate | null> => {
    const { data, error } = await supabase
      .from("form_template")
      .select(
        "*, pollution_type:pollution_type_id(*), fields:form_field(*, field_type:field_type_id(*), configuration:form_field_configuration(*))"
      )
      .eq("form_template_id", id)
      .single();
    if (error) console.error("Form template fetch error:", error);
    return data;
  },

  listActive: async (): Promise<FormTemplate[]> => {
    const { data, error } = await supabase
      .from("form_template")
      .select("*, pollution_type:pollution_type_id(*)")
      .eq("status", "Active");
    if (error) console.error("Active forms fetch error:", error);
    return data || [];
  },

  listByPollutionType: async (
    pollutionTypeId: string
  ): Promise<FormTemplate[]> => {
    const { data, error } = await supabase
      .from("form_template")
      .select("*, pollution_type:pollution_type_id(*)")
      .eq("pollution_type_id", pollutionTypeId)
      .eq("status", "Active");
    if (error) console.error("Forms by pollution type error:", error);
    return data || [];
  },

  updateFieldConfig: async (
    config: FieldConfig
  ): Promise<FieldConfig | null> => {
    const { data, error } = await supabase
      .from("form_field_configuration")
      .upsert(config)
      .select()
      .single();
    if (error) console.error("Field config update error:", error);
    return data;
  },
};
