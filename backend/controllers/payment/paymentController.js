import * as paymentModel from "../../models/paymentModel.js";
import * as bookingModel from "../../models/bookingModel.js";

export async function list(req, res, next) {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.user.role !== "admin") filters.userId = req.user.id;

    res.json({ payments: await paymentModel.findAll(filters) });
  } catch (err) {
    next(err);
  }
}

export async function getByBooking(req, res, next) {
  try {
    const booking = await bookingModel.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking tidak ditemukan" });
    if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
      return res.status(403).json({ message: "Bukan booking milik Anda" });
    }

    const payments = await paymentModel.findByBookingId(req.params.bookingId);
    res.json({ payments });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { bookingId, amount, method } = req.body;
    if (!bookingId || !amount || !method) {
      return res.status(400).json({ message: "bookingId, amount, dan method wajib diisi" });
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "amount harus berupa angka > 0" });
    }

    const booking = await bookingModel.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking tidak ditemukan" });
    if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
      return res.status(403).json({ message: "Bukan booking milik Anda" });
    }
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking sudah dibatalkan" });
    }

    const payment = await paymentModel.create({ bookingId, amount: amountNum, method });
    res.status(201).json({ payment });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status, reference } = req.body;
    if (!["pending", "paid", "failed", "refunded"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const existing = await paymentModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
    if (req.user.role !== "admin" && existing.booking_user_id !== req.user.id) {
      return res.status(403).json({ message: "Bukan pembayaran milik Anda" });
    }

    const paidAt = status === "paid" ? new Date() : null;
    const payment = await paymentModel.updateStatus(req.params.id, status, { paidAt, reference });
    if (!payment) return res.status(404).json({ message: "Pembayaran tidak ditemukan" });

    if (status === "paid" && payment.status === "paid" && existing.booking_status !== "cancelled") {
      await bookingModel.updateStatus(payment.booking_id, "confirmed");
    }

    res.json({ payment });
  } catch (err) {
    next(err);
  }
}
