import Subject from '../models/Subject.js';

// Ajouter une matière
export const createSubject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newSubject = new Subject({ name, description });
        await newSubject.save();
        res.status(201).json({ message: "Matière créée avec succès", subject: newSubject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de la matière", error });
    }
};

// Obtenir toutes les matières
export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des matières", error });
    }
};

// Récupérer une matière par son ID
export const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params; // L'ID de la matière envoyé dans l'URL

        // Chercher la matière dans la base de données
        const subject = await Subject.findById(id);
        
        // Vérifier si la matière existe
        if (!subject) {
            return res.status(404).json({ message: "Matière non trouvée" });
        }

        // Retourner la matière
        res.status(200).json({ subject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération de la matière" });
    }
};

// Mettre à jour une matière
export const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updatedSubject = await Subject.findByIdAndUpdate(id, { name, description }, { new: true });
        if (!updatedSubject) {
            return res.status(404).json({ message: "Matière non trouvée" });
        }
        res.status(200).json({ message: "Matière mise à jour avec succès", subject: updatedSubject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la matière" });
    }
};

// Supprimer une matière
export const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSubject = await Subject.findByIdAndDelete(id);
        if (!deletedSubject) {
            return res.status(404).json({ message: "Matière non trouvée" });
        }
        res.status(200).json({ message: "Matière supprimée avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de la matière" });
    }
};
