// ---------- Data awal (ganti dengan data dari API/backend) ----------
export const FIELDS = [
  { id: 1, name: "Lapangan A (Vinyl)", price: 150000 },
  { id: 2, name: "Lapangan B (Sintetis)", price: 120000 },
  { id: 3, name: "Lapangan C (Parket)", price: 180000 },
];

export const HOURS = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

export const STATUS_STYLE = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
};

export const STATUS_FALLBACK = "bg-gray-100 text-gray-600";

// helpers
export const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export const fieldName = (id) => FIELDS.find((f) => f.id === id)?.name ?? "-";
export const fieldPrice = (id) => FIELDS.find((f) => f.id === id)?.price ?? 0;

export const statusStyle = (status) => STATUS_STYLE[status] ?? STATUS_FALLBACK;

// Tanggal hari ini dalam format YYYY-MM-DD (zona waktu lokal, bukan UTC)
export function todayISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

// Tanggal N hari dari hari ini
export function dateOffsetISO(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export const STORAGE_KEY = "futsal-bookings";

// Seed demo: tanggal dibuat relatif terhadap hari ini agar selalu relevan
export function createInitialBookings() {
  const today = dateOffsetISO(0);
  const tomorrow = dateOffsetISO(1);
  return [
    { id: cryptoId(), customer: "Budi Santoso", phone: "0812-3456-7890", fieldId: 1, date: today, time: "19:00", status: "confirmed" },
    { id: cryptoId(), customer: "Tim Garuda FC", phone: "0813-1111-2222", fieldId: 3, date: today, time: "20:00", status: "pending" },
    { id: cryptoId(), customer: "Rina Putri", phone: "0857-9999-0000", fieldId: 2, date: tomorrow, time: "18:00", status: "confirmed" },
    { id: cryptoId(), customer: "Dimas Pratama", phone: "0821-4444-5555", fieldId: 1, date: tomorrow, time: "21:00", status: "cancelled" },
  ];
}

export function cryptoId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}