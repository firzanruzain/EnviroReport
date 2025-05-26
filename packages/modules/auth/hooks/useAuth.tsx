import { useEffect, useState } from "react";
import { supabase } from "services";
import { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let authListener: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // 1. Check existing session
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        setSession(initialSession);

        // 2. Set up real-time listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth event:", event);
          setSession(newSession);

          // Handle specific events
          if (event === "TOKEN_REFRESHED") {
            // Optional: refresh local data
          }
        });

        authListener = subscription;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Auth failed"));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  return { session, loading, error };
}
