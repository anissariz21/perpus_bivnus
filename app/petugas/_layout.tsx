import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, Image, StyleSheet } from "react-native";

export default function AdminLayout() {
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
      {/* 1. DASHBOARD */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }: any) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 2. KATALOG */}
      <Tabs.Screen
        name="katalog"
        options={{
          title: "Katalog",
          tabBarIcon: ({ color }: any) => (
            <Ionicons name="book" size={24} color={color} />
          ),
        }}
      />

      {/* 3. PEMINJAMAN */}
      <Tabs.Screen
        name="loans"
        options={{
          title: "Peminjaman",
          tabBarIcon: ({ color }: any) => (
            <Ionicons name="swap-horizontal" size={24} color={color} />
          ),
        }}
      />

      {/* 4. LAPORAN (BARU) */}
      <Tabs.Screen
        name="reports"
        options={{
          title: "Laporan",
          tabBarIcon: ({ color }: any) => (
            <Ionicons name="document-text" size={24} color={color} />
          ),
        }}
      />

      {/* 5. USER */}
      <Tabs.Screen
        name="users"
        options={{
          title: "User",
          tabBarIcon: ({ color }: any) => (
            <Ionicons name="people" size={24} color={color} />
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
