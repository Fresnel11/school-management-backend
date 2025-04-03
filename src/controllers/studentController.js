import Student from '../models/Student.js';

// Créer un nouvel élève
const createStudent = async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, gender, address, phoneNumber, email, guardianName, guardianPhone, classroomId, documents } = req.body;

        const newStudent = new Student({
            firstName,
            lastName,
            dateOfBirth,
            gender,
            address,
            phoneNumber,
            email,
            guardianName,
            guardianPhone,
            classroomId,
            documents,
        });

        await newStudent.save();
        res.status(201).json({ message: 'Élève créé avec succès.', student: newStudent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'élève.' });
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
        const student = await Student.findById(req.params.id).select('firstName lastName inscriptions');

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
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des élèves.' });
    }
};

// Récupérer un élève par son ID
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
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
        const { firstName, lastName, dateOfBirth, gender, address, phoneNumber, email, guardianName, guardianPhone, classroomId, documents, status } = req.body;

        const student = await Student.findByIdAndUpdate(req.params.id, {
            firstName,
            lastName,
            dateOfBirth,
            gender,
            address,
            phoneNumber,
            email,
            guardianName,
            guardianPhone,
            classroomId,
            documents,
            status,
        }, { new: true });

        if (!student) {
            return res.status(404).json({ message: 'Élève non trouvé.' });
        }

        res.status(200).json({ message: 'Élève mis à jour avec succès.', student });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'élève.' });
    }
};

// Supprimer un élève
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Élève non trouvé.' });
        }

        res.status(200).json({ message: 'Élève supprimé avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'élève.' });
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
};
