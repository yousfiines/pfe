import React, { useState } from "react";

const InscriptionEn = () => {
  const [formData, setFormData] = useState({
    Cin: "",
    Nom_et_prénom: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Cin) newErrors.Cin = "Le CIN est requis.";
    if (!formData.Nom_et_prénom) newErrors.Nom_et_prénom = "Le nom est requis.";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await fetch("http://localhost:5000/enseignants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Cin: formData.Cin,
            Nom_et_prénom: formData.Nom_et_prénom,
            Email: formData.email,
            Password: formData.password,
            Confirmpassword: formData.confirmPassword,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Réponse du serveur :", data);
          alert("Inscription réussie !");
          setFormData({
            Cin: "",
            Nom_et_prénom: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
        } else {
          console.error("Erreur lors de l'inscription :", data);
          if (data.errors) {
            setErrors(data.errors);
          } else {
            alert(`Erreur : ${data.message || "Une erreur s'est produite."}`);
          }
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        alert("Erreur réseau. Veuillez réessayer.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log("Formulaire invalide", errors);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Inscription</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Champ CIN */}
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

        {/* Champ Nom et prénom */}
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
          {errors.password && <span style={styles.error}>{errors.password}</span>}
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

        {/* Bouton de soumission */}
        <button type="submit" style={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "En cours..." : "S'inscrire"}
        </button>
      </form>
    </div>
  );
};

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

export default InscriptionEn;