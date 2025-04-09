import mongoose from "mongoose";

const ParentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    address: { type: String },
    profession: { type: String },
    relationToStudent: {
      type: String,
      enum: ["Père", "Mère", "Tuteur", "Tutrice"],
      required: true,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  },
  { timestamps: true }
);

const Parent = mongoose.model("Parent", ParentSchema);
export default Parent;