import { useEffect, useState } from "react";
import { Stack, router, useRootNavigationState } from "expo-router";
import { supabase } from "../lib/supabase";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    async function checkRole(userId: string) {
      console.log("3. Memeriksa role untuk user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.log("4. Gagal ambil role:", error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        console.log("4. Profil tidak ditemukan di tabel profiles!");
        setLoading(false);
        return;
      }

      console.log("4. Role ditemukan:", data.role);

      if (data.role === "admin") router.replace("/admin");
      else if (data.role === "petugas") router.replace("/petugas");
      else router.replace("/siswa");

      setLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/auth/login");
        setLoading(false);
      } else {
        checkRole(session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace("/auth/login");
          setLoading(false);
        } else {
          checkRole(session.user.id);
        }
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  if (!rootNavigationState?.key || loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#43B3AE" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="petugas" />
      <Stack.Screen name="siswa" />
    </Stack>
  );
}
