// middlewares/upload.js
import multer from "multer";
import path from "path";

// Config du dossier de destination et du nom de fichier
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + "-" + file.fieldname + ext);
    },
});

// Export du middleware
export const upload = multer({ storage });
