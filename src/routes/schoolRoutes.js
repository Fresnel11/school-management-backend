import express from "express";
import { registerSchool } from "../controllers/schoolController.js";

const router = express.Router();

// Route d'inscription d'une école
router.post("/register", registerSchool);

export default router;
