import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rngfbnqenckjadmsqnxh.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZ2ZibnFlbmNramFkbXNxbnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MjAwOTYsImV4cCI6MjA2MDE5NjA5Nn0.b6JIXrinbwh-2iGHEQF0aphYXRHYOmvc4-tPpUHYR5M";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
