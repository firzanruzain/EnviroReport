import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

Deno.serve(async (req) => {
  try {
    const { record } = await req.json(); // The new report

    // Log the environment variables to debug
    console.log("SUPABASE_URL exists:", !!Deno.env.get("SUPABASE_URL"));
    console.log(
      "SUPABASE_SERVICE_ROLE_KEY exists:",
      !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // First, let's test if we can access the database at all
    console.log("Testing database connection...");

    // 1. Get the form_template_id from the new report
    const formTemplateId = record.form_template_id;
    if (!formTemplateId) {
      return new Response(
        JSON.stringify({ error: "Missing form_template_id in report record" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Get the pollution_type_id from the form_template
    const { data: formTemplate, error: formTemplateError } = await supabase
      .from("form_template")
      .select("pollution_type_id")
      .eq("form_template_id", formTemplateId)
      .maybeSingle();
    if (formTemplateError || !formTemplate) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch form_template",
          details: formTemplateError?.message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const pollutionTypeId = formTemplate.pollution_type_id;

    // 3. Get the division_id from the pollution_type
    const { data: pollutionType, error: pollutionTypeError } = await supabase
      .from("pollution_type")
      .select("division_id")
      .eq("pollution_type_id", pollutionTypeId)
      .maybeSingle();
    if (pollutionTypeError || !pollutionType) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch pollution_type",
          details: pollutionTypeError?.message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const divisionId = pollutionType.division_id;

    // 4. Get all staff user IDs in this division
    const { data: staffAccounts, error: staffError } = await supabase
      .from("user_account")
      .select("auth_user_id")
      .eq("user_type", "Staff")
      .eq("division_id", divisionId);

    if (staffError) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch staff accounts",
          details: staffError?.message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const staffIds = (staffAccounts ?? []).map((acc: any) => acc.auth_user_id);

    if (staffIds.length === 0) {
      return new Response(
        JSON.stringify({ message: "No staff in this division", tokens: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Fetch push tokens for these staff
    const { data: tokens, error } = await supabase
      .from("staff_push_tokens")
      .select("expo_push_token, auth_user_id")
      .in("auth_user_id", staffIds);

    if (error) {
      console.error("Failed to fetch tokens", error);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch tokens",
          details: error,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log("No tokens found for staff in division", divisionId);
      return new Response(
        JSON.stringify({
          message: "No tokens found for staff in division",
          tokens: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Prepare notification
    const messages = tokens.map((t) => ({
      to: t.expo_push_token,
      sound: "default",
      title: "New Report Submitted",
      body: `A new report has been submitted: ${record.title || "See details"}`,
      data: {
        reportId: record.id,
        link: `/report/${record.id}`,
      },
    }));

    console.log("sending notifications to: ", tokens.length, "tokens");

    // Send notifications via Expo
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Expo API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Expo API error",
          details: errorText,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await response.json();
    console.log("Expo API response:", result);

    return new Response(
      JSON.stringify({
        message: "Notifications sent",
        sentTo: tokens.length,
        result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
        details: err.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
