-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.division (
division_id text NOT NULL,
division_name text NOT NULL,
CONSTRAINT division_pkey PRIMARY KEY (division_id)
);
CREATE TABLE public.feedback (
feedback_id uuid NOT NULL DEFAULT uuid_generate_v4(),
report_id uuid NOT NULL,
auth_user_id uuid NOT NULL,
feedback_text text NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT feedback_pkey PRIMARY KEY (feedback_id),
CONSTRAINT feedback_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.report(report_id),
CONSTRAINT feedback_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_account(auth_user_id)
);
CREATE TABLE public.form_field (
form_field_id uuid NOT NULL DEFAULT gen_random_uuid(),
form_template_id text NOT NULL,
field_type_id text NOT NULL,
field_label text NOT NULL,
is_required boolean NOT NULL,
field_order integer NOT NULL,
CONSTRAINT form_field_pkey PRIMARY KEY (form_field_id),
CONSTRAINT form_field_form_template_id_fkey FOREIGN KEY (form_template_id) REFERENCES public.form_template(form_template_id),
CONSTRAINT form_field_field_type_id_fkey FOREIGN KEY (field_type_id) REFERENCES public.form_field_type(field_type_id)
);
CREATE TABLE public.form_field_configuration (
configuration_id uuid NOT NULL DEFAULT gen_random_uuid(),
field_type_id text NOT NULL,
configuration_data jsonb NOT NULL,
form_field_id uuid DEFAULT gen_random_uuid(),
CONSTRAINT form_field_configuration_pkey PRIMARY KEY (configuration_id),
CONSTRAINT form_field_configuration_form_field_id_fkey FOREIGN KEY (form_field_id) REFERENCES public.form_field(form_field_id),
CONSTRAINT form_field_configuration_field_type_id_fkey FOREIGN KEY (field_type_id) REFERENCES public.form_field_type(field_type_id)
);
CREATE TABLE public.form_field_type (
field_type_id text NOT NULL,
label text NOT NULL,
configuration_schema jsonb,
icon text,
format_schema jsonb,
CONSTRAINT form_field_type_pkey PRIMARY KEY (field_type_id)
);
CREATE TABLE public.form_template (
form_template_id text NOT NULL,
form_name text NOT NULL,
description text,
pollution_type_id text NOT NULL,
status USER-DEFINED,
CONSTRAINT form_template_pkey PRIMARY KEY (form_template_id),
CONSTRAINT form_template_pollution_type_id_fkey FOREIGN KEY (pollution_type_id) REFERENCES public.pollution_type(pollution_type_id)
);
CREATE TABLE public.pollution_type (
pollution_type_id text NOT NULL,
division_id text NOT NULL,
pollution_type_name text NOT NULL,
pollution_type_description text NOT NULL,
CONSTRAINT pollution_type_pkey PRIMARY KEY (pollution_type_id),
CONSTRAINT pollution_type_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.division(division_id)
);
CREATE TABLE public.profile_details (
auth_user_id uuid NOT NULL,
name text NOT NULL,
identity_card_num text NOT NULL UNIQUE,
age integer NOT NULL,
phone_number character varying,
address text,
profile_pic text,
CONSTRAINT profile_details_pkey PRIMARY KEY (auth_user_id),
CONSTRAINT profile_details_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_account(auth_user_id)
);
CREATE TABLE public.report (
report_id uuid NOT NULL DEFAULT uuid_generate_v4(),
auth_user_id uuid NOT NULL,
form_template_id character varying NOT NULL,
submission_date timestamp with time zone NOT NULL DEFAULT now(),
report_status USER-DEFINED NOT NULL DEFAULT 'Pending'::report_status_type,
form_data jsonb NOT NULL,
location USER-DEFINED,
CONSTRAINT report_pkey PRIMARY KEY (report_id),
CONSTRAINT report_form_template_id_fkey FOREIGN KEY (form_template_id) REFERENCES public.form_template(form_template_id),
CONSTRAINT report_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_account(auth_user_id)
);
CREATE TABLE public.report_log (
log_id uuid NOT NULL DEFAULT gen_random_uuid(),
created_at timestamp with time zone NOT NULL DEFAULT now(),
report_id uuid NOT NULL DEFAULT gen_random_uuid(),
event_type text NOT NULL,
event_description text,
created_by uuid,
CONSTRAINT report_log_pkey PRIMARY KEY (log_id),
CONSTRAINT report_log_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_account(auth_user_id),
CONSTRAINT report_log_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.report(report_id)
);
CREATE TABLE public.spatial_ref_sys (
srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
auth_name character varying,
auth_srid integer,
srtext character varying,
proj4text character varying,
CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.user_account (
auth_user_id uuid NOT NULL,
user_type USER-DEFINED NOT NULL,
division_id character varying,
status USER-DEFINED NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT user_account_pkey PRIMARY KEY (auth_user_id),
CONSTRAINT user_account_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.division(division_id),
CONSTRAINT user_account_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
