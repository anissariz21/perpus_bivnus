import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: "",
    nis: "",
    kelas: "",
    phone: "",
    email: "",
    password: "",
  });
  const [showKelasModal, setShowKelasModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function register() {
    if (!form.name || !form.email || !form.password || !form.kelas) {
      return Alert.alert(
        "Gagal",
        "Nama, Kelas, Email, dan Password wajib diisi!",
      );
    }

    setLoading(true);
    const { data: auth, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setLoading(false);
      return Alert.alert("Gagal", authError.message);
    }

    if (auth.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: auth.user.id,
        full_name: form.name,
        nis: form.nis,
        kelas: form.kelas,
        phone: form.phone,
        email: form.email,
        role: "siswa",
      });

      setLoading(false);
      if (profileError) {
        Alert.alert("Gagal Simpan Profil", profileError.message);
      } else {
        Alert.alert("Sukses", "Akun berhasil dibuat, silakan login.");
        router.back();
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Daftar Akun Siswa</Text>
          <Text style={styles.subtitle}>
            Lengkapi data diri Anda dengan benar
          </Text>

          <Text style={styles.label}>Nama Lengkap *</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan nama lengkap"
            onChangeText={(t) => setForm({ ...form, name: t })}
          />

          <Text style={styles.label}>NIS (Nomor Induk Siswa)</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan NIS"
            keyboardType="numeric"
            onChangeText={(t) => setForm({ ...form, nis: t })}
          />

          <Text style={styles.label}>Kelas *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowKelasModal(true)}
          >
            <Text style={{ color: form.kelas ? "#1f2937" : "#9ca3af" }}>
              {form.kelas ? `Kelas ${form.kelas}` : "Pilih Kelas"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>

          <Text style={styles.label}>Nomor HP</Text>
          <TextInput
            style={styles.input}
            placeholder="Cth: 08123456789"
            keyboardType="phone-pad"
            onChangeText={(t) => setForm({ ...form, phone: t })}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Cth: nisa@bivnus.sch.id"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(t) => setForm({ ...form, email: t })}
          />

          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Buat password yang aman"
            secureTextEntry
            onChangeText={(t) => setForm({ ...form, password: t })}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={register}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 20 }}
          >
            <Text style={styles.link}>Sudah punya akun? Kembali ke Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showKelasModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Kelas</Text>
            {["X", "XI", "XII"].map((k) => (
              <TouchableOpacity
                key={k}
                style={styles.modalItem}
                onPress={() => {
                  setForm({ ...form, kelas: k });
                  setShowKelasModal(false);
                }}
              >
                <Text style={styles.modalItemText}>Kelas {k}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowKelasModal(false)}
              style={{ marginTop: 15 }}
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 24, paddingBottom: 50 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 30,
  },

  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#f9fafb",
    fontSize: 15,
  },

  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#f9fafb",
  },

  button: {
    backgroundColor: "#43B3AE",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: {
    textAlign: "center",
    color: "#43B3AE",
    fontWeight: "600",
    fontSize: 14,
  },

  // STYLE MODAL
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
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemText: { fontSize: 16, textAlign: "center", color: "#1f2937" },
});
