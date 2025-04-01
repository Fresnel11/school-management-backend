import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        isActive: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const School = mongoose.model("School", schoolSchema);
export default School;
