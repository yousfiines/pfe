import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcryptjs";

const app = express();
app.use(cors());
app.use(express.json());


const express = require('express');
const cookieParser = require('cookie-parser');


const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mon-pfe",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise();

const Filière = [
  "Licence en Sciences Biologiques et Environnementales",
  "Licence en Sciences de l'informatique : Génie logiciel et systèmes d'information",
  "Licence en Sciences : Physique-Chimie",
  "Licence en Sciences de Mathématique",
  "Licence en Technologie de l’information et de la communication",
  "Licence en Industries Agroalimentaires et Impacts Environnementaux",
  "Master Recherche en Ecophysiologie et Adaptation Végétal",
  "Master de Recherche Informatique décisionnelle",
  "Master recherche Physique et Chimie des Matériaux de Hautes Performances",
];





// Route pour la connexion des utilisateurs (enseignants ou étudiants)
app.post("/connexion", async (req, res) => {
  const { email, password } = req.body;

  // Validation des champs
  if (!email || !password) {
    return res.status(400).json({ message: "L'email et le mot de passe sont requis." });
  }

  try {
    // Vérifier si l'utilisateur est un enseignant
    const [enseignant] = await pool.query(
      "SELECT * FROM enseignants WHERE Email = ?",
      [email]
    );

    if (enseignant.length > 0) {
      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, enseignant[0].Password);
      if (isPasswordValid) {
        return res.status(200).json({ message: "Connexion réussie", role: "enseignant", user: enseignant[0] });
      } else {
        return res.status(400).json({ message: "Mot de passe incorrect." });
      }
    }

    // Vérifier si l'utilisateur est un étudiant
    const [etudiant] = await pool.query(
      "SELECT * FROM etudiant WHERE email = ?",
      [email]
    );

    if (etudiant.length > 0) {
      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, etudiant[0].password);
      if (isPasswordValid) {
        return res.status(200).json({ message: "Connexion réussie", role: "etudiant", user: etudiant[0] });
      } else {
        return res.status(400).json({ message: "Mot de passe incorrect." });
      }
    }

    // Si aucun utilisateur n'est trouvé
    return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
});







// Route pour l'inscription des enseignants
app.post("/enseignants", async (req, res) => {
  const { Cin, Nom_et_prénom, Email, Password, Confirmpassword } = req.body;

  const errors = {};

  if (!Cin) errors.Cin = "Le CIN est requis.";
  if (!Nom_et_prénom) errors.Nom_et_prénom = "Le nom est requis.";
  if (!Email) {
    errors.email = "L'email est requis.";
  } else if (!/\S+@\S+\.\S+/.test(Email)) {
    errors.email = "L'email est invalide.";
  }
  if (!Password) {
    errors.password = "Le mot de passe est requis.";
  } else if (Password.length < 6) {
    errors.password = "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (Password !== Confirmpassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const [existing] = await pool.query(
      "SELECT * FROM enseignants WHERE Cin = ? OR Email = ?",
      [Cin, Email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Un enseignant avec ce CIN ou cet email existe déjà." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    const [result] = await pool.query(
      "INSERT INTO enseignants (Cin, Nom_et_prénom, Email, Password) VALUES (?, ?, ?, ?)",
      [Cin, Nom_et_prénom, Email, hashedPassword]
    );

    res.status(201).json({ message: "Inscription réussie", data: { Cin, Nom_et_prénom, Email } });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Une erreur s'est produite lors de l'inscription.", error: error.message });
  }
});

// Route pour l'inscription des étudiants
app.post("/etudiant", async (req, res) => {
  const { Cin, Nom_et_prénom, Téléphone, email, password, confirmPassword, filière } = req.body;

  let errors = {};

  if (!Cin) errors.Cin = "Le CIN est requis.";
  else if (!/^\d{8}$/.test(Cin)) errors.Cin = "Le CIN doit contenir exactement 8 chiffres.";

  if (!Nom_et_prénom) errors.Nom_et_prénom = "Le nom est requis.";
  if (!Téléphone) errors.Téléphone = "Le téléphone est requis.";
  if (!email) errors.email = "L'email est requis.";
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "L'email est invalide.";
  if (!password) errors.password = "Le mot de passe est requis.";
  else if (password.length < 6) errors.password = "Le mot de passe doit contenir au moins 6 caractères.";
  if (password !== confirmPassword) errors.confirmPassword = "Les mots de passe ne correspondent pas.";
  if (!filière || !Filière.includes(filière)) {
    errors.filière = "La filière est invalide ou manquante.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const [existing] = await pool.query(
      "SELECT * FROM etudiant WHERE Cin = ? OR email = ?",
      [Cin, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Un étudiant avec ce CIN ou cet email existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO etudiant (Cin, Nom_et_prénom, Téléphone, email, password, filière) VALUES (?, ?, ?, ?, ?, ?)",
      [Cin, Nom_et_prénom, Téléphone, email, hashedPassword, filière]
    );

    res.status(201).json({ message: "Inscription réussie" });
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
});

//app.use(cors());
const PORT=5000;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});