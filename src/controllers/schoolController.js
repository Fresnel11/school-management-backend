import School from "../models/School.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Inscription d'une école et création d'un administrateur
export const registerSchool = async (req, res) => {
    let school; // Déclarer school en dehors pour pouvoir le supprimer si nécessaire

    try {
        // Séparer les données de l'école et de l'admin
        const {
            schoolData: { 
                name, address, phone, schoolEmail, schoolType, status, 
                postalBox, officialId, languages, website 
            },
            adminData: { 
                fullName, adminEmail, dateOfBirth, gender, password, 
                userPhone, address: adminAddress, profilePhoto 
            }
        } = req.body;
        

        // Vérifier que les emails sont différents
        if (schoolEmail === adminEmail) {
            return res.status(400).json({ message: "L'email de l'école et de l'administrateur doivent être différents" });
        }

        // Vérifier si l'école existe déjà (par email)
        const existingSchool = await School.findOne({ email: schoolEmail });
        if (existingSchool) {
            return res.status(400).json({ message: "Cette école existe déjà" });
        }

        // Vérifier si l'email de l'admin est déjà utilisé
        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email administrateur est déjà utilisé" });
        }

        // Générer le username
        const generatedUsername = fullName.toLowerCase().replace(/ /g, ".");

        // Vérifier si le username existe déjà
        const existingUsername = await User.findOne({ username: generatedUsername });
        if (existingUsername) {
            return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris, veuillez modifier le nom complet" });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'école
        school = new School({
            name,
            address,
            phone,
            email: schoolEmail,
            schoolType,
            status,
            postalBox, 
            officialId, 
            languages, 
            website, 
            isActive: false // En attente de validation
        });
        await school.save();

        // Créer l'admin
        const user = new User({
            fullName,
            username: generatedUsername,
            email: adminEmail,
            dateOfBirth,
            gender,
            userPhone,
            address, 
            profilePhoto, 
            password: hashedPassword,
            role: "superadmin",
            school: school._id,
            isVerified: false // En attente de validation
        });
        await user.save();

        // Mettre à jour l'école avec l'owner
        school.owner = user._id;
        await school.save();

        // Générer un token JWT
        const token = jwt.sign(
            { userId: user._id, schoolId: school._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d", algorithm: "HS256" }
        );

        res.status(201).json({
            message: "École et administrateur enregistrés avec succès",
            data: {
                school: {
                    id: school._id,
                    name: school.name,
                    email: school.email
                },
                admin: {
                    id: user._id,
                    fullName: user.fullName,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            },
            token
        });
    } catch (error) {
        // Si une erreur survient et que l'école a été créée, la supprimer
        if (school && school._id) {
            await School.findByIdAndDelete(school._id);
        }
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Connexion de l'administrateur
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email }).populate("school");
        if (!user) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        // Générer un token JWT
        const token = jwt.sign(
            { userId: user._id, schoolId: user.school._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d", algorithm: "HS256" }
        );

        res.status(200).json({
            message: "Connexion réussie",
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    school: {
                        id: user.school._id,
                        name: user.school.name,
                        email: user.school.email
                    }
                }
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Déconnexion (côté client)
export const logout = async (req, res) => {
    try {
        // La déconnexion est généralement gérée côté client en supprimant le token
        res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};