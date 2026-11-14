import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    books: 0,
    members: 0,
    loans: 0,
    pending: 0,
  });
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    const { count: bookCount } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true });
    const { count: memberCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "siswa");
    const { count: loanCount } = await supabase
      .from("loans")
      .select("*", { count: "exact", head: true })
      .eq("status", "dipinjam");
    const { count: pendingCount } = await supabase
      .from("loans")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    setStats({
      books: bookCount || 0,
      members: memberCount || 0,
      loans: loanCount || 0,
      pending: pendingCount || 0,
    });

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
      fetchDashboardData();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
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
        <View style={styles.card}>
          <Text style={styles.greeting}>Halo, Admin! 👋</Text>
          <Text style={styles.subGreeting}>
            Berikut adalah ringkasan data perpus hari ini.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/admin/books")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: "#e0f2fe" }]}>
              <Ionicons name="book" size={24} color="#0284c7" />
            </View>
            <Text style={styles.statNumber}>{stats.books}</Text>
            <Text style={styles.statLabel}>Total Buku</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/admin/users")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: "#dcfce7" }]}>
              <Ionicons name="people" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statNumber}>{stats.members}</Text>
            <Text style={styles.statLabel}>Anggota</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/admin/loans")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: "#fef3c7" }]}>
              <Ionicons name="swap-horizontal" size={24} color="#d97706" />
            </View>
            <Text style={styles.statNumber}>{stats.loans}</Text>
            <Text style={styles.statLabel}>Sedang Dipinjam</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/admin/loans")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: "#fee2e2" }]}>
              <Ionicons name="time" size={24} color="#dc2626" />
            </View>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Menunggu ACC</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Anggota Perpus</Text>
          <TouchableOpacity onPress={() => router.push("/admin/users")}>
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
            recentMembers.map((member, index) => (
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
  container: { flex: 1, backgroundColor: "#f9fafb", paddingTop: 10 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subGreeting: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    gap: 15,
  },
  statCard: {
    backgroundColor: "#fff",
    width: "47%",
    padding: 15,
    borderRadius: 12,
    alignItems: "flex-start",
    elevation: 2,
    marginBottom: 15,
  },
  iconWrapper: { padding: 10, borderRadius: 8, marginBottom: 10 },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  seeAllText: { fontSize: 14, color: "#43B3AE", fontWeight: "600" },
  memberListContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
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
