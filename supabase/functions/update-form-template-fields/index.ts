// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Define the form field type for the request
interface FormFieldPayload {
  form_field_id?: string; // Optional since new fields won't have an ID
  field_label: string;
  field_type_id: string;
  is_required: boolean;
  field_order: number;
  config_data?: Record<string, any>;
}

interface RequestPayload {
  form_template_id: string;
  form_fields: FormFieldPayload[];
}

interface FormFieldConfiguration {
  configuration_id: string;
  configuration_data: Record<string, any>;
}

interface ExistingFormField {
  form_field_id: string;
  field_type_id: string;
  field_label: string;
  is_required: boolean;
  field_order: number;
  form_field_configuration?: FormFieldConfiguration[];
}

serve(async (req: Request) => {
  try {
    console.log("=== Starting form fields update ===");

    // 1. Fetch and validate the payload
    const { form_template_id, form_fields } =
      (await req.json()) as RequestPayload;
    console.log("Received request:", { form_template_id, form_fields });

    if (!form_template_id) {
      console.error("Missing form_template_id");
      return new Response(
        JSON.stringify({
          error: "Missing form_template_id",
          details: "form_template_id is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!form_fields || !Array.isArray(form_fields)) {
      console.error("Invalid form_fields:", form_fields);
      return new Response(
        JSON.stringify({
          error: "Invalid form_fields",
          details: "form_fields must be an array",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization") ?? "",
          },
        },
      }
    );

    // 2. Get existing form fields and their configurations
    console.log("Fetching existing fields for form:", form_template_id);
    const { data: existingFields, error: fetchError } = await supabase
      .from("form_field")
      .select(
        `
        form_field_id,
        field_type_id,
        field_label,
        is_required,
        field_order,
        form_field_configuration (
          configuration_id,
          configuration_data
        )
      `
      )
      .eq("form_template_id", form_template_id);

    if (fetchError) {
      console.error("Error fetching existing fields:", fetchError);
      return new Response(
        JSON.stringify({
          error: "Database error",
          details: "Failed to fetch existing form fields",
          hint: fetchError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Existing fields:", existingFields);

    // Create a map of existing fields by their ID for quick lookup
    const existingFieldsMap = new Map(
      (existingFields as ExistingFormField[]).map((field) => [
        field.form_field_id,
        field,
      ])
    );

    // 3. Process each field from the payload
    console.log("Processing fields:", form_fields);
    for (const field of form_fields) {
      console.log("Processing field:", field);

      if (field.form_field_id && existingFieldsMap.has(field.form_field_id)) {
        console.log("Updating existing field:", field.form_field_id);
        // Update existing field
        const existingField = existingFieldsMap.get(field.form_field_id)!;
        const { error: updateFieldError } = await supabase
          .from("form_field")
          .update({
            field_label: field.field_label,
            field_type_id: field.field_type_id,
            is_required: field.is_required,
            field_order: field.field_order,
          })
          .eq("form_field_id", field.form_field_id);

        if (updateFieldError) {
          console.error("Error updating field:", updateFieldError);
          continue;
        }
        console.log("Successfully updated field:", field.form_field_id);

        // Update or create configuration
        if (field.config_data) {
          console.log("Updating configuration for field:", field.form_field_id);
          if (existingField.form_field_configuration?.[0]) {
            // Update existing configuration
            const { error: updateConfigError } = await supabase
              .from("form_field_configuration")
              .update({
                configuration_data: field.config_data,
                field_type_id: field.field_type_id,
              })
              .eq(
                "configuration_id",
                existingField.form_field_configuration[0].configuration_id
              );

            if (updateConfigError) {
              console.error("Error updating configuration:", updateConfigError);
            } else {
              console.log("Successfully updated configuration");
            }
          } else {
            // Create new configuration
            const { error: createConfigError } = await supabase
              .from("form_field_configuration")
              .insert({
                form_field_id: field.form_field_id,
                field_type_id: field.field_type_id,
                configuration_data: field.config_data,
              });

            if (createConfigError) {
              console.error("Error creating configuration:", createConfigError);
            } else {
              console.log("Successfully created new configuration");
            }
          }
        }
      } else {
        console.log("Creating new field");
        // Create new field
        const { data: newField, error: createFieldError } = await supabase
          .from("form_field")
          .insert({
            form_template_id,
            field_label: field.field_label,
            field_type_id: field.field_type_id,
            is_required: field.is_required,
            field_order: field.field_order,
          })
          .select()
          .single();

        if (createFieldError) {
          console.error("Error creating field:", createFieldError);
          continue;
        }
        console.log("Successfully created new field:", newField);

        // Create configuration if provided
        if (field.config_data && newField) {
          console.log("Creating configuration for new field");
          const { error: createConfigError } = await supabase
            .from("form_field_configuration")
            .insert({
              form_field_id: newField.form_field_id,
              field_type_id: field.field_type_id,
              configuration_data: field.config_data,
            });

          if (createConfigError) {
            console.error("Error creating configuration:", createConfigError);
          } else {
            console.log("Successfully created configuration for new field");
          }
        }
      }
    }

    // Delete fields that are no longer in the payload
    const existingFieldIds = Array.from(existingFieldsMap.keys());
    const newFieldIds = form_fields
      .filter((field) => field.form_field_id)
      .map((field) => field.form_field_id as string);
    const fieldsToDelete = existingFieldIds.filter(
      (id) => !newFieldIds.includes(id)
    );

    console.log("Fields to delete:", fieldsToDelete);

    if (fieldsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("form_field")
        .delete()
        .eq("form_template_id", form_template_id)
        .in("form_field_id", fieldsToDelete);

      if (deleteError) {
        console.error("Error deleting fields:", deleteError);
      } else {
        console.log("Successfully deleted fields:", fieldsToDelete);
      }
    }

    console.log("=== Form fields update completed successfully ===");
    return new Response(
      JSON.stringify({
        message: "Form fields updated successfully",
        form_template_id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    console.error("=== Unexpected error in form fields update ===");
    console.error("Error details:", err);
    const error = err as Error;
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
        details: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
