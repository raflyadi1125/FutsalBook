import { query } from "../config/db.js";

export async function findByEmail(email) {
  const rows = await query("SELECT * FROM users WHERE email = :email LIMIT 1", { email });
  return rows[0] ?? null;
}

export async function findById(id) {
  const rows = await query(
    "SELECT id, name, email, phone, role, created_at FROM users WHERE id = :id LIMIT 1",
    { id }
  );
  return rows[0] ?? null;
}

export async function create({ name, email, phone = null, passwordHash, role = "user" }) {
  const result = await query(
    "INSERT INTO users (name, email, phone, password_hash, role) VALUES (:name, :email, :phone, :passwordHash, :role)",
    { name, email, phone, passwordHash, role }
  );
  return findById(result.insertId);
}
