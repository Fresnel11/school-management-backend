import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Homme", "Femme"], required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String },
    email: { type: String, unique: true, sparse: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'graduated', 'transferred', 'excluded', "to be watched", "in difficulty"], default: 'active' },
    documents: [{ name: String, url: String }],
    inscriptions: [{
      classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
      startDate: Date,
      endDate: Date,
      status: { type: String, enum: ['active', 'completed'], default: 'active' }
    }],
    archived: {
      type: Boolean,
      default: false,
    },
    parents: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Parent' }],
      validate: {
        validator: function (value) {
          return value.length <= 2;
        },
        message: (props) => `Un élève ne peut avoir que deux parents/tuteurs légaux maximum.`
      }
    }
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', StudentSchema);
export default Student;
