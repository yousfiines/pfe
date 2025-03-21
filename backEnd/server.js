import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcryptjs"; // Utilisation de bcryptjs

// Configuration de la connexion à MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mon_pfe",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route pour l'inscription
app.post("/enseignants", async (req, res) => {
  const { Cin, Nom_et_prénom, Email, Password, Confirmpassword } = req.body;

  console.log("Données reçues :", { Cin, Nom_et_prénom, Email, Password, Confirmpassword });

  // Validation
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
    console.log("Erreurs de validation :", errors);
    return res.status(400).json({ errors });
  }

  try {
    // Vérifier si l'enseignant existe déjà
    const [existing] = await pool.query(
      "SELECT * FROM enseignants WHERE Cin = ? OR Email = ?",
      [Cin, Email]
    );

    if (existing.length > 0) {
      console.log("Enseignant existe déjà :", existing);
      return res.status(400).json({ message: "Un enseignant avec ce CIN ou cet email existe déjà." });
    }

    // Hacher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);
    console.log("Mot de passe haché :", hashedPassword);

    // Ajouter l'enseignant
    const [result] = await pool.query(
      "INSERT INTO enseignants (Cin, Nom_et_prénom, Email, Password) VALUES (?, ?, ?, ?)",
      [Cin, Nom_et_prénom, Email, hashedPassword]
    );

    console.log("Résultat de l'insertion :", result);

    // Réponse de succès
    res.status(201).json({ message: "Inscription réussie", data: { Cin, Nom_et_prénom, Email } });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Une erreur s'est produite lors de l'inscription.", error: error.message });
  }
});

// Démarrer le serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});