import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },  // Nom de la matière
    description: { type: String, required: false },        // Description de la matière (facultatif)
    createdAt: { type: Date, default: Date.now }
});

const Subject = mongoose.model("Subject", SubjectSchema);
export default Subject;
