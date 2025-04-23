import School from "../models/School.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";

dotenv.config();

// Inscription d'une école et création d'un administrateur
export const registerSchool = async (req, res) => {
    let school;

    try {
        // Extraire les données JSON encodées en texte depuis form-data
        const schoolData = JSON.parse(req.body.schoolData);
        const adminData = JSON.parse(req.body.adminData);

        // Données école
        const {
            name, address, phone, schoolEmail, schoolType, status,
            postalBox, officialId, languages, website
        } = schoolData;

        // Données admin
        const {
            fullName, adminEmail, dateOfBirth, gender, password,
            userPhone, address: adminAddress
        } = adminData;

        // Fichier
        const profilePhoto = req.file ? req.file.filename : null;

        // Check emails
        if (schoolEmail === adminEmail) {
            return res.status(400).json({ message: "L'email de l'école et de l'administrateur doivent être différents" });
        }

        const existingSchool = await School.findOne({ email: schoolEmail });
        if (existingSchool) {
            return res.status(400).json({ message: "Cette école existe déjà" });
        }

        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email administrateur est déjà utilisé" });
        }

        const generatedUsername = fullName.toLowerCase().replace(/ /g, ".");
        const existingUsername = await User.findOne({ username: generatedUsername });
        if (existingUsername) {
            return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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
            isActive: false
        });
        await school.save();

        const user = new User({
            fullName,
            username: generatedUsername,
            email: adminEmail,
            dateOfBirth,
            gender,
            userPhone,
            address: adminAddress,
            profilePhoto,
            password: hashedPassword,
            role: "superadmin",
            school: school._id,
            isVerified: false
        });
        await user.save();

        school.owner = user._id;
        await school.save();

        
        
        const token = jwt.sign(
            { userId: user._id, schoolId: school._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        
        // Générer un code de vérification aléatoire
        const verificationCode = Math.floor(100000 + Math.random() * 900000); // Code de 6 chiffres

        // user.verificationCode = verificationCode;
        // await user.save();
        // Envoyer l'e-mail de vérification avec le code et le nom d'utilisateur
        await sendVerificationEmail(adminEmail, generatedUsername, verificationCode, user);

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
        if (school && school._id) {
            await School.findByIdAndDelete(school._id);
        }
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Fonction pour envoyer un e-mail de vérification
const sendVerificationEmail = async (email, username, code, user) => {
    try {
        // Créer un transporteur Nodemailer
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "ed71e50cec99de",
                pass: "551d888538cb90"
            }
        });

        // Définir les options de l'e-mail
        const mailOptions = {
            from: "admin@tonapplication.com", // Adresse e-mail de l'expéditeur
            to: email, // Adresse e-mail de l'utilisateur
            subject: "Code de vérification et informations de votre compte", // Sujet de l'e-mail
            html: `
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333;">
                        <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                            <h2 style="color: #007BFF;">Bonjour ${username},</h2>
                            <p style="font-size: 16px; line-height: 1.5;">Voici votre code de vérification :</p>
                            <h3 style="font-size: 24px; color: #28a745;">${code}</h3>
                            <p style="font-size: 16px; line-height: 1.5;">Vous pouvez maintenant vous connecter à votre compte en utilisant ce code.</p>
                            <p style="font-size: 16px; line-height: 1.5;">Cordialement,<br>L'équipe de Ton Application</p>
                            <footer style="text-align: center; margin-top: 30px; font-size: 14px; color: #888;">
                                <p>Ton Application - Tous droits réservés</p>
                            </footer>
                        </div>
                    </body>
                </html>
            ` // Corps de l'e-mail en HTML
        };

        // Envoyer l'e-mail
        await transporter.sendMail(mailOptions);
        console.log(`E-mail envoyé à ${email}`);

        // Sauvegarder le code de vérification dans la base de données
        user.verificationCode = code;
        await user.save();
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail :", error);
    }
};

export const sendResetPasswordEmail = async (email, username, code) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "ed71e50cec99de",
                pass: "551d888538cb90"
            }
        });

        const mailOptions = {
            from: "admin@tonapplication.com",
            to: email,
            subject: "Code de réinitialisation de mot de passe",
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h2>Bonjour ${username},</h2>
                    <p>Voici votre code de réinitialisation :</p>
                    <h3 style="color: #007BFF;">${code}</h3>
                    <p>Utilisez ce code pour réinitialiser votre mot de passe. Il est valable pour une durée limitée.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`E-mail de réinitialisation envoyé à ${email}`);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail :", error);
    }
};

// 1. Envoyer le code de réinitialisation
export const sendResetCode = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
        }

        const resetCode = crypto.randomBytes(3).toString("hex").toUpperCase(); // ex: "A1B2C3"

        user.resetPasswordCode = resetCode;
        user.resetPasswordCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        

        await sendResetPasswordEmail(user.email, user.username, resetCode);

        res.json({ message: "Code de réinitialisation envoyé à votre adresse email." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'envoi du code.", error });
    }
};


// 2. Vérifier le code
export const verifyResetCode = async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await User.findOne({ email });

        if (
            !user ||
            user.resetPasswordCode !== code ||
            user.resetPasswordCodeExpires < new Date()
        ) {
            return res.status(400).json({ message: "Code invalide ou expiré." });
        }

        res.json({ message: "Code vérifié. Vous pouvez maintenant changer votre mot de passe." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la vérification du code." });
    }
};

export const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });

        if (
            !user ||
            user.resetPasswordCode !== code ||
            user.resetPasswordCodeExpires < new Date()
        ) {
            return res.status(400).json({ message: "Code invalide ou expiré." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // On nettoie les champs
        user.resetPasswordCode = undefined;
        user.resetPasswordCodeExpires = undefined;

        await user.save();

        res.json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe." });
    }
};



export const verifyUser = async (req, res) => {
    const { email, verificationCode } = req.body;
  
    try {
      // Trouver l'utilisateur par son e-mail
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
  
      // Convertir les deux valeurs en chaînes et nettoyer les espaces
      const storedCode = String(user.verificationCode).trim();
      const receivedCode = String(verificationCode).trim();
  
      // Vérifier si le code de vérification est correct
      if (storedCode !== receivedCode) {
        console.log("Comparaison échouée :", storedCode, "!==", receivedCode);
        return res.status(400).json({ message: "Code de vérification invalide" });
      }
  
      // Mettre à jour le statut de l'utilisateur et marquer comme vérifié
      user.status = "active";
      user.isVerified = true;
      await user.save();
  
      res.status(200).json({ message: "Compte vérifié avec succès" });
    } catch (error) {
      console.error("Erreur lors de la vérification de l'utilisateur :", error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  };

  export const resendVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Ce compte est déjà vérifié" });
        }

        const newCode = Math.floor(100000 + Math.random() * 900000);

        await sendVerificationEmail(user.email, user.username, newCode, user);

        res.status(200).json({ message: "Nouveau code envoyé avec succès" });

    } catch (error) {
        console.error("Erreur lors de la réémission du code :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export const getEmailFromToken = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: "Token manquant" });
    }

    try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Récupérer l'utilisateur via l'ID contenu dans le token
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Retourner l'email
        res.status(200).json({ email: user.email });

    } catch (error) {
        console.error("Erreur lors de la récupération de l'email :", error);
        res.status(401).json({ message: "Token invalide ou expiré" });
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

        // Vérifier si l'utilisateur est actif
        if (user.status !== "active") {
           return res.status(400).json({ message: "Compte non activé. Veuillez vérifier votre email." });
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

export const getCurrentUser = async (req, res) => {
    try {
        // req.user est déjà rempli par le middleware authenticate
        res.status(200).json({ user: req.user });
      } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des informations utilisateur", error });
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