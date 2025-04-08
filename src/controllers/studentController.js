import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import mongoose from "mongoose";

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
        documents,
        parents = []
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
        documents,
        parents: []
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
  
      res.status(201).json({ message: "Élève créé avec succès.", student: newStudent });
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
      const students = await Student.find()
        .populate('parents')
        .populate('classroomId');
  
      res.status(200).json(students);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la récupération des élèves.' });
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
      const updates = {};
      const allowedFields = [
        'firstName', 'lastName', 'dateOfBirth', 'gender', 'address',
        'phoneNumber', 'email', 'classroomId', 'documents', 'status'
      ];
  
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
  
      const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true });
  
      if (!student) {
        return res.status(404).json({ message: 'Élève non trouvé.' });
      }
  
      res.status(200).json({ message: 'Élève mis à jour avec succès.', student });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'élève.', error });
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
