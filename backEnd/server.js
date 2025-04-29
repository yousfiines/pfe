import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';

const app = express();
const router = express.Router();
//const multer = require('multer');
//const path = require('path');

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
      const isMatch = await bcrypt.compare(password, enseignant.Password);
      
      if (isMatch) {
        // Créez un token JWT si nécessaire
        const token = jwt.sign(
          { cin: enseignant.CIN, role: 'enseignant' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        return res.json({
          success: true,
          message: "Connexion réussie",
          role: "enseignant",
          cin: enseignant.CIN,
          email: enseignant.Email,
          token: token // Envoyez le token au frontend
        });
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

// Route pour uploader l'image
{/*router.post('/upload-profile-image', authenticateTeacher, async (req, res) => {
  try {
    if (!req.files || !req.files.profileImage) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }

    const image = req.files.profileImage;
    const teacherId = req.user.id; // ID de l'enseignant
    
    // Générer un nom de fichier unique
    const imageName = `teacher_${teacherId}_${Date.now()}${path.extname(image.name)}`;
    const imagePath = path.join(__dirname, '../uploads/profile_images', imageName);

    // Sauvegarder l'image
    await image.mv(imagePath);

    // Mettre à jour l'enseignant dans la base de données
    await Teacher.updateOne(
      { _id: teacherId },
      { $set: { profileImage: `/profile_images/${imageName}` } }
    );

    res.json({ 
      success: true,
      imageUrl: `/profile_images/${imageName}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});*/}
// Servir les fichiers statiques
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.get("/api/enseignants", async (req, res) => {
  const { cin, email } = req.query;

  try {
    if (!cin && !email) {
      return res.status(400).json({ 
        success: false,
        message: "CIN ou email requis" 
      });
    }

    const connection = await pool.getConnection();
    try {
      const [results] = await connection.query(
        "SELECT Cin, Nom_et_prénom, Email, Numero_tel, Classement, Description FROM enseignants WHERE Cin = ? OR Email = ? LIMIT 1",
        [cin || null, email || null]
      );

      if (results.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: "Enseignant non trouvé" 
        });
      }

      res.json({
        success: true,
        data: results[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur",
      error: error.message
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

// Route d'upload
{/*router.post('/upload-profile-image', 
  authenticateTeacher,
  upload.single('profileImage'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'Aucun fichier fourni' 
        });
      }

      const imageUrl = `/profile_images/${req.file.filename}`;
      
      await Teacher.updateOne(
        { _id: req.user.id },
        { profileImage: imageUrl }
      );

      res.json({
        success: true,
        imageUrl: imageUrl
      });

    } catch (error) {
      next(error); // Passe à middleware d'erreur
    }
  }
);
*/}


// Middleware pour vérifier l'authentification
const authenticateTeacher = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await pool.query(
      "SELECT Cin FROM enseignants WHERE Cin = ?", 
      [decoded.cin]
    );
    
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};



















// Configuration Multer
{/*const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_images/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `teacher_${req.user.id}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (JPEG, PNG)'), false);
    }
  }
});

router.post('/upload-profile-image', 
  authenticateTeacher,
  upload.single('profileImage'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'Aucune image valide fournie' 
        });
      }

      const imagePath = `/profile_images/${req.file.filename}`;
      
      // Mise à jour dans la base de données
      await Teacher.findByIdAndUpdate(
        req.user.id,
        { profileImage: imagePath },
        { new: true }
      );

      res.json({ 
        success: true,
        imageUrl: imagePath,
        message: 'Photo mise à jour avec succès'
      });
      
    } catch (error) {
      console.error('Erreur upload:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Échec de l\'envoi de la photo'
      });
    }
  }
);

*/}
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