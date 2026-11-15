import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// 1. Buat adapter untuk HP (Android/iOS)
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// 2. Buat adapter untuk Web (Browser)
// Menggunakan localStorage bawaan browser karena SecureStore tidak jalan di web
const WebStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
  },
};

// 3. Pilih adapter berdasarkan Platform
const customStorage =
  Platform.OS === "web" ? WebStorageAdapter : ExpoSecureStoreAdapter;

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: customStorage, // <-- Gunakan adapter pintar ini
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    db: { schema: "public" },
  },
);
