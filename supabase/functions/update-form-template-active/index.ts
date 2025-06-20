import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface RequestPayload {
  pollution_type_id: string;
  form_template_id: string;
}

serve(async (req: Request) => {
  if (req.method !== "PATCH") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const { pollution_type_id, form_template_id } =
      (await req.json()) as RequestPayload;

    if (!pollution_type_id || !form_template_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          details: "pollution_type_id and form_template_id are required",
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

    // 1. Fetch the currently active form_template for this pollution_type_id
    const { data: activeTemplate, error: fetchError } = await supabase
      .from("form_template")
      .select("form_template_id")
      .eq("pollution_type_id", pollution_type_id)
      .eq("status", "Active")
      .maybeSingle();

    if (fetchError) {
      return new Response(
        JSON.stringify({
          error: "Database error",
          details: fetchError.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // If the requested form_template_id is already active, return early
    if (
      activeTemplate &&
      activeTemplate.form_template_id === form_template_id
    ) {
      return new Response(
        JSON.stringify({
          message: "Form is already Active",
          form_template_id,
          pollution_type_id,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Set the status of the currently active form_template (if any) to Inactive
    if (activeTemplate) {
      const { error: deactivateError } = await supabase
        .from("form_template")
        .update({ status: "Inactive" })
        .eq("form_template_id", activeTemplate.form_template_id);
      if (deactivateError) {
        return new Response(
          JSON.stringify({
            error: "Database error",
            details: deactivateError.message,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 3. Set the status of the requested form_template to Active
    const { error: activateError } = await supabase
      .from("form_template")
      .update({ status: "Active" })
      .eq("form_template_id", form_template_id);

    if (activateError) {
      return new Response(
        JSON.stringify({
          error: "Database error",
          details: activateError.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Form template set as Active successfully",
        form_template_id,
        pollution_type_id,
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
