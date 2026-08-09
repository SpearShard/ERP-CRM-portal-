import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get(
  "/stats",
  authenticate,
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getDashboardStats
);

export default router;