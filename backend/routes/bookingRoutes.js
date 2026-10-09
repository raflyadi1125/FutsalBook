import { Router } from "express";
import * as ctrl from "../controllers/booking/bookingController.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.get("/:id", ctrl.getById);
router.patch("/:id/status", requireAdmin, ctrl.updateStatus);

export default router;