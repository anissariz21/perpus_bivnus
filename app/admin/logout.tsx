import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

export default function LogoutScreen() {
  useEffect(() => {
    supabase.auth.signOut().then(() => {
      router.replace("/(auth)/login");
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}
