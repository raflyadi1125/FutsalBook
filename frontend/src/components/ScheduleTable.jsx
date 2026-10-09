import { FIELDS, HOURS } from "../data/constants";

export default function ScheduleTable({ date, onDateChange, getBooking }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Jadwal Lapangan</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-3">Lapangan</th>
              {HOURS.map((h) => (
                <th key={h} className="px-1 py-2 text-center font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIELDS.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="py-2 pr-3 font-medium">{f.name}</td>
                {HOURS.map((h) => {
                  const b = getBooking(f.id, h);
                  return (
                    <td key={h} className="px-1 py-2 text-center">
                      <span
                        title={b ? b.customer : "Tersedia"}
                        className={`inline-block w-full rounded-md px-1 py-1 text-xs ${
                          b
                            ? b.status === "confirmed"
                              ? "bg-green-600 text-white"
                              : "bg-amber-400 text-white"
                            : "bg-gray-100 text-gray-400"
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
  );
}