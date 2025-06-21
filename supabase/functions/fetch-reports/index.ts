import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization"),
          },
        },
      }
    );
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const forDashboard = url.searchParams.get("dashboard") === "true";
    const form_name = url.searchParams.get("form_name");
    const pollution_id = url.searchParams.get("pollution_id");

    if (isNaN(limit) || isNaN(offset)) {
      return new Response("Invalid pagination parameters", {
        status: 400,
      });
    }

    // Step 1: If filtering by form_name or pollution_id, get matching form_template_ids
    let templateIds: string[] | undefined = undefined;
    if (form_name || pollution_id) {
      let templateQuery = supabase
        .from("form_template")
        .select("form_template_id");
      if (form_name) {
        templateQuery = templateQuery.ilike("form_name", `%${form_name}%`);
      }
      if (pollution_id) {
        templateQuery = templateQuery.eq("pollution_type_id", pollution_id);
      }
      const { data: matchingTemplates, error: formError } = await templateQuery;
      if (formError) {
        return new Response("Error fetching templates: " + formError.message, {
          status: 500,
        });
      }
      templateIds = matchingTemplates?.map((ft: any) => ft.form_template_id);
      if (!templateIds || templateIds.length === 0) {
        return new Response(
          JSON.stringify({
            data: [],
            total: 0,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Step 2: Build the report query
    let query = supabase
      .from("report")
      .select(
        "report_id, auth_user_id, form_template_id, submission_date, report_status, form_template:form_template_id(*)",
        {
          count: "exact",
        }
      );
    if (templateIds) {
      query = query.in("form_template_id", templateIds);
    }
    if (forDashboard) {
      query = query
        .order("submission_date", {
          ascending: false,
        })
        .limit(5);
    } else {
      query = query
        .order("submission_date", {
          ascending: false,
        })
        .range(offset, offset + limit - 1);
    }
    const { data, count, error } = await query;
    if (error) {
      return new Response("Error fetching reports: " + error.message, {
        status: 500,
      });
    }
    return new Response(
      JSON.stringify({
        data: data || [],
        total: count || 0,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response("Unexpected error: " + err.message, {
      status: 500,
    });
  }
});
