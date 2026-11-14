import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";

export default function UsersPetugasScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [search]);

  async function fetchUsers() {
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("role", "siswa")
      .order("full_name");

    if (search) {
      query = query.ilike("full_name", `%${search}%`);
    }

    const { data } = await query;
    if (data) setUsers(data);
  }

  async function handleLogout() {
    Alert.alert("Logout", "Keluar dari aplikasi?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya",
        onPress: () => supabase.auth.signOut(),
        style: "destructive",
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9ca3af"
          style={{ marginLeft: 10 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama siswa..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 15 }}
        ListEmptyComponent={
          <Text
            style={{ textAlign: "center", marginTop: 20, color: "#6b7280" }}
          >
            Data siswa tidak ditemukan.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.full_name}</Text>
              <Text style={styles.detail}>
                NIS: {item.nis || "-"} | Kelas: {item.kelas || "-"}
              </Text>
              <Text style={styles.detail}>Email: {item.email}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons
              name="log-out"
              size={20}
              color="#dc2626"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{ color: "#dc2626", fontWeight: "bold", fontSize: 14 }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: { flex: 1, padding: 12, fontSize: 14 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { fontSize: 20, fontWeight: "bold", color: "#0284c7" },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#1f2937", marginBottom: 4 },
  detail: { fontSize: 12, color: "#6b7280", marginBottom: 2 },

  logoutBtn: {
    backgroundColor: "#fee2e2",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
});
