import { FormFieldValue, FormField, FieldType } from "../models/form";

// Helper function to get field value
export const getFieldValue = (field: FormFieldValue): string | number => {
  return field.value;
};

// Helper function to get field type
export const getFieldType = (field: FormFieldValue): string => {
  return field.field_type_id;
};

// Helper function to check if field is of specific type
export const isFieldType = (field: FormFieldValue, type: string): boolean => {
  return field.field_type_id === type;
};

// Helper function to render field value based on type
export const renderFieldValue = (field: FormFieldValue): string => {
  const value = field.value;

  switch (field.field_type_id) {
    case "FT_TEXT":
    case "FT_TEXTAREA":
      return String(value);
    case "FT_NUMBER":
      return String(value);
    case "FT_DECIBEL":
      return `${value} dB`;
    case "FT_VIBRATION":
      return `${value} Hz`;
    case "FT_SELECT":
      return String(value);
    default:
      return String(value);
  }
};

// Helper functions for working with form fields
export const formFieldUtils = {
  // Get field type definition
  getFieldTypeDefinition: (
    fieldTypes: FieldType[],
    typeId: string
  ): FieldType | undefined => {
    return fieldTypes.find((ft) => ft.field_type_id === typeId);
  },

  // Get default configuration for field type
  getDefaultConfig: (
    fieldTypes: FieldType[],
    typeId: string
  ): Record<string, any> => {
    const fieldType = formFieldUtils.getFieldTypeDefinition(fieldTypes, typeId);
    if (!fieldType) return {};

    // Extract default values from configuration_schema
    const defaultConfig: Record<string, any> = {};
    if (fieldType.configuration_schema) {
      Object.entries(fieldType.configuration_schema).forEach(
        ([key, schema]) => {
          if (schema && typeof schema === "object" && "default" in schema) {
            defaultConfig[key] = schema.default;
          }
        }
      );
    }

    return defaultConfig;
  },

  // Validate field configuration against schema
  validateFieldConfig: (
    fieldTypes: FieldType[],
    typeId: string,
    config: Record<string, any>
  ): boolean => {
    const fieldType = formFieldUtils.getFieldTypeDefinition(fieldTypes, typeId);
    if (!fieldType) return false;

    const schema = fieldType.configuration_schema;

    for (const [key, value] of Object.entries(config)) {
      const fieldSchema = schema[key];
      if (!fieldSchema) return false;

      // Check if value matches schema type
      if (fieldSchema.type && typeof value !== fieldSchema.type) {
        return false;
      }

      // Check if required field is present
      if (fieldSchema.required && value === undefined) {
        return false;
      }

      // Check array items if schema specifies them
      if (fieldSchema.items && Array.isArray(value)) {
        for (const item of value) {
          if (
            fieldSchema.items.type &&
            typeof item !== fieldSchema.items.type
          ) {
            return false;
          }
        }
      }
    }

    return true;
  },

  // Create a new FormField with proper typing
  createFormField: (
    fieldTypes: FieldType[],
    label: string,
    typeId: string,
    isRequired: boolean,
    order: number,
    config?: Record<string, any>
  ): FormField => {
    return {
      field_label: label,
      field_type_id: typeId,
      is_required: isRequired,
      field_order: order,
      config: {
        field_type_id: typeId,
        configuration_data:
          config || formFieldUtils.getDefaultConfig(fieldTypes, typeId),
      },
    };
  },

  // Validate field value
  validateField: (
    fieldTypes: FieldType[],
    value: any,
    typeId: string,
    config: Record<string, any>
  ): boolean => {
    const fieldType = formFieldUtils.getFieldTypeDefinition(fieldTypes, typeId);
    if (!fieldType) return false;

    // Basic validation rules
    const rules = [
      // Required field check
      (val: any) => !config.required || (val !== undefined && val !== ""),
      // Type check
      (val: any) => {
        const schema = fieldType.configuration_schema;
        for (const [key, fieldSchema] of Object.entries(schema)) {
          if (fieldSchema.type && typeof val !== fieldSchema.type) {
            return false;
          }
        }
        return true;
      },
    ];

    return rules.every((rule) => rule(value));
  },

  // Format field value
  formatFieldValue: (
    fieldTypes: FieldType[],
    value: any,
    typeId: string,
    config: Record<string, any>
  ): string => {
    const fieldType = formFieldUtils.getFieldTypeDefinition(fieldTypes, typeId);
    if (!fieldType) return String(value);

    const formatSchema = fieldType.format_schema;
    if (!formatSchema) return String(value);

    // Transform the value based on the schema
    let transformedValue = value;
    switch (formatSchema.transform) {
      case "number":
        transformedValue = Number(value);
        break;
      case "date":
        transformedValue = new Date(value);
        if (formatSchema.format) {
          transformedValue = transformedValue[formatSchema.format]();
        }
        break;
      case "object":
        // For objects, we'll use the template directly
        break;
      default:
        transformedValue = String(value);
    }

    // If it's an object, use the template with object properties
    if (formatSchema.transform === "object") {
      try {
        return formatSchema.template.replace(
          /\{(\w+)\}/g,
          (_match: string, key: string) => {
            return value[key] || formatSchema.fallback || "";
          }
        );
      } catch (e) {
        return formatSchema.fallback || String(value);
      }
    }

    // For simple values, use the template
    return formatSchema.template.replace("{value}", transformedValue);
  },
};
