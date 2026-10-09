import { query } from "../config/db.js";

export async function findAll() {
  return query("SELECT * FROM fields ORDER BY id");
}

export async function findById(id) {
  const rows = await query("SELECT * FROM fields WHERE id = :id LIMIT 1", { id });
  return rows[0] ?? null;
}

export async function create({ name, description = null, price, status = "active" }) {
  const result = await query(
    "INSERT INTO fields (name, description, price, status) VALUES (:name, :description, :price, :status)",
    { name, description, price, status }
  );
  return findById(result.insertId);
}

export async function update(id, patch = {}) {
  const keys = ["name", "description", "price", "status"].filter((k) => patch[k] !== undefined);
  if (keys.length) {
    const params = { id };
    for (const k of keys) params[k] = patch[k];
    await query(`UPDATE fields SET ${keys.map((k) => `${k} = :${k}`).join(", ")} WHERE id = :id`, params);
  }
  return findById(id);
}

export async function remove(id) {
  const result = await query("DELETE FROM fields WHERE id = :id", { id });
  return result.affectedRows > 0;
}
