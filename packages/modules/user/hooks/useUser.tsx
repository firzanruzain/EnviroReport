import { useState, useEffect } from "react";
import { User } from "models";
import { supabase } from "services";

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      console.log("Fetching user data...");
      try {
        const { data, error } = await supabase.functions.invoke(
          "fetch-current-user"
        );
        console.log("User data:", data);
        if (error) throw error;

        setUser(data as User);
      } catch (err: any) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading, error };
}
