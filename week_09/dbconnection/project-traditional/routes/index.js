import express from "express";
import { showIndex } from "../controllers/indexController.js";

const router = express.Router();
router.get("/", showIndex);

export default router;
