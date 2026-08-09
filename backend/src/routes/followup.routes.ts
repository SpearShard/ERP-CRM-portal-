import { Router } from "express";
import {
  createFollowUp,
  getCustomerFollowUps,
} from "../controllers/followup.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";


const router = Router();

router.post(
  "/customers/:customerId/follow-ups",
  authenticate,
  authorize("ADMIN", "SALES"),
  createFollowUp
);

router.get(
  "/customers/:customerId/follow-ups",
  authenticate,
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getCustomerFollowUps
);

export default router;