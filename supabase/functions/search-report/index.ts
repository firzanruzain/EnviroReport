import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const form_name = url.searchParams.get("form_name");
    if (isNaN(limit) || isNaN(offset)) {
      return new Response("Invalid pagination parameters", {
        status: 400,
      });
    }
    if (!form_name) {
      return new Response("form_name is missing", {
        status: 400,
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_ANON_KEY"),
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization"),
          },
        },
      }
    );
    // Step 1: Get form_template IDs with that form_name (case-insensitive, partial match)
    const { data: matchingTemplates, error: formError } = await supabase
      .from("form_template")
      .select("form_template_id")
      .ilike("form_name", `%${form_name}%`);
    if (formError) {
      return new Response("Error fetching templates: " + formError.message, {
        status: 500,
      });
    }
    const templateIds = matchingTemplates?.map((ft) => ft.form_template_id);
    if (!templateIds || templateIds.length === 0) {
      return new Response(
        JSON.stringify({
          data: [],
          count: 0,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    // Step 2: Fetch filtered reports
    const { data, count, error } = await supabase
      .from("report")
      .select("*, form_template:form_template_id(*)", {
        count: "exact",
      })
      .in("form_template_id", templateIds)
      .order("submission_date", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      return new Response("Error fetching reports: " + error.message, {
        status: 500,
      });
    }
    return new Response(
      JSON.stringify({
        data,
        count,
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
