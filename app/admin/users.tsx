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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    role: "siswa",
  });

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");
    if (data) setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTambah = () => {
    setForm({ id: null, name: "", email: "", password: "", role: "siswa" });
    setModalVisible(true);
  };

  const handleEdit = (user: any) => {
    setForm({
      id: user.id,
      name: user.full_name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setModalVisible(true);
  };

  async function simpanUser() {
    if (!form.name) return Alert.alert("Gagal", "Nama wajib diisi!");

    if (form.id) {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.name,
          role: form.role,
        })
        .eq("id", form.id);

      if (error) return Alert.alert("Gagal Edit", error.message);
      Alert.alert("Sukses", "Data user berhasil diperbarui");
    } else {
      if (!form.email || !form.password)
        return Alert.alert("Gagal", "Email dan Password wajib diisi!");

      const { data: auth, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (error) return Alert.alert("Gagal", error.message);

      if (auth.user) {
        await supabase.from("profiles").insert({
          id: auth.user.id,
          full_name: form.name,
          email: form.email,
          role: form.role,
        });
        Alert.alert("Sukses", "User ditambahkan");
      }
    }

    setModalVisible(false);
    fetchUsers();
  }

  async function hapusUser(id: string) {
    Alert.alert("Hapus", "Yakin hapus user ini dari sistem?", [
      { text: "Batal" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await supabase.from("profiles").delete().eq("id", id);
          fetchUsers();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Manajemen User</Text>
        <TouchableOpacity onPress={handleTambah}>
          <Ionicons name="add-circle" size={40} color="#43B3AE" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.full_name}</Text>
              <Text style={styles.role}>
                Role: {item.role.toUpperCase()} | {item.email}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Ionicons name="pencil" size={24} color="#f59e0b" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => hapusUser(item.id)}>
                <Ionicons name="trash" size={24} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity
            style={styles.logoutBtn}
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

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {form.id ? "Edit User" : "Tambah User Baru"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nama Lengkap"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />

            <TextInput
              style={[
                styles.input,
                form.id && { backgroundColor: "#e5e7eb", color: "#9ca3af" },
              ]}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!form.id}
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
            />
            <TextInput
              style={[
                styles.input,
                form.id && { backgroundColor: "#e5e7eb", color: "#9ca3af" },
              ]}
              placeholder={
                form.id ? "Password tidak dapat diubah di sini" : "Password"
              }
              secureTextEntry
              editable={!form.id}
              onChangeText={(t) => setForm({ ...form, password: t })}
            />

            <Text style={{ marginBottom: 5, fontWeight: "bold", marginTop: 5 }}>
              Pilih Role:
            </Text>
            <View style={styles.roleRow}>
              {["siswa", "petugas", "admin"].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, form.role === r && styles.roleActive]}
                  onPress={() => setForm({ ...form, role: r })}
                >
                  <Text
                    style={[
                      styles.roleText,
                      form.role === r && { color: "#fff" },
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.btnSave} onPress={simpanUser}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {form.id ? "Simpan Perubahan" : "Tambah User"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 15,
                  color: "#dc2626",
                  fontWeight: "bold",
                }}
              >
                Batal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#1f2937" },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: "bold", color: "#1f2937" },
  role: { fontSize: 12, color: "#6b7280", marginTop: 4 },

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

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f9fafb",
  },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  roleBtn: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#43B3AE",
    flex: 1,
    alignItems: "center",
  },
  roleActive: { backgroundColor: "#43B3AE" },
  roleText: {
    color: "#43B3AE",
    textTransform: "capitalize",
    fontSize: 12,
    fontWeight: "bold",
  },
  btnSave: {
    backgroundColor: "#43B3AE",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});
