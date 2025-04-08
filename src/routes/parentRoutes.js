import express from "express";
import {
  createParent,
  getAllParents,
  getParentById,
  updateParent,
  deleteParent,
} from "../controllers/parentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/parents", authenticate, createParent); 
router.get("/parents", authenticate, getAllParents); 
router.get("/parents/:id", authenticate, getParentById); 
router.put("/parents/:id", authenticate, updateParent); 
router.delete("/parents/:id", authenticate, deleteParent); 
export default router;