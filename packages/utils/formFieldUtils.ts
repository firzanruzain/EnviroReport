import { FormFieldValue } from '../models/form';

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
    case 'FT_TEXT':
    case 'FT_TEXTAREA':
      return String(value);
    case 'FT_NUMBER':
      return String(value);
    case 'FT_DECIBEL':
      return `${value} dB`;
    case 'FT_VIBRATION':
      return `${value} Hz`;
    case 'FT_SELECT':
      return String(value);
    default:
      return String(value);
  }
}; 