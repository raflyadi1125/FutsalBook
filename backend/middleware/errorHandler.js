export function notFound(req, res) {
  res.status(404).json({ message: `Route tidak ditemukan: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Data sudah ada (duplikat)" });
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ message: "Relasi data tidak ditemukan" });
  }

  const connCodes = ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "EHOSTUNREACH", "PROTOCOL_CONNECTION_LOST"];
  if (connCodes.includes(err.code) || err.errors?.some?.((e) => connCodes.includes(e?.code))) {
    return res.status(503).json({
      message: "Database tidak dapat dihubungi. Pastikan MySQL berjalan dan konfigurasi backend/.env benar.",
    });
  }

  const message = err.message || err.errors?.[0]?.message || "Terjadi kesalahan pada server";
  res.status(err.status || 500).json({ message });
}
