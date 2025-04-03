import express from 'express';
import { verifyRole } from '../middleware/roleMiddleware.js';
import * as studentController from '../controllers/studentController.js'; 

const router = express.Router();

// Routes protégées pour les administrateurs
router.post('/students', verifyRole(['superadmin', 'admin']), studentController.createStudent);
router.post('/students/reinscription', verifyRole(['superadmin', 'admin']), studentController.reinscrireStudent);
router.get('/:id/inscriptions', verifyRole(['superadmin', 'admin']), studentController.getStudentInscriptions);
router.get('/students', verifyRole(['superadmin', 'admin']), studentController.getAllStudents);
router.get('/students/:id', verifyRole(['superadmin', 'admin']), studentController.getStudentById);
router.put('/students/:id', verifyRole(['superadmin', 'admin']), studentController.updateStudent);
router.delete('/students/:id', verifyRole(['superadmin', 'admin']), studentController.deleteStudent);

export default router;
