import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import "./models/User.js";
import "./models/School.js";
import schoolRoutes from "./routes/schoolRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";

dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", schoolRoutes);
app.use("/api", studentRoutes);
app.use('/api', classroomRoutes);
app.use('/api', teacherRoutes);

const PORT = process.env.PORT || 5000;

// Connexion à MongoDB
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connecté"))
    .catch((err) => console.error(err));

app.get("/", (req, res) => {
    res.send("API en ligne !");
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
