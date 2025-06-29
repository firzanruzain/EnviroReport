import { useEffect, useState } from "react";
import { supabase } from "services";
import { FunctionsHttpError, Session } from "@supabase/supabase-js";

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

  const signUp = async ({
    name,
    email,
    password,
    identityCard,
    user_type,
    isStaff = false,
    division_id = null,
    phone_number = null,
    address = null,
    profile_pic = null,
  }: {
    name: string;
    email: string;
    password: string;
    identityCard: string;
    user_type: string;
    isStaff?: boolean;
    division_id?: string | null;
    phone_number?: string | null;
    address?: string | null;
    profile_pic?: string | null;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("sign-up", {
        body: {
          name,
          email,
          password,
          identityCard,
          user_type,
          isStaff,
          division_id,
          phone_number,
          address,
          profile_pic,
        },
        method: "POST",
      });
      if (error) {
        if (error instanceof FunctionsHttpError) {
          // The Edge Function returned an HTTP error
          const errorMessage = await error.context.json(); // Or .text() if not JSON
          throw new Error(errorMessage.error);
        } else throw Error(error);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Sign up failed"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { session, loading, error, signUp };
}
