import express from "express";
import { registerSchool, login, logout, verifyUser, resendVerificationCode, getEmailFromToken, sendResetCode, verifyResetCode, resetPassword, getCurrentUser } from "../controllers/schoolController.js";
import { upload } from "../middleware/upload.js";
import { authenticate } from "../middleware/authMiddleware.js";
const router = express.Router();

// Route d'inscription d'une école
router.post("/register",upload.single("profilePhoto"), registerSchool);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser); 
router.get("/logout", authenticate, logout);
router.post("/verify-email", verifyUser);
router.post("/resend-code", resendVerificationCode);
router.get("/get-email-token", authenticate, getEmailFromToken);
router.post("/send-reset-code", sendResetCode);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;
