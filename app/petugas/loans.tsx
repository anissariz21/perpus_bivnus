import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

export default function LoansScreen() {
  const [loans, setLoans] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchLoans = async () => {
    const { data } = await supabase
      .from("loans")
      .select("*, books(title, cover_url, author), profiles(full_name)")
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

  async function setujui(id: number) {
    Alert.alert("Konfirmasi", "Setujui peminjaman ini?", [
      { text: "Batal" },
      {
        text: "Setujui",
        onPress: async () => {
          const { error } = await supabase.rpc("approve_loan", {
            p_loan_id: id,
          });
          if (error) Alert.alert("Gagal", error.message);
          else {
            Alert.alert("Sukses", "Peminjaman disetujui.");
            fetchLoans();
            setModalVisible(false);
          }
        },
      },
    ]);
  }

  async function kembalikan(id: number) {
    Alert.alert("Konfirmasi", "Kembalikan buku ini?", [
      { text: "Batal" },
      {
        text: "Ya",
        onPress: async () => {
          const { error } = await supabase.rpc("return_book", {
            p_loan_id: id,
          });
          if (error) Alert.alert("Gagal", error.message);
          else {
            Alert.alert("Sukses", "Buku dikembalikan & denda dihitung.");
            fetchLoans();
            setModalVisible(false);
          }
        },
      },
    ]);
  }

  async function bayarDenda(id: number) {
    Alert.alert("Konfirmasi", "Siswa sudah membayar denda secara tunai?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya, Lunas",
        onPress: async () => {
          const { error } = await supabase
            .from("loans")
            .update({ fine_status: "paid" })
            .eq("id", id);
          if (error) Alert.alert("Gagal", error.message);
          else {
            Alert.alert("Sukses", "Denda telah dibayar.");
            fetchLoans();
            setModalVisible(false);
          }
        },
      },
    ]);
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const hitungHariTerlambat = (due_date: string, returned_at: string) => {
    if (!returned_at) return 0;
    const due = new Date(new Date(due_date).toISOString().split("T")[0]);
    const ret = new Date(new Date(returned_at).toISOString().split("T")[0]);
    const diffTime = Math.max(0, ret.getTime() - due.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const openDetail = (loan: any) => {
    setSelectedLoan(loan);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <FlatList
        data={loans}
        keyExtractor={(i) => i.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <Text
            style={{ textAlign: "center", marginTop: 20, color: "#6b7280" }}
          >
            Belum ada riwayat peminjaman.
          </Text>
        }
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => openDetail(item)}
              activeOpacity={0.7}
            >
              {item.books.cover_url ? (
                <Image
                  source={{ uri: item.books.cover_url }}
                  style={styles.cover}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cover, styles.noCover]}>
                  <Text>No Cover</Text>
                </View>
              )}

              <Text style={styles.title} numberOfLines={1}>
                {item.books.title}
              </Text>

              <View style={styles.infoRow}>
                <Ionicons name="person" size={12} color="#6b7280" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.profiles.full_name}
                </Text>
              </View>

              <View style={{ marginTop: 5 }}>
                {item.status === "pending" && (
                  <View style={[styles.badge, { backgroundColor: "#fef3c7" }]}>
                    <Text style={[styles.badgeText, { color: "#d97706" }]}>
                      Menunggu ACC
                    </Text>
                  </View>
                )}
                {item.status === "dipinjam" && (
                  <View style={[styles.badge, { backgroundColor: "#e0f2fe" }]}>
                    <Text style={[styles.badgeText, { color: "#0284c7" }]}>
                      Sedang Dipinjam
                    </Text>
                  </View>
                )}
                {(item.status === "dikembalikan" ||
                  item.status === "terlambat") && (
                  <View style={[styles.badge, { backgroundColor: "#dcfce7" }]}>
                    <Text style={[styles.badgeText, { color: "#16a34a" }]}>
                      Selesai
                    </Text>
                  </View>
                )}
                {item.fine_amount > 0 && item.fine_status === "unpaid" && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: "#fee2e2", marginTop: 4 },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: "#dc2626" }]}>
                      Belum Bayar Denda
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Ketuk untuk detail
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedLoan && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Detail Peminjaman</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Ionicons name="close-circle" size={28} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailRow}>
                    {selectedLoan.books.cover_url ? (
                      <Image
                        source={{ uri: selectedLoan.books.cover_url }}
                        style={styles.modalCover}
                      />
                    ) : (
                      <View style={[styles.modalCover, styles.noCover]}>
                        <Text>No Cover</Text>
                      </View>
                    )}
                    <View style={styles.detailInfo}>
                      <Text style={styles.modalBookTitle}>
                        {selectedLoan.books.title}
                      </Text>
                      <Text style={styles.modalBookAuthor}>
                        {selectedLoan.books.author}
                      </Text>
                      <Text style={styles.modalStudent}>
                        Peminjam: {selectedLoan.profiles.full_name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <Text style={styles.sectionTitle}>Tanggal Penting</Text>

                  <View style={styles.dateDetailRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dateLabel}>Tanggal Pinjam:</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(selectedLoan.borrowed_at)}
                    </Text>
                  </View>

                  <View style={styles.dateDetailRow}>
                    <Ionicons name="alarm-outline" size={18} color="#ef4444" />
                    <Text style={styles.dateLabel}>Jatuh Tempo:</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(selectedLoan.due_date)}
                    </Text>
                  </View>

                  <View style={styles.dateDetailRow}>
                    <Ionicons
                      name="checkmark-done-outline"
                      size={18}
                      color="#10b981"
                    />
                    <Text style={styles.dateLabel}>Dikembalikan:</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(selectedLoan.returned_at)}
                    </Text>
                  </View>

                  {selectedLoan.fine_amount > 0 && (
                    <View style={styles.modalFineBox}>
                      <Text style={styles.modalFineTitle}>Rincian Denda</Text>
                      <Text style={styles.modalFineText}>
                        • Terlambat:{" "}
                        {hitungHariTerlambat(
                          selectedLoan.due_date,
                          selectedLoan.returned_at,
                        )}{" "}
                        hari
                      </Text>
                      <Text style={styles.modalFineText}>
                        • Tarif: Rp 1.000 / hari
                      </Text>
                      <Text style={styles.modalFineTotal}>
                        Total: Rp {selectedLoan.fine_amount}
                      </Text>
                      <Text
                        style={[
                          styles.modalFineText,
                          { marginTop: 5, fontWeight: "bold" },
                        ]}
                      >
                        Status:{" "}
                        {selectedLoan.fine_status === "unpaid"
                          ? "Belum Dibayar"
                          : "Lunas"}
                      </Text>
                    </View>
                  )}

                  <View style={styles.actionContainer}>
                    {selectedLoan.status === "pending" && (
                      <TouchableOpacity
                        style={styles.btnSetujui}
                        onPress={() => setujui(selectedLoan.id)}
                      >
                        <Text style={styles.btnText}>Setujui Pinjam</Text>
                      </TouchableOpacity>
                    )}
                    {selectedLoan.status === "dipinjam" && (
                      <TouchableOpacity
                        style={styles.btnKembali}
                        onPress={() => kembalikan(selectedLoan.id)}
                      >
                        <Text style={styles.btnText}>Kembalikan Buku</Text>
                      </TouchableOpacity>
                    )}
                    {selectedLoan.fine_amount > 0 &&
                      selectedLoan.fine_status === "unpaid" && (
                        <TouchableOpacity
                          style={styles.btnLunasi}
                          onPress={() => bayarDenda(selectedLoan.id)}
                        >
                          <Text style={styles.btnText}>Bayar Denda</Text>
                        </TouchableOpacity>
                      )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  row: { justifyContent: "space-between" },
  card: {
    backgroundColor: "#fff",
    width: "48%",
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cover: { width: "100%", height: 160, borderRadius: 6, marginBottom: 8 },
  noCover: {
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  infoText: { fontSize: 11, color: "#6b7280", marginLeft: 4 },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "bold" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1f2937" },

  detailRow: { flexDirection: "row", marginBottom: 15 },
  modalCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: "#e5e7eb",
  },
  detailInfo: { flex: 1, justifyContent: "center" },
  modalBookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  modalBookAuthor: { fontSize: 13, color: "#6b7280", marginBottom: 8 },
  modalStudent: { fontSize: 13, fontWeight: "600", color: "#43B3AE" },

  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 15 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
  },

  dateDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dateLabel: { fontSize: 13, color: "#6b7280", marginLeft: 8, flex: 1 },
  dateValue: { fontSize: 13, fontWeight: "600", color: "#1f2937" },

  modalFineBox: {
    backgroundColor: "#fef2f2",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  modalFineTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 8,
  },
  modalFineText: { fontSize: 13, color: "#b91c1c", marginBottom: 2 },
  modalFineTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
    marginTop: 8,
    marginBottom: 4,
  },

  actionContainer: { marginTop: 20 },
  btnSetujui: {
    backgroundColor: "#f59e0b",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  btnKembali: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  btnLunasi: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});
