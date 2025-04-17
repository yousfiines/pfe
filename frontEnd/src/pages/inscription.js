import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import inscriptionAnim from "../assets/lotties/inscription.json"; // Assurez-vous d'avoir ce fichier Lottie
import Lottie from "lottie-react";

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
  const navigate = useNavigate();

  const Filière = [
    "",
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

        const response = await fetch("http://localhost:5000/etudiant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });

        const data = await response.json();
        if (response.ok) {
          alert("Inscription réussie !");
          navigate("/connexion");
        } else {
          alert(data.message || "Erreur lors de l'inscription");
        }
      } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        alert("Erreur réseau. Veuillez réessayer.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.formCell}>
              <div style={styles.card}>
                <h2 style={styles.title}>Inscription Étudiant</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.formGroup}>
                    <input
                      type="text"
                      name="Cin"
                      value={formData.Cin}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Numéro CIN (8 chiffres)"
                    />
                    {errors.Cin && <span style={styles.error}>{errors.Cin}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <input
                      type="text"
                      name="Nom_et_prénom"
                      value={formData.Nom_et_prénom}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Nom et prénom"
                    />
                    {errors.Nom_et_prénom && <span style={styles.error}>{errors.Nom_et_prénom}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <input
                      type="text"
                      name="Téléphone"
                      value={formData.Téléphone}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Numéro de téléphone"
                    />
                    {errors.Téléphone && <span style={styles.error}>{errors.Téléphone}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Adresse email"
                    />
                    {errors.email && <span style={styles.error}>{errors.email}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Mot de passe (6 caractères min)"
                    />
                    {errors.password && <span style={styles.error}>{errors.password}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Confirmer le mot de passe"
                    />
                    {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <select
                      name="filière"
                      value={formData.filière}
                      onChange={handleChange}
                      style={styles.input}
                    >
                      {Filière.map((filière, index) => (
                        <option key={index} value={filière}>
                          {filière || "Sélectionnez une filière"}
                        </option>
                      ))}
                    </select>
                    {errors.filière && <span style={styles.error}>{errors.filière}</span>}
                  </div>

                  <button type="submit" style={styles.button} disabled={isSubmitting}>
                    {isSubmitting ? "En cours..." : "S'inscrire"}
                  </button>
                </form>

                <p style={styles.loginLink}>
                  Déjà inscrit? <a href="/connexion" style={styles.link}>Connectez-vous</a>
                </p>
              </div>
            </td>
            <td style={styles.animationCell}>
              <div style={styles.lottieContainer}>
                <Lottie
                  animationData={inscriptionAnim}
                  loop={true}
                  style={styles.lottieAnimation}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "20px",
  },
  table: {
    borderCollapse: "collapse",
    width: "auto",
  },
  formCell: {
    paddingRight: "50px",
    verticalAlign: "middle",
  },
  animationCell: {
    verticalAlign: "middle",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background-color 0.3s",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "500",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
    display: "block",
  },
  loginLink: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
  },
  lottieContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "500px",
  },
  lottieAnimation: {
    width: "100%",
    height: "100%",
    maxWidth: "450px",
    maxHeight: "450px",
  },
};

export default Inscription;