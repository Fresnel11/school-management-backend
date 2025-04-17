import Classroom from '../models/Classroom.js';

// Créer une classe
const createClassroom = async (req, res) => {
    try {
      // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
      console.log("req.user:", req.user); // Ajout d'un log pour déboguer
      if (!req.user || !req.user.school || !req.user.school._id) {
        return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
      }
  
      // Étape 2 : Extraire les données de la requête
      const { name, level, capacity, description, principalTeacher, classDelegate } = req.body;
  
      // Étape 3 : Vérifier si l'élève est déjà délégué dans une autre classe
      if (classDelegate) {
        const existingClass = await Classroom.findOne({ classDelegate });
        if (existingClass) {
          return res.status(400).json({
            message: `Cet élève est déjà délégué de la classe ${existingClass.name}.`,
          });
        }
      }
  
      // Étape 4 : Créer une nouvelle classe
      // - On utilise req.user.school._id pour obtenir l'ID de l'école
      const newClassroom = new Classroom({
        name,
        level,
        capacity,
        description,
        principalTeacher,
        classDelegate,
        school: req.user.school._id, // Utilisation de l'ID de l'école
      });
  
      // Étape 5 : Sauvegarder la classe
      await newClassroom.save();
  
      // Étape 6 : Renvoyer une réponse de succès
      res.status(201).json({ message: "Classe créée avec succès.", classroom: newClassroom });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la création de la classe.", error });
    }
  };
// Mettre à jour une classe
const updateClassroom = async (req, res) => {
    try {
      const { name, level, capacity, description, principalTeacher, classDelegate } = req.body;
      const classroomId = req.params.id;
  
      // Vérifier si l'élève est déjà délégué dans une autre classe
      if (classDelegate) {
        const existingClass = await Classroom.findOne({
          classDelegate,
          _id: { $ne: classroomId }, // Exclure la classe actuelle
        });
  
        if (existingClass) {
          return res.status(400).json({
            message: `Cet élève est déjà délégué de la classe ${existingClass.name}.`,
          });
        }
      }
  
      const classroom = await Classroom.findByIdAndUpdate(
        req.params.id,
        {
          name,
          level,
          capacity,
          description,
          principalTeacher,
          classDelegate,
        },
        { new: true }
      );
  
      if (!classroom) {
        return res.status(404).json({ message: "Classe non trouvée." });
      }
  
      res.status(200).json({ message: "Classe mise à jour avec succès.", classroom });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de la classe.", error });
    }
  };

// Récupérer toutes les classes (uniquement celles de l'école de l'utilisateur)
const getAllClassrooms = async (req, res) => {
    try {
      // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
      if (!req.user || !req.user.school) {
        return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
      }
  
      // Étape 2 : Récupérer l'ID de l'école de l'utilisateur
      const schoolId = req.user.school;
  
      // Étape 3 : Récupérer les classes de l'école de l'utilisateur
      // - On ajoute une condition { school: schoolId } pour ne récupérer que les classes de cette école
      const classrooms = await Classroom.find({ school: schoolId })
        .populate("principalTeacher", "firstName lastName email") // Charger les infos du professeur principal
        .populate("classDelegate", "firstName lastName email"); // Charger les infos du délégué de classe
  
      // Étape 4 : Renvoyer les classes trouvées
      res.status(200).json(classrooms);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la récupération des classes.", error });
    }
  };;

// Récupérer une classe par ID (avec le professeur et le délégué)
// Récupérer une classe par ID (uniquement si elle appartient à l'école de l'utilisateur)
const getClassroomById = async (req, res) => {
    try {
      // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
      if (!req.user || !req.user.school) {
        return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
      }
  
      // Étape 2 : Récupérer l'ID de l'école de l'utilisateur
      const schoolId = req.user.school;
  
      // Étape 3 : Récupérer la classe par ID, mais uniquement si elle appartient à l'école de l'utilisateur
      // - On utilise findOne avec deux conditions : l'ID de la classe et l'ID de l'école
      const classroom = await Classroom.findOne({
        _id: req.params.id,
        school: schoolId,
      })
        .populate("principalTeacher", "firstName lastName email")
        .populate("classDelegate", "firstName lastName email");
  
      // Étape 4 : Vérifier si la classe existe
      // - Si aucune classe n'est trouvée (soit elle n'existe pas, soit elle n'appartient pas à l'école), on renvoie une erreur 404
      if (!classroom) {
        return res.status(404).json({ message: "Classe non trouvée ou vous n'y avez pas accès." });
      }
  
      // Étape 5 : Renvoyer la classe trouvée
      res.status(200).json(classroom);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la récupération de la classe.", error });
    }
  };

// Supprimer une classe
// Supprimer une classe
const deleteClassroom = async (req, res) => {
    try {
      const classroom = await Classroom.findByIdAndDelete(req.params.id);
  
      if (!classroom) {
        return res.status(404).json({ message: "Classe non trouvée." });
      }
  
      res.status(200).json({ message: "Classe supprimée avec succès." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la suppression de la classe.", error });
    }
  }


export { createClassroom, getAllClassrooms, getClassroomById, updateClassroom, deleteClassroom };
