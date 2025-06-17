import { FormField, FieldType, FieldConfig } from "./form";
import fieldTypesConfig from "./formFieldTypes.json";

// Define the available field types
export enum FormFieldType {
  TEXT = "FT_TEXT",
  TEXTAREA = "FT_TEXTAREA",
  NUMBER = "FT_NUMBER",
  DECIBEL = "FT_DECIBEL",
  VIBRATION = "FT_VIBRATION",
  SELECT = "FT_SELECT",
  DATE = "FT_DATE",
  TIME = "FT_TIME",
  LOCATION = "FT_LOCATION",
  DOCUMENT = "FT_DOCUMENT",
  STATE = "FT_STATE",
  AREA = "FT_AREA",
}

// Base interface for field configuration
export interface BaseFieldConfig {
  placeholder?: string;
  helpText?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => boolean;
  };
  [key: string]: any; // Allow additional configuration properties
}

// Type for field type definition from JSON
export interface FieldTypeDefinition {
  label: string;
  icon: string;
  defaultConfig: BaseFieldConfig;
  configSchema: Record<
    string,
    {
      type: string | string[];
      optional?: boolean;
      items?: {
        type: string | string[];
        properties?: Record<
          string,
          {
            type: string | string[];
          }
        >;
      };
    }
  >;
}

// Type for the entire field types configuration
export interface FieldTypesConfig {
  fieldTypes: Record<FormFieldType, FieldTypeDefinition>;
}

// Field type metadata
export interface FieldTypeMetadata {
  label: string;
  icon: string;
  defaultConfig: BaseFieldConfig;
  validationRules: (config: BaseFieldConfig) => Array<(value: any) => boolean>;
  formatValue: (value: any, config: BaseFieldConfig) => string;
}

// Helper functions for working with form fields
export const formFieldUtils = {
  // Get field metadata
  getFieldMetadata: (type: FormFieldType): FieldTypeMetadata => {
    const fieldDef = (fieldTypesConfig as FieldTypesConfig).fieldTypes[type];
    return {
      label: fieldDef.label,
      icon: fieldDef.icon,
      defaultConfig: fieldDef.defaultConfig,
      validationRules: (config) => [
        (value) => !config.validation?.required || value !== "",
        (value) =>
          !config.validation?.pattern ||
          new RegExp(config.validation.pattern).test(value),
        (value) =>
          !config.validation?.min || Number(value) >= config.validation.min,
        (value) =>
          !config.validation?.max || Number(value) <= config.validation.max,
      ],
      formatValue: (value) => {
        switch (type) {
          case FormFieldType.DECIBEL:
            return `${value} dB`;
          case FormFieldType.VIBRATION:
            return `${value} Hz`;
          case FormFieldType.DATE:
            return new Date(value).toLocaleDateString();
          case FormFieldType.TIME:
            return new Date(value).toLocaleTimeString();
          case FormFieldType.LOCATION:
            return `${value.latitude}, ${value.longitude}`;
          case FormFieldType.DOCUMENT:
            return value.name || "Document";
          default:
            return String(value);
        }
      },
    };
  },

  // Validate field value
  validateField: (
    value: any,
    type: FormFieldType,
    config: BaseFieldConfig
  ): boolean => {
    const metadata = formFieldUtils.getFieldMetadata(type);
    return metadata.validationRules(config).every((rule) => rule(value));
  },

  // Format field value
  formatFieldValue: (
    value: any,
    type: FormFieldType,
    config: BaseFieldConfig
  ): string => {
    const metadata = formFieldUtils.getFieldMetadata(type);
    return metadata.formatValue(value, config);
  },

  // Get default configuration for field type
  getDefaultConfig: (type: FormFieldType): BaseFieldConfig => {
    return formFieldUtils.getFieldMetadata(type).defaultConfig;
  },

  // Convert FormField to typed field with proper configuration
  convertToTypedField: (
    field: FormField
  ): { type: FormFieldType; config: BaseFieldConfig } => {
    const type = field.field_type_id as FormFieldType;
    const config =
      (field.config_data as BaseFieldConfig) ||
      formFieldUtils.getDefaultConfig(type);
    return { type, config };
  },

  // Create a new FormField with proper typing
  createFormField: (
    label: string,
    type: FormFieldType,
    isRequired: boolean,
    order: number,
    config?: BaseFieldConfig
  ): FormField => {
    return {
      field_label: label,
      field_type_id: type,
      is_required: isRequired,
      field_order: order,
      config_data: config || formFieldUtils.getDefaultConfig(type),
    };
  },

  // Get field type definition
  getFieldTypeDefinition: (type: FormFieldType): FieldTypeDefinition => {
    return (fieldTypesConfig as FieldTypesConfig).fieldTypes[type];
  },

  // Validate field configuration against schema
  validateFieldConfig: (
    type: FormFieldType,
    config: Record<string, any>
  ): boolean => {
    const fieldDef = formFieldUtils.getFieldTypeDefinition(type);
    const schema = fieldDef.configSchema;

    for (const [key, value] of Object.entries(config)) {
      const fieldSchema = schema[key];
      if (!fieldSchema) return false;

      if (Array.isArray(fieldSchema.type)) {
        if (!fieldSchema.type.includes(typeof value)) return false;
      } else if (typeof value !== fieldSchema.type) {
        return false;
      }

      if (fieldSchema.items) {
        if (!Array.isArray(value)) return false;
        for (const item of value) {
          if (fieldSchema.items.properties) {
            for (const [propKey, propSchema] of Object.entries(
              fieldSchema.items.properties
            )) {
              if (!(propKey in item)) return false;
              if (Array.isArray(propSchema.type)) {
                if (!propSchema.type.includes(typeof item[propKey]))
                  return false;
              } else if (typeof item[propKey] !== propSchema.type) {
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  },
};
