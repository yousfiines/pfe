import React, { useState } from "react";
import login from "../assets/lotties/login.json";
import Lottie from "lottie-react";

const Connexion = () => {
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
      {/* Formulaire de connexion */}
      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Champ Email */}
          <div style={styles.formGroup}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="Saisir votre email"
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          {/* Champ Mot de passe */}
          <div style={styles.formGroup}>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Saisir votre mot de passe"
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

      {/* Animation Lottie */}
      <div style={styles.lottieContainer}>
        <Lottie
          animationData={login}
          style={{ width: "300px", height: "300px" }}
          loop={true}
        />
      </div>
    </div>
  );
};

// Styles pour le formulaire
const styles = {
  container: {
    display: "flex",
    justifyContent: "center", // Centre horizontalement
    alignItems: "center", // Centre verticalement
    minHeight: "100vh", // Prend toute la hauteur de la page
    backgroundColor: "#f0f2f5", // Couleur de fond
    padding: "20px", // Espacement autour du contenu
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "100%",
    marginRight: "50px", // Espace entre le formulaire et l'animation
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
  },
  buttonHover: {
    backgroundColor: "#0056b3", // Couleur au survol
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
  },
  lottieContainer: {
    maxWidth: "400px", // Largeur maximale de l'animation
    width: "100%",
  },
};


export default Connexion;