import { useMemo, useState } from "react";

// ---------- Data awal (ganti dengan data dari API/backend) ----------
const FIELDS = [
  { id: 1, name: "Lapangan A (Vinyl)", price: 150000 },
  { id: 2, name: "Lapangan B (Sintetis)", price: 120000 },
  { id: 3, name: "Lapangan C (Parket)", price: 180000 },
];

const HOURS = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

const INITIAL_BOOKINGS = [
  { id: 1, customer: "Budi Santoso", phone: "0812-3456-7890", fieldId: 1, date: "2026-10-07", time: "19:00", status: "confirmed" },
  { id: 2, customer: "Tim Garuda FC", phone: "0813-1111-2222", fieldId: 3, date: "2026-10-07", time: "20:00", status: "pending" },
  { id: 3, customer: "Rina Putri", phone: "0857-9999-0000", fieldId: 2, date: "2026-10-08", time: "18:00", status: "confirmed" },
  { id: 4, customer: "Dimas Pratama", phone: "0821-4444-5555", fieldId: 1, date: "2026-10-08", time: "21:00", status: "cancelled" },
];

const STATUS_STYLE = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
};

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// ---------- Komponen kecil ----------
function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function BookingModal({ onClose, onSave, defaultDate }) {
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    fieldId: FIELDS[0].id,
    date: defaultDate,
    time: HOURS[0],
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    if (!form.customer.trim() || !form.phone.trim()) return alert("Nama dan No. HP wajib diisi");
    onSave({ ...form, fieldId: Number(form.fieldId) });
  };

  const input = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Tambah Booking</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">Nama Pemesan
            <input className={input} value={form.customer} onChange={set("customer")} />
          </label>
          <label className="block text-sm">No. HP
            <input className={input} value={form.phone} onChange={set("phone")} />
          </label>
          <label className="block text-sm">Lapangan
            <select className={input} value={form.fieldId} onChange={set("fieldId")}>
              {FIELDS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">Tanggal
              <input type="date" className={input} value={form.date} onChange={set("date")} />
            </label>
            <label className="block text-sm">Jam
              <select className={input} value={form.time} onChange={set("time")}>
                {HOURS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Batal</button>
          <button onClick={submit} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Simpan</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Dashboard utama ----------
export default function FutsalDashboard() {
  const today = "2026-10-07";
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const fieldName = (id) => FIELDS.find((f) => f.id === id)?.name ?? "-";
  const fieldPrice = (id) => FIELDS.find((f) => f.id === id)?.price ?? 0;

  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status !== "cancelled");
    const todayCount = active.filter((b) => b.date === today).length;
    const revenue = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + fieldPrice(b.fieldId), 0);
    const pending = bookings.filter((b) => b.status === "pending").length;
    return { total: bookings.length, todayCount, revenue, pending };
  }, [bookings]);

  const filtered = bookings.filter(
    (b) =>
      (statusFilter === "all" || b.status === statusFilter) &&
      b.customer.toLowerCase().includes(search.toLowerCase())
  );

  // Cek slot terisi untuk jadwal harian
  const isTaken = (fieldId, time) =>
    bookings.find((b) => b.fieldId === fieldId && b.date === date && b.time === time && b.status !== "cancelled");

  const updateStatus = (id, status) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

  const addBooking = (data) => {
    if (isTaken(data.fieldId, data.time) && data.date === date) {
      return alert("Slot tersebut sudah dipesan!");
    }
    const clash = bookings.some(
      (b) => b.fieldId === data.fieldId && b.date === data.date && b.time === data.time && b.status !== "cancelled"
    );
    if (clash) return alert("Slot tersebut sudah dipesan!");
    setBookings((prev) => [...prev, { ...data, id: Date.now(), status: "pending" }]);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-green-700">⚽ Futsal Booking</h1>
            <p className="text-xs text-gray-500">Dashboard Admin</p>
          </div>
          <button onClick={() => setShowModal(true)} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            + Booking Baru
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {/* Statistik */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Booking" value={stats.total} />
          <StatCard label="Booking Hari Ini" value={stats.todayCount} />
          <StatCard label="Menunggu Konfirmasi" value={stats.pending} />
          <StatCard label="Pendapatan (Confirmed)" value={rupiah(stats.revenue)} />
        </section>

        {/* Jadwal harian */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Jadwal Lapangan</h2>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-3">Lapangan</th>
                  {HOURS.map((h) => <th key={h} className="px-1 py-2 text-center font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {FIELDS.map((f) => (
                  <tr key={f.id} className="border-t">
                    <td className="py-2 pr-3 font-medium">{f.name}</td>
                    {HOURS.map((h) => {
                      const b = isTaken(f.id, h);
                      return (
                        <td key={h} className="px-1 py-2 text-center">
                          <span
                            title={b ? b.customer : "Tersedia"}
                            className={`inline-block w-full rounded-md px-1 py-1 text-xs ${
                              b ? (b.status === "confirmed" ? "bg-green-600 text-white" : "bg-amber-400 text-white") : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {b ? "Terisi" : "Kosong"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Daftar booking */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Daftar Booking</h2>
            <div className="flex gap-2">
              <input placeholder="Cari nama..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
                <option value="all">Semua</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2">Pemesan</th>
                  <th>Lapangan</th>
                  <th>Tanggal</th>
                  <th>Jam</th>
                  <th>Harga</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-6 text-center text-gray-400">Tidak ada data</td></tr>
                )}
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="py-2">
                      <p className="font-medium">{b.customer}</p>
                      <p className="text-xs text-gray-400">{b.phone}</p>
                    </td>
                    <td>{fieldName(b.fieldId)}</td>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td>{rupiah(fieldPrice(b.fieldId))}</td>
                    <td>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="space-x-2 text-right">
                      {b.status === "pending" && (
                        <button onClick={() => updateStatus(b.id, "confirmed")} className="text-green-600 hover:underline">Konfirmasi</button>
                      )}
                      {b.status !== "cancelled" && (
                        <button onClick={() => updateStatus(b.id, "cancelled")} className="text-red-600 hover:underline">Batalkan</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showModal && <BookingModal defaultDate={date} onClose={() => setShowModal(false)} onSave={addBooking} />}
    </div>
  );
}
