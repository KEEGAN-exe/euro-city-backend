import Router from "express";
import { checkAccount } from "../services/authentication.js";

const router = Router();

router.post("/", checkAccount);

export default router;
