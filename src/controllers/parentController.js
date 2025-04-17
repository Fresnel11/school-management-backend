import Parent from "../models/Parent.js";
import mongoose from "mongoose";

// Créer un parent
export const createParent = async (req, res) => {
  try {
    // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
    if (!req.user || !req.user.school || !req.user.school._id) {
      return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
    }

    // Étape 2 : Ajouter le school_id de l'utilisateur authentifié au parent
    const parentData = {
      ...req.body,
      school_id: req.user.school._id, // Assigner l'école de l'utilisateur
    };

    const parent = new Parent(parentData);
    await parent.save();

    // Étape 3 : Vérifier que les étudiants associés (s'il y en a) appartiennent à la même école
    if (parent.students && parent.students.length > 0) {
      const students = await mongoose.model('Student').find({
        _id: { $in: parent.students },
        classroomId: {
          $in: await mongoose
            .model('Classroom')
            .find({ school: req.user.school._id })
            .select('_id'),
        },
      });

      if (students.length !== parent.students.length) {
        return res.status(400).json({ message: "Certains étudiants ne sont pas associés à votre école" });
      }
    }

    res.status(201).json({ message: "Parent créé avec succès", parent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création du parent", error });
  }
};

// Récupérer tous les parents
export const getAllParents = async (req, res) => {
  try {
    // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
    if (!req.user || !req.user.school || !req.user.school._id) {
      return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
    }

    // Étape 2 : Récupérer l'ID de l'école de l'utilisateur
    const schoolId = req.user.school._id;

    // Étape 3 : Trouver les parents associés à cette école
    const parents = await Parent.find({
      school_id: schoolId,
      $or: [{ archived: false }, { archived: { $exists: false } }],
    }).populate("students");

    res.json(parents);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des parents", error });
  }
};

// Récupérer un parent par ID
export const getParentById = async (req, res) => {
  try {
    // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
    if (!req.user || !req.user.school || !req.user.school._id) {
      return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
    }

    // Étape 2 : Vérifier que le parent appartient à l'école de l'utilisateur authentifié
    const parent = await Parent.findOne({
      _id: req.params.id,
      school_id: req.user.school._id,
    }).populate("students");

    if (!parent) {
      return res.status(404).json({ message: "Parent non trouvé ou vous n'avez pas accès à ce parent" });
    }

    res.json(parent);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du parent", error });
  }
};

// Mettre à jour un parent
export const updateParent = async (req, res) => {
  try {
    // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
    if (!req.user || !req.user.school || !req.user.school._id) {
      return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
    }

    // Étape 2 : Vérifier que le parent appartient à l'école de l'utilisateur authentifié
    const parent = await Parent.findOne({
      _id: req.params.id,
      school_id: req.user.school._id,
    });

    if (!parent) {
      return res.status(404).json({ message: "Parent non trouvé ou vous n'avez pas accès à ce parent" });
    }

    // Étape 3 : Mettre à jour le parent
    const updatedParent = await Parent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, school_id: req.user.school._id }, // Empêche la modification du school_id
      { new: true }
    );

    // Étape 4 : Vérifier que les étudiants associés (s'il y en a) appartiennent à la même école
    if (req.body.students && req.body.students.length > 0) {
      const students = await mongoose.model('Student').find({
        _id: { $in: req.body.students },
        classroomId: {
          $in: await mongoose
            .model('Classroom')
            .find({ school: req.user.school._id })
            .select('_id'),
        },
      });

      if (students.length !== req.body.students.length) {
        return res.status(400).json({ message: "Certains étudiants ne sont pas associés à votre école" });
      }
    }

    res.json({ message: "Parent mis à jour avec succès", parent: updatedParent });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du parent", error });
  }
};

// Supprimer un parent
export const deleteParent = async (req, res) => {
  try {
    // Étape 1 : Vérifier si l'utilisateur est connecté et a une école associée
    if (!req.user || !req.user.school || !req.user.school._id) {
      return res.status(403).json({ message: "Utilisateur non autorisé ou école non spécifiée" });
    }

    // Étape 2 : Vérifier que le parent appartient à l'école de l'utilisateur authentifié
    const parent = await Parent.findOne({
      _id: req.params.id,
      school_id: req.user.school._id,
    });

    if (!parent) {
      return res.status(404).json({ message: "Parent non trouvé ou vous n'avez pas accès à ce parent" });
    }

    await Parent.findByIdAndDelete(req.params.id);
    res.json({ message: "Parent supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du parent", error });
  }
};