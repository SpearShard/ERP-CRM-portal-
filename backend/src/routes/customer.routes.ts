import { Router } from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deactivateCustomer,
} from "../controllers/customer.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SALES"),
  createCustomer
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getCustomers
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getCustomerById
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SALES"),
  updateCustomer
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SALES"),
  deactivateCustomer
);
export default router;