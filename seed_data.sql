-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop dependent view
DROP VIEW IF EXISTS public.form_template_with_fields;

-- Drop dependent policy
DROP POLICY IF EXISTS "Staff can view division reports" ON public.report;

-- Modify ID columns from varchar(20) to text
ALTER TABLE public.division 
  ALTER COLUMN division_id TYPE text;

ALTER TABLE public.pollution_type 
  ALTER COLUMN pollution_type_id TYPE text,
  ALTER COLUMN division_id TYPE text;

ALTER TABLE public.form_field_type 
  ALTER COLUMN field_type_id TYPE text;

ALTER TABLE public.form_template 
  ALTER COLUMN form_template_id TYPE text,
  ALTER COLUMN pollution_type_id TYPE text;

ALTER TABLE public.form_field 
  ALTER COLUMN form_template_id TYPE text,
  ALTER COLUMN field_type_id TYPE text;

ALTER TABLE public.form_field_configuration 
  ALTER COLUMN field_type_id TYPE text;

-- Modify other columns from varchar to text where appropriate
ALTER TABLE public.division 
  ALTER COLUMN division_name TYPE text;

ALTER TABLE public.pollution_type 
  ALTER COLUMN pollution_type_name TYPE text,
  ALTER COLUMN pollution_type_description TYPE text;

ALTER TABLE public.form_template 
  ALTER COLUMN form_name TYPE text,
  ALTER COLUMN description TYPE text;

ALTER TABLE public.form_field 
  ALTER COLUMN field_label TYPE text;

ALTER TABLE public.profile_details 
  ALTER COLUMN name TYPE text,
  ALTER COLUMN address TYPE text,
  ALTER COLUMN profile_pic TYPE text;

-- Recreate the policy
CREATE POLICY "Staff can view division reports" ON public.report
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.user_account ua
            JOIN public.division d ON ua.division_id = d.division_id
            JOIN public.pollution_type pt ON pt.division_id = d.division_id
            JOIN public.form_template ft ON ft.pollution_type_id = pt.pollution_type_id
            WHERE ua.auth_user_id = auth.uid()
            AND ua.user_type = 'Staff'
            AND ft.form_template_id = report.form_template_id
        )
    );

-- Clear all tables in correct order (respecting foreign key constraints)
TRUNCATE TABLE public.feedback CASCADE;
TRUNCATE TABLE public.report CASCADE;
TRUNCATE TABLE public.form_field_configuration CASCADE;
TRUNCATE TABLE public.form_field CASCADE;
TRUNCATE TABLE public.form_template CASCADE;
TRUNCATE TABLE public.pollution_type CASCADE;
TRUNCATE TABLE public.division CASCADE;
TRUNCATE TABLE public.form_field_type CASCADE;
TRUNCATE TABLE public.profile_details CASCADE;
TRUNCATE TABLE public.user_account CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS public.form_field_form_field_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.form_field_configuration_configuration_id_seq RESTART WITH 1;

-- Insert divisions
INSERT INTO public.division (division_id, division_name) VALUES
    ('DIV_WATER_MARINE', 'Water and Marine'),
    ('DIV_AIR', 'Air'),
    ('DIV_HAZMAT', 'Hazardous Materials');

-- Insert User Accounts
INSERT INTO public.user_account (auth_user_id, user_type, division_id, status, created_at) VALUES
    ('b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'Public User', NULL, 'Verified', NOW() - INTERVAL '30 days'),
    ('1c2f4118-4692-4f71-afab-de4dc49b947a', 'Staff', 'DIV_WATER_MARINE', 'Verified', NOW() - INTERVAL '25 days'),
    ('e0047d39-7a72-48ba-a74d-a00a2e36b2fd', 'Admin', 'DIV_HAZMAT', 'Verified', NOW() - INTERVAL '20 days'),
    ('25c9824a-9c8c-40d0-9efe-35a84372ab14', 'Public User', NULL, 'Verified', NOW() - INTERVAL '15 days');

-- Insert Profile Details
INSERT INTO public.profile_details (auth_user_id, name, identity_card_num, age, phone_number, address, profile_pic) VALUES
    ('1c2f4118-4692-4f71-afab-de4dc49b947a', 'Ahmad bin Abdullah', '900101-01-1234', 35, '0123456789', '123 Jalan Merdeka, Kuala Lumpur', 'https://example.com/profiles/ahmad.jpg'),
    ('b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'Siti binti Mohamed', '880202-02-5678', 40, '0123456780', '456 Taman Seri, Petaling Jaya', 'https://example.com/profiles/siti.jpg'),
    ('e0047d39-7a72-48ba-a74d-a00a2e36b2fd', 'Raj Kumar', '870303-03-9012', 45, '0123456781', '789 Jalan Utama, Shah Alam', 'https://example.com/profiles/raj.jpg'),
    ('25c9824a-9c8c-40d0-9efe-35a84372ab14', 'Lim Wei Chen', '920404-04-3456', 32, '0123456782', '321 Taman Indah, Johor Bahru', 'https://example.com/profiles/lim.jpg');

-- Insert pollution types
INSERT INTO public.pollution_type (pollution_type_id, division_id, pollution_type_name, pollution_type_description) VALUES
    ('PT_WATER', 'DIV_WATER_MARINE', 'Water Pollution', 'Contamination of water bodies'),
    ('PT_MARINE', 'DIV_WATER_MARINE', 'Marine Oil Spill', 'Oil spills in marine environments'),
    ('PT_AIR', 'DIV_AIR', 'Air Pollution', 'Contamination of air quality'),
    ('PT_WASTE', 'DIV_HAZMAT', 'Scheduled Waste', 'Hazardous waste management'),
    ('PT_NOISE', 'DIV_HAZMAT', 'Noise Pollution', 'Excessive noise levels'),
    ('PT_VIB', 'DIV_HAZMAT', 'Vibration', 'Excessive vibration levels'),
    ('PT_OIL', 'DIV_HAZMAT', 'Land Oil Spill', 'Oil spills on land');

-- Insert Form Field Types
INSERT INTO public.form_field_type (field_type_id, configuration_schema, label, icon) VALUES
('FT_TEXT', 
 '{"type":"object","description":"A single-line text input field for short text entries like names, locations, or identfiers","properties":{"placeholder":{"type":"string","description":"Placeholder text for the input field"},"minLength":{"type":"number","description":"Minimum length of the text"},"maxLength":{"type":"number","description":"Maximum length of the text"},"pattern":{"type":"string","description":"Regex pattern for validation"}}}',
 'text', 'format-text'),
('FT_TEXTAREA',  
 '{"type":"object","description":"A multi-line text input field for longer text entries like descriptions, comments, or detailed observations","properties":{"placeholder":{"type":"string","description":"Placeholder text for the textarea"},"minLength":{"type":"number","description":"Minimum length of the text"},"maxLength":{"type":"number","description":"Maximum length of the text"},"rows":{"type":"number","description":"Number of visible rows"}}}',
 'textarea', 'text-box-multiple'),
('FT_NUMBER', 
 '{"type":"object","description":"A numeric input field for numbers","properties":{"placeholder":{"type":"string","description":"Placeholder text for the input field"},"min":{"type":"number","description":"Minimum value"},"max":{"type":"number","description":"Maximum value"},"step":{"type":"number","description":"Step increment"},"unit":{"type":"string","description":"Unit of measurement"}}}',
 'number', 'numeric'),
('FT_SELECT', 
 '{"type":"object","description":"A dropdown select field for choosing from predefined options","properties":{"placeholder":{"type":"string","description":"Placeholder text for the select field"},"options":{"type":"array","description":"Array of options","items":{"type":"object","properties":{"label":{"type":"string"},"value":{"type":"string"}}}}}}',
 'select', 'format-list-bulleted'),
('FT_DATE', 
 '{"type":"object","description":"A date input field","properties":{"placeholder":{"type":"string","description":"Placeholder text for the input field"},"minDate":{"type":"string","description":"Minimum date"},"maxDate":{"type":"string","description":"Maximum date"},"format":{"type":"string","description":"Date format"}}}',
 'date', 'calendar'),
('FT_TIME',  
 '{"type":"object","description":"A time input field","properties":{"placeholder":{"type":"string","description":"Placeholder text for the input field"},"format":{"type":"string","description":"Time format"},"interval":{"type":"number","description":"Time interval in minutes"}}}',
 'time', 'clock-outline'),
('FT_LOCATION',  
 '{"type":"object","description":"A location input field for selecting coordinates","properties":{"placeholder":{"type":"string","description":"Placeholder text for the input field"},"radius":{"type":"number","description":"Search radius in meters"},"allowCurrentLocation":{"type":"boolean","description":"Allow using current location"}}}',
 'location', 'map-marker');

-- Add format schemas for each field type
UPDATE public.form_field_type 
SET format_schema = '{
  "template": "{value}",
  "transform": "string"
}' 
WHERE field_type_id = 'FT_TEXT';

UPDATE public.form_field_type 
SET format_schema = '{
  "template": "{value}",
  "transform": "string"
}' 
WHERE field_type_id = 'FT_TEXTAREA';

UPDATE public.form_field_type 
SET format_schema = '{
  "template": "{value}",
  "transform": "number"
}' 
WHERE field_type_id = 'FT_NUMBER';

UPDATE public.form_field_type 
SET format_schema = '{
  "template": "{value}",
  "transform": "string"
}' 
WHERE field_type_id = 'FT_SELECT';

UPDATE public.form_field_type 
SET format_schema = '{
  "template": "{value}",
  "transform": "date",
  "format": "toLocaleDateString"
}' 
WHERE field_type_id = 'FT_DATE';

UPDATE public.form_field_type 
SET format_schema = '{
  "template": "{value}",
  "transform": "date",
  "format": "toLocaleTimeString"
}' 
WHERE field_type_id = 'FT_TIME';

UPDATE public.form_field_type 
SET format_schema = '{
  "template": "{latitude}, {longitude}",
  "transform": "object",
  "fallback": "Location not specified"
}' 
WHERE field_type_id = 'FT_LOCATION';

-- Insert Form Templates
INSERT INTO public.form_template (form_template_id, form_name, description, pollution_type_id, status) VALUES
    -- Water Pollution Templates
    ('FT_water_pollution_1', 'Water Pollution Report', 'Form for reporting water pollution incidents', 'PT_WATER', 'Active'),
    ('FT_water_pollution_2', 'Water Quality Assessment', 'Detailed water quality assessment form', 'PT_WATER', 'Inactive'),
    
    -- Marine Oil Spill Templates
    ('FT_marine_oil_spill_1', 'Marine Oil Spill Report', 'Form for reporting marine oil spill incidents', 'PT_MARINE', 'Active'),
    ('FT_marine_oil_spill_2', 'Marine Pollution Assessment', 'Comprehensive marine pollution assessment form', 'PT_MARINE', 'Inactive'),
    
    -- Air Pollution Templates
    ('FT_air_pollution_1', 'Air Pollution Report', 'Form for reporting air pollution incidents', 'PT_AIR', 'Active'),
    ('FT_air_pollution_2', 'Air Quality Monitoring', 'Detailed air quality monitoring form', 'PT_AIR', 'Inactive'),
    
    -- Scheduled Waste Templates
    ('FT_scheduled_waste_1', 'Scheduled Waste Report', 'Form for reporting scheduled waste incidents', 'PT_WASTE', 'Active'),
    ('FT_scheduled_waste_2', 'Hazardous Waste Assessment', 'Comprehensive hazardous waste assessment form', 'PT_WASTE', 'Inactive'),
    
    -- Noise Pollution Templates
    ('FT_noise_pollution_1', 'Noise Pollution Report', 'Form for reporting noise pollution incidents', 'PT_NOISE', 'Active'),
    ('FT_noise_pollution_2', 'Noise Level Monitoring', 'Detailed noise level monitoring form', 'PT_NOISE', 'Inactive'),
    
    -- Vibration Templates
    ('FT_vibration_1', 'Vibration Report', 'Form for reporting vibration incidents', 'PT_VIB', 'Active'),
    ('FT_vibration_2', 'Vibration Impact Assessment', 'Comprehensive vibration impact assessment form', 'PT_VIB', 'Inactive'),
    
    -- Land Oil Spill Templates
    ('FT_land_oil_spill_1', 'Land Oil Spill Report', 'Form for reporting land oil spill incidents', 'PT_OIL', 'Active'),
    ('FT_land_oil_spill_2', 'Land Contamination Assessment', 'Detailed land contamination assessment form', 'PT_OIL', 'Inactive');

-- Insert Form Fields
INSERT INTO public.form_field (form_field_id, form_template_id, field_type_id, field_label, is_required, field_order) VALUES
    -- Water Pollution Form Fields (7 fields)
    (gen_random_uuid(), 'FT_water_pollution_1', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_water_pollution_1', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_water_pollution_1', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_water_pollution_1', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_water_pollution_1', 'FT_NUMBER', 'Severity Level', true, 5),
    (gen_random_uuid(), 'FT_water_pollution_1', 'FT_LOCATION', 'Water Source', true, 6),
    (gen_random_uuid(), 'FT_water_pollution_1', 'FT_SELECT', 'Pollution Category', true, 7),

    -- Water Pollution Alternative Form Fields (8 fields)
    (gen_random_uuid(), 'FT_water_pollution_2', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_water_pollution_2', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_water_pollution_2', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_water_pollution_2', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_water_pollution_2', 'FT_NUMBER', 'pH Level', true, 5),
    (gen_random_uuid(), 'FT_water_pollution_2', 'FT_NUMBER', 'Turbidity', true, 6),
    (gen_random_uuid(), 'FT_water_pollution_2', 'FT_NUMBER', 'Dissolved Oxygen', true, 7),
    (gen_random_uuid(), 'FT_water_pollution_2', 'FT_SELECT', 'Water Quality Index', true, 8),

    -- Marine Oil Spill Form Fields (5 fields)
    (gen_random_uuid(), 'FT_marine_oil_spill_1', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_marine_oil_spill_1', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_marine_oil_spill_1', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_marine_oil_spill_1', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_marine_oil_spill_1', 'FT_NUMBER', 'Estimated Volume', true, 5),

    -- Marine Oil Spill Alternative Form Fields (7 fields)
    (gen_random_uuid(), 'FT_marine_oil_spill_2', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_marine_oil_spill_2', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_marine_oil_spill_2', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_marine_oil_spill_2', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_marine_oil_spill_2', 'FT_NUMBER', 'Oil Thickness', true, 5),
    (gen_random_uuid(), 'FT_marine_oil_spill_2', 'FT_NUMBER', 'Affected Area', true, 6),
    (gen_random_uuid(), 'FT_marine_oil_spill_2', 'FT_SELECT', 'Oil Type', true, 7),

    -- Air Pollution Form Fields (6 fields)
    (gen_random_uuid(), 'FT_air_pollution_1', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_air_pollution_1', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_air_pollution_1', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_air_pollution_1', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_air_pollution_1', 'FT_SELECT', 'Emission Type', true, 5),
    (gen_random_uuid(), 'FT_air_pollution_1', 'FT_NUMBER', 'Air Quality Index', true, 6),

    -- Air Pollution Alternative Form Fields (8 fields)
    (gen_random_uuid(), 'FT_air_pollution_2', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_air_pollution_2', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_air_pollution_2', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_air_pollution_2', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_air_pollution_2', 'FT_NUMBER', 'PM2.5 Level', true, 5),
    (gen_random_uuid(), 'FT_air_pollution_2', 'FT_NUMBER', 'PM10 Level', true, 6),
    (gen_random_uuid(), 'FT_air_pollution_2', 'FT_NUMBER', 'Ozone Level', true, 7),
    (gen_random_uuid(), 'FT_air_pollution_2', 'FT_SELECT', 'Air Quality Category', true, 8),

    -- Scheduled Waste Form Fields (6 fields)
    (gen_random_uuid(), 'FT_scheduled_waste_1', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_scheduled_waste_1', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_scheduled_waste_1', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_scheduled_waste_1', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_scheduled_waste_1', 'FT_SELECT', 'Waste Category', true, 5),
    (gen_random_uuid(), 'FT_scheduled_waste_1', 'FT_NUMBER', 'Estimated Weight', true, 6),

    -- Scheduled Waste Alternative Form Fields (8 fields)
    (gen_random_uuid(), 'FT_scheduled_waste_2', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_scheduled_waste_2', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_scheduled_waste_2', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_scheduled_waste_2', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_scheduled_waste_2', 'FT_SELECT', 'Hazard Level', true, 5),
    (gen_random_uuid(), 'FT_scheduled_waste_2', 'FT_NUMBER', 'Volume', true, 6),
    (gen_random_uuid(), 'FT_scheduled_waste_2', 'FT_SELECT', 'Storage Condition', true, 7),
    (gen_random_uuid(), 'FT_scheduled_waste_2', 'FT_SELECT', 'Disposal Method', true, 8),

    -- Noise Pollution Form Fields (5 fields)
    (gen_random_uuid(), 'FT_noise_pollution_1', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_noise_pollution_1', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_noise_pollution_1', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_noise_pollution_1', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_noise_pollution_1', 'FT_NUMBER', 'Noise Level', true, 5),

    -- Noise Pollution Alternative Form Fields (7 fields)
    (gen_random_uuid(), 'FT_noise_pollution_2', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_noise_pollution_2', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_noise_pollution_2', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_noise_pollution_2', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_noise_pollution_2', 'FT_NUMBER', 'Daytime Level', true, 5),
    (gen_random_uuid(), 'FT_noise_pollution_2', 'FT_NUMBER', 'Nighttime Level', true, 6),

    -- Vibration Form Fields (6 fields)
    (gen_random_uuid(), 'FT_vibration_1', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_vibration_1', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_vibration_1', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_vibration_1', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_vibration_1', 'FT_NUMBER', 'Vibration Level', true, 5),
    (gen_random_uuid(), 'FT_vibration_1', 'FT_SELECT', 'Vibration Source', true, 6),

    -- Vibration Alternative Form Fields (8 fields)
    (gen_random_uuid(), 'FT_vibration_2', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_vibration_2', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_vibration_2', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_vibration_2', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_vibration_2', 'FT_NUMBER', 'Peak Level', true, 5),
    (gen_random_uuid(), 'FT_vibration_2', 'FT_NUMBER', 'Average Level', true, 6),
    (gen_random_uuid(), 'FT_vibration_2', 'FT_NUMBER', 'Duration', true, 7),

    -- Land Oil Spill Form Fields (5 fields)
    (gen_random_uuid(), 'FT_land_oil_spill_1', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_land_oil_spill_1', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_land_oil_spill_1', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_land_oil_spill_1', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_land_oil_spill_1', 'FT_NUMBER', 'Estimated Volume', true, 5),

    -- Land Oil Spill Alternative Form Fields (7 fields)
    (gen_random_uuid(), 'FT_land_oil_spill_2', 'FT_LOCATION', 'Location', true, 1),
    (gen_random_uuid(), 'FT_land_oil_spill_2', 'FT_DATE', 'Incident Date', true, 2),
    (gen_random_uuid(), 'FT_land_oil_spill_2', 'FT_TIME', 'Incident Time', true, 3),
    (gen_random_uuid(), 'FT_land_oil_spill_2', 'FT_TEXTAREA', 'Description', true, 4),
    (gen_random_uuid(), 'FT_land_oil_spill_2', 'FT_NUMBER', 'Contaminated Area', true, 5),
    (gen_random_uuid(), 'FT_land_oil_spill_2', 'FT_SELECT', 'Soil Type', true, 6),
    (gen_random_uuid(), 'FT_land_oil_spill_2', 'FT_SELECT', 'Contamination Level', true, 7);

-- Insert Reports
INSERT INTO public.report (report_id, auth_user_id, form_template_id, submission_date, report_status, form_data) VALUES
-- Water Pollution Reports (7 fields)
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_water_pollution_1', NOW() - INTERVAL '20 days', 'Pending', '{
  "location": {"value": {"latitude": 3.139, "longitude": 101.6869}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-01", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "14:00", "field_type_id": "FT_TIME"},
  "description": {"value": "Suspected chemical waste discharge causing water discoloration", "field_type_id": "FT_TEXTAREA"},
  "severity_level": {"value": 4, "field_type_id": "FT_NUMBER"},
  "water_source": {"value": {"latitude": 3.140, "longitude": 101.700}, "field_type_id": "FT_LOCATION"},
  "pollution_category": {"value": "Chemical", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_water_pollution_1', NOW() - INTERVAL '18 days', 'In Review', '{
  "location": {"value": {"latitude": 3.174, "longitude": 101.709}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-03", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "10:30", "field_type_id": "FT_TIME"},
  "description": {"value": "Algae bloom observed in the lake, possible nutrient pollution", "field_type_id": "FT_TEXTAREA"},
  "severity_level": {"value": 3, "field_type_id": "FT_NUMBER"},
  "water_source": {"value": {"latitude": 3.175, "longitude": 101.710}, "field_type_id": "FT_LOCATION"},
  "pollution_category": {"value": "Biological", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_water_pollution_1', NOW() - INTERVAL '15 days', 'Closed', '{
  "location": {"value": {"latitude": 3.162, "longitude": 101.698}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-06", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "09:15", "field_type_id": "FT_TIME"},
  "description": {"value": "Industrial waste discharge affecting water quality", "field_type_id": "FT_TEXTAREA"},
  "severity_level": {"value": 5, "field_type_id": "FT_NUMBER"},
  "water_source": {"value": {"latitude": 3.163, "longitude": 101.699}, "field_type_id": "FT_LOCATION"},
  "pollution_category": {"value": "Chemical", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_water_pollution_1', NOW() - INTERVAL '12 days', 'Pending', '{
  "location": {"value": {"latitude": 2.995, "longitude": 101.789}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-09", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "16:45", "field_type_id": "FT_TIME"},
  "description": {"value": "Suspected sewage discharge into river", "field_type_id": "FT_TEXTAREA"},
  "severity_level": {"value": 4, "field_type_id": "FT_NUMBER"},
  "water_source": {"value": {"latitude": 2.996, "longitude": 101.790}, "field_type_id": "FT_LOCATION"},
  "pollution_category": {"value": "Biological", "field_type_id": "FT_SELECT"}
}'),

-- Marine Oil Spill Reports
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_marine_oil_spill_1', NOW() - INTERVAL '19 days', 'In Review', '{
  "location": {"value": {"latitude": 3.003, "longitude": 101.367}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-02", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "11:20", "field_type_id": "FT_TIME"},
  "description": {"value": "Oil slick observed near cargo terminal", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 500, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_marine_oil_spill_1', NOW() - INTERVAL '16 days', 'Closed', '{
  "location": {"value": {"latitude": 6.326, "longitude": 99.849}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-05", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "13:10", "field_type_id": "FT_TIME"},
  "description": {"value": "Small oil spill from fishing vessel", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 100, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_marine_oil_spill_1', NOW() - INTERVAL '13 days', 'Pending', '{
  "location": {"value": {"latitude": 5.402, "longitude": 100.347}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-08", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "15:00", "field_type_id": "FT_TIME"},
  "description": {"value": "Oil sheen observed in harbor area", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 200, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_marine_oil_spill_1', NOW() - INTERVAL '10 days', 'In Review', '{
  "location": {"value": {"latitude": 3.977, "longitude": 103.427}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-11", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "08:40", "field_type_id": "FT_TIME"},
  "description": {"value": "Minor oil spill from cargo ship", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 300, "field_type_id": "FT_NUMBER"}
}'),

-- Air Pollution Reports (6 fields)
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_air_pollution_1', NOW() - INTERVAL '17 days', 'Closed', '{
  "location": {"value": {"latitude": 3.073, "longitude": 101.518}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-04", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "13:00", "field_type_id": "FT_TIME"},
  "description": {"value": "Strong chemical odor from factory", "field_type_id": "FT_TEXTAREA"},
  "emission_type": {"value": "Industrial", "field_type_id": "FT_SELECT"},
  "air_quality_index": {"value": 150, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_air_pollution_1', NOW() - INTERVAL '14 days', 'Pending', '{
  "location": {"value": {"latitude": 3.132, "longitude": 101.686}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-07", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "09:45", "field_type_id": "FT_TIME"},
  "description": {"value": "Heavy smoke from construction site", "field_type_id": "FT_TEXTAREA"},
  "emission_type": {"value": "Construction", "field_type_id": "FT_SELECT"},
  "air_quality_index": {"value": 180, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_air_pollution_1', NOW() - INTERVAL '11 days', 'In Review', '{
  "location": {"value": {"latitude": 3.107, "longitude": 101.606}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-10", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "15:30", "field_type_id": "FT_TIME"},
  "description": {"value": "Dust particles from manufacturing plant", "field_type_id": "FT_TEXTAREA"},
  "emission_type": {"value": "Industrial", "field_type_id": "FT_SELECT"},
  "air_quality_index": {"value": 120, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_air_pollution_1', NOW() - INTERVAL '8 days', 'Closed', '{
  "location": {"value": {"latitude": 3.043, "longitude": 101.449}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-13", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "11:10", "field_type_id": "FT_TIME"},
  "description": {"value": "Unusual odor from chemical plant", "field_type_id": "FT_TEXTAREA"},
  "emission_type": {"value": "Industrial", "field_type_id": "FT_SELECT"},
  "air_quality_index": {"value": 200, "field_type_id": "FT_NUMBER"}
}'),

-- Scheduled Waste Reports (6 fields)
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_scheduled_waste_1', NOW() - INTERVAL '15 days', 'Pending', '{
  "location": {"value": {"latitude": 2.993, "longitude": 101.790}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-06", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "10:20", "field_type_id": "FT_TIME"},
  "description": {"value": "Illegal dumping of electronic waste", "field_type_id": "FT_TEXTAREA"},
  "waste_category": {"value": "Electronic", "field_type_id": "FT_SELECT"},
  "estimated_weight": {"value": 250.5, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_scheduled_waste_1', NOW() - INTERVAL '12 days', 'In Review', '{
  "location": {"value": {"latitude": 3.140, "longitude": 101.686}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-09", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "14:50", "field_type_id": "FT_TIME"},
  "description": {"value": "Improper disposal of medical waste", "field_type_id": "FT_TEXTAREA"},
  "waste_category": {"value": "Medical", "field_type_id": "FT_SELECT"},
  "estimated_weight": {"value": 75.2, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_scheduled_waste_1', NOW() - INTERVAL '9 days', 'Closed', '{
  "location": {"value": {"latitude": 1.484, "longitude": 103.880}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-12", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "16:30", "field_type_id": "FT_TIME"},
  "description": {"value": "Hazardous chemical waste storage issue", "field_type_id": "FT_TEXTAREA"},
  "waste_category": {"value": "Chemical", "field_type_id": "FT_SELECT"},
  "estimated_weight": {"value": 500.0, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_scheduled_waste_1', NOW() - INTERVAL '6 days', 'Pending', '{
  "location": {"value": {"latitude": 4.597, "longitude": 101.090}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-15", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "12:10", "field_type_id": "FT_TIME"},
  "description": {"value": "Suspected hazardous waste dumping", "field_type_id": "FT_TEXTAREA"},
  "waste_category": {"value": "Hazardous", "field_type_id": "FT_SELECT"},
  "estimated_weight": {"value": 150.8, "field_type_id": "FT_NUMBER"}
}'),

-- Noise Pollution Reports (5 fields)
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_noise_pollution_1', NOW() - INTERVAL '13 days', 'In Review', '{
  "location": {"value": {"latitude": 3.128, "longitude": 101.684}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-08", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "15:00", "field_type_id": "FT_TIME"},
  "description": {"value": "Excessive noise from construction equipment", "field_type_id": "FT_TEXTAREA"},
  "noise_level": {"value": 85, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_noise_pollution_1', NOW() - INTERVAL '10 days', 'Closed', '{
  "location": {"value": {"latitude": 3.107, "longitude": 101.606}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-11", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "10:30", "field_type_id": "FT_TIME"},
  "description": {"value": "Loud music from entertainment venues", "field_type_id": "FT_TEXTAREA"},
  "noise_level": {"value": 90, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_noise_pollution_1', NOW() - INTERVAL '7 days', 'Pending', '{
  "location": {"value": {"latitude": 3.043, "longitude": 101.449}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-14", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "18:20", "field_type_id": "FT_TIME"},
  "description": {"value": "Factory machinery noise exceeding limits", "field_type_id": "FT_TEXTAREA"},
  "noise_level": {"value": 95, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_noise_pollution_1', NOW() - INTERVAL '4 days', 'In Review', '{
  "location": {"value": {"latitude": 3.085, "longitude": 101.740}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-17", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "21:10", "field_type_id": "FT_TIME"},
  "description": {"value": "Noise from air conditioning units", "field_type_id": "FT_TEXTAREA"},
  "noise_level": {"value": 75, "field_type_id": "FT_NUMBER"}
}'),

-- Vibration Reports (6 fields)
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_vibration_1', NOW() - INTERVAL '11 days', 'Closed', '{
  "location": {"value": {"latitude": 3.146, "longitude": 101.621}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-10", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "08:30", "field_type_id": "FT_TIME"},
  "description": {"value": "Heavy machinery causing ground vibration", "field_type_id": "FT_TEXTAREA"},
  "vibration_level": {"value": 45, "field_type_id": "FT_NUMBER"},
  "vibration_source": {"value": "Construction", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_vibration_1', NOW() - INTERVAL '8 days', 'Pending', '{
  "location": {"value": {"latitude": 3.029, "longitude": 101.618}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-13", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "17:00", "field_type_id": "FT_TIME"},
  "description": {"value": "Factory equipment causing structural vibration", "field_type_id": "FT_TEXTAREA"},
  "vibration_level": {"value": 35, "field_type_id": "FT_NUMBER"},
  "vibration_source": {"value": "Industrial", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_vibration_1', NOW() - INTERVAL '5 days', 'In Review', '{
  "location": {"value": {"latitude": 3.318, "longitude": 101.576}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-16", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "12:40", "field_type_id": "FT_TIME"},
  "description": {"value": "Blasting operations causing ground vibration", "field_type_id": "FT_TEXTAREA"},
  "vibration_level": {"value": 50, "field_type_id": "FT_NUMBER"},
  "vibration_source": {"value": "Industrial", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_vibration_1', NOW() - INTERVAL '2 days', 'Closed', '{
  "location": {"value": {"latitude": 3.167, "longitude": 101.651}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-19", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "19:20", "field_type_id": "FT_TIME"},
  "description": {"value": "Pile driving causing excessive vibration", "field_type_id": "FT_TEXTAREA"},
  "vibration_level": {"value": 40, "field_type_id": "FT_NUMBER"},
  "vibration_source": {"value": "Construction", "field_type_id": "FT_SELECT"}
}'),

-- Land Oil Spill Reports (5 fields)
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_land_oil_spill_1', NOW() - INTERVAL '9 days', 'Pending', '{
  "location": {"value": {"latitude": 3.073, "longitude": 101.518}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-12", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "08:10", "field_type_id": "FT_TIME"},
  "description": {"value": "Oil spill from storage tank", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 200, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_land_oil_spill_1', NOW() - INTERVAL '6 days', 'In Review', '{
  "location": {"value": {"latitude": 3.033, "longitude": 101.445}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-15", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "13:30", "field_type_id": "FT_TIME"},
  "description": {"value": "Hydraulic oil leak from machinery", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 50, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_land_oil_spill_1', NOW() - INTERVAL '3 days', 'Closed', '{
  "location": {"value": {"latitude": 3.104, "longitude": 101.651}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-18", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "17:50", "field_type_id": "FT_TIME"},
  "description": {"value": "Engine oil spill in workshop", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 30, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_land_oil_spill_1', NOW() - INTERVAL '1 day', 'Pending', '{
  "location": {"value": {"latitude": 3.064, "longitude": 101.503}, "field_type_id": "FT_LOCATION"},
  "incident_date": {"value": "2024-05-20", "field_type_id": "FT_DATE"},
  "incident_time": {"value": "20:40", "field_type_id": "FT_TIME"},
  "description": {"value": "Fuel spill during refueling", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 100, "field_type_id": "FT_NUMBER"}
}');

-- Insert Feedback
INSERT INTO public.feedback (feedback_id, report_id, auth_user_id, feedback_text, created_at) VALUES
(uuid_generate_v4(), (SELECT report_id FROM public.report LIMIT 1), '1c2f4118-4692-4f71-afab-de4dc49b947a', 'Investigation in progress', NOW() - INTERVAL '2 days'),
(uuid_generate_v4(), (SELECT report_id FROM public.report LIMIT 1 OFFSET 1), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'Team dispatched to site', NOW() - INTERVAL '1 day');

-- Insert Form Field Configurations
INSERT INTO public.form_field_configuration (configuration_id, field_type_id, configuration_data, form_field_id) VALUES
    -- Water Pollution Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_1' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_1' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_1' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_1' AND field_order = 4)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter severity level (1-5)", "min": 1, "max": 5, "step": 1}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_1' AND field_order = 5)),
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter water source", "allowCurrentLocation": true, "radius": 5000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_1' AND field_order = 6)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select pollution category", "options": [{"label": "Chemical", "value": "chemical"}, {"label": "Biological", "value": "biological"}, {"label": "Physical", "value": "physical"}, {"label": "Thermal", "value": "thermal"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_1' AND field_order = 7)),

    -- Water Pollution Alternative Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_2' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_2' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_2' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_2' AND field_order = 4)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter pH level", "min": 0, "max": 14, "step": 0.1, "unit": "pH"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_2' AND field_order = 5)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter turbidity", "min": 0, "max": 1000, "step": 1, "unit": "NTU"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_2' AND field_order = 6)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter dissolved oxygen", "min": 0, "max": 20, "step": 0.1, "unit": "mg/L"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_2' AND field_order = 7)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select water quality index", "options": [{"label": "Excellent", "value": "excellent"}, {"label": "Good", "value": "good"}, {"label": "Fair", "value": "fair"}, {"label": "Poor", "value": "poor"}, {"label": "Very Poor", "value": "very_poor"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_water_pollution_2' AND field_order = 8)),

    -- Marine Oil Spill Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_1' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_1' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_1' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_1' AND field_order = 4)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter estimated volume", "min": 0, "max": 10000, "step": 1, "unit": "liters"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_1' AND field_order = 5)),

    -- Marine Oil Spill Alternative Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_2' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_2' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_2' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_2' AND field_order = 4)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter oil thickness", "min": 0, "max": 100, "step": 0.1, "unit": "mm"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_2' AND field_order = 5)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter affected area", "min": 0, "max": 1000000, "step": 1, "unit": "m²"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_2' AND field_order = 6)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select oil type", "options": [{"label": "Crude Oil", "value": "crude_oil"}, {"label": "Diesel", "value": "diesel"}, {"label": "Petrol", "value": "petrol"}, {"label": "Lubricating Oil", "value": "lubricating_oil"}, {"label": "Other", "value": "other"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_marine_oil_spill_2' AND field_order = 7)),

    -- Air Pollution Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_1' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_1' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_1' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_1' AND field_order = 4)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select emission type", "options": [{"label": "Industrial", "value": "industrial"}, {"label": "Vehicle", "value": "vehicle"}, {"label": "Construction", "value": "construction"}, {"label": "Agricultural", "value": "agricultural"}, {"label": "Other", "value": "other"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_1' AND field_order = 5)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter air quality index", "min": 0, "max": 500, "step": 1}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_1' AND field_order = 6)),

    -- Air Pollution Alternative Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_2' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_2' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_2' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_2' AND field_order = 4)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter PM2.5 level", "min": 0, "max": 500, "step": 1, "unit": "μg/m³"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_2' AND field_order = 5)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter PM10 level", "min": 0, "max": 1000, "step": 1, "unit": "μg/m³"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_2' AND field_order = 6)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter ozone level", "min": 0, "max": 500, "step": 1, "unit": "ppb"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_2' AND field_order = 7)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select air quality category", "options": [{"label": "Good", "value": "good"}, {"label": "Moderate", "value": "moderate"}, {"label": "Unhealthy", "value": "unhealthy"}, {"label": "Very Unhealthy", "value": "very_unhealthy"}, {"label": "Hazardous", "value": "hazardous"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_air_pollution_2' AND field_order = 8)),

    -- Scheduled Waste Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_1' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_1' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_1' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_1' AND field_order = 4)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select waste category", "options": [{"label": "Electronic", "value": "electronic"}, {"label": "Medical", "value": "medical"}, {"label": "Chemical", "value": "chemical"}, {"label": "Hazardous", "value": "hazardous"}, {"label": "Other", "value": "other"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_1' AND field_order = 5)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter estimated weight", "min": 0, "max": 10000, "step": 0.1, "unit": "kg"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_1' AND field_order = 6)),

    -- Scheduled Waste Alternative Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_2' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_2' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_2' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_2' AND field_order = 4)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select hazard level", "options": [{"label": "Low", "value": "low"}, {"label": "Medium", "value": "medium"}, {"label": "High", "value": "high"}, {"label": "Very High", "value": "very_high"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_2' AND field_order = 5)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter volume", "min": 0, "max": 1000, "step": 0.1, "unit": "m³"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_2' AND field_order = 6)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select storage condition", "options": [{"label": "Contained", "value": "contained"}, {"label": "Exposed", "value": "exposed"}, {"label": "Partially Contained", "value": "partially_contained"}, {"label": "Unknown", "value": "unknown"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_2' AND field_order = 7)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select disposal method", "options": [{"label": "Landfill", "value": "landfill"}, {"label": "Incineration", "value": "incineration"}, {"label": "Recycling", "value": "recycling"}, {"label": "Treatment", "value": "treatment"}, {"label": "Other", "value": "other"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_scheduled_waste_2' AND field_order = 8)),

    -- Noise Pollution Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_1' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_1' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_1' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_1' AND field_order = 4)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter noise level", "min": 0, "max": 120, "step": 1, "unit": "dB"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_1' AND field_order = 5)),

    -- Noise Pollution Alternative Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_2' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_2' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_2' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_2' AND field_order = 4)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter daytime level", "min": 0, "max": 120, "step": 1, "unit": "dB"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_2' AND field_order = 5)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter nighttime level", "min": 0, "max": 120, "step": 1, "unit": "dB"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_2' AND field_order = 6)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select noise source type", "options": [{"label": "Construction", "value": "construction"}, {"label": "Industrial", "value": "industrial"}, {"label": "Transportation", "value": "transportation"}, {"label": "Entertainment", "value": "entertainment"}, {"label": "Other", "value": "other"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_noise_pollution_2' AND field_order = 7)),

    -- Vibration Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_1' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_1' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_1' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_1' AND field_order = 4)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter vibration level", "min": 0, "max": 100, "step": 0.1, "unit": "mm/s"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_1' AND field_order = 5)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select vibration source", "options": [{"label": "Construction", "value": "construction"}, {"label": "Industrial", "value": "industrial"}, {"label": "Transportation", "value": "transportation"}, {"label": "Natural", "value": "natural"}, {"label": "Other", "value": "other"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_1' AND field_order = 6)),

    -- Vibration Alternative Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_2' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_2' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_2' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_2' AND field_order = 4)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter peak level", "min": 0, "max": 100, "step": 0.1, "unit": "mm/s"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_2' AND field_order = 5)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter average level", "min": 0, "max": 100, "step": 0.1, "unit": "mm/s"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_2' AND field_order = 6)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter duration", "min": 0, "max": 24, "step": 0.5, "unit": "hours"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_2' AND field_order = 7)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select impact category", "options": [{"label": "Low", "value": "low"}, {"label": "Medium", "value": "medium"}, {"label": "High", "value": "high"}, {"label": "Very High", "value": "very_high"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_vibration_2' AND field_order = 8)),

    -- Land Oil Spill Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_1' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_1' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_1' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_1' AND field_order = 4)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter estimated volume", "min": 0, "max": 10000, "step": 1, "unit": "liters"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_1' AND field_order = 5)),

    -- Land Oil Spill Alternative Form Fields Configurations
    (gen_random_uuid(), 'FT_LOCATION', '{"placeholder": "Enter location", "allowCurrentLocation": true, "radius": 1000}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_2' AND field_order = 1)),
    (gen_random_uuid(), 'FT_DATE', '{"placeholder": "Select incident date", "minDate": "2020-01-01", "maxDate": "2025-12-31", "format": "YYYY-MM-DD"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_2' AND field_order = 2)),
    (gen_random_uuid(), 'FT_TIME', '{"placeholder": "Select incident time", "format": "24h", "interval": 15}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_2' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_2' AND field_order = 4)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter contaminated area", "min": 0, "max": 1000000, "step": 1, "unit": "m²"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_2' AND field_order = 5)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select soil type", "options": [{"label": "Clay", "value": "clay"}, {"label": "Silt", "value": "silt"}, {"label": "Sand", "value": "sand"}, {"label": "Loam", "value": "loam"}, {"label": "Other", "value": "other"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_2' AND field_order = 6)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select contamination level", "options": [{"label": "Low", "value": "low"}, {"label": "Medium", "value": "medium"}, {"label": "High", "value": "high"}, {"label": "Very High", "value": "very_high"}]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_land_oil_spill_2' AND field_order = 7));

-- Insert a "submitted" log for each report
INSERT INTO public.report_log (log_id, created_at, report_id, event_type, event_description, created_by)
SELECT
    gen_random_uuid(),
    submission_date,
    report_id,
    'submitted',
    'Report submitted',
    auth_user_id
FROM public.report;

-- Insert a "status_updated" log for reports that are not 'Pending'
INSERT INTO public.report_log (log_id, created_at, report_id, event_type, event_description, created_by)
SELECT
    gen_random_uuid(),
    submission_date + INTERVAL '1 day',
    report_id,
    'status_updated',
    'Status changed to ' || report_status,
    auth_user_id
FROM public.report
WHERE report_status <> 'Pending';

-- Insert a "feedback_added" log for each feedback
INSERT INTO public.report_log (log_id, created_at, report_id, event_type, event_description, created_by)
SELECT
    gen_random_uuid(),
    f.created_at,
    f.report_id,
    'feedback_added',
    'Feedback added: ' || f.feedback_text,
    f.auth_user_id
FROM public.feedback f;
