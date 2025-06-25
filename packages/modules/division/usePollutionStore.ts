import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PollutionType } from "models";
import { supabase } from "services";

interface PollutionState {
  pollutionTypes: PollutionType[] | null;
  isLoading: boolean;
  error: Error | null;
  fetchPollutions: (division_id: string) => Promise<void>;
  fetchAllPollutions: () => Promise<void>;
}

export const usePollutionStore = create<PollutionState>()(
  persist(
    (set) => ({
      pollutionTypes: null,
      isLoading: false,
      error: null,
      fetchPollutions: async (division_id: string) => {
        if (!division_id) return;

        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase.functions.invoke(
            `fetch-pollutions?division_id=${division_id}`,
            { method: "GET" }
          );

          if (error) throw error;

          set({
            pollutionTypes: data as PollutionType[],
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err as Error,
            isLoading: false,
          });
        }
      },
      fetchAllPollutions: async () => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase.functions.invoke(
            `fetch-all-pollutions`,
            { method: "GET" }
          );

          if (error) throw error;

          set({
            pollutionTypes: data as PollutionType[],
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err as Error,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "pollution-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pollutionTypes: state.pollutionTypes,
      }),
    }
  )
);
