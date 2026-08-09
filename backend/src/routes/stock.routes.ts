import { Router } from "express";
import {
  createStockMovement,
  getProductStockMovements,
} from "../controllers/stock.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/products/:id/stock",
  authenticate,
  authorize("ADMIN", "WAREHOUSE"),
  createStockMovement
);

router.get(
  "/products/:id/movements",
  authenticate,
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getProductStockMovements
);

export default router;