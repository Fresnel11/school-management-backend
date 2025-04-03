import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, enum: ["Homme", "Femme",], required: true },
        address: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        email: { type: String, unique: true, sparse: true }, // Facultatif
        guardianName: { type: String },
        guardianPhone: { type: String },
        classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: false },
        enrollmentDate: { type: Date, default: Date.now },
        status: { type: String, enum: ['active', 'graduated', 'transferred', 'excluded'], default: 'active' },
        documents: [{ name: String, url: String }], // Ex: [{ name: 'Birth Certificate', url: 'path/to/file.pdf' }]
        inscriptions: [{
            classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: false },
            startDate: Date,
            endDate: Date,
            status: { type: String, enum: ['active', 'completed'], default: 'active' }
        }],
    },
    { timestamps: true }
);

const Student = mongoose.model('Student', StudentSchema);
export default Student;
