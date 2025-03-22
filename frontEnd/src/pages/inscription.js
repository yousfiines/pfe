import React, { useState } from "react";

const Inscription = () => {
  const [formData, setFormData] = useState({
    Cin: "",
    Nom_et_prénom: "",
    Téléphone: "",
    email: "",
    password: "",
    confirmPassword: "",
    filière: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const Filière = [
    "",
    "Licence en Sciences Biologiques et Environnementales",
    "Licence en Sciences de l'informatique : Génie logiciel et systèmes d'information",
    "Licence en Sciences : Physique-Chimie",
    "Licence en Sciences de Mathématique",
    "Licence en Technologie de l’information et de la communication",
    "Licence en Industries Agroalimentaires et Impacts Environnementaux",
    "Master Recherche en Ecophysiologie et Adaptation Végétal",
    "Master de Recherche Informatique décisionnelle",
    "Master recherche Physique et Chimie des Matériaux de Hautes Performances",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Champ ${name} mis à jour :`, value); // Debug
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Cin) newErrors.Cin = "Le CIN est requis.";
    else if (!/^\d{8}$/.test(formData.Cin)) newErrors.Cin = "Le CIN doit contenir exactement 8 chiffres.";

    if (!formData.Nom_et_prénom) newErrors.Nom_et_prénom = "Le nom est requis.";
    if (!formData.Téléphone) newErrors.Téléphone = "Le téléphone est requis.";
    if (!formData.email) newErrors.email = "L'email est requis.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email est invalide.";
    if (!formData.password) newErrors.password = "Le mot de passe est requis.";
    else if (formData.password.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    if (!formData.filière) newErrors.filière = "La filière est requise.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      try {
        const { confirmPassword, ...dataToSend } = formData;
        console.log("Données envoyées :", { ...dataToSend, confirmPassword }); // Debug

        const response = await fetch("http://localhost:5000/etudiant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...dataToSend, confirmPassword }), // Inclure confirmPassword
        });

        const data = await response.json();
        if (response.ok) {
          alert("Inscription réussie !");
          setFormData({
            Cin: "",
            Nom_et_prénom: "",
            Téléphone: "",
            email: "",
            password: "",
            confirmPassword: "",
            filière: "",
          });
        } else {
          setErrors(data.errors || { message: data.message });
        }
      } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Inscription</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Champs du formulaire */}
        <div style={styles.formGroup}>
          <label style={styles.label}>CIN :</label>
          <input
            type="text"
            name="Cin"
            value={formData.Cin}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.Cin && <span style={styles.error}>{errors.Cin}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Nom et prénom :</label>
          <input
            type="text"
            name="Nom_et_prénom"
            value={formData.Nom_et_prénom}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.Nom_et_prénom && <span style={styles.error}>{errors.Nom_et_prénom}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Téléphone :</label>
          <input
            type="text"
            name="Téléphone"
            value={formData.Téléphone}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.Téléphone && <span style={styles.error}>{errors.Téléphone}</span>}
        </div>

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

        <div style={styles.formGroup}>
          <label style={styles.label}>Mot de passe :</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.password && <span style={styles.error}>{errors.password}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirmer le mot de passe :</label>
          <input
  type="password"
  name="confirmPassword" // Nom du champ
  value={formData.confirmPassword}
  onChange={handleChange}
  style={styles.input}
/>
          {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Filière :</label>
          <select
            name="filière"
            value={formData.filière}
            onChange={handleChange}
            style={styles.input}
          >
            {Filière.map((filière, index) => (
              <option key={index} value={filière}>
                {filière}
              </option>
            ))}
          </select>
          {errors.filière && <span style={styles.error}>{errors.filière}</span>}
        </div>

        <button type="submit" style={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "En cours..." : "S'inscrire"}
        </button>
      </form>
    </div>
  );
};

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