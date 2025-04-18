import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Configuration de la base de données
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mon_pfe",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise();

const Filière = [
  "Licence en Sciences Biologiques et Environnementales",
  "Licence en Sciences de l'informatique : Génie logiciel et systèmes d'information",
  "Licence en Sciences : Physique-Chimie",
  "Licence en Sciences de Mathématique",
  "Licence en Technologie de l'information et de la communication",
  "Licence en Industries Agroalimentaires et Impacts Environnementaux",
  "Master Recherche en Ecophysiologie et Adaptation Végétal",
  "Master de Recherche Informatique décisionnelle",
  "Master recherche Physique et Chimie des Matériaux de Hautes Performances",
];

// Route pour la connexion admin
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [admin] = await pool.query("SELECT * FROM admin WHERE Email = ?", [email]);
    
    if (admin.length === 0) {
      return res.status(401).json({ success: false, message: "Email incorrect" });
    }

    // Vérification simple car mot de passe non hashé dans votre DB
    if (password !== admin[0].password) {
      return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { email: admin[0].Email },
      'votre_cle_secrete',
      { expiresIn: '1h' }
    );

    res.json({ 
      success: true, 
      token,
      user: {
        email: admin[0].Email,
        role: 'admin'
      }
    });

  } catch (err) {
    console.error("Erreur de connexion admin:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Route pour la connexion des utilisateurs
app.post("/connexion", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "L'email et le mot de passe sont requis." });
  }

  try {
    // Vérification enseignant
    const [enseignant] = await pool.query("SELECT * FROM enseignants WHERE Email = ?", [email]);

    if (enseignant.length > 0) {
      const isPasswordValid = await bcrypt.compare(password, enseignant[0].Password);
      if (isPasswordValid) {
        return res.status(200).json({ 
          message: "Connexion réussie", 
          role: "enseignant", 
          user: enseignant[0] 
        });
      }
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    // Vérification étudiant
    const [etudiant] = await pool.query("SELECT * FROM etudiant WHERE email = ?", [email]);

    if (etudiant.length > 0) {
      const isPasswordValid = await bcrypt.compare(password, etudiant[0].password);
      if (isPasswordValid) {
        return res.status(200).json({ 
          message: "Connexion réussie", 
          role: "etudiant", 
          user: etudiant[0] 
        });
      }
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

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

  // Validation des champs
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

    await pool.query(
      "INSERT INTO enseignants (Cin, Nom_et_prénom, Email, Password) VALUES (?, ?, ?, ?)",
      [Cin, Nom_et_prénom, Email, hashedPassword]
    );

    res.status(201).json({ message: "Inscription réussie", data: { Cin, Nom_et_prénom, Email } });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Route pour l'inscription des étudiants
app.post("/etudiant", async (req, res) => {
  const { Cin, Nom_et_prénom, Téléphone, email, password, confirmPassword, filière } = req.body;

  let errors = {};

  // Validation des champs
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
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Route pour afficher tous les utilisateurs
app.get("/api/utilisateurs", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM vue_utilisateurs");
    res.json(rows);
  } catch (err) {
    console.error("Erreur SQL :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour supprimer un utilisateur
app.delete('/api/utilisateurs/:cin', async (req, res) => {
  const { cin } = req.params;
  const { role } = req.query;

  try {
    if (role === 'enseignant') {
      await pool.query('DELETE FROM enseignants WHERE Cin = ?', [cin]);
    } else if (role === 'étudiant') {
      await pool.query('DELETE FROM etudiant WHERE Cin = ?', [cin]);
    } else {
      return res.status(400).json({ message: 'Rôle non valide' });
    }

    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Route pour modifier un utilisateur
app.put("/api/utilisateurs/:cin", async (req, res) => {
  const { cin } = req.params;
  const { nom, email, formation, role } = req.body;

  try {
    if (role === "enseignant") {
      await pool.query(
        "UPDATE enseignants SET Nom_et_prénom = ?, Email = ? WHERE CIN = ?",
        [nom, email, cin]
      );
    } else if (role === "étudiant") {
      await pool.query(
        "UPDATE etudiant SET Nom_et_prénom = ?, email = ?, filière = ? WHERE CIN = ?",
        [nom, email, formation, cin]
      );
    }
    res.json({ message: "Utilisateur mis à jour" });
  } catch (err) {
    console.error("Erreur modification :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Démarrer le serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});