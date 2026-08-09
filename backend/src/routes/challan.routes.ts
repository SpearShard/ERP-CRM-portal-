import { Router } from "express";
import {
  createChallan,
  confirmChallan,
  getChallans,
  getChallanById,
  cancelChallan,
} from "../controllers/challan.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SALES"),
  createChallan
);

router.put(
  "/:id/confirm",
  authenticate,
  authorize("ADMIN", "SALES"),
  confirmChallan
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getChallans
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getChallanById
);

router.put(
  "/:id/cancel",
  authenticate,
  authorize("ADMIN", "SALES"),
  cancelChallan
);

export default router;