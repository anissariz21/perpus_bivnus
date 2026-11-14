import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

export default function BooksScreen() {
  const [books, setBooks] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showKelasModal, setShowKelasModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);

  const [form, setForm] = useState({
    id: null,
    title: "",
    author: "",
    publisher: "",
    kelas: "",
    semester: "",
    stock: 1,
    shelf: "",
    cover_url: "",
  });

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("*").order("title");
    if (data) setBooks(data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleTambahBaru = () => {
    setForm({
      id: null,
      title: "",
      author: "",
      publisher: "",
      kelas: "",
      semester: "",
      stock: 1,
      shelf: "",
      cover_url: "",
    });
    setModalVisible(true);
  };

  const handleEdit = (book: any) => {
    setForm({
      id: book.id,
      title: book.title,
      author: book.author,
      publisher: book.publisher || "",
      kelas: book.kelas || "",
      semester: book.semester || "",
      stock: book.stock,
      shelf: book.shelf_location || "",
      cover_url: book.cover_url || "",
    });
    setModalVisible(true);
  };

  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.2,
    });
    if (!result.canceled) uploadImage(result.assets[0].uri);
  }

  async function uploadImage(uri: string) {
    setUploading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = Uint8Array.from(atob(base64), (c) =>
        c.charCodeAt(0),
      ).buffer;
      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpeg";
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("book-covers")
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("book-covers").getPublicUrl(fileName);
      setForm({ ...form, cover_url: publicUrl });
    } catch (error: any) {
      Alert.alert("Gagal Upload", error.message);
    } finally {
      setUploading(false);
    }
  }

  async function simpanBuku() {
    if (!form.title || !form.author)
      return Alert.alert("Gagal", "Judul dan Penulis wajib diisi!");

    const payload = {
      title: form.title,
      author: form.author,
      publisher: form.publisher,
      kelas: form.kelas,
      semester: form.semester,
      stock: form.stock,
      shelf_location: form.shelf,
      cover_url: form.cover_url,
    };

    if (form.id) {
      const { error } = await supabase
        .from("books")
        .update(payload)
        .eq("id", form.id);
      if (error) return Alert.alert("Gagal Edit", error.message);
      Alert.alert("Sukses", "Buku berhasil diperbarui");
    } else {
      const { error } = await supabase.from("books").insert([payload]);
      if (error) return Alert.alert("Gagal Tambah", error.message);
      Alert.alert("Sukses", "Buku berhasil ditambahkan");
    }

    setModalVisible(false);
    fetchBooks();
  }

  async function hapusBuku(id: number) {
    Alert.alert("Hapus", "Yakin hapus buku ini?", [
      { text: "Batal" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("books").delete().eq("id", id);
          if (error)
            return Alert.alert(
              "Gagal",
              "Buku tidak bisa dihapus karena sedang dipinjam.",
            );
          fetchBooks();
        },
      },
    ]);
  }

  const tambahStok = () => setForm({ ...form, stock: form.stock + 1 });
  const kurangStok = () =>
    setForm({ ...form, stock: form.stock > 0 ? form.stock - 1 : 0 });

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Manajemen Buku</Text>
        <TouchableOpacity onPress={handleTambahBaru}>
          <Ionicons name="add-circle" size={40} color="#43B3AE" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={books}
        keyExtractor={(i) => i.id.toString()}
        numColumns={2}
        columnWrapperStyle={[styles.row, { paddingHorizontal: 15 }]}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 5 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.cover_url ? (
              <Image source={{ uri: item.cover_url }} style={styles.cover} />
            ) : (
              <View
                style={[
                  styles.cover,
                  {
                    backgroundColor: "#e5e7eb",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text>No Cover</Text>
              </View>
            )}

            <Text style={styles.bookTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {item.author} | Stok: {item.stock}
            </Text>

            <View style={styles.detailRow}>
              <Ionicons name="school-outline" size={12} color="#6b7280" />
              <Text style={styles.detailText}>
                {item.kelas || "-"} | Smt {item.semester || "-"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={12} color="#6b7280" />
              <Text style={styles.detailText}>
                Rak: {item.shelf_location || "-"}
              </Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() => handleEdit(item)}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDelete}
                onPress={() => hapusBuku(item.id)}
              >
                <Ionicons name="trash" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {form.id ? "Edit Buku" : "Tambah Buku Baru"}
              </Text>

              <TouchableOpacity
                style={styles.uploadBox}
                onPress={pickImage}
                disabled={uploading}
              >
                {form.cover_url ? (
                  <Image
                    source={{ uri: form.cover_url }}
                    style={styles.uploadPreview}
                  />
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Ionicons name="camera" size={32} color="#6b7280" />
                    <Text style={{ color: "#6b7280", marginTop: 5 }}>
                      Pilih Cover Buku
                    </Text>
                  </View>
                )}
                {uploading && (
                  <ActivityIndicator
                    style={{ position: "absolute" }}
                    size="large"
                    color="#43B3AE"
                  />
                )}
              </TouchableOpacity>

              <Text style={styles.label}>Judul Buku *</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan judul buku"
                value={form.title}
                onChangeText={(t) => setForm({ ...form, title: t })}
              />

              <Text style={styles.label}>Penulis *</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama penulis"
                value={form.author}
                onChangeText={(t) => setForm({ ...form, author: t })}
              />

              <Text style={styles.label}>Penerbit</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama penerbit"
                value={form.publisher}
                onChangeText={(t) => setForm({ ...form, publisher: t })}
              />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Kelas</Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowKelasModal(true)}
                  >
                    <Text style={{ color: form.kelas ? "#1f2937" : "#9ca3af" }}>
                      {form.kelas || "Pilih Kelas"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Semester</Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowSemesterModal(true)}
                  >
                    <Text
                      style={{ color: form.semester ? "#1f2937" : "#9ca3af" }}
                    >
                      {form.semester || "Pilih Semester"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Stok Buku</Text>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={kurangStok}
                    >
                      <Ionicons name="remove" size={20} color="#dc2626" />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{form.stock}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={tambahStok}
                    >
                      <Ionicons name="add" size={20} color="#10b981" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Lokasi Rak</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Cth: BV1"
                    value={form.shelf}
                    onChangeText={(t) => setForm({ ...form, shelf: t })}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.btnSave}
                onPress={simpanBuku}
                disabled={uploading}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Simpan Buku
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ marginTop: 15, marginBottom: 20 }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#dc2626",
                    fontWeight: "bold",
                  }}
                >
                  Batal
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showKelasModal} transparent animationType="fade">
        <View style={styles.dropdownBg}>
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownTitle}>Pilih Kelas</Text>
            {["X", "XI", "XII"].map((k) => (
              <TouchableOpacity
                key={k}
                style={styles.dropdownItem}
                onPress={() => {
                  setForm({ ...form, kelas: k });
                  setShowKelasModal(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{k}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowKelasModal(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ textAlign: "center", color: "#dc2626" }}>
                Tutup
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSemesterModal} transparent animationType="fade">
        <View style={styles.dropdownBg}>
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownTitle}>Pilih Semester</Text>
            {["1", "2"].map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.dropdownItem}
                onPress={() => {
                  setForm({ ...form, semester: s });
                  setShowSemesterModal(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{s}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowSemesterModal(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ textAlign: "center", color: "#dc2626" }}>
                Tutup
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#1f2937" },

  row: { justifyContent: "space-between" },
  card: {
    backgroundColor: "#fff",
    width: "48%",
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  cover: { width: "100%", height: 160, borderRadius: 6, marginBottom: 8 },
  bookTitle: { fontSize: 14, fontWeight: "bold", color: "#1f2937" },
  bookAuthor: { fontSize: 11, color: "#6b7280", marginTop: 2, marginBottom: 4 },

  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  detailText: { fontSize: 10, color: "#6b7280", marginLeft: 4 },

  actionRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  btnEdit: {
    flex: 1,
    backgroundColor: "#f59e0b",
    padding: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  btnDelete: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 6,
    borderRadius: 6,
    alignItems: "center",
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 5,
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f9fafb",
  },
  uploadBox: {
    height: 180,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  uploadPreview: { width: "100%", height: "100%", resizeMode: "contain" },
  btnSave: {
    backgroundColor: "#43B3AE",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },

  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f9fafb",
  },
  dropdownBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  dropdownContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownItemText: { fontSize: 16, textAlign: "center", color: "#1f2937" },

  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    height: 45,
  },
  stepperBtn: { padding: 10, alignItems: "center", justifyContent: "center" },
  stepperValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
});
