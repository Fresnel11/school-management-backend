import express from 'express';
import { verifyRole } from '../middleware/roleMiddleware.js';
import * as studentController from '../controllers/studentController.js'; 

const router = express.Router();

// Créer un élève
router.post('/students', verifyRole(['superadmin', 'admin']), studentController.createStudent);

// Réinscrire un élève
router.post('/students/reinscription', verifyRole(['superadmin', 'admin']), studentController.reinscrireStudent);

// Récupérer l'historique d'inscription
router.get('/students/:id/inscriptions', verifyRole(['superadmin', 'admin']), studentController.getStudentInscriptions);

// Récupérer tous les élèves NON archivés
router.get('/students', verifyRole(['superadmin', 'admin']), studentController.getAllStudents);

// Récupérer tous les élèves archivés
router.get('/students/archived', verifyRole(['superadmin', 'admin']), studentController.getArchivedStudents);

// Récupérer un élève par ID
router.get('/students/:id', verifyRole(['superadmin', 'admin']), studentController.getStudentById);

// Mettre à jour un élève
router.put('/students/:id', verifyRole(['superadmin', 'admin']), studentController.updateStudent);

// Archiver un élève
router.put('/students/:id/archive', verifyRole(['superadmin', 'admin']), studentController.archiveStudent);

// Supprimer définitivement un élève
router.delete('/students/:id', verifyRole(['superadmin', 'admin']), studentController.deleteStudent);

export default router;
