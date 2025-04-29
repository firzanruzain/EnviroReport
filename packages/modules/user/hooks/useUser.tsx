import { useState, useEffect } from "react";
import { User } from "models";
import { supabase } from "@/packages/services";

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "get-current-user"
        );

        if (error) throw error;
        setUser(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading, error };
}
