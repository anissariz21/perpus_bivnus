import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

export default function KatalogSiswa() {
  const [books, setBooks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchBooks = async () => {
    let query = supabase.from("books").select("*");
    if (search) query = query.ilike("title", `%${search}%`);
    const { data } = await query;
    if (data) setBooks(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [search]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  }, [search]);

  async function pinjam(id: number) {
    const { error } = await supabase.rpc("borrow_book", { p_book_id: id });
    if (error) {
      Alert.alert("Gagal", error.message);
    } else {
      Alert.alert(
        "Sukses",
        "Pengajuan peminjaman terkirim. Silakan ambil buku di meja petugas.",
      );
      fetchBooks();
    }
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
          placeholder="Cari judul buku..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <Text
            style={{ textAlign: "center", marginTop: 20, color: "#6b7280" }}
          >
            Buku tidak ditemukan.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.cover_url ? (
              <Image
                source={{ uri: item.cover_url }}
                style={styles.cover}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.cover, styles.noCover]}>
                <Text>No Cover</Text>
              </View>
            )}

            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>

            <View style={styles.infoRow}>
              <Ionicons name="person" size={12} color="#6b7280" />
              <Text style={styles.author} numberOfLines={1}>
                {item.author}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="school-outline" size={12} color="#6b7280" />
              <Text style={styles.detailText}>
                {item.kelas || "-"} | Smt {item.semester || "-"}
              </Text>
              <Ionicons
                name="location-outline"
                size={12}
                color="#6b7280"
                style={{ marginLeft: 10 }}
              />
              <Text style={styles.detailText}>
                Rak {item.shelf_location || "-"}
              </Text>
            </View>

            <Text style={styles.stock}>Stok: {item.stock}</Text>

            <TouchableOpacity
              style={[
                styles.btnPinjam,
                item.stock < 1 && { backgroundColor: "#9ca3af" },
              ]}
              onPress={() => pinjam(item.id)}
              disabled={item.stock < 1}
            >
              <Text style={styles.btnText}>
                {item.stock < 1 ? "Habis" : "Pinjam"}
              </Text>
            </TouchableOpacity>
          </View>
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
  row: { justifyContent: "space-between", paddingHorizontal: 10 },
  card: {
    backgroundColor: "#fff",
    width: "48%",
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  cover: { width: "100%", height: 160, borderRadius: 6, marginBottom: 8 },
  noCover: {
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 14, fontWeight: "bold", color: "#1f2937" },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  author: { fontSize: 12, color: "#6b7280", marginLeft: 4 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flexWrap: "wrap",
  },
  detailText: { fontSize: 10, color: "#6b7280", marginLeft: 3 },
  stock: {
    fontSize: 11,
    color: "#43B3AE",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
  },
  btnPinjam: {
    backgroundColor: "#43B3AE",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
});
