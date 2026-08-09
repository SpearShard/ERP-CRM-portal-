import { Router } from "express";
import {
  createChallan,
  confirmChallan,
  getChallans,
  getChallanById,
  cancelChallan,
} from "../controllers/challan.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

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