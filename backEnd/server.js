import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();

// Middleware pour autoriser le cross-origin
app.use(cors());
// Middleware pour parser le JSON du body
app.use(express.json());

// Configuration de la connexion MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mon_pfe",
});

// Connexion à la base MySQL
db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à MySQL :", err);
    return;
  }
  console.log("Connecté à MySQL !");
});

// Route GET pour récupérer tous les utilisateurs
app.get("/enseignants", (req, res) => {
  const sql = "SELECT * FROM enseignants";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération :", err);
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération des données" });
    }
    res.json(results);
  });
});

// Route POST pour insérer un nouvel utilisateur
app.post("/enseignants", (req, res) => {
  const { CIN,Nom_et_prénom,Email,Password,Confirmpassword } = req.body;
  console.log("Données reçues :", { CIN,Nom_et_prénom,Email,Password,Confirmpassword  }); // Log des données reçues

  // Vérifier que les champs requis sont présents
  if (CIN,Nom_et_prénom,Email,Password,Confirmpassword ) {
    return res.status(400).json({ error: "champ obligatoire." });
  }

  // Validation supplémentaire de l'email (exemple)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Format d'email invalide." });
  }

  const sql = "INSERT INTO enseignants (CIN,Nom_et_prénom,Email,Password,Confirmpassword ) VALUES (?, ?)";
  db.query(sql, [name, email], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion :", err);
      return res.status(500).json({ error: "Erreur lors de l'insertion." });
    }
    console.log("Utilisateur inséré avec l'ID :", result.insertId); // Log de l'ID inséré
    res.json({ message: "Utilisateur ajouté !", id: result.insertId });
  });
});

// Lancer le serveur
const PORT = 5000;
app.listen(PORT, () => console.log('Serveur lancé sur http://localhost:${PORT}'));