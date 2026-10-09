import { query } from "../config/db.js";

export async function findAll({ date, fieldId, status, userId } = {}) {
  const conditions = [];
  const params = {};

  if (date) {
    conditions.push("b.booking_date = :date");
    params.date = date;
  }
  if (fieldId) {
    conditions.push("b.field_id = :fieldId");
    params.fieldId = fieldId;
  }
  if (status) {
    conditions.push("b.status = :status");
    params.status = status;
  }
  if (userId) {
    conditions.push("b.user_id = :userId");
    params.userId = userId;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return query(
    `SELECT b.*, f.name AS field_name, f.price, u.name AS customer_name, u.phone
     FROM bookings b
     JOIN fields f ON f.id = b.field_id
     JOIN users u ON u.id = b.user_id
     ${where}
     ORDER BY b.booking_date DESC, b.start_time ASC`,
    params
  );
}

export async function findById(id) {
  const rows = await query(
    `SELECT b.*, f.name AS field_name, f.price, u.name AS customer_name, u.phone
     FROM bookings b
     JOIN fields f ON f.id = b.field_id
     JOIN users u ON u.id = b.user_id
     WHERE b.id = :id
     LIMIT 1`,
    { id }
  );
  return rows[0] ?? null;
}

export async function isSlotTaken({ fieldId, date, time, excludeId = null }) {
  const rows = await query(
    `SELECT id FROM bookings
     WHERE field_id = :fieldId
       AND booking_date = :date
       AND start_time = :time
       AND status != 'cancelled'
       AND (:excludeId IS NULL OR id != :excludeId)
     LIMIT 1`,
    { fieldId, date, time, excludeId }
  );
  return rows.length > 0;
}

export async function create({ userId, fieldId, date, time, notes = null }) {
  const result = await query(
    `INSERT INTO bookings (user_id, field_id, booking_date, start_time, notes)
     VALUES (:userId, :fieldId, :date, :time, :notes)`,
    { userId, fieldId, date, time, notes }
  );
  return findById(result.insertId);
}

export async function updateStatus(id, status) {
  await query("UPDATE bookings SET status = :status WHERE id = :id", { id, status });
  return findById(id);
}
