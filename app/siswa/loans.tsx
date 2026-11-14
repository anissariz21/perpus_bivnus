import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

export default function SiswaLoansScreen() {
  const [loans, setLoans] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLoans = async () => {
    const { data } = await supabase
      .from("loans")
      .select("*, books(title, cover_url, author)")
      .order("borrowed_at", { ascending: false });
    if (data) setLoans(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchLoans();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLoans();
    setRefreshing(false);
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const hitungHariTerlambat = (due_date: string, returned_at: string) => {
    if (!returned_at) return 0;
    const due = new Date(due_date);
    const ret = new Date(returned_at);
    const diffTime = Math.max(0, ret.getTime() - due.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <FlatList
        data={loans}
        keyExtractor={(i) => i.id.toString()}
        contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Ionicons name="book-outline" size={60} color="#d1d5db" />
            <Text
              style={{
                textAlign: "center",
                marginTop: 15,
                color: "#6b7280",
                fontSize: 16,
              }}
            >
              Belum ada riwayat peminjaman.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const hariTerlambat = hitungHariTerlambat(
            item.due_date,
            item.returned_at,
          );

          return (
            <View style={styles.card}>
              {item.books.cover_url ? (
                <Image
                  source={{ uri: item.books.cover_url }}
                  style={styles.cover}
                />
              ) : (
                <View style={[styles.cover, styles.noCover]}>
                  <Text>No Cover</Text>
                </View>
              )}

              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.books.title}
                </Text>
                <Text style={styles.author}>{item.books.author}</Text>

                {/* STATUS BADGE */}
                <View style={styles.statusRow}>
                  {item.status === "pending" && (
                    <View
                      style={[styles.badge, { backgroundColor: "#fef3c7" }]}
                    >
                      <Text style={[styles.badgeText, { color: "#d97706" }]}>
                        Menunggu Persetujuan
                      </Text>
                    </View>
                  )}
                  {item.status === "dipinjam" && (
                    <View
                      style={[styles.badge, { backgroundColor: "#e0f2fe" }]}
                    >
                      <Text style={[styles.badgeText, { color: "#0284c7" }]}>
                        Sedang Dipinjam
                      </Text>
                    </View>
                  )}
                  {item.returned_at && (
                    <View
                      style={[styles.badge, { backgroundColor: "#dcfce7" }]}
                    >
                      <Text style={[styles.badgeText, { color: "#16a34a" }]}>
                        Selesai
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.dateRow}>
                  <Ionicons name="calendar" size={14} color="#43B3AE" />
                  <Text style={styles.dateText}>
                    Pinjam: {formatDate(item.borrowed_at)}
                  </Text>
                </View>
                <View style={styles.dateRow}>
                  <Ionicons name="alarm" size={14} color="#ef4444" />
                  <Text style={styles.dateText}>
                    Tempo: {formatDate(item.due_date)}
                  </Text>
                </View>

                {item.fine_amount > 0 && (
                  <View
                    style={[
                      styles.fineBox,
                      item.fine_status === "paid"
                        ? { backgroundColor: "#dcfce7", borderColor: "#bbf7d0" }
                        : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.fineTitle,
                        item.fine_status === "paid" && { color: "#16a34a" },
                      ]}
                    >
                      {item.fine_status === "unpaid"
                        ? "⚠️ Anda Memiliki Denda"
                        : "✅ Denda Telah Lunas"}
                    </Text>
                    <Text style={styles.fineText}>
                      Terlambat: {hariTerlambat} hari x Rp 1.000
                    </Text>
                    <Text style={styles.fineAmount}>
                      Total: Rp {item.fine_amount}
                    </Text>

                    {item.fine_status === "unpaid" && (
                      <Text style={styles.fineWarning}>
                        Silakan bayar ke Petugas untuk bisa meminjam lagi.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  cover: { width: 80, height: 120, borderRadius: 6, marginRight: 15 },
  noCover: {
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, justifyContent: "center" },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  author: { fontSize: 13, color: "#6b7280", marginBottom: 8 },

  statusRow: { flexDirection: "row", marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "bold" },

  dateRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  dateText: { fontSize: 12, color: "#4b5563", marginLeft: 6 },

  fineBox: {
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  fineTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
  },
  fineText: { fontSize: 11, color: "#b91c1c" },
  fineAmount: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#dc2626",
    marginTop: 2,
    marginBottom: 4,
  },
  fineWarning: { fontSize: 10, color: "#dc2626", fontStyle: "italic" },
});
