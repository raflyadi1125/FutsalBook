import * as bookingModel from "../../models/bookingModel.js";
import * as fieldModel from "../../models/fieldModel.js";

export async function list(req, res, next) {
  try {
    const filters = req.query.admin === "1" && req.user.role === "admin"
      ? req.query
      : { ...req.query, userId: req.user.id };

    const bookings = await bookingModel.findAll(filters);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const booking = await bookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking tidak ditemukan" });
    if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
      return res.status(403).json({ message: "Bukan booking milik Anda" });
    }
    res.json({ booking });
  } catch (err) {
    next(err);
  }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function create(req, res, next) {
  try {
    const { fieldId, date, time, notes } = req.body;

    if (!fieldId || !date || !time) {
      return res.status(400).json({ message: "fieldId, date, dan time wajib diisi" });
    }
    if (!DATE_RE.test(String(date))) {
      return res.status(400).json({ message: "date harus berformat YYYY-MM-DD" });
    }
    if (!TIME_RE.test(String(time))) {
      return res.status(400).json({ message: "time harus berformat HH:MM" });
    }

    const field = await fieldModel.findById(fieldId);
    if (!field) return res.status(404).json({ message: "Lapangan tidak ditemukan" });
    if (field.status !== "active") {
      return res.status(400).json({ message: "Lapangan tidak aktif" });
    }

    if (await bookingModel.isSlotTaken({ fieldId, date, time })) {
      return res.status(409).json({ message: "Jam tersebut sudah dibooking" });
    }

    const booking = await bookingModel.create({
      userId: req.user.id,
      fieldId,
      date,
      time,
      notes: notes ?? null,
    });

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const existing = await bookingModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Booking tidak ditemukan" });
    if (req.user.role !== "admin" && existing.user_id !== req.user.id) {
      return res.status(403).json({ message: "Bukan booking milik Anda" });
    }

    const booking = await bookingModel.updateStatus(req.params.id, status);
    res.json({ booking });
  } catch (err) {
    next(err);
  }
}
