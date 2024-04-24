import { Router } from "express";
import {
  createUser,
  deleteUserById,
  getUser,
  updateUser,
} from "../services/user_service.js";

const router = Router();

router.get("/", getUser);
router.post("/", createUser);
router.patch("/:user_id", updateUser);
router.delete("/:user_id", deleteUserById);

export default router;
