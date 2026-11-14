import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!email || !password) {
      return Alert.alert("Peringatan", "Email dan Password wajib diisi!");
    }

    setLoading(true);
    console.log("1. Mencoba login dengan email:", email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("2. Error dari Supabase:", error.message);
        Alert.alert("Login Gagal", error.message);
      } else {
        console.log("2. Login Berhasil! User ID:", data.user?.id);
      }
    } catch (err: any) {
      console.log("Error sistem:", err);
      Alert.alert("Error", "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../assets/images/logo-sekolah.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Perpus Bivnus</Text>
          <Text style={styles.subtitle}>SMK Bina Vokasi Nusantara</Text>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={signIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Masuk</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text style={styles.link}>Belum punya akun? Daftar Siswa</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logo: { width: 120, height: 120, alignSelf: "center", marginBottom: 15 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 30,
  },
  formContainer: { width: "100%" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#f9fafb",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#43B3AE",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: {
    textAlign: "center",
    color: "#43B3AE",
    marginTop: 20,
    fontWeight: "600",
  },
});
