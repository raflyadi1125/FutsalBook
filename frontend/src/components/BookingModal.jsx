import { useEffect, useRef, useState } from "react";
import { FIELDS, HOURS } from "../data/constants";

const PHONE_RE = /^[0-9+\-\s()]{8,20}$/;

export default function BookingModal({ onClose, onSave, defaultDate }) {
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    fieldId: FIELDS[0].id,
    date: defaultDate,
    time: HOURS[0],
  });
  const [error, setError] = useState("");
  const firstInputRef = useRef(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    firstInputRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    if (!form.customer.trim()) return setError("Nama pemesan wajib diisi.");
    if (!PHONE_RE.test(form.phone.trim())) return setError("No. HP tidak valid (8-20 digit).");
    if (!form.date) return setError("Tanggal wajib diisi.");
    setError("");
    onSave({ ...form, fieldId: Number(form.fieldId) });
  };

  const input =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tambah Booking"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Tambah Booking</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            Nama Pemesan
            <input
              ref={firstInputRef}
              className={input}
              value={form.customer}
              onChange={set("customer")}
            />
          </label>
          <label className="block text-sm">
            No. HP
            <input className={input} value={form.phone} onChange={set("phone")} />
          </label>
          <label className="block text-sm">
            Lapangan
            <select className={input} value={form.fieldId} onChange={set("fieldId")}>
              {FIELDS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              Tanggal
              <input type="date" className={input} value={form.date} onChange={set("date")} />
            </label>
            <label className="block text-sm">
              Jam
              <select className={input} value={form.time} onChange={set("time")}>
                {HOURS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={submit}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}