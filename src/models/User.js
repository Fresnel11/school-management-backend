import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin"], default: "admin" },
        school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
        isVerified: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
