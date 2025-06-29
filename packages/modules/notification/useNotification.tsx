import { useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { supabase } from "services";

interface StaffPushToken {
  auth_user_id: string;
  expo_push_token: string;
  enabled: boolean;
}

export function useNotification(auth_user_id?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 1. Check if notification is enabled (in DB)
  const checkIfNotificationEnabled = useCallback(async () => {
    if (!auth_user_id) return false;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("staff_push_tokens")
        .select("*")
        .eq("auth_user_id", auth_user_id)
        .single();
      if (error) throw error;
      return !!data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    } finally {
      setLoading(false);
    }
  }, [auth_user_id]);

  // 2. Get Expo Push Token
  const getPushToken = useCallback(async () => {
    if (!Device.isDevice) {
      throw new Error("Must use physical device for Push Notifications");
    }
    // Check permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      throw new Error("Permission denied");
    }
    // Get projectId for EAS
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }
    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;
    return token;
  }, []);

  // 3. Enable notification: check permission, get token, update DB
  const enableNotification = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!auth_user_id) throw new Error("No auth_user_id provided");
      // Get push token
      const expo_push_token = await getPushToken();
      // Upsert to staff_push_tokens
      const { error } = await supabase.from("staff_push_tokens").upsert(
        [
          {
            auth_user_id,
            expo_push_token,
            enabled: true,
          },
        ],
        { onConflict: "auth_user_id" }
      );
      if (error) throw error;
      return expo_push_token;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auth_user_id, getPushToken]);

  // 4. Disable notification: update DB to set enabled to false
  const disableNotification = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!auth_user_id) throw new Error("No auth_user_id provided");
      // Update staff_push_tokens to set enabled to false
      const { error } = await supabase
        .from("staff_push_tokens")
        .update({ enabled: false })
        .eq("auth_user_id", auth_user_id);
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auth_user_id]);

  return {
    loading,
    error,
    checkIfNotificationEnabled,
    getPushToken,
    enableNotification,
    disableNotification,
  };
}
