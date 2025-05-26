import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "services";
import { User } from "models/user";

type UserStoreState = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  fetchUser: () => Promise<void>;
  getUserName: () => string | null;
  resetUser: () => void;
};

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.functions.invoke(
            "fetch-current-user"
          );
          console.log("Fetching current user");
          if (error) throw error;
          set({ user: data });
        } catch (err) {
          set({ error: (err as Error) || "Failed to fetch user" });
        } finally {
          set({ isLoading: false });
        }
      },

      getUserName : () => {
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
      }
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