import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token manquant ou invalide" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).populate("school");
        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Authentification échouée", error: error.message });
    }
};
