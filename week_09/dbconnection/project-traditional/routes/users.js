import express from "express";
import { showUsers } from "../controllers/usersController.js";

const router = express.Router();
router.get("/", showUsers);

export default router;
