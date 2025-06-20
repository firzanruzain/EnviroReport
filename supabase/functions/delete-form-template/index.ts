import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface RequestPayload {
  form_template_id: string;
}

serve(async (req: Request) => {
  if (req.method !== "DELETE") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const { form_template_id } = (await req.json()) as RequestPayload;

    if (!form_template_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required field",
          details: "form_template_id is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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

    // 1. Get all form_field_ids for this template
    const { data: fields, error: fieldsError } = await supabase
      .from("form_field")
      .select("form_field_id")
      .eq("form_template_id", form_template_id);
    if (fieldsError) {
      return new Response(
        JSON.stringify({
          error: "Database error",
          details: fieldsError.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const fieldIds = (fields ?? []).map(
      (f: { form_field_id: string }) => f.form_field_id
    );

    // 2. Delete all form_field_configuration for these fields
    if (fieldIds.length > 0) {
      const { error: configError } = await supabase
        .from("form_field_configuration")
        .delete()
        .in("form_field_id", fieldIds);
      if (configError) {
        return new Response(
          JSON.stringify({
            error: "Database error",
            details: configError.message,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 3. Delete all form_field for this template
    const { error: fieldDeleteError } = await supabase
      .from("form_field")
      .delete()
      .eq("form_template_id", form_template_id);
    if (fieldDeleteError) {
      return new Response(
        JSON.stringify({
          error: "Database error",
          details: fieldDeleteError.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Delete the form_template itself
    const { error: templateDeleteError } = await supabase
      .from("form_template")
      .delete()
      .eq("form_template_id", form_template_id);
    if (templateDeleteError) {
      return new Response(
        JSON.stringify({
          error: "Database error",
          details: templateDeleteError.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        message:
          "Form template and all related fields/configurations deleted successfully",
        form_template_id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
        details: error.message,
        stack: error.stack,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
