import jwt from 'jsonwebtoken';

// Middleware pour vérifier les rôles
export const verifyRole = (roles) => (req, res, next) => {
    // Vérifier si req.user existe (il devrait être défini par le middleware authenticate)
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Utilisateur non autorisé ou rôle non spécifié" });
    }
  
    // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
  
    next();
  };
