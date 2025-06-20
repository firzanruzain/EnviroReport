import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
Deno.serve(async (req) => {
  try {
    const body = await await req.json();
    const { pollution_type_id, form_name, description } = body;
    // check pollution_type_id in payload
    if (!pollution_type_id) {
      return new Response("Missing required fields: pollution_type_id", {
        status: 400,
      });
    }
    // check form_name in payload
    if (!form_name) {
      return new Response("Missing required fields: form_name", {
        status: 400,
      });
    }
    // check description in payload
    if (!description) {
      return new Response("Missing required fields: description", {
        status: 400,
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization"),
          },
        },
      }
    );
    // get pollution_type_name
    const { data: pollution_type_arr, error: pollutionTypeError } =
      await supabase
        .from("pollution_type")
        .select("pollution_type_name")
        .eq("pollution_type_id", pollution_type_id);
    if (pollutionTypeError) {
      console.error(
        "Failed to fetch pollution type: " + pollutionTypeError.message
      );
      return new Response(
        "Failed to fetch pollution type: " + pollutionTypeError.message,
        { status: 500 }
      );
    }
    if (!pollution_type_arr || pollution_type_arr.length === 0) {
      return new Response("Invalid pollution_type_id: not found", {
        status: 400,
      });
    }
    const pollution_type_name = pollution_type_arr[0].pollution_type_name;
    const pollution_type_id_str = pollution_type_name
      .toLowerCase()
      .replace(/\s+/g, "_");
    // Count existing forms for the given division
    const { count, error: countError } = await supabase
      .from("form_template")
      .select("form_template_id", {
        count: "exact",
        head: true,
      })
      .ilike("form_template_id", `FT_${pollution_type_id_str}_%`);
    if (countError) {
      console.error("Failed to count form templates: " + countError.message);
      return new Response(
        "Failed to count form templates: " + countError.message,
        {
          status: 500,
        }
      );
    }
    const newCount = count ? count + 1 : 0;
    const form_template_id = `FT_${pollution_type_id_str}_${newCount}`;
    // Insert new form_template
    const { error: insertError } = await supabase.from("form_template").insert({
      form_template_id: form_template_id,
      form_name: form_name,
      description: description,
      pollution_type_id: pollution_type_id,
      status: "Inactive",
    });
    if (insertError) {
      console.error("Failed to insert form_template: " + insertError.message);
      return new Response(
        "Failed to insert form_template: " + insertError.message,
        {
          status: 500,
        }
      );
    }
    // // Insert one default blank field
    // const { error: fieldError } = await supabase.from("form_field").insert({
    //   form_template_id,
    //   field_label: "",
    //   field_type_id: null,
    //   is_required: false,
    //   field_order: 1,
    // });
    // if (fieldError) {
    //   console.error(
    //     "Form created but failed to add default field: " + fieldError.message
    //   );
    //   return new Response(
    //     "Form created but failed to add default field: " + fieldError.message,
    //     {
    //       status: 500,
    //     }
    //   );
    // }
    return new Response(
      JSON.stringify({
        message: "Form template created",
        form_template_id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Unexpected Error: " + err.message);
    return new Response("Unexpected error: " + err.message, {
      status: 500,
    });
  }
});
