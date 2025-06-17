import { PollutionType } from "./division";

export interface FormField {
  form_field_id?: string;
  field_label: string;
  field_type_id: string;
  is_required: boolean;
  field_order: number;
  config?: FieldConfig;
}

export interface FormTemplate {
  form_template_id: string;
  form_name: string;
  description?: string;
  pollution_type_id: string;
  status: "Active" | "Inactive";
  pollution_type?: PollutionType;
  form_fields: FormField[];
}

export interface FormTemplateMetadata {
  form_template_id: string;
  form_name: string;
  description: string;
}

export interface FieldType {
  field_type_id: string;
  label: string;
  icon: string;
  configuration_schema: Record<string, any>;
  format_schema?: {
    template: string;
    transform: "number" | "date" | "object" | "string";
    format?: string;
    fallback?: string;
  };
}

export interface FieldConfig {
  configuration_id?: string;
  field_type_id: string;
  configuration_data: Record<string, any>;
}

// handling formfield value in submitted report
export interface FormFieldValue {
  value: string | number;
  field_type_id: string;
}

// FormData interface for submitted report
export interface FormData {
  [key: string]: FormFieldValue;
}

// payload Params for create form
export interface CreateFormParams {
  pollution_type_id: string;
  form_name: string;
  description: string;
}

// payload Params for update form
export interface UpdateFormTemplateParams {
  form_template_id: string;
  form_name: string;
  description: string;
  pollution_type_id: string;
  status: "Active" | "Inactive";
  form_fields: FormField[];
}

export interface FormStore {
  forms: FormTemplate[];
  isLoading: boolean;
  fieldTypes: FieldType[];
  fetchActiveForm: (pollution_type_id: string) => Promise<FormTemplateMetadata>;
  fetchForms: (
    pollution_type_id: string,
    limit: number,
    offset: number,
    published?: boolean
  ) => Promise<{
    forms: FormTemplate[];
    hasMore: boolean;
  }>;
  fetchFormTemplate: (form_template_id: string) => Promise<FormTemplate | null>;
  updateFormTemplateFields: (
    form_template_id: string,
    form_fields: FormField[]
  ) => Promise<void>;
  fetchFieldTypes: () => Promise<FieldType[]>;
  getFieldTypeDefinition: (typeId: string) => FieldType | undefined;
  getDefaultFieldConfig: (typeId: string) => Record<string, any>;
  validateFieldConfig: (typeId: string, config: Record<string, any>) => boolean;
  createFormField: (
    label: string,
    typeId: string,
    isRequired: boolean,
    order: number,
    config?: Record<string, any>
  ) => FormField;
  validateField: (
    value: any,
    typeId: string,
    config: Record<string, any>
  ) => boolean;
  formatFieldValue: (
    value: any,
    typeId: string,
    config: Record<string, any>
  ) => string;
}
