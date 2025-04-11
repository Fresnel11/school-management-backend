import Student from '../models/student.js';
import Parent from '../models/Parent.js';

const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
      email,
      classroomId,
      status, // Ajouter status ici
      documents,
      parents = [],
    } = req.body;

    if (parents.length > 2) {
      return res.status(400).json({ message: "Un élève ne peut avoir que deux parents/tuteurs légaux maximum." });
    }

    // Créer l'élève
    const newStudent = new Student({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
      email,
      classroomId,
      status, // Ajouter status ici
      documents,
      parents: [],
    });

    await newStudent.save();

    const parentIds = [];

    // Créer ou retrouver les parents
    for (const parentData of parents) {
      let parent = await Parent.findOne({ email: parentData.email });

      if (!parent) {
        parent = await Parent.create(parentData);
      }

      parentIds.push(parent._id);

      if (!parent.students.includes(newStudent._id)) {
        await Parent.findByIdAndUpdate(parent._id, { $push: { students: newStudent._id } });
      }
    }

    // Mettre à jour l'élève avec les parents
    newStudent.parents = parentIds;
    await newStudent.save();

    // Peupler les données pour renvoyer une réponse complète
    const populatedStudent = await Student.findById(newStudent._id)
      .populate("classroomId")
      .populate("parents");

    res.status(201).json({ message: "Élève créé avec succès.", student: populatedStudent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de l'élève.", error });
  }
};



const reinscrireStudent = async (req, res) => {
    try {
        const { studentId, newClassroomId, startDate, endDate } = req.body;

        // Vérifier si l'étudiant existe
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Élève non trouvé.' });
        }

        // Marquer la dernière inscription comme terminée
        if (student.inscriptions.length > 0) {
            student.inscriptions[student.inscriptions.length - 1].status = 'completed';
        }

        // Ajouter une nouvelle inscription
        student.inscriptions.push({
            classroomId: newClassroomId,
            startDate,
            endDate,
            status: 'active'
        });

        // Sauvegarder les modifications
        await student.save();

        res.status(200).json({ message: 'Réinscription réussie.', student });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la réinscription.' });
    }
};

// Récupérer l'historique des inscriptions d'un élève
const getStudentInscriptions = async (req, res) => {
    try {
      const student = await Student.findById(req.params.id)
        .populate('inscriptions.classroomId', 'name')  // Remplace 'name' par les champs que tu veux afficher de la classroom.
        .populate('parents', 'firstName lastName email phoneNumber'); // Remplace les champs par ceux que tu veux afficher des parents.
  
      if (!student) {
        return res.status(404).json({ message: 'Élève non trouvé.' });
      }
  
      res.status(200).json({
        message: 'Historique des inscriptions récupéré avec succès.',
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          inscriptions: student.inscriptions
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique des inscriptions.' });
    }
  };
  


// Récupérer tous les élèves
const getAllStudents = async (req, res) => {
    try {
      const students = await Student.find({
        $or: [{ archived: false }, { archived: { $exists: false } }]
      })
        .populate('parents')
        .populate('classroomId');
  
      res.status(200).json(students);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la récupération des élèves.' });
    }
  };

  const getArchivedStudents = async (req, res) => {
    try {
      const archivedStudents = await Student.find({ archived: true })
        .populate('parents')
        .populate('classroomId');
  
      res.status(200).json(archivedStudents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la récupération des élèves archivés.' });
    }
  };
  

// Récupérer un élève par son ID
const getStudentById = async (req, res) => {
    try {
      const student = await Student.findById(req.params.id)
        .populate('parents')
        .populate('classroomId');
  
      if (!student) {
        return res.status(404).json({ message: 'Élève non trouvé.' });
      }
  
      res.status(200).json(student);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'élève.' });
    }
  };
  

// Mettre à jour un élève
const updateStudent = async (req, res) => {
  try {
    const {
      parents = [],
      ...studentFields
    } = req.body;

    const allowedFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'address',
      'phoneNumber', 'email', 'classroomId', 'documents', 'status'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (studentFields[field] !== undefined) {
        updates[field] = studentFields[field];
      }
    });

    // Met à jour les infos de l'élève
    const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé.' });
    }

    // Gérer les parents (si inclus dans la requête)
    if (parents.length > 0) {
      if (parents.length > 2) {
        return res.status(400).json({ message: 'Un élève ne peut avoir que deux parents/tuteurs légaux maximum.' });
      }

      const newParentIds = [];

      for (const parentData of parents) {
        let parent = await Parent.findOne({ email: parentData.email });

        if (parent) {
          // Mise à jour du parent existant
          await Parent.findByIdAndUpdate(parent._id, parentData);
        } else {
          // Création d’un nouveau parent
          parent = await Parent.create(parentData);
        }

        // Ajout de la relation parent → élève si elle n'existe pas
        if (!parent.students.includes(student._id)) {
          await Parent.findByIdAndUpdate(parent._id, { $addToSet: { students: student._id } });
        }

        newParentIds.push(parent._id);
      }

      // Mise à jour de la relation élève → parents
      student.parents = newParentIds;
      await student.save();
    }

    const populatedStudent = await Student.findById(student._id)
      .populate("classroomId")
      .populate("parents");

    res.status(200).json({ message: 'Élève et parents mis à jour avec succès.', student: populatedStudent });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'élève.', error });
  }
};
  

// Supprimer un élève
const deleteStudent = async (req, res) => {
  try {
    // Récupérer l'élève avec ses parents
    const student = await Student.findById(req.params.id).populate('parents');

    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé.' });
    }

    // Traiter chaque parent lié à l'élève
    for (const parent of student.parents) {
      // Récupérer le parent et ses étudiants associés
      const parentRecord = await Parent.findById(parent._id).populate('students');

      // Vérifier les autres étudiants liés au parent (exclure l'étudiant actuel)
      const otherStudents = parentRecord.students.filter(
        (sid) => sid._id.toString() !== student._id.toString()
      );

      if (otherStudents.length === 0) {
        // Si le parent n'a plus d'autres étudiants, le supprimer
        await Parent.findByIdAndDelete(parent._id);
      } else {
        // Sinon, retirer l'étudiant de la liste des étudiants du parent
        await Parent.findByIdAndUpdate(parent._id, {
          $pull: { students: student._id },
        });
      }
    }

    // Supprimer l'élève
    await Student.findByIdAndDelete(student._id);

    res.status(200).json({ message: 'Élève (et parents associés si nécessaire) supprimé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'élève.' });
  }
};

// Archiver un élève
const archiveStudent = async (req, res) => {
  try {
    // Récupérer l'élève avec ses parents
    const student = await Student.findById(req.params.id).populate('parents');

    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé.' });
    }

    // Archiver l'élève
    student.archived = true;
    await student.save();

    // Traiter chaque parent lié à l'élève
    for (const parent of student.parents) {
      // Récupérer le parent et ses étudiants associés
      const parentRecord = await Parent.findById(parent._id).populate('students');

      // Vérifier les autres étudiants liés au parent (exclure l'étudiant actuel)
      const otherStudents = parentRecord.students.filter(
        (sid) => sid._id.toString() !== student._id.toString()
      );

      if (otherStudents.length === 0) {
        // Si le parent n'a plus d'autres étudiants, l'archiver
        parentRecord.archived = true;
        await parentRecord.save();
      } else {
        // Vérifier si tous les autres étudiants sont archivés
        const allOtherStudentsArchived = otherStudents.every(
          (otherStudent) => otherStudent.archived === true
        );

        if (allOtherStudentsArchived) {
          // Si tous les autres étudiants sont archivés, archiver le parent
          parentRecord.archived = true;
          await parentRecord.save();
        }

        // Retirer l'étudiant archivé de la liste des étudiants du parent
        await Parent.findByIdAndUpdate(parent._id, {
          $pull: { students: student._id },
        });
      }
    }

    res.status(200).json({ message: 'Élève archivé avec succès (parents archivés si nécessaires).' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'archivage de l\'élève.' });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);

    // Fonction d'arrondi utilitaire
    const roundPercent = (value, total) => {
      if (!total || total === 0) return 0;
      return Number(((value / total) * 100).toFixed(1)); // arrondi à 1 chiffre après la virgule
    };

    const [
      totalStudents,
      activeStudents,
      archivedStudents,
      studentsThisYear,
      studentsLastYear,
      boys,
      girls,
      missingDocs,
      atRisk,
      noParents
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ archived: false }),
      Student.countDocuments({ archived: true }),
      Student.countDocuments({ createdAt: { $gte: startOfYear } }),
      Student.countDocuments({ createdAt: { $gte: lastYearStart, $lte: lastYearEnd } }),
      Student.countDocuments({ gender: 'Homme' }),
      Student.countDocuments({ gender: 'Femme' }),
      Student.countDocuments({ documents: { $exists: true, $size: 0 } }),
      Student.countDocuments({ status: { $in: ["to be watched", "in difficulty"] } }),
      Student.countDocuments({ parents: { $size: 0 } }),
    ]);

    const evolutionPercentage =
      studentsLastYear === 0
        ? null
        : Number((((studentsThisYear - studentsLastYear) / studentsLastYear) * 100).toFixed(1));

    res.json({
      totalStudents,
      activeStudents,
      archivedStudents,
      studentsThisYear,
      studentsLastYear,
      evolutionPercentage,
      boys,
      girls,
      genderDistribution: {
        boysPercent: roundPercent(boys, totalStudents),
        girlsPercent: roundPercent(girls, totalStudents),
      },
      missingDocs,
      missingDocsPercent: roundPercent(missingDocs, totalStudents),
      atRisk,
      atRiskPercent: roundPercent(atRisk, totalStudents),
      noParents,
      noParentsPercent: roundPercent(noParents, totalStudents)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques", error });
  }
};





export {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    reinscrireStudent,
    getStudentInscriptions,
    archiveStudent,
    getArchivedStudents,
    getStudentStats,
};
