import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  findProductById,
  getAllProducts,
  updateProduct,
} from "../services/product_service.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/:product_id", findProductById);
router.post("/", createProduct);
router.patch("/:product_id", updateProduct);
router.delete("/:product_id", deleteProduct);

export default router;
