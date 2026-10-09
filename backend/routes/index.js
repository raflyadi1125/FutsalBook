import { Router } from "express";
import authRoutes from "./authRoutes.js";
import fieldRoutes from "./fieldRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const router = Router();

router.get("/health", (req, res) => res.json({ status: "ok" }));
router.use("/auth", authRoutes);
router.use("/fields", fieldRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);

export default router;