import { query } from "../config/db.js";

export async function findByBookingId(bookingId) {
  const rows = await query(
    "SELECT * FROM payments WHERE booking_id = :bookingId ORDER BY created_at DESC",
    { bookingId }
  );
  return rows;
}

export async function findById(id) {
  const rows = await query(
    `SELECT p.*, b.user_id AS booking_user_id, b.status AS booking_status
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     WHERE p.id = :id
     LIMIT 1`,
    { id }
  );
  return rows[0] ?? null;
}

export async function create({ bookingId, amount, method, status = "pending" }) {
  const result = await query(
    `INSERT INTO payments (booking_id, amount, method, status)
     VALUES (:bookingId, :amount, :method, :status)`,
    { bookingId, amount, method, status }
  );
  const rows = await query("SELECT * FROM payments WHERE id = :id", { id: result.insertId });
  return rows[0];
}

export async function updateStatus(id, status, { paidAt = null, reference = null } = {}) {
  await query(
    `UPDATE payments SET
      status = :status,
      paid_at = COALESCE(:paidAt, paid_at),
      reference = COALESCE(:reference, reference)
    WHERE id = :id`,
    { id, status, paidAt, reference }
  );
  const rows = await query("SELECT * FROM payments WHERE id = :id", { id });
  return rows[0] ?? null;
}

export async function findAll({ status, userId } = {}) {
  const conditions = [];
  const params = {};

  if (status) {
    conditions.push("p.status = :status");
    params.status = status;
  }
  if (userId) {
    conditions.push("b.user_id = :userId");
    params.userId = userId;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return query(
    `SELECT p.*, b.booking_date, b.start_time, b.user_id AS booking_user_id, f.name AS field_name
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     JOIN fields f ON f.id = b.field_id
     ${where}
     ORDER BY p.created_at DESC`,
    params
  );
}
