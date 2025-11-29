import express from "express";
import { showRegisterPage, handleRegister } from "../controllers/registerController.js";

const router = express.Router();

router.get("/", showRegisterPage);
router.post("/", handleRegister);

export default router;
