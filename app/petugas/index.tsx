import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";

export default function PetugasDashboard() {
  const [stats, setStats] = useState({ pending: 0, active: 0 });
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const { count: pendingCount } = await supabase
      .from("loans")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    const { count: activeCount } = await supabase
      .from("loans")
      .select("*", { count: "exact", head: true })
      .eq("status", "dipinjam");

    setStats({ pending: pendingCount || 0, active: activeCount || 0 });

    const { data: membersData } = await supabase
      .from("profiles")
      .select("id, full_name, kelas, nis")
      .eq("role", "siswa")
      .order("created_at", { ascending: false })
      .limit(5);

    if (membersData) setRecentMembers(membersData);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#43B3AE"]}
          />
        }
      >
        <Text style={styles.greeting}>Halo, Petugas Perpus! 👋</Text>
        <Text style={styles.subGreeting}>
          Berikut ringkasan aktivitas perpus hari ini.
        </Text>

        <View style={styles.cardRow}>
          <View style={[styles.card, { borderLeftColor: "#f59e0b" }]}>
            <Ionicons name="time" size={30} color="#f59e0b" />
            <Text style={styles.cardNumber}>{stats.pending}</Text>
            <Text style={styles.cardLabel}>Menunggu Persetujuan</Text>
          </View>

          <View style={[styles.card, { borderLeftColor: "#10b981" }]}>
            <Ionicons name="book" size={30} color="#10b981" />
            <Text style={styles.cardNumber}>{stats.active}</Text>
            <Text style={styles.cardLabel}>Sedang Dipinjam</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Anggota Perpus</Text>
          <TouchableOpacity onPress={() => router.push("/petugas/users")}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.memberListContainer}>
          {recentMembers.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                color: "#6b7280",
                marginVertical: 20,
              }}
            >
              Belum ada data anggota.
            </Text>
          ) : (
            recentMembers.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {member.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.full_name}</Text>
                  <Text style={styles.memberDetail}>
                    NIS: {member.nis || "-"} | Kelas: {member.kelas || "-"}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafb" },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  subGreeting: { fontSize: 14, color: "#6b7280", marginBottom: 25 },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 5,
    elevation: 2,
    alignItems: "center",
  },
  cardNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 10,
  },
  cardLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  seeAllText: { fontSize: 14, color: "#43B3AE", fontWeight: "600" },

  memberListContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    elevation: 1,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: "bold", color: "#0284c7" },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: "bold", color: "#1f2937" },
  memberDetail: { fontSize: 12, color: "#6b7280", marginTop: 2 },
});
