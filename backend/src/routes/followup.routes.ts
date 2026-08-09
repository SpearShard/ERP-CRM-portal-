import { Router } from "express";
import {
  createFollowUp,
  getCustomerFollowUps,
} from "../controllers/followup.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";


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