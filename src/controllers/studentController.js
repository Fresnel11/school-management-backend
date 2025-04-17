import Student from '../models/student.js';
import Parent from '../models/Parent.js';
import Classroom from "../models/Classroom.js";

// Créer un étudiant
const createStudent = async (req, res) => {
  try {
    // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
    if (!req.user || !req.user.school || !req.user.school._id) {
      return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
    }

    // Étape 2 : Extraire les données de la requête
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
      email,
      classroomId,
      status,
      documents,
      parents = [],
    } = req.body;

    // Étape 3 : Vérifier que la salle de classe appartient à l'école de l'utilisateur
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Salle de classe non trouvée." });
    }
    if (classroom.school.toString() !== req.user.school._id.toString()) {
      return res.status(403).json({ message: "La salle de classe n'appartient pas à votre école." });
    }

    // Étape 4 : Vérifier le nombre de parents
    if (parents.length > 2) {
      return res.status(400).json({ message: "Un élève ne peut avoir que deux parents/tuteurs légaux maximum." });
    }

    // Étape 5 : Créer ou récupérer les parents avant de créer l'étudiant
    const parentIds = [];
    for (const parentData of parents) {
      // Renommer "relationship" en "relationToStudent" pour correspondre au modèle Parent
      const correctedParentData = {
        ...parentData,
        relationToStudent: parentData.relationship || parentData.relationToStudent,
        school_id: req.user.school._id, // Ajouter le school_id de l'utilisateur authentifié
      };
      delete correctedParentData.relationship; // Supprimer l'ancien champ pour éviter les confusions

      // Chercher si un parent avec cet email existe déjà dans la même école
      let parent = await Parent.findOne({
        email: correctedParentData.email,
        school_id: req.user.school._id, // Restreindre la recherche à l'école de l'utilisateur
      });

      if (!parent) {
        // Créer un nouveau parent avec le school_id
        parent = await Parent.create(correctedParentData);
      }

      // Ajouter l'ID du parent à la liste
      parentIds.push(parent._id);
    }

    // Étape 6 : Créer l'étudiant uniquement si les parents ont été créés avec succès
    const newStudent = new Student({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
      email,
      classroomId,
      status,
      documents,
      parents: parentIds, // Associer les parents dès la création
    });

    // Étape 7 : Sauvegarder l'étudiant
    await newStudent.save();

    // Étape 8 : Mettre à jour les parents pour inclure l'étudiant
    for (const parentId of parentIds) {
      await Parent.findByIdAndUpdate(parentId, { $push: { students: newStudent._id } });
    }

    // Étape 9 : Récupérer l'étudiant avec les données peuplées
    const populatedStudent = await Student.findById(newStudent._id)
      .populate("classroomId")
      .populate("parents");

    // Étape 10 : Renvoyer une réponse de succès
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
  


// Récupérer tous les étudiants (filtrés par l'école de l'utilisateur via les salles de classe)
const getAllStudents = async (req, res) => {
  try {
    // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
    if (!req.user || !req.user.school || !req.user.school._id) {
      return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
    }

    // Étape 2 : Récupérer l'ID de l'école de l'utilisateur
    const schoolId = req.user.school._id;

    // Étape 3 : Trouver les salles de classe de l'école
    const classrooms = await Classroom.find({ school: schoolId }).select("_id");
    const classroomIds = classrooms.map((classroom) => classroom._id);

    // Étape 4 : Trouver les étudiants dans ces salles de classe
    const students = await Student.find({
      $and: [
        { classroomId: { $in: classroomIds } },
        { $or: [{ archived: false }, { archived: { $exists: false } }] },
      ],
    })
      .populate("parents")
      .populate("classroomId");

    // Étape 5 : Renvoyer les étudiants
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des élèves.", error });
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
    // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
    if (!req.user || !req.user.school || !req.user.school._id) {
      return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
    }

    // Étape 2 : Récupérer les salles de classe de l'école de l'utilisateur
    const classrooms = await Classroom.find({ school: req.user.school._id }).select("_id");
    const classroomIds = classrooms.map((classroom) => classroom._id);

    if (classroomIds.length === 0) {
      return res.status(404).json({ message: "Aucune salle de classe trouvée pour votre école." });
    }

    // Étape 3 : Récupérer l'élève avec ses parents et vérifier qu'il appartient à l'école
    const student = await Student.findOne({
      _id: req.params.id,
      classroomId: { $in: classroomIds },
    }).populate('parents');

    if (!student) {
      return res.status(404).json({ message: "Élève non trouvé ou vous n'avez pas accès à cet élève." });
    }

    // Étape 4 : Archiver l'élève
    student.archived = true;
    await student.save();

    // Étape 5 : Traiter chaque parent lié à l'élève
    for (const parent of student.parents) {
      // Vérifier que le parent appartient à l'école de l'utilisateur
      if (!parent.school_id || parent.school_id.toString() !== req.user.school._id.toString()) {
        console.warn(`Parent ${parent._id} n'a pas de school_id ou appartient à une autre école. Ignoré.`);
        continue; // Ignorer ce parent pour éviter des erreurs
      }

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

    res.status(200).json({ message: "Élève archivé avec succès (parents archivés si nécessaires)." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'archivage de l'élève.", error });
  }
};
const getStudentStats = async (req, res) => {
  try {
    // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
    if (!req.user || !req.user.school || !req.user.school._id) {
      return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
    }

    // Étape 2 : Récupérer l'ID de l'école de l'utilisateur
    const schoolId = req.user.school._id;

    // Étape 3 : Trouver les salles de classe de l'école
    const classrooms = await Classroom.find({ school: schoolId }).select("_id");
    const classroomIds = classrooms.map((classroom) => classroom._id);

    // Si aucune salle de classe n'est trouvée, retourner des stats vides
    if (classroomIds.length === 0) {
      return res.json({
        totalStudents: 0,
        activeStudents: 0,
        archivedStudents: 0,
        studentsThisYear: 0,
        studentsLastYear: 0,
        evolutionPercentage: null,
        boys: 0,
        girls: 0,
        genderDistribution: { boysPercent: 0, girlsPercent: 0 },
        missingDocs: 0,
        missingDocsPercent: 0,
        atRisk: 0,
        atRiskPercent: 0,
        noParents: 0,
        noParentsPercent: 0,
      });
    }

    // Étape 4 : Définir les dates pour les statistiques
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);

    // Fonction d'arrondi utilitaire
    const roundPercent = (value, total) => {
      if (!total || total === 0) return 0;
      return Number(((value / total) * 100).toFixed(1)); // arrondi à 1 chiffre après la virgule
    };

    // Étape 5 : Ajouter la restriction sur classroomId pour toutes les requêtes
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
      noParents,
    ] = await Promise.all([
      Student.countDocuments({ classroomId: { $in: classroomIds } }),
      Student.countDocuments({ classroomId: { $in: classroomIds }, archived: false }),
      Student.countDocuments({ classroomId: { $in: classroomIds }, archived: true }),
      Student.countDocuments({
        classroomId: { $in: classroomIds },
        createdAt: { $gte: startOfYear },
      }),
      Student.countDocuments({
        classroomId: { $in: classroomIds },
        createdAt: { $gte: lastYearStart, $lte: lastYearEnd },
      }),
      Student.countDocuments({ classroomId: { $in: classroomIds }, gender: 'Homme' }),
      Student.countDocuments({ classroomId: { $in: classroomIds }, gender: 'Femme' }),
      Student.countDocuments({
        classroomId: { $in: classroomIds },
        documents: { $exists: true, $size: 0 },
      }),
      Student.countDocuments({
        classroomId: { $in: classroomIds },
        status: { $in: ["to be watched", "in difficulty"] },
      }),
      Student.countDocuments({
        classroomId: { $in: classroomIds },
        parents: { $size: 0 },
      }),
    ]);

    const evolutionPercentage =
      studentsLastYear === 0
        ? null
        : Number((((studentsThisYear - studentsLastYear) / studentsLastYear) * 100).toFixed(1));

    // Étape 6 : Renvoyer les statistiques
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
      noParentsPercent: roundPercent(noParents, totalStudents),
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
