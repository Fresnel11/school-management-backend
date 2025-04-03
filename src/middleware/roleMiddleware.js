import jwt from 'jsonwebtoken';

// Middleware pour vérifier les rôles
export const verifyRole = (roles) => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(403).json({ message: 'Accès refusé. Token manquant.' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Token verification error:', err.message); // Log l'erreur
                return res.status(403).json({ message: 'Token invalide.' });
            }

            const userRole = decoded.role;

            if (!roles.includes(userRole)) {
                return res.status(403).json({ message: 'Accès refusé. Vous n\'avez pas les droits nécessaires.' });
            }

            req.user = decoded;
            next();
        });
    };
};
