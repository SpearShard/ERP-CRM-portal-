import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "WAREHOUSE"),
  createProduct
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getProducts
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getProductById
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "WAREHOUSE"),
  updateProduct
);
export default router;