import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const center_lat = parseFloat(url.searchParams.get("center_lat") || "");
    const center_lng = parseFloat(url.searchParams.get("center_lng") || "");
    const radius_meters = parseFloat(
      url.searchParams.get("radius_meters") || ""
    );
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    if (
      isNaN(center_lat) ||
      isNaN(center_lng) ||
      isNaN(radius_meters) ||
      isNaN(limit) ||
      isNaN(offset)
    ) {
      return new Response(
        "Missing or invalid parameters: center_lat, center_lng, radius_meters, limit, offset",
        { status: 400 }
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

    // Call the RPC to get reports within the radius
    const { data, error } = await supabase
      .rpc("find_reports_within_radius", {
        center_lng,
        center_lat,
        radius_meters,
      })
      .range(offset, offset + limit - 1);

    if (error) {
      return new Response("Error fetching reports: " + error.message, {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({
        data: data || [],
        total: data ? data.length : 0,
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
