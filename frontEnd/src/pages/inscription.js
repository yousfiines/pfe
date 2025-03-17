import React, { useState } from "react";

const Inscription = () => {
  // États pour gérer les valeurs des champs
  const [formData, setFormData] = useState({
    Nom_et_prénom: "",
    Cin: "",
    Téléphone: "",
    email: "",
    password: "",
    confirmPassword: "",
   filiere: "Informatique", // Nouveau champ 
  });

  // États pour gérer les erreurs
  const [errors, setErrors] = useState({});

  // Options pour la liste déroulante
  const Filière = ["Informatique", "Phy/chimie", "Tic", "Agro"];

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

    if (!formData.name) newErrors.name = "Le nom est requis.";
    if (!formData.Cin) newErrors.cin = "Le numéro de cin est requis.";
    if (!formData.tél) newErrors.tél = "Le numéro de téléphone est requis.";
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
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }
    if (!formData.filiere) {
      newErrors.filiere = "Le filiere est requis.";
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
      alert("Inscription réussie !");
      // Réinitialiser le formulaire après la soumission
      setFormData({
        Nom_et_prénom: "",
        Cin: "",
        Téléphone: "",
        email: "",
        password: "",
        confirmPassword: "",
        filiere: "Étudiant", // Réinitialiser le rôle
      });
    } else {
      console.log("Erreurs dans le formulaire :", errors);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Inscription</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Champ Nom */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Nom et prénom :</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.name && <span style={styles.error}>{errors.name}</span>}
        </div>
         {/* Champ cin */}
         <div style={styles.formGroup}>
          <label style={styles.label}>CIN :</label>
          <input
            type="int"
            name="cin"
            value={formData.cin}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.cin && <span style={styles.error}>{errors.cin}</span>}
        </div>
         {/* Champ télé */}
         <div style={styles.formGroup}>
          <label style={styles.label}>Téléphone :</label>
          <input
            type="int"
            name="tél"
            value={formData.tél}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.tél&& <span style={styles.error}>{errors.tél}</span>}
        </div>

        {/* Champ Email */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Email :</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
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
          />
          {errors.password && (
            <span style={styles.error}>{errors.password}</span>
          )}
        </div>

        {/* Champ Confirmation du mot de passe */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Confirmer le mot de passe :</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.confirmPassword && (
            <span style={styles.error}>{errors.confirmPassword}</span>
          )}
        </div>

        {/* Liste déroulante  */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Filière :</label>
          <select
            name="filiere"
            value={formData.filiere}
            onChange={handleChange}
            style={styles.input}
          >
            {Filière.map((filiere, index) => (
              <option key={index} value={filiere}>
                {filiere}
              </option>
            ))}
          </select>
          {errors.filiere && <span style={styles.error}>{errors.filiere}</span>}
        </div>

        {/* Bouton de soumission */}
        <button type="submit" style={styles.button}>
          S'inscrire
        </button>
      </form>
    </div>


          );
        }


// Styles pour le formulaire
const styles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    marginBottom: "5px",
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "100%",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
  button: {
    padding: "10px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
  },
};

export default Inscription;
