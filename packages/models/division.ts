import { FormTemplate } from "./form";

export interface Division {
  division_id: string;
  division_name: string;
  pollution_types?: PollutionType[];
}

export interface PollutionType {
  pollution_type_id: string;
  division_id: string;
  pollution_type_name: string;
  pollution_type_description: string;
  division?: Division;
  form_templates?: FormTemplate[];
}