import { Router } from "express";
import * as ctrl from "../controllers/field/fieldController.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", verifyToken, requireAdmin, ctrl.create);
router.patch("/:id", verifyToken, requireAdmin, ctrl.update);
router.delete("/:id", verifyToken, requireAdmin, ctrl.remove);

export default router;