import mongoose from 'mongoose';
import Parent from './src/models/Parent.js';
import Student from './src/models/student.js';
import Classroom from './src/models/Classroom.js';

const migrateParents = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect('mongodb://localhost:27017/school_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à la base de données.');

    // Trouver tous les parents sans school_id
    const parentsWithoutSchoolId = await Parent.find({ school_id: { $exists: false } }).populate('students');
    console.log(`Nombre de parents sans school_id : ${parentsWithoutSchoolId.length}`);

    for (const parent of parentsWithoutSchoolId) {
      if (parent.students && parent.students.length > 0) {
        // Récupérer le premier étudiant associé au parent
        const student = await Student.findById(parent.students[0]).populate('classroomId');
        if (student && student.classroomId) {
          // Récupérer l'école à partir de la salle de classe de l'étudiant
          const classroom = await Classroom.findById(student.classroomId);
          if (classroom && classroom.school) {
            parent.school_id = classroom.school;
            await parent.save();
            console.log(`Parent ${parent._id} mis à jour avec school_id ${parent.school_id}`);
          } else {
            console.warn(`Impossible de trouver l'école pour l'étudiant ${student._id} du parent ${parent._id}`);
          }
        } else {
          console.warn(`Aucun étudiant valide trouvé pour le parent ${parent._id}`);
        }
      } else {
        console.warn(`Le parent ${parent._id} n'a aucun étudiant associé. Suppression recommandée.`);
        // Optionnel : Supprimer les parents sans étudiants
        // await Parent.findByIdAndDelete(parent._id);
      }
    }

    console.log('Migration terminée.');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Erreur lors de la migration :', error);
    await mongoose.connection.close();
  }
};

// Exécuter la migration
migrateParents();