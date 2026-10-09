import { Router } from "express";
import * as ctrl from "../controllers/payment/paymentController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.get("/booking/:bookingId", ctrl.getByBooking);
router.patch("/:id/status", ctrl.updateStatus);

export default router;