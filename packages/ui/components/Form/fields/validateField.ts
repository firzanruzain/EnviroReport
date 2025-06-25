import { fieldValidationMap } from "./fieldValidationMap";
import { fieldTypeValidationMap } from "./fieldTypeValidationMap";

export function validateField(
  value: any,
  config: any,
  configurationSchema: string[],
  field?: any
): string | undefined {
  // 1. General required validation using field.is_required
  if (field?.is_required) {
    let error: string = "";
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      error = "This field is required";
    } else if (value && value.split) {
      value.split(",").forEach((e: string) => {
        if (e == "") {
          error = "This field is required";
        }
      });
    }

    if (error) return error;
  }
  // 2. Config-based validation (skip 'required' key)
  for (const key of configurationSchema) {
    if (key === "required") continue;
    if (config && config[key] !== undefined && fieldValidationMap[key]) {
      const error = fieldValidationMap[key](value, config[key], field);
      if (error) return error; // Return first error found
    }
  }
  // 3. Field-type-specific validation
  if (field && fieldTypeValidationMap[field.field_type_id]) {
    const error = fieldTypeValidationMap[field.field_type_id](
      value,
      field,
      config
    );
    if (error) return error;
  }
  return undefined;
}
