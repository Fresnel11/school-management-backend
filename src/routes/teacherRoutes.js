import express from 'express';
import { verifyRole } from '../middleware/roleMiddleware.js';
import * as teacherController from '../controllers/teacherController.js';

const router = express.Router();

// Routes protégées pour les administrateurs
router.post('/teachers', verifyRole(['superadmin', 'admin']), teacherController.createTeacher);
router.get('/teachers', verifyRole(['superadmin', 'admin']), teacherController.getAllTeachers);
router.get('/teachers/:id', verifyRole(['superadmin', 'admin']), teacherController.getTeacherById);
router.put('/teachers/:id', verifyRole(['superadmin', 'admin']), teacherController.updateTeacher);
router.delete('/teachers/:id', verifyRole(['superadmin', 'admin']), teacherController.deleteTeacher);   

export default router;