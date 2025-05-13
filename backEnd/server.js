import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import axios from 'axios'; 

const app = express();
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();


import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration JWT améliorée
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: '1h'
};

if (!JWT_CONFIG.secret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ Configuration critique: JWT_SECRET doit être défini en production');
  }
  JWT_CONFIG.secret = 'dev-secret-only';
  console.warn('⚠️ Mode développement: Utilisation d\'une clé JWT temporaire');
}
// Vérification de la configuration JWT
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Avertissement: JWT_SECRET non défini dans .env - utilisation d\'une clé de développement');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Configuration critique: JWT_SECRET doit être défini en production');
  }
}
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-only';

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization' , 'X-Requested-With']
}));
app.use(express.json());
app.options('*', cors());
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

// Utilisez une URL absolue en développement
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000S/api' 
  : '/api';

// Exemple d'appel corrigé
axios.get(`${API_URL}/filieres`)
  .then(response => console.log(response.data))
  .catch(error => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Serveur inaccessible - Vérifiez que le backend est démarré');
    }
  });

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
      { cin: admin[0].Cin, role: 'admin' }, // Utilisez admin[0].Cin
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn }
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

  try {
    // Vérification enseignant
    const [enseignants] = await pool.query("SELECT * FROM enseignants WHERE Email = ?", [email]);
    
    if (enseignants.length > 0) {
      const enseignant = enseignants[0];
      const isMatch = await bcrypt.compare(password, enseignant.Password);
      
      if (isMatch) {
        const token = jwt.sign(
          { cin: enseignant.CIN, role: 'enseignant' },
          process.env.JWT_SECRET || 'dev-secret-only',
          { expiresIn: '24h' }
        );
      
        return res.json({
          success: true,
          message: "Connexion réussie",
          token: token, // Important
          role: "enseignant",
          cin: enseignant.CIN,
          email: enseignant.Email
        });
      }
    }

    // Vérification étudiant
    const [etudiants] = await pool.query("SELECT * FROM etudiant WHERE email = ?", [email]);
    
    if (etudiants.length > 0) {
      const etudiant = etudiants[0];
      const isPasswordValid = await bcrypt.compare(password, etudiant.Password);
      
      if (isPasswordValid) {
        const token = jwt.sign(
          { cin: etudiant.CIN, role: 'etudiant' },
          process.env.JWT_SECRET || 'dev-secret-only',
          { expiresIn: '1h' }
        );
        
        return res.json({
          success: true,
          message: "Connexion réussie",
          token: token,
          role: "etudiant",
          cin: etudiant.CIN,
          email: etudiant.email
        });
      }
    }

    return res.status(401).json({ 
      success: false,
      message: "Identifiants incorrects" 
    });

  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return res.status(500).json({ 
      success: false,
      message: "Erreur interne du serveur"
    });
  }
});

app.post("/enseignants", async (req, res) => {
  const { 
    Cin, 
    Nom_et_prénom, 
    Email, 
    Password, 
    Numero_tel, 
    Classement, 
    Description 
  } = req.body;

  // Validation des données
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

  // Validation du CIN
  if (!Cin) {
    errors.Cin = "Le CIN est requis.";
  } else if (!/^[01]\d{7}$/.test(Cin)) {
    errors.Cin = "Le CIN doit contenir exactement 8 chiffres commençant par 0 ou 1.";
  }

  // Validation du nom
  if (!Nom_et_prénom?.trim()) {
    errors.Nom_et_prénom = "Le nom est requis.";
  }

  // Validation de l'email
  if (!Email?.trim()) {
    errors.email = "L'email est requis.";
  } else if (!/\S+@\S+\.\S+/.test(Email)) {
    errors.email = "L'email est invalide.";
  }

  // Validation du téléphone
  if (!Numero_tel) {
    errors.Numero_tel = "Le numéro de téléphone est requis.";
  } else if (!/^\d{8}$/.test(Numero_tel)) {
    errors.Numero_tel = "Le numéro doit contenir exactement 8 chiffres.";
  }

  // Validation du mot de passe
  if (!Password) {
    errors.password = "Le mot de passe est requis.";
  } else {
    passwordFeedback.requirements = {
      minLength: Password.length >= 10,
      hasUpper: /[A-Z]/.test(Password),
      hasLower: /[a-z]/.test(Password),
      hasNumber: /[0-9]/.test(Password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(Password)
    };
    passwordFeedback.strength = Object.values(passwordFeedback.requirements).filter(Boolean).length;

    if (passwordFeedback.strength < 3) {
      errors.password = "Le mot de passe est trop faible.";
    }
  }

  // Validation du classement
  if (!Classement?.trim()) {
    errors.Classement = "Le classement est requis.";
  }

  // Validation de la description
  if (!Description?.trim()) {
    errors.Description = "La description est requise.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      success: false,
      errors,
      passwordFeedback
    });
  }

  try {
    // Vérification des doublons
    const [existing] = await pool.query(
      "SELECT * FROM enseignants WHERE Cin = ? OR Email = ?",
      [Cin, Email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Un enseignant avec ce CIN ou cet email existe déjà." 
      });
    }

    // Hashage du mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    // Insertion dans la base de données
    await pool.query(
      `INSERT INTO enseignants 
      (Cin, Nom_et_prénom, Email, Numero_tel, Password, Classement, Description) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Cin,
        Nom_et_prénom.trim(),
        Email.trim(),
        Numero_tel,
        hashedPassword,
        Classement.trim(),
        Description.trim()
      ]
    );

    res.status(201).json({ 
      success: true,
      message: "Inscription réussie",
      data: { Cin, Nom_et_prénom, Email }
    });

  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de l'inscription",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post("/etudiant", async (req, res) => {
  const { 
    Cin, 
    Nom_et_prénom, 
    Téléphone, 
    email, 
    password, 
    confirmPassword,
    filiere,  // Notez le nom sans accent
    classe
  } = req.body;

  // Validation de base
  const errors = {};
  if (!Cin) errors.Cin = "Le CIN est requis";
  if (!Nom_et_prénom) errors.Nom_et_prénom = "Le nom est requis";
  // Ajoutez les autres validations...

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  try {
    // Vérifiez si l'étudiant existe déjà
    const [existing] = await pool.query(
      "SELECT * FROM etudiant WHERE Cin = ? OR email = ?",
      [Cin, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Un étudiant avec ce CIN ou cet email existe déjà"
      });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);

    // Insertion dans la base
    await pool.query(
      `INSERT INTO etudiant 
      (Cin, Nom_et_prénom, Téléphone, email, password, Confirmpassword, Filière, Classe) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Cin, Nom_et_prénom, Téléphone, email, hashedPassword, hashedConfirmPassword, filiere, classe]
    );

    res.status(201).json({
      success: true,
      message: "Inscription réussie"
    });

  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
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
      { expiresIn: '4h' } // Nouvelle expiration
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(403).json({ error: 'Token invalide' });
  }
});


// Route pour enregistrer un participant
// Route pour enregistrer un participant
app.post('/api/register', async (req, res) => {
  console.log('Données reçues:', req.body);
  
  try {
    const { nom, cin, email, tele, sexe, niveauEtude } = req.body;

    // Validation améliorée
    const errors = [];
    if (!nom?.trim()) errors.push('Le nom est requis');
    if (!cin) errors.push('Le CIN est requis');
    if (!email?.trim()) errors.push('L\'email est requis');
    if (!tele) errors.push('Le téléphone est requis');
    if (!sexe) errors.push('Le sexe est requis');
    if (!niveauEtude) errors.push('Le niveau d\'étude est requis');

    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation échouée',
        errors
      });
    }

    // Conversion des types
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        'INSERT INTO formulaire (Nom_complet, CIN, Email, Numéro_téléphone, Sexe, Niveau_étude) VALUES (?, ?, ?, ?, ?, ?)',
        [
          nom.trim(),
          Number(cin),
          email.trim(),
          Number(tele),
          sexe,
          niveauEtude
        ]
      );
      
      res.status(201).json({ 
        success: true, 
        message: 'Inscription réussie',
        id: result.insertId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    
    let errorMessage = 'Erreur lors de l\'inscription';
    if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'Ce CIN ou cet email est déjà enregistré';
    } else if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      errorMessage = 'Format de données incorrect pour un champ numérique';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Middleware d'authentification amélioré
const authenticateTeacher = async (req, res, next) => {
  try {
    // 1. Vérifier la présence du token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: "Authorization header manquant ou invalide" 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // 2. Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-only');
    
    // 3. Vérification minimale dans la base de données
    const [user] = await pool.query(
      "SELECT Cin FROM enseignants WHERE Cin = ? LIMIT 1", 
      [decoded.cin]
    );
    
    if (!user.length) {
      return res.status(401).json({ 
        success: false,
        message: "Utilisateur non autorisé" 
      });
    }
    
    // 4. Ajouter les infos utilisateur à la requête
    req.user = { cin: decoded.cin };
    next();

  } catch (error) {
    console.error('Erreur authentification:', error);
    
    let message = "Erreur d'authentification";
    if (error.name === 'TokenExpiredError') {
      message = "Session expirée - Veuillez vous reconnecter";
    } else if (error.name === 'JsonWebTokenError') {
      message = "Token invalide";
    }
    
    return res.status(401).json({ 
      success: false,
      message 
    });
  }
};

app.get("/api/enseignants", authenticateTeacher, async (req, res) => {
  try {
    const { cin, email } = req.query;
    
    if (!cin && !email) {
      return res.status(400).json({ 
        success: false,
        message: "Paramètres manquants: cin ou email requis" 
      });
    }

    const [results] = await pool.query(
      `SELECT 
        Cin, Nom_et_prénom, Email, 
        Numero_tel, Classement, Description,
        ProfileImage
       FROM enseignants 
       WHERE Cin = ? OR Email = ? 
       LIMIT 1`,
      [cin || null, email || null]
    );

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Enseignant non trouvé" 
      });
    }

    const teacherData = results[0];
    res.json({ 
      success: true,
      data: {
        ...results[0],
        // Assurez-vous que le chemin est complet
        ProfileImage: results[0].ProfileImage 
          ? `http://localhost:5000${results[0].ProfileImage}`
          : null
      }
    });

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});





// Configuration du stockage pour les emplois du temps
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads", "emplois"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `emploi-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers PDF et Excel sont autorisés"));
    }
  },
});

// Créer le répertoire de téléchargement s'il n'existe pas
import fs from "fs";
const uploadDir = path.join(__dirname, "uploads", "emplois");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes pour les emplois du temps

// Ajouter un nouvel emploi du temps
app.post("/api/emplois", upload.single("fichier"), async (req, res) => {
  try {
    const { filiere_id, classe_id, semestre_id, type } = req.body;
    const fichier_path = req.file ? `/uploads/emplois/${req.file.filename}` : null;

    // Validation des données
    if (!filiere_id || !classe_id || !semestre_id || !type || !fichier_path) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires",
      });
    }

    // Insérer dans la base de données
    const [result] = await pool.query(
      "INSERT INTO emplois_du_temps (filiere_id, classe_id, semestre_id, type, fichier_path) VALUES (?, ?, ?, ?, ?)",
      [filiere_id, classe_id, semestre_id, type, fichier_path]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        filiere_id,
        classe_id,
        semestre_id,
        type,
        fichier_path,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'emploi du temps:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// Récupérer tous les emplois du temps
app.get("/api/emplois/classe/:classeNom", async (req, res) => {
  try {
    const { classeNom } = req.params;
    
    const [emplois] = await pool.query(`
      SELECT e.*, f.nom AS filiere_nom, c.nom AS classe_nom
      FROM emplois_du_temps e
      JOIN classes c ON e.classe_id = c.id
      JOIN filieres f ON e.filiere_id = f.id
      WHERE e.published = TRUE AND c.nom = ?
      ORDER BY e.created_at DESC
      LIMIT 1
    `, [classeNom]);

    if (emplois.length === 0) {
      return res.json({ 
        success: true,
        data: [] 
      });
    }

    res.json({
      success: true,
      data: emplois
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});


// Publier un emploi du temps
// Publier un emploi du temps
// Route PUT pour publier un emploi du temps
app.put("/api/emplois/:id/publish", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Seulement mettre à jour le statut published
    const [result] = await pool.query(
      "UPDATE emplois_du_temps SET published = TRUE WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Emploi du temps non trouvé"
      });
    }

    res.json({
      success: true,
      message: "Emploi du temps publié avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la publication:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

// Télécharger un emploi du temps
app.get("/api/emplois/:id/download", async (req, res) => {
  try {
    const { id } = req.params;

    const [emploi] = await pool.query(
      "SELECT fichier_path FROM emplois_du_temps WHERE id = ?",
      [id]
    );

    if (emploi.length === 0 || !emploi[0].fichier_path) {
      return res.status(404).json({
        success: false,
        message: "Fichier non trouvé",
      });
    }

    const filePath = path.join(__dirname, emploi[0].fichier_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Fichier non trouvé sur le serveur",
      });
    }

    res.download(filePath);
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// Routes pour les données de référence
app.get("/api/filieres", async (req, res) => {
  try {
    const [filieres] = await pool.query("SELECT * FROM filieres ORDER BY nom");
    res.json({
      success: true,
      data: filieres,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

app.get("/api/classes", async (req, res) => {
  try {
    const [classes] = await pool.query("SELECT * FROM classes ORDER BY nom");
    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

app.get("/api/semestres", async (req, res) => {
  try {
    const [semestres] = await pool.query("SELECT * FROM semestres ORDER BY numero");
    res.json({
      success: true,
      data: semestres,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// Middleware pour servir les fichiers uploadés
app.use("/uploads", express.static(uploadDir));

// Middleware pour les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "Erreur serveur",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});


// Route pour l'emploi du temps de l'étudiant
app.get("/api/etudiant/:cin/emploi-du-temps", async (req, res) => {
  // Implémentation similaire à la route précédente
});

// Route pour les examens de l'étudiant
app.get("/api/etudiant/:cin/examens", async (req, res) => {
  // Implémentation similaire à la route précédente
});


// Juste avant app.listen()
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.get('/api/teachers/profile', authenticateTeacher, async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT CIN, Nom_et_prénom, Email, Numero_tel, Classement, Description, profile_image FROM enseignants WHERE CIN = ?',
      [req.user.cin]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Route pour l'upload
app.post('/api/teachers/upload-profile', upload.single('profile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier téléchargé' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const imagePath = `/uploads/profiles/${req.file.filename}`;
    
    await pool.query(
      'UPDATE enseignants SET profile_image = ? WHERE CIN = ?',
      [imagePath, decoded.cin]
    );

    res.json({ 
      success: true,
      imageUrl: imagePath
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour l'inscription des étudiants
app.post('/api/etudiant', (req, res) => {
  
  // Traitement de l'inscription
  console.log(req.body);
  res.status(201).json({ message: "Inscription réussie" });
});

// Route pour récupérer les données d'un étudiant
app.get("/api/etudiant/:cin", async (req, res) => {
  const { cin } = req.params;
  
  try {
    const [etudiant] = await pool.query(`
      SELECT 
        e.CIN, 
        e.Nom_et_prénom, 
        e.Téléphone, 
        e.Email,
        e.Filière AS filiere_id,
        e.Classe AS classe_id,
        f.nom AS filiere_nom,
        c.nom AS classe_nom
      FROM etudiant e
      LEFT JOIN filieres f ON e.Filière = f.id
      LEFT JOIN classes c ON e.Classe = c.id
      WHERE e.CIN = ?
    `, [cin]);

    if (etudiant.length === 0) {
      return res.status(404).json({ success: false, message: "Étudiant non trouvé" });
    }

    res.json({
      success: true,
      data: {
        ...etudiant[0],
        // Utilisez les noms complets pour l'affichage
        Filière: etudiant[0].filiere_nom || etudiant[0].filiere_id,
        Classe: etudiant[0].classe_nom || etudiant[0].classe_id
      }
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


// Middleware pour les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: err.message 
  });
});




app.post('/api/upload-profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const imagePath = `/uploads/${req.file.filename}`;
    const fullUrl = `http://localhost:5000${imagePath}`;
    
    // Utilisez le même nom de champ partout (ProfileImage)
    await pool.query(
      'UPDATE enseignants SET ProfileImage = ? WHERE CIN = ?',
      [fullUrl, decoded.cin]
    );

    res.json({ 
      success: true,
      imageUrl: fullUrl,
      message: 'Image enregistrée avec succès'
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});




// Middleware essentiels
app.use(bodyParser.json()); // Pour parser le JSON
app.use(bodyParser.urlencoded({ extended: true })); // Pour parser les formulaires


////////filière 

app.post('/api/filieres', async (req, res) => {
  try {
    const { nom } = req.body;
    
    if (!nom) {
      return res.status(400).json({ 
        success: false,
        message: 'Le nom de la filière est requis' 
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO filieres (nom) VALUES (?)',
      [nom]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      nom,
      message: 'Filière créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la filière:', error);
    
    // Gestion spécifique des erreurs de doublon
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Une filière avec ce nom existe déjà'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la création de la filière',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


app.get('/api/filieres', async (req, res) => {
  try {
    const [filieres] = await pool.query('SELECT * FROM filieres');
    res.json(filieres);
  } catch (error) {
    console.error('Erreur lors de la récupération des filières:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.get('/api/filieres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [filiere] = await pool.execute(
      'SELECT * FROM filieres WHERE id = ?',
      [id]
    );

    if (filiere.length === 0) {
      return res.status(404).json({ error: 'Filière non trouvée' });
    }

    res.json(filiere[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de la filière:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.put('/api/filieres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la filière est requis' });
    }

    const [result] = await pool.execute(
      'UPDATE filieres SET nom = ? WHERE id = ?',
      [nom, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Filière non trouvée' });
    }

    res.json({ id, nom, message: 'Filière mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la filière:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.delete('/api/filieres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      'DELETE FROM filieres WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Filière non trouvée' });
    }

    res.json({ message: 'Filière supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la filière:', error);
    
    // Gestion spécifique des contraintes de clé étrangère
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        error: 'Impossible de supprimer : des classes sont associées à cette filière' 
      });
    }
    
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/////classes
// Routes pour les classes
// Route POST pour ajouter une classe
app.post('/api/classes', async (req, res) => {
  try {
    const { nom, filiere_id } = req.body;

    // Validation
    if (!nom || !filiere_id) {
      return res.status(400).json({ 
        success: false,
        error: 'Le nom et l\'ID de la filière sont requis' 
      });
    }

    // Insertion dans la base de données
    const [result] = await pool.query(
      'INSERT INTO classes (nom, filiere_id) VALUES (?, ?)',
      [nom, filiere_id]
    );

    res.status(201).json({
      success: true,
      message: 'Classe créée avec succès',
      data: {
        id: result.insertId,
        nom,
        filiere_id
      }
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur' 
    });
  }
});

// Récupérer toutes les classes
app.get('/api/classes', async (req, res) => {
  try {
    const [classes] = await pool.query(`
      SELECT c.id, c.nom, f.nom as filiere_nom, f.id as filiere_id 
      FROM classes c
      JOIN filieres f ON c.filiere_id = f.id
    `);
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Dans server.js ou votre fichier de routes
app.put('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, filiere_id } = req.body;

    // Validation
    if (!nom || !filiere_id) {
      return res.status(400).json({ error: 'Nom et filière sont requis' });
    }

    // Mise à jour dans la base de données
    const [result] = await pool.query(
      'UPDATE classes SET nom = ?, filiere_id = ? WHERE id = ?',
      [nom, filiere_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    res.json({ success: true, message: 'Classe mise à jour' });
  } catch (error) {
    console.error('Erreur modification classe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route DELETE pour supprimer une classe
// Route DELETE pour supprimer une classe
app.delete('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Vérifier si la classe existe
    const [classe] = await pool.query('SELECT id FROM classes WHERE id = ?', [id]);
    if (!classe.length) {
      return res.status(404).json({ 
        success: false,
        message: 'Classe non trouvée' 
      });
    }

    // 2. Suppression effective
    await pool.query('DELETE FROM classes WHERE id = ?', [id]);
    
    res.json({ 
      success: true,
      message: 'Classe supprimée avec succès' 
    });

  } catch (error) {
    console.error('Erreur suppression:', error);
    
    // Gestion des contraintes de clé étrangère
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer : des éléments sont liés à cette classe'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});


// Récupérer les classes d'une filière spécifique
app.get('/api/filieres/:filiereId/classes', async (req, res) => {
  try {
    const [classes] = await pool.query(
      'SELECT * FROM classes WHERE filiere_id = ?',
      [req.params.filiereId]
    );
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



///semestres
// Route POST pour créer un semestre
// Route POST pour créer un semestre
app.post('/api/semestres', async (req, res) => {
  try {
    const { numero, classe_id } = req.body;

    // Validation
    if (!numero || !classe_id) {
      return res.status(400).json({
        success: false,
        message: 'Le numéro et la classe sont obligatoires'
      });
    }

    // Vérifier si la classe existe
    const [classe] = await pool.query(
      'SELECT id FROM classes WHERE id = ?', 
      [classe_id]
    );

    if (!classe.length) {
      return res.status(400).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    // Création du semestre
    const [result] = await pool.query(
      'INSERT INTO semestres (numero, classe_id) VALUES (?, ?)',
      [numero, classe_id]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        numero,
        classe_id
      }
    });

  } catch (error) {
    console.error('Erreur création semestre:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Ce semestre existe déjà pour cette classe'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});


// Récupérer tous les semestres avec leur classe
app.get('/api/semestres', async (req, res) => {
  try {
    const [semestres] = await pool.query(`
      SELECT s.id, s.numero, c.nom as classe_nom, c.id as classe_id
      FROM semestres s
      JOIN classes c ON s.classe_id = c.id
    `);
    res.json(semestres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les semestres d'une classe spécifique
app.get('/api/classes/:classeId/semestres', async (req, res) => {
  try {
    const [semestres] = await pool.query(
      'SELECT * FROM semestres WHERE classe_id = ?',
      [req.params.classeId]
    );
    res.json(semestres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




// Route DELETE pour supprimer un semestre
// Route DELETE pour supprimer un semestre
app.delete('/api/semestres/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Vérifier si le semestre existe
    const [semestre] = await pool.query('SELECT id FROM semestres WHERE id = ?', [id]);
    if (!semestre.length) {
      return res.status(404).json({ success: false, message: "Semestre non trouvé" });
    }

    // 2. Supprimer le semestre
    await pool.query('DELETE FROM semestres WHERE id = ?', [id]);

    res.json({ success: true, message: "Semestre supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

//////matieres 
// Route POST pour créer une matière
// Route POST pour créer une matière
app.post('/api/matieres', async (req, res) => {
  try {
    const { nom, credits, enseignant_id, semestre_id } = req.body;

    // Validation
    if (!nom || !semestre_id) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le semestre sont obligatoires'
      });
    }

    // Vérifier si le semestre existe
    const [semestre] = await pool.query(
      'SELECT id FROM semestres WHERE id = ?',
      [semestre_id]
    );

    if (!semestre.length) {
      return res.status(400).json({
        success: false,
        message: 'Semestre non trouvé'
      });
    }

    // Vérifier si l'enseignant existe (si renseigné)
    if (enseignant_id) {
      const [enseignant] = await pool.query(
        'SELECT Cin FROM enseignants WHERE Cin = ?',
        [enseignant_id]
      );
      
      if (!enseignant.length) {
        return res.status(400).json({
          success: false,
          message: 'Enseignant non trouvé'
        });
      }
    }

    // Insertion
    const [result] = await pool.query(
      'INSERT INTO matieres (nom, credits, enseignant_id, semestre_id) VALUES (?, ?, ?, ?)',
      [nom, credits, enseignant_id, semestre_id]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        ...req.body
      }
    });

  } catch (error) {
    console.error('Erreur création matière:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Cette matière existe déjà pour ce semestre'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route GET pour récupérer toutes les matières
app.get('/api/matieres', async (req, res) => {
  try {
    const [matieres] = await pool.query(`
      SELECT m.id, m.nom, m.credits, 
             e.Nom_et_prénom AS enseignant,
             s.numero AS semestre,
             c.nom AS classe
      FROM matieres m
      LEFT JOIN enseignants e ON m.enseignant_id = e.Cin
      LEFT JOIN semestres s ON m.semestre_id = s.id
      LEFT JOIN classes c ON s.classe_id = c.id
    `);
    
    res.json({
      success: true,
      data: matieres
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// Route PUT pour modifier une matière
app.put('/api/matieres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, credits, enseignant_id, semestre_id } = req.body;

    // Validation
    if (!nom || !semestre_id) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le semestre sont obligatoires'
      });
    }

    // Vérifier si la matière existe
    const [matiere] = await pool.query(
      'SELECT id FROM matieres WHERE id = ?',
      [id]
    );

    if (!matiere.length) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }

    // Vérifier le semestre
    const [semestre] = await pool.query(
      'SELECT id FROM semestres WHERE id = ?',
      [semestre_id]
    );

    if (!semestre.length) {
      return res.status(400).json({
        success: false,
        message: 'Semestre non trouvé'
      });
    }

    // Vérifier l'enseignant si renseigné
    if (enseignant_id) {
      const [enseignant] = await pool.query(
        'SELECT Cin FROM enseignants WHERE Cin = ?',
        [enseignant_id]
      );
      
      if (!enseignant.length) {
        return res.status(400).json({
          success: false,
          message: 'Enseignant non trouvé'
        });
      }
    }

    // Mise à jour
    await pool.query(
      'UPDATE matieres SET nom = ?, credits = ?, enseignant_id = ?, semestre_id = ? WHERE id = ?',
      [nom, credits, enseignant_id, semestre_id, id]
    );

    res.json({
      success: true,
      message: 'Matière mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur modification matière:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Cette matière existe déjà pour ce semestre'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});


// Route DELETE pour supprimer une matière
app.delete('/api/matieres/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Vérifier si la matière existe
    const [matiere] = await pool.query(
      'SELECT id FROM matieres WHERE id = ?',
      [id]
    );

    if (!matiere.length) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }

    // 2. Suppression effective
    await pool.query(
      'DELETE FROM matieres WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Matière supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression matière:', error);
    
    // Gestion des contraintes de clé étrangère
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer : des éléments sont liés à cette matière'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});



// Route POST pour créer un événement
app.post('/api/evenements', async (req, res) => {
  try {
    const { titre, date, lieu, type, description } = req.body;

    // Validation
    if (!titre || !date || !lieu || !type) {
      return res.status(400).json({
        success: false,
        message: 'Les champs titre, date, lieu et type sont obligatoires'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO evenements (titre, date, lieu, type, description) VALUES (?, ?, ?, ?, ?)',
      [titre, new Date(date), lieu, type, description || null]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        ...req.body
      }
    });

  } catch (error) {
    console.error('Erreur création événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route GET pour récupérer tous les événements
app.get('/api/evenements', async (req, res) => {
  try {
    const [evenements] = await pool.query(
      'SELECT id, titre, date, lieu, type, description FROM evenements ORDER BY date DESC'
    );
    
    res.json({
      success: true,
      data: evenements
    });

  } catch (error) {
    console.error('Erreur récupération événements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route PUT pour modifier un événement
app.put('/api/evenements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, date, lieu, type, description } = req.body;

    // Validation
    if (!titre || !date || !lieu || !type) {
      return res.status(400).json({
        success: false,
        message: 'Les champs titre, date, lieu et type sont obligatoires'
      });
    }

    const [result] = await pool.query(
      'UPDATE evenements SET titre = ?, date = ?, lieu = ?, type = ?, description = ? WHERE id = ?',
      [titre, new Date(date), lieu, type, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Événement mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur modification événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});



// Route pour obtenir toutes les filières
app.get('/api/filieres', async (req, res) => {
  try {
    const [filieres] = await pool.query('SELECT * FROM filieres');
    res.json(filieres || []); // Retourne un tableau vide si undefined
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json([]); // Retourne un tableau vide en cas d'erreur
  }
});

// Dans votre fichier server.js
app.get('/api/classes', async (req, res) => {
  try {
    const { filiere } = req.query;

    // Validation du paramètre
    if (!filiere || isNaN(filiere)) {
      return res.status(400).json({
        success: false,
        message: "ID de filière invalide"
      });
    }

    // Requête SQL avec jointure pour vérifier l'existence de la filière
    const [classes] = await pool.query(`
      SELECT c.id, c.nom 
      FROM classes c
      JOIN filieres f ON c.filiere_id = f.id
      WHERE f.id = ?
      ORDER BY c.nom
    `, [filiere]);

    res.json({
      success: true,
      data: classes
    });

  } catch (error) {
    console.error('Erreur API classes:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});


// Route pour récupérer les documents d'un étudiant
app.get('/api/student-documents', authenticateStudent, async (req, res) => {
  try {
    const { filiere, classe } = req.query;
    
    // 1. Récupérer les matières de la filière et classe
    const [subjects] = await pool.query(`
      SELECT m.id, m.nom, s.numero AS semestre
      FROM matieres m
      JOIN semestres s ON m.semestre_id = s.id
      JOIN classes c ON s.classe_id = c.id
      JOIN filieres f ON c.filiere_id = f.id
      WHERE f.nom = ? AND c.nom = ?
    `, [filiere, classe]);

    // 2. Récupérer les documents associés
    const [documents] = await pool.query(`
      SELECT d.id, d.titre, d.description, d.date_upload AS date, 
             d.taille AS size, d.type, d.matiere_id,
             m.nom AS matiere, s.numero AS semestre
      FROM documents d
      JOIN matieres m ON d.matiere_id = m.id
      JOIN semestres s ON m.semestre_id = s.id
      JOIN classes c ON s.classe_id = c.id
      JOIN filieres f ON c.filiere_id = f.id
      WHERE f.nom = ? AND c.nom = ?
    `, [filiere, classe]);

    res.json({
      success: true,
      subjects,
      documents: documents.map(doc => ({
        ...doc,
        viewed: false // Vous pourriez suivre les vues dans la base
      }))
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Middleware d'authentification étudiant
function authenticateStudent(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'etudiant') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
}


// Configuration du modèle Emploi
const getEmplois = async () => {
  try {
    const [emplois] = await pool.query(`
      SELECT e.*, 
             f.nom AS filiere_nom,
             c.nom AS classe_nom,
             s.numero AS semestre_numero
      FROM emplois_du_temps e
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN classes c ON e.classe_id = c.id
      LEFT JOIN semestres s ON e.semestre_id = s.id
    `);
    return emplois;
  } catch (err) {
    console.error('Erreur récupération emplois:', err);
    throw err;
  }
};


// Route pour les documents par matière
app.get('/api/documents-matiere', authenticateStudent, async (req, res) => {
  try {
    const { matiereId } = req.query;
    
    const [documents] = await pool.query(`
      SELECT id, titre, description, file_path AS path, 
             DATE_FORMAT(createdAt, '%Y-%m-%d') AS date,
             ROUND(LENGTH(contenu)/1024) AS size_kb,
             'pdf' AS type
      FROM documents
      WHERE matiere_id = ?
    `, [matiereId]);

    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur' 
    });
  }
});

// Route pour télécharger un document
app.get('/api/download-document/:id', authenticateStudent, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [document] = await pool.query(`
      SELECT contenu, nom_fichier 
      FROM documents 
      WHERE id = ?
    `, [id]);

    if (!document.length) {
      return res.status(404).json({ success: false, message: 'Document non trouvé' });
    }

    // Convertir le buffer stocké en base64
    const fileBuffer = Buffer.from(document[0].contenu, 'base64');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${document[0].nom_fichier}`);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});




// Route pour récupérer les cours par filière et classe
app.get('/api/cours-etudiant', authenticateStudent, async (req, res) => {
  try {
    const { filiere, classe } = req.query;
    
    // 1. Récupérer l'ID de la classe
    const [classeData] = await pool.query(
      'SELECT id FROM classes WHERE nom = ? LIMIT 1',
      [classe]
    );

    if (!classeData.length) {
      return res.status(404).json({ 
        success: false,
        message: 'Classe non trouvée' 
      });
    }

    const classeId = classeData[0].id;

    // 2. Récupérer les semestres de cette classe
    const [semestres] = await pool.query(
      'SELECT id, numero FROM semestres WHERE classe_id = ?',
      [classeId]
    );

    // 3. Pour chaque semestre, récupérer les matières
    const result = await Promise.all(semestres.map(async (semestre) => {
      const [matieres] = await pool.query(`
        SELECT m.id, m.nom, m.credits, 
               e.Nom_et_prénom AS enseignant
        FROM matieres m
        LEFT JOIN enseignants e ON m.enseignant_id = e.CIN
        WHERE m.semestre_id = ?
      `, [semestre.id]);

      return {
        semestre: semestre.numero,
        matieres
      };
    }));

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur' 
    });
  }
});


// GET /api/filieres
router.get('/filieres', async (req, res) => {
  try {
    const [filieres] = await connection.query('SELECT * FROM filieres');
    res.json(filieres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET /api/classes
router.get('/classes', async (req, res) => {$
  try {
    const [classes] = await connection.query('SELECT * FROM classes');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET /api/semestres
router.get('/semestres', async (req, res) => {
  try {
    const [semestres] = await connection.query('SELECT * FROM semestres');
    res.json(semestres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get('/api/filieres', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM filiere');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});
router.get('/filieres/:filiereId/classes', async (req, res) => {
  try {
    const classes = await db.query(
      'SELECT * FROM classes WHERE filiere_id = $1', 
      [req.params.filiereId]
    );
    res.json(classes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Exemple correct dans une route
app.get('/api/test-filieres', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3001/api/filieres');
    res.json(response.data);
  } catch (error) {
    console.error('Erreur Axios:', error);
    res.status(500).send('Erreur serveur');
  }
});


// Récupérer les emplois publiés pour une classe spécifique
app.get("/api/emplois/classe/:classeNom", async (req, res) => {
  try {
    const { classeNom } = req.params;
    
    const [emplois] = await pool.query(`
      SELECT e.*, 
             f.nom AS filiere_nom,
             c.nom AS classe_nom,
             s.numero AS semestre_numero
      FROM emplois_du_temps e
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN classes c ON e.classe_id = c.id
      LEFT JOIN semestres s ON e.semestre_id = s.id
      WHERE e.published = TRUE AND c.nom = ?
      ORDER BY e.created_at DESC
    `, [classeNom]);

    res.json({
      success: true,
      data: emplois,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});


// Protégez vos routes
app.get("/api/protected-route", authenticateTeacher, (req, res) => {
  res.json({ message: "Accès autorisé" });
});


// Démarrer le serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Erreur du serveur:', err.message);
});