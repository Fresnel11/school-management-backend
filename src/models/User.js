import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: ["Homme", "Femme", "Autre"],
            required: true,
        },
        profilePhoto: {
            type: String, // URL ou chemin de la photo
            required: false,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        userPhone: {
            type: String,
            required: false,
        },
        address: {
            type: String,
            required: false,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["superadmin", "admin", "user"],
            default: "superadmin", // par défaut, l'admin a le rôle "superadmin"
        },
        isVerified: {
            type: Boolean,
            default: false, // Validation nécessaire
        },
        status: {
            type: String,
            enum: ["inactive", "active"],
            default: "inactive", // Par défaut, le statut est "inactive"
        },
        verificationCode: {
            type: String, 
            required: false,
        },
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Création automatique du nom d'utilisateur
userSchema.pre("save", function (next) {
    if (this.isNew) {
        this.username = this.fullName.toLowerCase().replace(/ /g, ".");
    }
    next();
});

const User = mongoose.model("User", userSchema);
export default User;
