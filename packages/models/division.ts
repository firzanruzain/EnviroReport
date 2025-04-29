import supabase from "../utils/supabase";
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

export const DivisionModel = {
  listAll: async (): Promise<Division[]> => {
    const { data, error } = await supabase
      .from("division")
      .select("*, pollution_types:pollution_type(*)");
    if (error) console.error("Division list error:", error);
    return data || [];
  },

  getPollutionType: async (id: string): Promise<PollutionType | null> => {
    const { data, error } = await supabase
      .from("pollution_type")
      .select("*, division:division_id(*)")
      .eq("pollution_type_id", id)
      .single();
    if (error) console.error("Pollution type fetch error:", error);
    return data;
  },

  listPollutionTypes: async (divisionId?: string): Promise<PollutionType[]> => {
    let query = supabase
      .from("pollution_type")
      .select("*, division:division_id(*)");
    if (divisionId) query = query.eq("division_id", divisionId);
    const { data, error } = await query;
    if (error) console.error("Pollution types list error:", error);
    return data || [];
  },
};
