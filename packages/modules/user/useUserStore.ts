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
  setUser: (user: User | null) => void;
  getUserName: () => string | null;
  resetUser: () => void;
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

      fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.functions.invoke(
            "fetch-current-user"
          );
          console.log("Fetching current user");

          if (error) {
            const errorContext = error?.context;
            const errorMessage = `Error ${errorContext.status}: ${
              errorContext.statusText || "Unauthorized"
            }`;
            throw new Error(errorMessage);
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
