import Router from "express";
import {
  createCategory,
  deleteCategory,
  findCategoryById,
  getAllCategories,
  updateCategory,
} from "../services/category_service.js";

const router = Router();

router.get("/", getAllCategories);
router.get("/:category_id", findCategoryById);
router.post("/", createCategory);
router.patch("/:category_id", updateCategory);
router.delete("/:category_id", deleteCategory);

export default router;
