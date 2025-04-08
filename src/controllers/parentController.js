import Parent from "../models/Parent.js";

// Créer un parent
export const createParent = async (req, res) => {
  try {
    const parent = new Parent(req.body);
    await parent.save();
    res.status(201).json({ message: "Parent créé avec succès", parent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création du parent", error });
  }
};

// Récupérer tous les parents
export const getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find().populate("students");
    res.json(parents);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des parents", error });
  }
};

// Récupérer un parent par ID
export const getParentById = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id).populate("students");
    if (!parent) return res.status(404).json({ message: "Parent non trouvé" });
    res.json(parent);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du parent", error });
  }
};

// Mettre à jour un parent
export const updateParent = async (req, res) => {
  try {
    const updatedParent = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedParent) return res.status(404).json({ message: "Parent non trouvé" });
    res.json({ message: "Parent mis à jour avec succès", parent: updatedParent });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du parent", error });
  }
};

// Supprimer un parent
export const deleteParent = async (req, res) => {
  try {
    const deletedParent = await Parent.findByIdAndDelete(req.params.id);
    if (!deletedParent) return res.status(404).json({ message: "Parent non trouvé" });
    res.json({ message: "Parent supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du parent", error });
  }
};
