import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "services";
import { User } from "models/user";
import { Profile } from "../../models/user";

type UserStoreState = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  fetchUser: (userId: String) => Promise<void>;
  setUser: (user: User | null) => void;
  getUserName: () => string | null;
  resetUser: () => void;
  updateProfile: (profile: Profile) => Promise<Profile | null>;
};

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user: User | null) => {
        set({ user, error: null });
      },

      fetchUser: async (userId: String) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("user_account")
            .select(
              `*,
              profile:profile_details(*),
              division:division_id(*, pollution_types:pollution_type(*))`
            )
            .eq("auth_user_id", userId)
            .single();
          console.log("Fetching current user");

          if (error) {
            throw error;
          }

          if (!data) {
            set({ user: null });
            return;
          }

          set({ user: data });
        } catch (err) {
          set({
            error:
              err instanceof Error ? err : new Error("Failed to fetch user"),
          });
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      },

      getUserName: () => {
        const { user } = get();
        if (!user) return null;
        return user.profile?.name || null;
      },

      resetUser: () => {
        set({
          user: null,
          isLoading: false,
          error: null,
        });
      },

      updateProfile: async (profile) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("profile_details")
            .update(profile)
            .eq("auth_user_id", profile.auth_user_id)
            .select()
            .single();
          if (error) throw error;
          // Update local user state
          const { user } = get();
          if (user) {
            set({ user: { ...user, profile: data } });
          }
          return data;
        } catch (err) {
          console.error(err);
          set({
            error:
              err instanceof Error
                ? err
                : new Error("Failed to update profile"),
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "user-storage",
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
