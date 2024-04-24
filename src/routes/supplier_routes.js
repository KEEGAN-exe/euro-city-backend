import Router from "express";
import {
  createSupplier,
  deleteSupplier,
  findSupplierById,
  getAllSuppliers,
  updateSupplier,
} from "../services/suppliers_service.js";

const router = Router();

router.get("/", getAllSuppliers);
router.get("/:supplier_id", findSupplierById);
router.post("/", createSupplier);
router.patch("/:supplier_id", updateSupplier);
router.delete("/:supplier_id", deleteSupplier);

export default router;
