import express from "express";
import { registerSchool, login, logout } from "../controllers/schoolController.js";

const router = express.Router();

// Route d'inscription d'une école
router.post("/register", registerSchool);
router.post("/login", login);
router.post("/logout", logout);

export default router;
