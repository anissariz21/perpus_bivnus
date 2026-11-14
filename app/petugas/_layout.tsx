import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function PetugasLayout() {
  const handleLogout = () => {
    Alert.alert("Logout", "Keluar dari aplikasi?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya",
        onPress: () => supabase.auth.signOut(),
        style: "destructive",
      },
    ]);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#43B3AE",
        headerShown: true,
        headerStyle: { backgroundColor: "#43B3AE" },
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Image
              source={require("../../assets/images/logo-sekolah.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerText}>Perpus Bivnus</Text>
          </View>
        ),
        headerTitleAlign: "left",
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }: any) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="katalog"
        options={{
          title: "Katalog",
          tabBarIcon: ({ color }: any) => (
            <Ionicons name="book" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="loans"
        options={{
          title: "Peminjaman",
          tabBarIcon: ({ color }: any) => (
            <Ionicons name="swap-horizontal" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="users"
        options={{
          title: "Anggota",
          tabBarIcon: ({ color }: any) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="logout"
        options={{
          title: "Keluar",
          tabBarIcon: () => (
            <Ionicons name="log-out" size={24} color="#dc2626" />
          ),
          tabBarButton: (props: any) => (
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 5,
              }}
              onPress={handleLogout}
            >
              {props.children}
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: { flexDirection: "row", alignItems: "center" },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});
