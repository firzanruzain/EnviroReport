import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
Deno.serve(async (req) => {
  try {
    // Check if the request method is PATCH
    if (req.method !== "PATCH") {
      return new Response(
        "Method not allowed. Only PATCH requests are accepted.",
        {
          status: 405,
          headers: {
            Allow: "PATCH",
          },
        }
      );
    }
    const url = new URL(req.url);
    const report_id = url.searchParams.get("report_id");
    const status = url.searchParams.get("status");
    // Validate required parameters
    if (!report_id) {
      return new Response("report_id is required", {
        status: 400,
      });
    }
    if (!status) {
      return new Response("status is required", {
        status: 400,
      });
    }
    // Validate status values
    const validStatuses = ["Pending", "In Review", "Closed"];
    if (!validStatuses.includes(status)) {
      return new Response(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        {
          status: 400,
        }
      );
    }
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
    // Update the report status
    const { data, error } = await supabase
      .from("report")
      .update({
        report_status: status,
      })
      .eq("report_id", report_id)
      .select("report_id")
      .maybeSingle();
    if (error) {
      return new Response("Error updating report: " + error.message, {
        status: 500,
      });
    }
    if (!data) {
      return new Response("Report not found", {
        status: 404,
      });
    }
    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: `Report status updated to ${status}`,
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
