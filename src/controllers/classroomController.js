import Classroom from '../models/Classroom.js';

// Créer une classe
const createClassroom = async (req, res) => {
    try {
        const { name, level, capacity, description, principalTeacher, classDelegate } = req.body;

        // Vérifier si l'élève est déjà délégué dans une autre classe
        if (classDelegate) {
            const existingClass = await Classroom.findOne({ classDelegate });
            if (existingClass) {
                return res.status(400).json({
                    message: `Cet élève est déjà délégué de la classe ${existingClass.name}.`
                });
            }
        }

        const newClassroom = new Classroom({
            name,   
            level,
            capacity,
            description,
            principalTeacher,
            classDelegate
        });

        await newClassroom.save();
        res.status(201).json({ message: 'Classe créée avec succès.', classroom: newClassroom });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de la classe.', error });
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
                _id: { $ne: classroomId } // Exclure la classe actuelle
            });

            if (existingClass) {
                return res.status(400).json({
                    message: `Cet élève est déjà délégué de la classe ${existingClass.name}.`
                });
            }
        }

        const classroom = await Classroom.findByIdAndUpdate(req.params.id, {
            name,
            level,
            capacity,
            description,
            principalTeacher,
            classDelegate
        }, { new: true });

        if (!classroom) {
            return res.status(404).json({ message: 'Classe non trouvée.' });
        }

        res.status(200).json({ message: 'Classe mise à jour avec succès.', classroom });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la classe.', error });
    }
};

// Récupérer toutes les classes (avec le professeur et le délégué)
const getAllClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find()
            .populate('principalTeacher', 'firstName lastName email') // Charger les infos du professeur principal
            .populate('classDelegate', 'firstName lastName email'); // Charger les infos du délégué de classe

        res.status(200).json(classrooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des classes.', error });
    }
};

// Récupérer une classe par ID (avec le professeur et le délégué)
const getClassroomById = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('principalTeacher', 'firstName lastName email')
            .populate('classDelegate', 'firstName lastName email');

        if (!classroom) {
            return res.status(404).json({ message: 'Classe non trouvée.' });
        }

        res.status(200).json(classroom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la classe.', error });
    }
};

// Supprimer une classe
const deleteClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.findByIdAndDelete(req.params.id);

        if (!classroom) {
            return res.status(404).json({ message: 'Classe non trouvée.' });
        }

        res.status(200).json({ message: 'Classe supprimée avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la classe.', error });
    }
};


export { createClassroom, getAllClassrooms, getClassroomById, updateClassroom, deleteClassroom };
