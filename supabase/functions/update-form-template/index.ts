// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface RequestPayload {
  form_template_id: string;
  form_name: string;
  description: string;
}

serve(async (req: Request) => {
  try {
    const { form_template_id, form_name, description } =
      (await req.json()) as RequestPayload;

    if (!form_template_id || !form_name) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          details: "form_template_id and form_name are required",
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

    const { error } = await supabase
      .from("form_template")
      .update({
        form_name,
        description,
      })
      .eq("form_template_id", form_template_id);

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Database error",
          details: error.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Form template updated successfully",
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
