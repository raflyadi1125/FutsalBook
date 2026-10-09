import { Router } from "express";
import * as ctrl from "../controllers/auth/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/me", verifyToken, ctrl.me);

export default router;