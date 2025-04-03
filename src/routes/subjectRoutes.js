import express from 'express';
import { verifyRole } from '../middleware/roleMiddleware.js';
import * as subjectController from '../controllers/subjectController.js';

const router = express.Router();

// Routes protégées pour les administrateurs
router.post('/subjects', verifyRole(['superadmin', 'admin']), subjectController.createSubject);
router.get('/subjects', verifyRole(['superadmin', 'admin']), subjectController.getAllSubjects);
router.get('/subjects/:id', verifyRole(['superadmin', 'admin']), subjectController.getSubjectById);
router.put('/subjects/:id', verifyRole(['superadmin', 'admin']), subjectController.updateSubject);
router.delete('/subjects/:id', verifyRole(['superadmin', 'admin']), subjectController.deleteSubject);

export default router;