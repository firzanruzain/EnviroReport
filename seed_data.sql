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

ALTER TABLE public.form_field_type 
  ALTER COLUMN field_type TYPE text;

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
    ('DIV_WATER_MARINE', 'Water and Marine Division'),
    ('DIV_AIR', 'Air Division'),
    ('DIV_HAZMAT', 'Hazardous Materials Division');

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
INSERT INTO public.form_field_type (field_type_id, field_type, configuration_schema) VALUES
('FT_TEXT', 'text', '{
  "type": "object",
  "description": "A single-line text input field for short text entries like names, locations, or identifiers",
  "properties": {
    "placeholder": {
      "type": "string",
      "description": "Placeholder text for the input field"
    },
    "required": {
      "type": "boolean",
      "description": "Whether the field is required"
    },
    "minLength": {
      "type": "number",
      "description": "Minimum length of the text"
    },
    "maxLength": {
      "type": "number",
      "description": "Maximum length of the text"
    },
    "pattern": {
      "type": "string",
      "description": "Regex pattern for validation"
    }
  }
}'),
('FT_TEXTAREA', 'textarea', '{
  "type": "object",
  "description": "A multi-line text input field for longer text entries like descriptions, comments, or detailed observations",
  "properties": {
    "placeholder": {
      "type": "string",
      "description": "Placeholder text for the textarea"
    },
    "required": {
      "type": "boolean",
      "description": "Whether the field is required"
    },
    "minLength": {
      "type": "number",
      "description": "Minimum length of the text"
    },
    "maxLength": {
      "type": "number",
      "description": "Maximum length of the text"
    },
    "rows": {
      "type": "number",
      "description": "Number of visible rows"
    }
  }
}'),
('FT_NUMBER', 'number', '{
  "type": "object",
  "description": "A numeric input field for quantitative measurements, counts, or ratings with optional unit specifications",
  "properties": {
    "placeholder": {
      "type": "string",
      "description": "Placeholder text for the number input"
    },
    "required": {
      "type": "boolean",
      "description": "Whether the field is required"
    },
    "min": {
      "type": "number",
      "description": "Minimum allowed value"
    },
    "max": {
      "type": "number",
      "description": "Maximum allowed value"
    },
    "step": {
      "type": "number",
      "description": "Step increment for the number input"
    },
    "unit": {
      "type": "string",
      "description": "Unit of measurement (e.g., kg, L, etc.)"
    }
  }
}'),
('FT_SELECT', 'select', '{
  "type": "object",
  "description": "A dropdown selection field for choosing from predefined options, supporting single or multiple selections",
  "properties": {
    "placeholder": {
      "type": "string",
      "description": "Placeholder text for the select input"
    },
    "required": {
      "type": "boolean",
      "description": "Whether the field is required"
    },
    "options": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of options for the select input"
    },
    "multiple": {
      "type": "boolean",
      "description": "Whether multiple selections are allowed"
    }
  }
}'),
('FT_DECIBEL', 'decibel', '{
  "type": "object",
  "description": "A specialized number input field for noise level measurements in decibels (dB), with predefined ranges for environmental noise monitoring",
  "properties": {
    "placeholder": {
      "type": "string",
      "description": "Placeholder text for the decibel input"
    },
    "required": {
      "type": "boolean",
      "description": "Whether the field is required"
    },
    "min": {
      "type": "number",
      "description": "Minimum allowed decibel value"
    },
    "max": {
      "type": "number",
      "description": "Maximum allowed decibel value"
    },
    "unit": {
      "type": "string",
      "description": "Unit of measurement (dB)"
    }
  }
}'),
('FT_VIBRATION', 'vibration', '{
  "type": "object",
  "description": "A specialized number input field for vibration measurements in Hertz (Hz), with predefined ranges for environmental vibration monitoring",
  "properties": {
    "placeholder": {
      "type": "string",
      "description": "Placeholder text for the vibration input"
    },
    "required": {
      "type": "boolean",
      "description": "Whether the field is required"
    },
    "min": {
      "type": "number",
      "description": "Minimum allowed vibration value"
    },
    "max": {
      "type": "number",
      "description": "Maximum allowed vibration value"
    },
    "unit": {
      "type": "string",
      "description": "Unit of measurement (Hz)"
    }
  }
}');

-- Insert Form Templates
INSERT INTO public.form_template (form_template_id, form_name, description, pollution_type_id, status) VALUES
    ('FT_WATER', 'Water Pollution Report', 'Form for reporting water pollution incidents', 'PT_WATER', 'Active'),
    ('FT_MARINE', 'Marine Oil Spill Report', 'Form for reporting marine oil spill incidents', 'PT_MARINE', 'Active'),
    ('FT_AIR', 'Air Pollution Report', 'Form for reporting air pollution incidents', 'PT_AIR', 'Active'),
    ('FT_WASTE', 'Scheduled Waste Report', 'Form for reporting scheduled waste incidents', 'PT_WASTE', 'Active'),
    ('FT_NOISE', 'Noise Pollution Report', 'Form for reporting noise pollution incidents', 'PT_NOISE', 'Active'),
    ('FT_VIB', 'Vibration Report', 'Form for reporting vibration incidents', 'PT_VIB', 'Active'),
    ('FT_OIL', 'Land Oil Spill Report', 'Form for reporting land oil spill incidents', 'PT_OIL', 'Active');

-- Insert Form Fields
INSERT INTO public.form_field (form_field_id, form_template_id, field_type_id, field_label, is_required, field_order) VALUES
    -- Water Pollution Form Fields (5 fields)
    (gen_random_uuid(), 'FT_WATER', 'FT_TEXT', 'Location', true, 1),
    (gen_random_uuid(), 'FT_WATER', 'FT_TEXTAREA', 'Description', true, 2),
    (gen_random_uuid(), 'FT_WATER', 'FT_NUMBER', 'Severity Level', true, 3),
    (gen_random_uuid(), 'FT_WATER', 'FT_TEXT', 'Water Source', true, 4),
    (gen_random_uuid(), 'FT_WATER', 'FT_SELECT', 'Pollution Category', true, 5),

    -- Marine Oil Spill Form Fields (3 fields - unchanged)
    (gen_random_uuid(), 'FT_MARINE', 'FT_TEXT', 'Location', true, 1),
    (gen_random_uuid(), 'FT_MARINE', 'FT_TEXTAREA', 'Description', true, 2),
    (gen_random_uuid(), 'FT_MARINE', 'FT_NUMBER', 'Estimated Volume', true, 3),

    -- Air Pollution Form Fields (4 fields)
    (gen_random_uuid(), 'FT_AIR', 'FT_TEXT', 'Location', true, 1),
    (gen_random_uuid(), 'FT_AIR', 'FT_TEXTAREA', 'Description', true, 2),
    (gen_random_uuid(), 'FT_AIR', 'FT_SELECT', 'Emission Type', true, 3),
    (gen_random_uuid(), 'FT_AIR', 'FT_NUMBER', 'Air Quality Index', true, 4),

    -- Scheduled Waste Form Fields (4 fields)
    (gen_random_uuid(), 'FT_WASTE', 'FT_TEXT', 'Location', true, 1),
    (gen_random_uuid(), 'FT_WASTE', 'FT_TEXTAREA', 'Description', true, 2),
    (gen_random_uuid(), 'FT_WASTE', 'FT_SELECT', 'Waste Category', true, 3),
    (gen_random_uuid(), 'FT_WASTE', 'FT_NUMBER', 'Estimated Weight', true, 4),

    -- Noise Pollution Form Fields (3 fields - unchanged)
    (gen_random_uuid(), 'FT_NOISE', 'FT_TEXT', 'Location', true, 1),
    (gen_random_uuid(), 'FT_NOISE', 'FT_TEXTAREA', 'Description', true, 2),
    (gen_random_uuid(), 'FT_NOISE', 'FT_DECIBEL', 'Noise Level', true, 3),

    -- Vibration Form Fields (4 fields)
    (gen_random_uuid(), 'FT_VIB', 'FT_TEXT', 'Location', true, 1),
    (gen_random_uuid(), 'FT_VIB', 'FT_TEXTAREA', 'Description', true, 2),
    (gen_random_uuid(), 'FT_VIB', 'FT_VIBRATION', 'Vibration Level', true, 3),
    (gen_random_uuid(), 'FT_VIB', 'FT_SELECT', 'Vibration Source', true, 4),

    -- Land Oil Spill Form Fields (3 fields - unchanged)
    (gen_random_uuid(), 'FT_OIL', 'FT_TEXT', 'Location', true, 1),
    (gen_random_uuid(), 'FT_OIL', 'FT_TEXTAREA', 'Description', true, 2),
    (gen_random_uuid(), 'FT_OIL', 'FT_NUMBER', 'Estimated Volume', true, 3);

-- Insert Reports
INSERT INTO public.report (report_id, auth_user_id, form_template_id, submission_date, report_status, form_data) VALUES
-- Water Pollution Reports (5 fields)
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_WATER', NOW() - INTERVAL '20 days', 'Pending', '{
  "location": {"value": "Sungai Klang, Kuala Lumpur", "field_type_id": "FT_TEXT"},
  "description": {"value": "Suspected chemical waste discharge causing water discoloration", "field_type_id": "FT_TEXTAREA"},
  "severity_level": {"value": 4, "field_type_id": "FT_NUMBER"},
  "water_source": {"value": "River", "field_type_id": "FT_TEXT"},
  "pollution_category": {"value": "Chemical", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_WATER', NOW() - INTERVAL '18 days', 'In Review', '{
  "location": {"value": "Taman Tasik Titiwangsa, Kuala Lumpur", "field_type_id": "FT_TEXT"},
  "description": {"value": "Algae bloom observed in the lake, possible nutrient pollution", "field_type_id": "FT_TEXTAREA"},
  "severity_level": {"value": 3, "field_type_id": "FT_NUMBER"},
  "water_source": {"value": "Lake", "field_type_id": "FT_TEXT"},
  "pollution_category": {"value": "Biological", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_WATER', NOW() - INTERVAL '15 days', 'Closed', '{
  "location": {"value": "Sungai Gombak, Selangor", "field_type_id": "FT_TEXT"},
  "description": {"value": "Industrial waste discharge affecting water quality", "field_type_id": "FT_TEXTAREA"},
  "severity_level": {"value": 5, "field_type_id": "FT_NUMBER"},
  "water_source": {"value": "River", "field_type_id": "FT_TEXT"},
  "pollution_category": {"value": "Chemical", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_WATER', NOW() - INTERVAL '12 days', 'Pending', '{
  "location": {"value": "Sungai Langat, Selangor", "field_type_id": "FT_TEXT"},
  "description": {"value": "Suspected sewage discharge into river", "field_type_id": "FT_TEXTAREA"},
  "severity_level": {"value": 4, "field_type_id": "FT_NUMBER"},
  "water_source": {"value": "River", "field_type_id": "FT_TEXT"},
  "pollution_category": {"value": "Biological", "field_type_id": "FT_SELECT"}
}'),

-- Marine Oil Spill Reports
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_MARINE', NOW() - INTERVAL '19 days', 'In Review', '{
  "location": {"value": "Port Klang, Selangor", "field_type_id": "FT_TEXT"},
  "description": {"value": "Oil slick observed near cargo terminal", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 500, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_MARINE', NOW() - INTERVAL '16 days', 'Closed', '{
  "location": {"value": "Langkawi Island, Kedah", "field_type_id": "FT_TEXT"},
  "description": {"value": "Small oil spill from fishing vessel", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 100, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_MARINE', NOW() - INTERVAL '13 days', 'Pending', '{
  "location": {"value": "Penang Port, Penang", "field_type_id": "FT_TEXT"},
  "description": {"value": "Oil sheen observed in harbor area", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 200, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_MARINE', NOW() - INTERVAL '10 days', 'In Review', '{
  "location": {"value": "Kuantan Port, Pahang", "field_type_id": "FT_TEXT"},
  "description": {"value": "Minor oil spill from cargo ship", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 300, "field_type_id": "FT_NUMBER"}
}'),

-- Air Pollution Reports (4 fields)
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_AIR', NOW() - INTERVAL '17 days', 'Closed', '{
  "location": {"value": "Industrial Area, Shah Alam", "field_type_id": "FT_TEXT"},
  "description": {"value": "Strong chemical odor from factory", "field_type_id": "FT_TEXTAREA"},
  "emission_type": {"value": "Industrial", "field_type_id": "FT_SELECT"},
  "air_quality_index": {"value": 150, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_AIR', NOW() - INTERVAL '14 days', 'Pending', '{
  "location": {"value": "Brickfields, Kuala Lumpur", "field_type_id": "FT_TEXT"},
  "description": {"value": "Heavy smoke from construction site", "field_type_id": "FT_TEXTAREA"},
  "emission_type": {"value": "Construction", "field_type_id": "FT_SELECT"},
  "air_quality_index": {"value": 180, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_AIR', NOW() - INTERVAL '11 days', 'In Review', '{
  "location": {"value": "Petaling Jaya Industrial Zone", "field_type_id": "FT_TEXT"},
  "description": {"value": "Dust particles from manufacturing plant", "field_type_id": "FT_TEXTAREA"},
  "emission_type": {"value": "Industrial", "field_type_id": "FT_SELECT"},
  "air_quality_index": {"value": 120, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_AIR', NOW() - INTERVAL '8 days', 'Closed', '{
  "location": {"value": "Klang Valley Industrial Park", "field_type_id": "FT_TEXT"},
  "description": {"value": "Unusual odor from chemical plant", "field_type_id": "FT_TEXTAREA"},
  "emission_type": {"value": "Industrial", "field_type_id": "FT_SELECT"},
  "air_quality_index": {"value": 200, "field_type_id": "FT_NUMBER"}
}'),

-- Scheduled Waste Reports (4 fields)
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_WASTE', NOW() - INTERVAL '15 days', 'Pending', '{
  "location": {"value": "Kajang Industrial Estate", "field_type_id": "FT_TEXT"},
  "description": {"value": "Illegal dumping of electronic waste", "field_type_id": "FT_TEXTAREA"},
  "waste_category": {"value": "Electronic", "field_type_id": "FT_SELECT"},
  "estimated_weight": {"value": 250.5, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_WASTE', NOW() - INTERVAL '12 days', 'In Review', '{
  "location": {"value": "Hospital Area, Kuala Lumpur", "field_type_id": "FT_TEXT"},
  "description": {"value": "Improper disposal of medical waste", "field_type_id": "FT_TEXTAREA"},
  "waste_category": {"value": "Medical", "field_type_id": "FT_SELECT"},
  "estimated_weight": {"value": 75.2, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_WASTE', NOW() - INTERVAL '9 days', 'Closed', '{
  "location": {"value": "Chemical Plant, Pasir Gudang", "field_type_id": "FT_TEXT"},
  "description": {"value": "Hazardous chemical waste storage issue", "field_type_id": "FT_TEXTAREA"},
  "waste_category": {"value": "Chemical", "field_type_id": "FT_SELECT"},
  "estimated_weight": {"value": 500.0, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_WASTE', NOW() - INTERVAL '6 days', 'Pending', '{
  "location": {"value": "Industrial Zone, Ipoh", "field_type_id": "FT_TEXT"},
  "description": {"value": "Suspected hazardous waste dumping", "field_type_id": "FT_TEXTAREA"},
  "waste_category": {"value": "Hazardous", "field_type_id": "FT_SELECT"},
  "estimated_weight": {"value": 150.8, "field_type_id": "FT_NUMBER"}
}'),

-- Noise Pollution Reports
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_NOISE', NOW() - INTERVAL '13 days', 'In Review', '{
  "location": {"value": "Construction Site, Bangsar", "field_type_id": "FT_TEXT"},
  "description": {"value": "Excessive noise from construction equipment", "field_type_id": "FT_TEXTAREA"},
  "noise_level": {"value": 85, "field_type_id": "FT_DECIBEL"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_NOISE', NOW() - INTERVAL '10 days', 'Closed', '{
  "location": {"value": "Night Market, Petaling Jaya", "field_type_id": "FT_TEXT"},
  "description": {"value": "Loud music from entertainment venues", "field_type_id": "FT_TEXTAREA"},
  "noise_level": {"value": 90, "field_type_id": "FT_DECIBEL"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_NOISE', NOW() - INTERVAL '7 days', 'Pending', '{
  "location": {"value": "Industrial Area, Subang Jaya", "field_type_id": "FT_TEXT"},
  "description": {"value": "Factory machinery noise exceeding limits", "field_type_id": "FT_TEXTAREA"},
  "noise_level": {"value": 95, "field_type_id": "FT_DECIBEL"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_NOISE', NOW() - INTERVAL '4 days', 'In Review', '{
  "location": {"value": "Residential Area, Cheras", "field_type_id": "FT_TEXT"},
  "description": {"value": "Noise from air conditioning units", "field_type_id": "FT_TEXTAREA"},
  "noise_level": {"value": 75, "field_type_id": "FT_DECIBEL"}
}'),

-- Vibration Reports (4 fields)
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_VIB', NOW() - INTERVAL '11 days', 'Closed', '{
  "location": {"value": "Construction Site, Damansara", "field_type_id": "FT_TEXT"},
  "description": {"value": "Heavy machinery causing ground vibration", "field_type_id": "FT_TEXTAREA"},
  "vibration_level": {"value": 45, "field_type_id": "FT_VIBRATION"},
  "vibration_source": {"value": "Construction", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_VIB', NOW() - INTERVAL '8 days', 'Pending', '{
  "location": {"value": "Industrial Zone, Puchong", "field_type_id": "FT_TEXT"},
  "description": {"value": "Factory equipment causing structural vibration", "field_type_id": "FT_TEXTAREA"},
  "vibration_level": {"value": 35, "field_type_id": "FT_VIBRATION"},
  "vibration_source": {"value": "Industrial", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_VIB', NOW() - INTERVAL '5 days', 'In Review', '{
  "location": {"value": "Mining Area, Rawang", "field_type_id": "FT_TEXT"},
  "description": {"value": "Blasting operations causing ground vibration", "field_type_id": "FT_TEXTAREA"},
  "vibration_level": {"value": 50, "field_type_id": "FT_VIBRATION"},
  "vibration_source": {"value": "Industrial", "field_type_id": "FT_SELECT"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_VIB', NOW() - INTERVAL '2 days', 'Closed', '{
  "location": {"value": "Construction Site, Mont Kiara", "field_type_id": "FT_TEXT"},
  "description": {"value": "Pile driving causing excessive vibration", "field_type_id": "FT_TEXTAREA"},
  "vibration_level": {"value": 40, "field_type_id": "FT_VIBRATION"},
  "vibration_source": {"value": "Construction", "field_type_id": "FT_SELECT"}
}'),

-- Land Oil Spill Reports
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_OIL', NOW() - INTERVAL '9 days', 'Pending', '{
  "location": {"value": "Industrial Park, Shah Alam", "field_type_id": "FT_TEXT"},
  "description": {"value": "Oil spill from storage tank", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 200, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), 'b2ab83ee-4750-4f27-9e99-da86b7b2b783', 'FT_OIL', NOW() - INTERVAL '6 days', 'In Review', '{
  "location": {"value": "Factory Area, Klang", "field_type_id": "FT_TEXT"},
  "description": {"value": "Hydraulic oil leak from machinery", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 50, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_OIL', NOW() - INTERVAL '3 days', 'Closed', '{
  "location": {"value": "Workshop Area, Petaling Jaya", "field_type_id": "FT_TEXT"},
  "description": {"value": "Engine oil spill in workshop", "field_type_id": "FT_TEXTAREA"},
  "estimated_volume": {"value": 30, "field_type_id": "FT_NUMBER"}
}'),
(uuid_generate_v4(), '25c9824a-9c8c-40d0-9efe-35a84372ab14', 'FT_OIL', NOW() - INTERVAL '1 day', 'Pending', '{
  "location": {"value": "Service Station, Subang Jaya", "field_type_id": "FT_TEXT"},
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
    (gen_random_uuid(), 'FT_TEXT', '{"placeholder": "Enter location", "required": true, "minLength": 5, "maxLength": 100}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_WATER' AND field_order = 1)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "required": true, "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_WATER' AND field_order = 2)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter severity level (1-5)", "required": true, "min": 1, "max": 5, "step": 1}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_WATER' AND field_order = 3)),
    (gen_random_uuid(), 'FT_TEXT', '{"placeholder": "Enter water source", "required": true, "minLength": 3, "maxLength": 50}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_WATER' AND field_order = 4)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select pollution category", "required": true, "options": ["Chemical", "Biological", "Physical", "Thermal"]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_WATER' AND field_order = 5)),

    -- Marine Oil Spill Form Fields Configurations
    (gen_random_uuid(), 'FT_TEXT', '{"placeholder": "Enter location", "required": true, "minLength": 5, "maxLength": 100}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_MARINE' AND field_order = 1)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "required": true, "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_MARINE' AND field_order = 2)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter estimated volume in liters", "required": true, "min": 0, "max": 1000000, "step": 100}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_MARINE' AND field_order = 3)),

    -- Air Pollution Form Fields Configurations
    (gen_random_uuid(), 'FT_TEXT', '{"placeholder": "Enter location", "required": true, "minLength": 5, "maxLength": 100}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_AIR' AND field_order = 1)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "required": true, "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_AIR' AND field_order = 2)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select emission type", "required": true, "options": ["Industrial", "Vehicle", "Construction", "Other"]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_AIR' AND field_order = 3)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter AQI (0-500)", "required": true, "min": 0, "max": 500, "step": 1}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_AIR' AND field_order = 4)),

    -- Scheduled Waste Form Fields Configurations
    (gen_random_uuid(), 'FT_TEXT', '{"placeholder": "Enter location", "required": true, "minLength": 5, "maxLength": 100}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_WASTE' AND field_order = 1)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "required": true, "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_WASTE' AND field_order = 2)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select waste category", "required": true, "options": ["Chemical", "Biological", "Radioactive", "Other"]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_WASTE' AND field_order = 3)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter weight in kg", "required": true, "min": 0, "max": 10000, "step": 0.1}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_WASTE' AND field_order = 4)),

    -- Noise Pollution Form Fields Configurations
    (gen_random_uuid(), 'FT_TEXT', '{"placeholder": "Enter location", "required": true, "minLength": 5, "maxLength": 100}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_NOISE' AND field_order = 1)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "required": true, "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_NOISE' AND field_order = 2)),
    (gen_random_uuid(), 'FT_DECIBEL', '{"placeholder": "Enter noise level in dB", "required": true, "min": 0, "max": 150, "unit": "dB"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_NOISE' AND field_order = 3)),

    -- Vibration Form Fields Configurations
    (gen_random_uuid(), 'FT_TEXT', '{"placeholder": "Enter location", "required": true, "minLength": 5, "maxLength": 100}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_VIB' AND field_order = 1)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "required": true, "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_VIB' AND field_order = 2)),
    (gen_random_uuid(), 'FT_VIBRATION', '{"placeholder": "Enter vibration level in Hz", "required": true, "min": 0, "max": 100, "unit": "Hz"}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_VIB' AND field_order = 3)),
    (gen_random_uuid(), 'FT_SELECT', '{"placeholder": "Select vibration source", "required": true, "options": ["Construction", "Industrial", "Transportation", "Other"]}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_VIB' AND field_order = 4)),

    -- Land Oil Spill Form Fields Configurations
    (gen_random_uuid(), 'FT_TEXT', '{"placeholder": "Enter location", "required": true, "minLength": 5, "maxLength": 100}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_OIL' AND field_order = 1)),
    (gen_random_uuid(), 'FT_TEXTAREA', '{"placeholder": "Describe the incident", "required": true, "minLength": 10, "maxLength": 500, "rows": 4}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_OIL' AND field_order = 2)),
    (gen_random_uuid(), 'FT_NUMBER', '{"placeholder": "Enter estimated volume in liters", "required": true, "min": 0, "max": 1000000, "step": 100}', 
        (SELECT form_field_id FROM public.form_field WHERE form_template_id = 'FT_OIL' AND field_order = 3));

