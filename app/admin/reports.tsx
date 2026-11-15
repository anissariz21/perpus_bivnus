import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy"; // <-- Gunakan legacy untuk writeAsStringAsync

export default function ReportsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalDenda, setTotalDenda] = useState(0);
  const [totalPinjam, setTotalPinjam] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);

  const fetchReports = async () => {
    const { data } = await supabase
      .from("loans")
      .select("*, books(title), profiles(full_name)")
      .not("returned_at", "is", null)
      .order("returned_at", { ascending: false });

    if (data) {
      setReports(data);
      setTotalPinjam(data.length);
      const denda = data.reduce(
        (total, item) => total + (item.fine_amount || 0),
        0,
      );
      setTotalDenda(denda);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const cetakPDF = async () => {
    if (reports.length === 0)
      return Alert.alert("Gagal", "Tidak ada data untuk dicetak.");

    setIsPrinting(true);
    try {
      const tableRows = reports
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.books.title}</td>
          <td>${item.profiles.full_name}</td>
          <td>${formatDate(item.borrowed_at)}</td>
          <td>${formatDate(item.returned_at)}</td>
          <td>Rp ${item.fine_amount > 0 ? item.fine_amount : 0}</td>
        </tr>
      `,
        )
        .join("");

      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; }
              h1 { text-align: center; color: #333; margin-bottom: 5px; }
              h3 { text-align: center; color: #666; font-weight: normal; margin-top: 0; margin-bottom: 20px; }
              .summary { margin-bottom: 20px; padding: 10px; background-color: #f3f4f6; border-radius: 8px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
              th { background-color: #43B3AE; color: white; text-align: center; }
              td { text-align: center; }
            </style>
          </head>
          <body>
            <h1>Laporan Perpustakaan</h1>
            <h3>SMK Bina Vokasi Nusantara</h3>
            <div class="summary">
              <strong>Total Peminjaman Selesai:</strong> ${totalPinjam} <br/>
              <strong>Total Denda Terkumpul:</strong> Rp ${totalDenda.toLocaleString("id-ID")}
            </div>
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Judul Buku</th>
                  <th>Peminjam</th>
                  <th>Tgl Pinjam</th>
                  <th>Tgl Kembali</th>
                  <th>Denda</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // 1. Minta file PDF dalam bentuk Base64 (melewati izin baca cache)
      const { base64 } = await Print.printToFileAsync({ html, base64: true });

      if (!base64) {
        throw new Error("Gagal menghasilkan dokumen PDF.");
      }

      // 2. Tentukan nama file dan folder tujuan yang aman
      const fileName = `Laporan_Perpustakaan_${Date.now()}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;

      // 3. Tulis string Base64 menjadi file PDF fisik di folder dokumen
      await FileSystem.writeAsStringAsync(newUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 4. Cek ketersediaan fitur Sharing
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        return Alert.alert(
          "Info",
          "File PDF berhasil dibuat, tetapi fitur berbagi tidak tersedia di perangkat ini.",
        );
      }

      // 5. Bagikan file yang sudah kita tulis sendiri
      await Sharing.shareAsync(newUri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error: any) {
      console.log("Detail Error PDF:", error);
      Alert.alert(
        "Gagal Cetak",
        error.message || "Terjadi kesalahan saat membuat PDF.",
      );
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      {/* KARTU RINGKASAN */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-done-circle" size={28} color="#10b981" />
          <Text style={styles.summaryNumber}>{totalPinjam}</Text>
          <Text style={styles.summaryLabel}>Total Selesai</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="cash" size={28} color="#d97706" />
          <Text style={styles.summaryNumber}>
            Rp {totalDenda.toLocaleString("id-ID")}
          </Text>
          <Text style={styles.summaryLabel}>Total Denda</Text>
        </View>
      </View>

      {/* TOMBOL CETAK PDF */}
      <TouchableOpacity
        style={styles.btnPrint}
        onPress={cetakPDF}
        disabled={isPrinting}
      >
        {isPrinting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons
              name="print"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.btnPrintText}>Cetak Laporan PDF</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Riwayat Pengembalian Buku</Text>

      <FlatList
        data={reports}
        keyExtractor={(i) => i.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <Text
            style={{ textAlign: "center", marginTop: 20, color: "#6b7280" }}
          >
            Belum ada riwayat pengembalian.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.bookTitle} numberOfLines={1}>
                {item.books.title}
              </Text>
              <View
                style={[
                  styles.badge,
                  item.fine_amount > 0
                    ? { backgroundColor: "#fee2e2" }
                    : { backgroundColor: "#dcfce7" },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.fine_amount > 0
                      ? { color: "#dc2626" }
                      : { color: "#16a34a" },
                  ]}
                >
                  {item.fine_amount > 0 ? "Terlambat" : "Tepat Waktu"}
                </Text>
              </View>
            </View>

            <Text style={styles.studentName}>
              Peminjam: {item.profiles.full_name}
            </Text>

            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text style={styles.dateText}>
                Kembali: {formatDate(item.returned_at)}
              </Text>
            </View>

            {item.fine_amount > 0 && (
              <View style={styles.fineRow}>
                <Text style={styles.fineLabel}>Denda:</Text>
                <Text style={styles.fineValue}>Rp {item.fine_amount}</Text>
                <Text style={styles.fineStatus}>
                  ({item.fine_status === "paid" ? "Lunas" : "Belum Lunas"})
                </Text>
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", paddingTop: 10 },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  summaryLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },

  btnPrint: {
    backgroundColor: "#43B3AE",
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  btnPrintText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginHorizontal: 15,
    marginBottom: 10,
  },
  listCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
    marginRight: 10,
  },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "bold" },

  studentName: { fontSize: 13, color: "#4b5563", marginBottom: 6 },
  dateRow: { flexDirection: "row", alignItems: "center" },
  dateText: { fontSize: 12, color: "#6b7280", marginLeft: 6 },

  fineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 6,
  },
  fineLabel: { fontSize: 12, color: "#b91c1c" },
  fineValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#dc2626",
    marginLeft: 5,
    flex: 1,
  },
  fineStatus: { fontSize: 11, color: "#dc2626", fontStyle: "italic" },
});
