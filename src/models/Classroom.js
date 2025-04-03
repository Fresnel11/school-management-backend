import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Nom de la classe (ex: "6ème A", "3ème B")
    level: { type: String, enum: ['6ème', '5ème', '4ème', '3ème', '2nd', '1ere', 'Terminal'], required: true }, // Niveau scolaire
    capacity: { type: Number, required: false }, // Nombre max d'élèves
    description: { type: String }, // Description optionnelle
    principalTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: false }, // Professeur principal
    classDelegate: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: false }, // Délégué de classe
    createdAt: { type: Date, default: Date.now } // Date de création
});

const Classroom = mongoose.model('Classroom', classroomSchema);

export default Classroom;
