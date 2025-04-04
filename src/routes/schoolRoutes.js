import express from "express";
import { registerSchool, login, logout, verifyUser, resendVerificationCode, getEmailFromToken } from "../controllers/schoolController.js";
import { upload } from "../middleware/upload.js";
import { authenticate } from "../middleware/authMiddleware.js";
const router = express.Router();

// Route d'inscription d'une école
router.post("/register",upload.single("profilePhoto"), registerSchool);
router.post("/login", login);
router.get("/logout", authenticate, logout);
router.post("/verify-email", verifyUser);
router.post("/resend-code", resendVerificationCode);
router.get("/get-email-token", authenticate, getEmailFromToken);

export default router;
