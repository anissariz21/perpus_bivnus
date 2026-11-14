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

export default function SiswaLayout() {
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

        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={() =>
              Alert.alert("Logout", "Keluar dari aplikasi?", [
                { text: "Batal", style: "cancel" },
                {
                  text: "Ya",
                  onPress: () => supabase.auth.signOut(),
                  style: "destructive",
                },
              ])
            }
          >
            <Ionicons name="log-out-outline" size={26} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
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
          title: "Pinjaman",
          tabBarIcon: ({ color }: any) => (
            <Ionicons name="time" size={24} color={color} />
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
