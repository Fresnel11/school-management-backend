import Teacher from "../models/Teacher.js";
import Subject from '../models/Subject.js';
// Ajouter un enseignant avec vérification du numéro de pièce d'identité
export const createTeacher = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, subjectId, identityDocument, identityNumber } = req.body;

        // Vérifier si un enseignant avec ce numéro de pièce d'identité existe déjà
        const existingTeacherById = await Teacher.findOne({ identityNumber });
        if (existingTeacherById) {
            return res.status(400).json({ message: "Un enseignant avec ce numéro de pièce d'identité existe déjà." });
        }

        // Vérifier si la matière existe
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(400).json({ message: "La matière spécifiée n'existe pas." });
        }

        // Vérifier si un enseignant avec cet email existe déjà
        const existingTeacherByEmail = await Teacher.findOne({ email });
        if (existingTeacherByEmail) {
            return res.status(400).json({ message: "Un enseignant avec cet email existe déjà." });
        }

        const newTeacher = new Teacher({
            firstName,
            lastName,
            email,
            phoneNumber,
            subject: subjectId,
            identityDocument,
            identityNumber
        });

        await newTeacher.save();
        res.status(201).json({ message: "Enseignant créé avec succès.", teacher: newTeacher });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de l'enseignant." });
    }
};


export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des enseignants." });
    }
};

export const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: "Enseignant non trouvé." });
        }
        res.status(200).json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération de l'enseignant." });
    }
};

export const updateTeacher = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, subjectId, identityDocument, identityNumber } = req.body;

        // Vérifier si l'enseignant existe
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: "Enseignant non trouvé." });
        }

        // Vérifier si la matière existe
        let updatedSubject = teacher.subject;
        if (subjectId) {
            const subject = await Subject.findById(subjectId);
            if (!subject) {
                return res.status(400).json({ message: "La matière spécifiée n'existe pas." });
            }
            updatedSubject = subjectId;
        }

        // Si l'email a changé, vérifier si l'email est déjà pris par un autre enseignant
        if (email && email !== teacher.email) {
            const emailExists = await Teacher.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Cet email est déjà utilisé par un autre enseignant." });
            }
        }

        // Vérifier si le numéro de pièce est déjà pris par un autre enseignant
        if (identityNumber && identityNumber !== teacher.identityNumber) {
            const idExists = await Teacher.findOne({ identityNumber });
            if (idExists) {
                return res.status(400).json({ message: "Ce numéro de pièce d'identité est déjà utilisé." });
            }
        }

        teacher.firstName = firstName || teacher.firstName;
        teacher.lastName = lastName || teacher.lastName;
        teacher.email = email || teacher.email;
        teacher.phoneNumber = phoneNumber || teacher.phoneNumber;
        teacher.subject = updatedSubject;
        teacher.identityDocument = identityDocument || teacher.identityDocument;
        teacher.identityNumber = identityNumber || teacher.identityNumber;

        await teacher.save();
        res.status(200).json({ message: "Enseignant mis à jour avec succès.", teacher });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'enseignant." });
    }
};


export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: "Enseignant non trouvé." });
        }

        await Teacher.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Enseignant supprimé avec succès." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'enseignant." });
    }
};


