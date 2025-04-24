import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';

const app = express();
const router = express.Router();

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
    const [enseignants] = await pool.query("SELECT * FROM enseignants WHERE Email = ?", [email]);
    
    if (enseignants.length > 0) {
      const enseignant = enseignants[0];
      // Debug: Afficher le hash stocké et le mot de passe tenté
      console.log("Hash stocké (enseignant):", enseignant.Password);
      console.log("Mot de passe tenté:", password);
      
      const isPasswordValid = await bcrypt.compare(password, enseignant.Password);
      
      if (isPasswordValid) {
        return res.status(200).json({ 
          message: "Connexion réussie", 
          role: "enseignant", 
          cin: enseignant.CIN, // Ajout du CIN
          user: enseignant 
        });
      } else {
        console.log("Comparaison bcrypt échouée pour enseignant");
        return res.status(401).json({ message: "Mot de passe incorrect." });
      }
    }

    // Vérification étudiant
    const [etudiants] = await pool.query("SELECT * FROM etudiant WHERE email = ?", [email]);
    
    if (etudiants.length > 0) {
      const etudiant = etudiants[0];
      // Debug: Afficher le hash stocké et le mot de passe tenté
      console.log("Hash stocké (étudiant):", etudiant.Password);
      console.log("Mot de passe tenté:", password);
      
      const isPasswordValid = await bcrypt.compare(password, etudiant.Password);
      
      if (isPasswordValid) {
        return res.status(200).json({ 
          message: "Connexion réussie", 
          role: "etudiant", 
          cin: etudiant.CIN, // Ajout du CIN
          user: etudiant 
        });
      } else {
        console.log("Comparaison bcrypt échouée pour étudiant");
        return res.status(401).json({ message: "Mot de passe incorrect." });
      }
    }

    return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return res.status(500).json({ 
      message: "Erreur interne du serveur", 
      error: error.message 
    });
  }
});

app.post("/enseignants", async (req, res) => {
  const { Cin, Nom_et_prénom, Email, Password, Confirmpassword } = req.body;

  const errors = {};
  const passwordFeedback = {
    requirements: {
      minLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false
    },
    strength: 0
  };

  // Validation des champs
  if (!Cin) {
    errors.Cin = "Le CIN est requis.";
  } else if (!/^[01]\d{7}$/.test(Cin)) {
    errors.Cin = "Le CIN doit contenir exactement 8 chiffres commençant par 0 ou 1.";
  }
  if (!Nom_et_prénom) errors.Nom_et_prénom = "Le nom est requis.";
  
  if (!Email) {
    errors.email = "L'email est requis.";
  } else if (!/\S+@\S+\.\S+/.test(Email)) {
    errors.email = "L'email est invalide.";
  }

  if (!Password) {
    errors.password = "Le mot de passe est requis.";
  } else {
    // Vérification des exigences
    passwordFeedback.requirements.minLength = Password.length >= 10;
    passwordFeedback.requirements.hasUpper = /[A-Z]/.test(Password);
    passwordFeedback.requirements.hasLower = /[a-z]/.test(Password);
    passwordFeedback.requirements.hasNumber = /[0-9]/.test(Password);
    passwordFeedback.requirements.hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(Password);

    // Calcul du score de force (0-5)
    passwordFeedback.strength = Object.values(passwordFeedback.requirements).filter(Boolean).length;

    if (!passwordFeedback.requirements.minLength) {
      errors.password = "Le mot de passe doit contenir au moins 10 caractères.";
    }
  }

  if (Password !== Confirmpassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      errors,
      passwordFeedback
    });
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
app.post("/etudiant", async (req, res) => {
  const { Cin, Nom_et_prénom, Téléphone, email, password, confirmPassword, filière } = req.body;

  // Validation des champs
  const errors = {};
  const passwordFeedback = {
    requirements: {
      minLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false
    },
    strength: 0
  };

  if (!Cin) {
    errors.Cin = "Le CIN est requis.";
  } else if (!/^[01]\d{7}$/.test(Cin)) {
    errors.Cin = "Le CIN doit contenir exactement 8 chiffres commençant par 0 ou 1.";
  }

  if (!Nom_et_prénom || Nom_et_prénom.trim().length === 0) {
    errors.Nom_et_prénom = "Le nom complet est requis.";
  }

  if (!Téléphone || !/^\d{8}$/.test(Téléphone)) {
    errors.Téléphone = "Un numéro de téléphone valide (8 chiffres) est requis.";
  }

  if (!email) {
    errors.email = "L'email est requis.";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "L'email est invalide.";
  }

  if (!password) {
    errors.password = "Le mot de passe est requis.";
  } else {
    // Vérification des exigences du mot de passe
    passwordFeedback.requirements = {
      minLength: password.length >= 10,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    passwordFeedback.strength = Object.values(passwordFeedback.requirements).filter(Boolean).length;

    if (passwordFeedback.strength < 3) { // Au moins 3 critères sur 5
      errors.password = "Le mot de passe est trop faible. Il doit contenir au moins : 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.";
    }
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas.";
  }

  if (!filière || !Filière.includes(filière)) {
    errors.filière = "Veuillez sélectionner une filière valide.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      success: false,
      errors,
      passwordFeedback
    });
  }

  try {
    // Vérification de l'unicité du CIN et de l'email
    const [existing] = await pool.query(
      "SELECT * FROM etudiant WHERE Cin = ? OR email = ?",
      [Cin, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Un étudiant avec ce CIN ou cet email existe déjà." 
      });
    }

    // Hachage du mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, saltRounds);

    // Insertion dans la base de données
    await pool.query(
      "INSERT INTO etudiant (Cin, Nom_et_prénom, Téléphone, email, password, Confirmpassword, Filière) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [Cin, Nom_et_prénom.trim(), Téléphone, email.toLowerCase(), hashedPassword, hashedConfirmPassword, filière]
    );

    return res.status(201).json({ 
      success: true,
      message: "Inscription réussie",
      data: {
        Cin,
        Nom_et_prénom,
        email
      }
    });

  } catch (error) {
    console.error("Erreur serveur :", error);
    return res.status(500).json({ 
      success: false,
      message: "Erreur lors de l'inscription",
      error: error.message 
    });
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


router.post('/extend-session', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Crée un nouveau token avec 3 minutes supplémentaires
    const newToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '3m' } // Nouvelle expiration
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(403).json({ error: 'Token invalide' });
  }
});


// Démarrer le serveur
app.use(cors({
  origin: 'http://localhost:3000', // ou l'URL de votre frontend
  credentials: true
}));