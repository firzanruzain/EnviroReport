import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "services";
import {
  FormTemplate,
  FormStore,
  CreateFormParams,
  UpdateFormTemplateParams,
  FormField,
  FormTemplateMetadata,
  FieldType,
} from "models/form";
import { formFieldUtils } from "../../utils/formFieldUtils";

export interface FetchFormsResponse {
  forms: FormTemplate[];
  hasMore: boolean;
}

// Interface for form list data (simplified version without form_fields)
interface FormTemplateListItem {
  form_template_id: string;
  form_name: string;
  description: string;
  status: "Active" | "Inactive";
}

// Local function to fetch forms directly from database
const fetchFormsFromDB = async ({
  pollution_type_id,
  limit = 10,
  offset = 0,
  published = false,
}: {
  pollution_type_id: string;
  limit?: number;
  offset?: number;
  published?: boolean;
}) => {
  // Check if pollution exists
  const { data: exists, error: existsError } = await supabase.rpc(
    "pollution_exists",
    {
      id: pollution_type_id,
    }
  );

  if (existsError) {
    throw new Error("Error checking pollution: " + existsError.message);
  }

  if (!exists) {
    throw new Error("Pollution not found");
  }

  // Apply filters
  let query = supabase
    .from("form_template")
    .select("form_template_id, form_name, description, status", {
      count: "exact",
    })
    .eq("pollution_type_id", pollution_type_id)
    .range(offset, offset + limit - 1);

  if (published) {
    query = query.eq("status", "Active");
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error("Error fetching form templates: " + error.message);
  }

  return {
    data: data || [],
    count: count || 0,
    limit,
    offset,
  };
};

// Local function to fetch form template directly from database
const fetchFormTemplateFromDB = async (form_template_id: string) => {
  if (!form_template_id) {
    throw new Error("Missing form_template_id");
  }

  const { data, error } = await supabase
    .from("form_template")
    .select(
      `
      *,
      form_fields:form_field (
        form_field_id,
        field_label,
        field_type_id,
        is_required,
        field_order,
        config:form_field_configuration (
          configuration_id,
          configuration_data,
          field_type_id
        )
      )
    `
    )
    .eq("form_template_id", form_template_id)
    .single();

  if (error) {
    throw new Error("Error fetching form template: " + error.message);
  }

  if (!data) {
    throw new Error("Form template not found");
  }

  return data;
};

// Local function to fetch active form directly from database
const fetchActiveFormFromDB = async (pollution_type_id: string) => {
  if (!pollution_type_id) {
    throw new Error("Missing pollution_type_id");
  }

  const { data, error } = await supabase
    .from("form_template")
    .select("form_template_id, form_name, description")
    .eq("pollution_type_id", pollution_type_id)
    .eq("status", "Active")
    .single();

  if (error) {
    throw new Error("Error fetching active form: " + error.message);
  }

  if (!data) {
    throw new Error("No active form found for this pollution type");
  }

  return data;
};

// Local function to fetch field types directly from database
const fetchFieldTypesFromDB = async () => {
  const { data, error } = await supabase.from("form_field_type").select("*");

  if (error) {
    throw new Error("Error fetching field types: " + error.message);
  }

  if (!data) {
    throw new Error("No field types found");
  }

  return data;
};

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      forms: [],
      fieldTypes: [] as FieldType[],

      fetchFieldTypes: async () => {
        try {
          console.log("Fetching field types");
          const data = await fetchFieldTypesFromDB();
          set({ fieldTypes: data });
          return data as FieldType[];
        } catch (error) {
          console.error("Error fetching field types:", error);
          throw error;
        }
      },

      getFieldTypeDefinition: (typeId: string) => {
        const { fieldTypes } = get();
        return formFieldUtils.getFieldTypeDefinition(fieldTypes, typeId);
      },

      getDefaultFieldConfig: (typeId: string) => {
        const { fieldTypes } = get();
        return formFieldUtils.getDefaultConfig(fieldTypes, typeId);
      },

      validateFieldConfig: (typeId: string, config: Record<string, any>) => {
        const { fieldTypes } = get();
        return formFieldUtils.validateFieldConfig(fieldTypes, typeId, config);
      },

      createFormField: (
        label: string,
        typeId: string,
        isRequired: boolean,
        order: number,
        config?: Record<string, any>
      ) => {
        const { fieldTypes } = get();
        return formFieldUtils.createFormField(
          fieldTypes,
          label,
          typeId,
          isRequired,
          order,
          config
        );
      },

      validateField: (
        value: any,
        typeId: string,
        config: Record<string, any>
      ) => {
        const { fieldTypes } = get();
        return formFieldUtils.validateField(fieldTypes, value, typeId, config);
      },

      formatFieldValue: (value: any, typeId: string) => {
        const { fieldTypes } = get();

        return formFieldUtils.formatFieldValue(fieldTypes, value, typeId);
      },

      fetchActiveForm: async (pollution_type_id: string) => {
        try {
          console.log(
            "Fetching active form for pollution type:",
            pollution_type_id
          );
          const data = await fetchActiveFormFromDB(pollution_type_id);
          return data as FormTemplateMetadata;
        } catch (error) {
          console.error("Error fetching active form:", error);
          throw error;
        }
      },

      fetchForms: async (
        pollution_type_id: string,
        limit: number,
        offset: number
      ) => {
        try {
          console.log("Fetching forms");
          const result = await fetchFormsFromDB({
            pollution_type_id,
            limit,
            offset,
            published: false, // Get all forms, not just published ones
          });

          // Convert the list data to FormTemplate format by adding missing fields
          const forms: FormTemplate[] = result.data.map(
            (item: FormTemplateListItem) => ({
              ...item,
              pollution_type_id,
              form_fields: [], // Empty array for list view
              pollution_type: undefined, // Will be populated if needed
            })
          );

          return {
            forms,
            hasMore: offset + limit < (result.count || 0),
          };
        } catch (error) {
          console.error("Error fetching forms:", error);
          throw error;
        }
      },

      fetchFormTemplate: async (form_template_id: string) => {
        try {
          console.log("Fetching form template:", form_template_id);
          const data = await fetchFormTemplateFromDB(form_template_id);

          // Parse the form fields to ensure config is a single object
          const parsedData = {
            ...data,
            form_fields: data.form_fields.map((field: any) => ({
              ...field,
              config: Array.isArray(field.config)
                ? field.config[0]
                : field.config,
            })),
          };

          return parsedData as FormTemplate;
        } catch (error) {
          console.error("Error fetching form template:", error);
          return null;
        }
      },

      updateFormTemplateFields: async (
        form_template_id: string,
        form_fields: FormField[]
      ) => {
        try {
          // Update form fields using the edge function
          const { error: fieldsError } = await supabase.functions.invoke(
            "update-form-template-fields",
            {
              body: {
                form_template_id,
                form_fields: form_fields.map((field) => ({
                  form_field_id: field.form_field_id,
                  field_label: field.field_label,
                  field_type_id: field.field_type_id,
                  is_required: field.is_required,
                  field_order: field.field_order,
                  config_data: field.config?.configuration_data,
                })),
              },
            }
          );

          if (fieldsError) throw fieldsError;

          // Refresh the form data
          const updatedForm = await get().fetchFormTemplate(form_template_id);
          if (updatedForm) {
            set((state) => ({
              forms: state.forms.map((form) =>
                form.form_template_id === form_template_id ? updatedForm : form
              ),
            }));
          }
        } catch (error) {
          console.error("Error updating form fields:", error);
          throw error;
        }
      },

      deleteFormTemplate: async (form_template_id: string) => {
        try {
          console.log("Deleting form template:", form_template_id);
          const { error } = await supabase.functions.invoke(
            "delete-form-template",
            {
              method: "DELETE",
              body: { form_template_id },
            }
          );
          if (error) throw error;
          // Remove from local state
          set((state) => ({
            forms: state.forms.filter(
              (f) => f.form_template_id !== form_template_id
            ),
          }));
          return true;
        } catch (error) {
          console.error("Error deleting form template:", error);
          throw error;
        }
      },

      updateFormTemplate: async (
        form_template_id: string,
        form_name: string,
        description: string
      ) => {
        try {
          const { error } = await supabase.functions.invoke(
            "update-form-template",
            {
              body: {
                form_template_id,
                form_name,
                description,
              },
            }
          );
          if (error) throw error;

          // Refresh the form data
          const updatedForm = await get().fetchFormTemplate(form_template_id);
          if (updatedForm) {
            set((state) => ({
              forms: state.forms.map((form) =>
                form.form_template_id === form_template_id ? updatedForm : form
              ),
            }));
          }
        } catch (error) {
          console.error("Error updating form template:", error);
          throw error;
        }
      },

      createNewForm: async (
        pollution_type_id: string,
        form_name: string,
        description: string
      ) => {
        try {
          const { data, error } = await supabase.functions.invoke(
            "create-new-form",
            {
              body: {
                pollution_type_id,
                form_name,
                description,
              },
            }
          );
          if (error as Error) throw error;

          // add NewForm to state Forms
          const newForm = await get().fetchFormTemplate(data.form_template_id);
          if (newForm) {
            set((state) => ({
              forms: [...state.forms, newForm],
            }));
          }
          return newForm;
        } catch (error) {
          console.error("Error creating form template:", error);
          throw error;
        }
      },

      setFormTemplateActive: async (
        pollution_type_id: string,
        form_template_id: string
      ) => {
        try {
          const { data, error } = await supabase.functions.invoke(
            "update-form-template-active",
            {
              method: "PATCH",
              body: {
                pollution_type_id,
                form_template_id,
              },
            }
          );
          if (error) throw error;
          return data as {
            message: string;
            form_template_id: string;
            pollution_type_id: string;
          };
        } catch (error) {
          console.error("Error setting form template as active:", error);
          throw error;
        }
      },
    }),
    {
      name: "form-store-field-types",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        fieldTypes: state.fieldTypes,
      }),
    }
  )
);
