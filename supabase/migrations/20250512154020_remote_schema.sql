

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."account_status" AS ENUM (
    'Pending',
    'Verified',
    'Rejected'
);


ALTER TYPE "public"."account_status" OWNER TO "postgres";


CREATE TYPE "public"."report_status_type" AS ENUM (
    'Pending',
    'In Review',
    'Closed'
);


ALTER TYPE "public"."report_status_type" OWNER TO "postgres";


CREATE TYPE "public"."template_status" AS ENUM (
    'Active',
    'Inactive'
);


ALTER TYPE "public"."template_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'Public User',
    'Staff',
    'Admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."division_exists"("id" character varying) RETURNS boolean
    LANGUAGE "sql"
    AS $_$
  select exists(
    select 1 from division where division_id = $1
  )
$_$;


ALTER FUNCTION "public"."division_exists"("id" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    user_name TEXT;
BEGIN
    -- Get name from auth metadata or fallback to email prefix
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    -- Insert into user_account
    INSERT INTO public.user_account (
        auth_user_id,
        user_type,
        status,
        created_at
    ) VALUES (
        NEW.id,
        'Public User',
        'Pending',
        NOW()
    );

    -- Insert into profile_details
    INSERT INTO public.profile_details (
        auth_user_id,
        name,
        identity_card_num,
        age,
        phone_number,
        address,
        profile_pic
    ) VALUES (
        NEW.id,
        user_name,
        000000000000,      -- Default identity card number
        18,     -- Default age
        NULL,   -- Default phone
        NULL,   -- Default address
        NULL    -- Default profile pic
    );

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  PERFORM
  FROM public.user_account
  WHERE auth_user_id = user_id AND user_type = 'Admin'::user_role;
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_staff"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  PERFORM
  FROM public.user_account
  WHERE auth_user_id = user_id AND user_type = 'Staff'::user_role;
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."is_staff"("user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."division" (
    "division_id" character varying(50) NOT NULL,
    "division_name" character varying(100) NOT NULL
);


ALTER TABLE "public"."division" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "feedback_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "feedback_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_field" (
    "form_field_id" character varying(50) NOT NULL,
    "form_template_id" character varying(50) NOT NULL,
    "field_type_id" character varying(50) NOT NULL,
    "field_label" character varying(100) NOT NULL,
    "is_required" boolean NOT NULL,
    "field_order" integer NOT NULL
);


ALTER TABLE "public"."form_field" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_field_configuration" (
    "configuration_id" character varying(50) NOT NULL,
    "form_field_id" character varying(50) NOT NULL,
    "field_type_id" character varying(50) NOT NULL,
    "configuration_data" "jsonb" NOT NULL
);


ALTER TABLE "public"."form_field_configuration" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_field_type" (
    "field_type_id" character varying(50) NOT NULL,
    "field_type" character varying(50) NOT NULL,
    "configuration_schema" "jsonb"
);


ALTER TABLE "public"."form_field_type" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_template" (
    "form_template_id" character varying(100) NOT NULL,
    "form_name" character varying(255) NOT NULL,
    "description" character varying(255),
    "pollution_type_id" character varying(50) NOT NULL,
    "status" "public"."template_status"
);


ALTER TABLE "public"."form_template" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pollution_type" (
    "pollution_type_id" character varying(20) NOT NULL,
    "division_id" character varying(50) NOT NULL,
    "pollution_type_name" character varying(100) NOT NULL,
    "pollution_type_description" character varying(255) NOT NULL
);


ALTER TABLE "public"."pollution_type" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_details" (
    "auth_user_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "identity_card_num" "text" NOT NULL,
    "age" integer NOT NULL,
    "phone_number" character varying(20),
    "address" character varying(255),
    "profile_pic" character varying(255)
);


ALTER TABLE "public"."profile_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report" (
    "report_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "form_template_id" character varying(50) NOT NULL,
    "submission_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "report_status" "public"."report_status_type" NOT NULL,
    "form_data" "jsonb" NOT NULL
);


ALTER TABLE "public"."report" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_account" (
    "auth_user_id" "uuid" NOT NULL,
    "user_type" "public"."user_role" NOT NULL,
    "division_id" character varying(50),
    "status" "public"."account_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_account" OWNER TO "postgres";


ALTER TABLE ONLY "public"."division"
    ADD CONSTRAINT "division_pkey" PRIMARY KEY ("division_id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("feedback_id");



ALTER TABLE ONLY "public"."form_field_configuration"
    ADD CONSTRAINT "form_field_configuration_pkey" PRIMARY KEY ("configuration_id");



ALTER TABLE ONLY "public"."form_field"
    ADD CONSTRAINT "form_field_pkey" PRIMARY KEY ("form_field_id");



ALTER TABLE ONLY "public"."form_field_type"
    ADD CONSTRAINT "form_field_type_pkey" PRIMARY KEY ("field_type_id");



ALTER TABLE ONLY "public"."form_template"
    ADD CONSTRAINT "form_template_pkey" PRIMARY KEY ("form_template_id");



ALTER TABLE ONLY "public"."pollution_type"
    ADD CONSTRAINT "pollution_type_pkey" PRIMARY KEY ("pollution_type_id");



ALTER TABLE ONLY "public"."profile_details"
    ADD CONSTRAINT "profile_details_identity_card_num_key" UNIQUE ("identity_card_num");



ALTER TABLE ONLY "public"."profile_details"
    ADD CONSTRAINT "profile_details_pkey" PRIMARY KEY ("auth_user_id");



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_pkey" PRIMARY KEY ("report_id");



ALTER TABLE ONLY "public"."user_account"
    ADD CONSTRAINT "user_account_pkey" PRIMARY KEY ("auth_user_id");



CREATE INDEX "idx_feedback_user" ON "public"."feedback" USING "btree" ("auth_user_id");



CREATE INDEX "idx_profile_details_user" ON "public"."profile_details" USING "btree" ("auth_user_id");



CREATE INDEX "idx_report_status" ON "public"."report" USING "btree" ("report_status");



CREATE INDEX "idx_report_user" ON "public"."report" USING "btree" ("auth_user_id");



CREATE INDEX "idx_user_account_admin" ON "public"."user_account" USING "btree" ("user_type") WHERE ("user_type" = 'Admin'::"public"."user_role");



CREATE INDEX "idx_user_account_auth" ON "public"."user_account" USING "btree" ("auth_user_id");



CREATE INDEX "idx_user_account_staff" ON "public"."user_account" USING "btree" ("user_type") WHERE ("user_type" = 'Staff'::"public"."user_role");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "public"."user_account"("auth_user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."report"("report_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_field_configuration"
    ADD CONSTRAINT "form_field_configuration_field_type_id_fkey" FOREIGN KEY ("field_type_id") REFERENCES "public"."form_field_type"("field_type_id");



ALTER TABLE ONLY "public"."form_field_configuration"
    ADD CONSTRAINT "form_field_configuration_form_field_id_fkey" FOREIGN KEY ("form_field_id") REFERENCES "public"."form_field"("form_field_id");



ALTER TABLE ONLY "public"."form_field"
    ADD CONSTRAINT "form_field_field_type_id_fkey" FOREIGN KEY ("field_type_id") REFERENCES "public"."form_field_type"("field_type_id");



ALTER TABLE ONLY "public"."form_field"
    ADD CONSTRAINT "form_field_form_template_id_fkey" FOREIGN KEY ("form_template_id") REFERENCES "public"."form_template"("form_template_id");



ALTER TABLE ONLY "public"."form_template"
    ADD CONSTRAINT "form_template_pollution_type_id_fkey" FOREIGN KEY ("pollution_type_id") REFERENCES "public"."pollution_type"("pollution_type_id");



ALTER TABLE ONLY "public"."pollution_type"
    ADD CONSTRAINT "pollution_type_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "public"."division"("division_id");



ALTER TABLE ONLY "public"."profile_details"
    ADD CONSTRAINT "profile_details_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "public"."user_account"("auth_user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "public"."user_account"("auth_user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_form_template_id_fkey" FOREIGN KEY ("form_template_id") REFERENCES "public"."form_template"("form_template_id");



ALTER TABLE ONLY "public"."user_account"
    ADD CONSTRAINT "user_account_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_account"
    ADD CONSTRAINT "user_account_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "public"."division"("division_id");



CREATE POLICY "Admin and Staff can view all profile details" ON "public"."profile_details" FOR SELECT USING (("public"."is_admin"("auth"."uid"()) OR "public"."is_staff"("auth"."uid"())));



CREATE POLICY "Admin can view all users data" ON "public"."user_account" FOR SELECT TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Enable users to view their own data only" ON "public"."user_account" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "auth_user_id"));



CREATE POLICY "Staff can view division reports" ON "public"."report" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."user_account"
  WHERE (("user_account"."auth_user_id" = "auth"."uid"()) AND ("user_account"."user_type" = 'Staff'::"public"."user_role")))) AND (EXISTS ( SELECT 1
   FROM ("public"."pollution_type"
     JOIN "public"."form_template" ON ((("pollution_type"."pollution_type_id")::"text" = ("form_template"."pollution_type_id")::"text")))
  WHERE ((("pollution_type"."division_id")::"text" = (( SELECT "user_account"."division_id"
           FROM "public"."user_account"
          WHERE ("user_account"."auth_user_id" = "auth"."uid"())))::"text") AND (("form_template"."form_template_id")::"text" = ("report"."form_template_id")::"text"))))));



CREATE POLICY "Users can update their own profile" ON "public"."profile_details" FOR UPDATE USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own profile" ON "public"."profile_details" FOR SELECT USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own report" ON "public"."report" FOR SELECT TO "authenticated" USING (("auth_user_id" = "auth"."uid"()));



ALTER TABLE "public"."profile_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."report" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_account" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";











































































































































































GRANT ALL ON FUNCTION "public"."division_exists"("id" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."division_exists"("id" character varying) TO "authenticated";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."is_staff"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_staff"("user_id" "uuid") TO "authenticated";


















GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."division" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."division" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."feedback" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."feedback" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."form_field" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."form_field" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."form_field_configuration" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."form_field_configuration" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."form_field_type" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."form_field_type" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."form_template" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."form_template" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."pollution_type" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."pollution_type" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."profile_details" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."profile_details" TO "authenticated";



GRANT ALL ON TABLE "public"."report" TO "anon";
GRANT ALL ON TABLE "public"."report" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."user_account" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."user_account" TO "authenticated";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,USAGE ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,USAGE ON SEQUENCES  TO "authenticated";



ALTER DEFAULT PRIVILEGES FOR ROLE "authenticated" IN SCHEMA "public" GRANT SELECT,USAGE ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "authenticated" IN SCHEMA "public" GRANT SELECT,USAGE ON SEQUENCES  TO "anon";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";



ALTER DEFAULT PRIVILEGES FOR ROLE "authenticated" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "authenticated" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES  TO "authenticated";



ALTER DEFAULT PRIVILEGES FOR ROLE "authenticated" IN SCHEMA "public" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "authenticated" IN SCHEMA "public" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES  TO "anon";



























RESET ALL;
