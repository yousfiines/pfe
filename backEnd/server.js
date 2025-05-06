import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

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
          { expiresIn: '1h' }
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
  const { Cin, Nom_et_prénom, Téléphone, email, password, confirmPassword, filière , classe} = req.body;

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
  if (!classe || !classe.includes(classe)) {
    errors.classe = "Veuillez sélectionner une classe valide.";
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
      "INSERT INTO etudiant (Cin, Nom_et_prénom, Téléphone, email, password, Confirmpassword, Filière, Classe) VALUES (?, ?,? , ?, ?, ?, ?, ?)",
      [Cin, Nom_et_prénom.trim(), Téléphone, email.toLowerCase(), hashedPassword, hashedConfirmPassword, filière, classe]
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





// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ext = path.extname(file.originalname);
    cb(null, `teacher_${decoded.cin}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
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
  const token = req.headers.authorization?.split(' ')[1];

  try {
    if (!token) {
      return res.status(401).json({ success: false, message: "Token manquant" });
    }

    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-only');
    
    // Vérification que le CIN demandé correspond à celui du token
    if (decoded.cin !== parseInt(cin)) {
      return res.status(403).json({ success: false, message: "Accès non autorisé" });
    }

    // Récupération des données de l'étudiant
    const [etudiant] = await pool.query(
      "SELECT CIN, Nom_et_prénom, Téléphone, Email, Filière, Classe FROM etudiant WHERE CIN = ?",
      [cin]
    );

    if (etudiant.length === 0) {
      return res.status(404).json({ success: false, message: "Étudiant non trouvé" });
    }

    res.json({
      success: true,
      data: etudiant[0]
    });

  } catch (error) {
    console.error("Erreur:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Token invalide" });
    }
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
      SELECT c.id, c.nom, f.nom AS filiere 
      FROM classes c
      LEFT JOIN filieres f ON c.filiere_id = f.id
    `);
    
    res.json({ 
      success: true,
      data: classes 
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur' 
    });
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


// Route GET pour récupérer tous les semestres
app.get('/api/semestres', async (req, res) => {
  try {
    const [semestres] = await pool.query(`
      SELECT s.id, s.numero, c.nom AS classe 
      FROM semestres s
      LEFT JOIN classes c ON s.classe_id = c.id
    `);
    
    res.json({
      success: true,
      data: semestres
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
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