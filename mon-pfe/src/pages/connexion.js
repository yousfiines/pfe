import React, { useState } from "react";


const LoginForm = () => {
  // États pour gérer les valeurs des champs
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // États pour gérer les erreurs
  const [errors, setErrors] = useState({});

  // Fonction pour gérer les changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Fonction pour valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "L'email est requis.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email est invalide.";
    }
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retourne true si aucune erreur
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Si le formulaire est valide, vous pouvez envoyer les données
      console.log("Formulaire soumis avec succès :", formData);
      alert("Connexion réussie !");
      // Réinitialiser le formulaire après la soumission
      setFormData({
        email: "",
        password: "",
      });
    } else {
      console.log("Erreurs dans le formulaire :", errors);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
      <h2 style={styles.title}>Connexion</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Champ Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email :</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="Entrez votre email"
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          {/* Champ Mot de passe */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe :</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Entrez votre mot de passe"
            />
            {errors.password && (
              <span style={styles.error}>{errors.password}</span>
            )}
          </div>

          {/* Bouton de soumission */}
          <button type="submit" style={styles.button}>
            Se connecter
          </button>
        </form>

        {/* Lien pour s'inscrire */}
        <p style={styles.signupLink}>
          Pas encore de compte ? 
        </p>
        <p style={styles.signupLink}>
        <a href="/inscriptionEN" style={styles.link}>Inscrivez-vous en tant qu'enseignant</a></p>
        <p style={styles.signupLink}>
        <a href="/inscription" style={styles.link}>Inscrivez-vous en tant qu'etudiant</a>
        </p>
       
      </div>
    </div>
  
  );
};

// Styles pour le formulaire
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    marginBottom: "8px",
    fontSize: "14px",
    color: "#555",
  },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
  },
  error: {
    color: "#ff4d4f",
    fontSize: "12px",
    marginTop: "5px",
  },
  button: {
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  signupLink: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
    color: "#555",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
  },
};

export default LoginForm;