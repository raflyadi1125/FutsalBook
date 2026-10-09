import { useEffect, useState } from "react";

// Sinkronisasi state dengan localStorage dengan aman (try/catch)
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const fallback = () =>
      typeof initialValue === "function" ? initialValue() : initialValue;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback();

      const parsed = JSON.parse(raw);
      const base = fallback();
      const valid = Array.isArray(base) ? Array.isArray(parsed) : parsed !== null && typeof parsed === "object";
      return valid ? parsed : fallback();
    } catch {
      return fallback();
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // abaikan jika storage penuh / tidak tersedia
    }
  }, [key, value]);

  return [value, setValue];
}