import { fieldName, fieldPrice, rupiah, statusStyle } from "../data/constants";

export default function BookingTable({
  bookings,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onUpdateStatus,
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Daftar Booking</h2>
        <div className="flex gap-2">
          <input
            placeholder="Cari nama..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
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
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-400">
                  Tidak ada data
                </td>
              </tr>
            )}
            {bookings.map((b) => (
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
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle(b.status)}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="space-x-2 text-right">
                  {b.status === "pending" && (
                    <button
                      onClick={() => onUpdateStatus(b.id, "confirmed")}
                      className="text-green-600 hover:underline"
                    >
                      Konfirmasi
                    </button>
                  )}
                  {b.status !== "cancelled" && (
                    <button
                      onClick={() => onUpdateStatus(b.id, "cancelled")}
                      className="text-red-600 hover:underline"
                    >
                      Batalkan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}