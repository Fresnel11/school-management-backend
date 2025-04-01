import School from "../models/School.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Inscription d'une école et création d'un administrateur
export const registerSchool = async (req, res) => {
    try {
        const { name, address, phone, email, password } = req.body;

        // Vérifier si l'école existe déjà
        const existingSchool = await School.findOne({ email });
        if (existingSchool) return res.status(400).json({ message: "Cette école existe déjà." });

        // Vérifier si l'email est déjà utilisé
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Cet email est déjà utilisé." });

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer une école SANS owner pour l'instant
        const school = new School({
            name,
            address,
            phone,
            email,
            isActive: false, // En attente de validation
        });
        await school.save();

        // Créer l'admin de l'école
        const user = new User({
            name: "Admin",
            email,
            password: hashedPassword,
            role: "admin",
            school: school._id, // Lier l'école ici
            isVerified: false, // En attente de validation
        });
        await user.save();

        // Mettre à jour l'école avec l'admin
        school.owner = user._id;
        await school.save();

        // Générer un token
        const token = jwt.sign({ userId: user._id, schoolId: school._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ message: "École enregistrée avec succès", token });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};