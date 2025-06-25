// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method Not Allowed",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  try {
    const body = await req.json();
    const { form_template_id, form_data } = body;
    if (!form_template_id || !form_data) {
      console.error("missing required fields", form_data, form_template_id);
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    // Validate form_data structure
    if (!isValidFormData(form_data)) {
      console.error("Invalid Form Data structure", form_data);
      return new Response(
        JSON.stringify({
          error: "Invalid form data structure",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const { data, error } = await supabase
      .from("report")
      .insert({
        form_template_id,
        form_data,
        auth_user_id: user.id,
      })
      .select()
      .single();
    if (error) {
      console.error("error creating report", error);
      return new Response(
        JSON.stringify({
          error: "Error creating report: " + error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("idk bro", err);
    return new Response(
      JSON.stringify({
        error: "Unexpected error: " + err.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});
function isValidFormData(form_data) {
  if (typeof form_data !== "object" || form_data === null) return false;
  for (const key in form_data) {
    const field = form_data[key];
    if (
      typeof field !== "object" ||
      field === null ||
      !("value" in field) ||
      !("field_type_id" in field)
    ) {
      return false;
    }
    // Optionally, check value type
    if (
      typeof field.value !== "string" &&
      typeof field.value !== "number" &&
      typeof field.value !== "object"
    ) {
      return false;
    }
    if (typeof field.field_type_id !== "string") {
      return false;
    }
  }
  return true;
}
