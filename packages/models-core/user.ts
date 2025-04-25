import  supabase  from "../utils/supabase";

type UserRole = "Public User" | "Staff" | "Admin";
type AccountStatus = "Pending" | "Verified" | "Rejected";

export interface User {
  auth_user_id: string;
  user_type: UserRole;
  division_id?: string | null;
  status: AccountStatus;
  created_at: string;
  profile?: Profile;
  division?: Division;
}

export interface Profile {
  auth_user_id: string;
  name: string;
  identity_card_num: number;
  age: number;
  phone_number?: string | null;
  address?: string | null;
  profile_pic?: string | null;
}

interface Division {
  division_id: string;
  division_name: string;
}

export const UserModel = {
  getCurrent: async (): Promise<User | null> => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data, error } = await supabase
      .from("user_account")
      .select(
        `
      *,
      profile:profile_details(*),
      division:division_id(*)
    `
      )
      .eq("auth_user_id", authUser.id)
      .single();

    if (error) {
      console.error("User fetch error:", error);
      return null;
    }

    return {
      ...data,
      profile: data.profile,
      division: data.division,
    };
  },

  getById: async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from("user_account")
      .select("*, profile:profile_details(*), division:division_id(*)")
      .eq("auth_user_id", userId)
      .single();
    if (error) console.error("User fetch error:", error);
    return data;
  },

  update: async (
    userId: string,
    updates: Partial<User>
  ): Promise<User | null> => {
    const { data, error } = await supabase
      .from("user_account")
      .update(updates)
      .eq("auth_user_id", userId)
      .select("*, profile:profile_details(*)")
      .single();
    if (error) console.error("User update error:", error);
    return data;
  },

  upsertProfile: async (profile: Profile): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profile_details")
      .upsert(profile)
      .select()
      .single();
    if (error) console.error("Profile update error:", error);
    return data;
  },

  listStaff: async (divisionId?: string): Promise<User[]> => {
    let query = supabase
      .from("user_account")
      .select("*, profile:profile_details(*)")
      .eq("user_type", "Staff");

    if (divisionId) query = query.eq("division_id", divisionId);

    const { data, error } = await query;
    if (error) console.error("Staff list error:", error);
    return data || [];
  },
};
