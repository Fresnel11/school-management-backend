import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    subject: { type: String, required: true }, // Matière enseignée
    identityDocument: { type: String, required: true }, // Type de pièce d'identité (CNI, passeport, etc.)
    identityNumber: { type: String, required: true, unique: true }, // Numéro de la pièce d'identité (doit être unique)
    createdAt: { type: Date, default: Date.now }
});

const Teacher = mongoose.model("Teacher", TeacherSchema);
export default Teacher;
