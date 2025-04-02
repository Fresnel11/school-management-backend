import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: false,
        },
        postalBox: {
            type: String,
            required: false,
        },
        schoolType: {
            type: String,
            required: false, // "Collège", "Lycée", "Université", "Centre de formation"
        },
        status: {
            type: String,
            required: false, // "Public", "Privé", "Confessionnel", "Autre"
        },
        officialId: {
            type: String,
            required: false, // Numéro d'identification officiel
        },
        languages: {
            type: [String], // Liste des langues d'enseignement
            required: false,
        },
        website: {
            type: String, // URL du site officiel
            required: false,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        isActive: {
            type: Boolean,
            default: false, // En attente de validation
        },
    },
    {
        timestamps: true,
    }
);

const School = mongoose.model("School", schoolSchema);
export default School;
