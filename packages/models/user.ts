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
