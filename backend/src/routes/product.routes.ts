import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

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