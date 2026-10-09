import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { pool } from "./config/db.js";

dotenv.config({ path: fileURLToPath(new URL(".env", import.meta.url)) });

if (!process.env.JWT_SECRET) {
  console.warn("PERINGATAN: JWT_SECRET belum di-set di backend/.env — login akan gagal.");
}

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`FutsalBook API berjalan di http://localhost:${PORT}`);
  try {
    await pool.query("SELECT 1");
    console.log(`Terhubung ke database ${process.env.DB_NAME || "futsal_book"}`);
  } catch (err) {
    const detail = err.message || err.errors?.[0]?.message || err.code || "unknown error";
    console.error(
      `Tidak bisa terhubung ke MySQL (${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}): ${detail}`
    );
    console.error("Pastikan MySQL berjalan lalu import database/schema.sql");
  }
});