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