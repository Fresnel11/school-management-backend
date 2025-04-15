import express from 'express';
import { verifyRole } from '../middleware/roleMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';
import * as studentController from '../controllers/studentController.js'; 

const router = express.Router();

// Créer un élève
router.post('/students', authenticate, verifyRole(['superadmin', 'admin']), studentController.createStudent);

// Réinscrire un élève
router.post('/students/reinscription', authenticate, verifyRole(['superadmin', 'admin']), studentController.reinscrireStudent);

// Récupérer l'historique d'inscription
router.get('/students/:id/inscriptions', authenticate, verifyRole(['superadmin', 'admin']), studentController.getStudentInscriptions);

// Récupérer tous les élèves NON archivés
router.get('/students', authenticate, verifyRole(['superadmin', 'admin']), studentController.getAllStudents);

// Récupérer tous les élèves archivés
router.get('/students/archived', authenticate, verifyRole(['superadmin', 'admin']), studentController.getArchivedStudents);

// Récupérer le stats des élèves
router.get('/students/stats', authenticate, verifyRole(['superadmin', 'admin']), studentController.getStudentStats);

// Récupérer un élève par ID
router.get('/students/:id', authenticate, verifyRole(['superadmin', 'admin']), studentController.getStudentById);

// Mettre à jour un élève
router.put('/students/:id', authenticate, verifyRole(['superadmin', 'admin']), studentController.updateStudent);

// Archiver un élève
router.put('/students/:id/archive', authenticate, verifyRole(['superadmin', 'admin']), studentController.archiveStudent);

// Supprimer définitivement un élève
router.delete('/students/:id', authenticate, verifyRole(['superadmin', 'admin']), studentController.deleteStudent);



export default router;
