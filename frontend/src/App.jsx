import { useCallback, useMemo, useState } from "react";
import StatCard from "./components/StatCard";
import BookingModal from "./components/BookingModal";
import ScheduleTable from "./components/ScheduleTable";
import BookingTable from "./components/BookingTable";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  STORAGE_KEY,
  createInitialBookings,
  cryptoId,
  fieldPrice,
  rupiah,
  todayISO,
} from "./data/constants";

export default function FutsalDashboard() {
  const today = todayISO();
  const [bookings, setBookings] = useLocalStorage(STORAGE_KEY, createInitialBookings);
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status !== "cancelled");
    const todayCount = active.filter((b) => b.date === today).length;
    const revenue = bookings
      .filter((b) => b.status === "confirmed")
      .reduce((s, b) => s + fieldPrice(b.fieldId), 0);
    const pending = bookings.filter((b) => b.status === "pending").length;
    return { total: bookings.length, todayCount, revenue, pending };
  }, [bookings, today]);

  const filtered = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (statusFilter === "all" || b.status === statusFilter) &&
          b.customer.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [bookings, statusFilter, search]
  );

  const getBooking = useCallback(
    (fieldId, time) =>
      bookings.find(
        (b) =>
          b.fieldId === fieldId && b.date === date && b.time === time && b.status !== "cancelled"
      ),
    [bookings, date]
  );

  const updateStatus = useCallback(
    (id, status) => setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b))),
    [setBookings]
  );

  const addBooking = useCallback(
    (data) => {
      const clash = bookings.some(
        (b) =>
          b.fieldId === data.fieldId &&
          b.date === data.date &&
          b.time === data.time &&
          b.status !== "cancelled"
      );
      if (clash) {
        alert("Slot tersebut sudah dipesan!");
        return;
      }
      setBookings((prev) => [...prev, { ...data, id: cryptoId(), status: "pending" }]);
      setShowModal(false);
    },
    [bookings, setBookings]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-green-700">⚽ Futsal Booking</h1>
            <p className="text-xs text-gray-500">Dashboard Admin</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
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
        <ScheduleTable date={date} onDateChange={setDate} getBooking={getBooking} />

        {/* Daftar booking */}
        <BookingTable
          bookings={filtered}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onUpdateStatus={updateStatus}
        />
      </main>

      {showModal && (
        <BookingModal
          defaultDate={date}
          onClose={() => setShowModal(false)}
          onSave={addBooking}
        />
      )}
    </div>
  );
}