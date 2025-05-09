import express from "express";
import { verifyRole } from '../middleware/roleMiddleware.js';
import * as classroomController from '../controllers/classroomController.js';

const router = express.Router();

// Routes protégées pour les administrateurs
router.post('/classrooms', verifyRole(['superadmin', 'admin']), classroomController.createClassroom);
router.get('/classrooms', verifyRole(['superadmin', 'admin']), classroomController.getAllClassrooms);
router.get('/classrooms/:id', verifyRole(['superadmin', 'admin']), classroomController.getClassroomById);
router.put('/classrooms/:id', verifyRole(['superadmin', 'admin']), classroomController.updateClassroom);
router.delete('/classrooms/:id', verifyRole(['superadmin', 'admin']), classroomController.deleteClassroom);

export default router;