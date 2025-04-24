import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import inscriptionAnim from "../assets/lotties/inscription.json";
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
  const [passwordFeedback, setPasswordFeedback] = useState(null);
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

    // Validation en temps réel pour le mot de passe
    if (name === "password") {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordFeedback(null);
      return;
    }

    const requirements = {
      minLength: password.length >= 10,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const strength = Object.values(requirements).filter(Boolean).length;

    setPasswordFeedback({
      requirements,
      strength,
      percentage: (strength / 5) * 100,
    });
  };

  const getStrengthColor = (percentage) => {
    if (percentage < 40) return "#ff0000";
    if (percentage < 70) return "#ffa500";
    return "#00cc00";
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Cin) {
      newErrors.Cin = "Le CIN est requis.";
    } else if (!/^[01]\d{7}$/.test(formData.Cin)) {
      newErrors.Cin = "Le CIN doit contenir exactement 8 chiffres commençant par 0 ou 1.";
    }
    if (!formData.Nom_et_prénom) newErrors.Nom_et_prénom = "Le nom est requis.";
    if (!formData.Téléphone) newErrors.Téléphone = "Le téléphone est requis.";
    if (!formData.email) newErrors.email = "L'email est requis.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email est invalide.";
    
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis.";
    } else if (formData.password.length < 10) {
      newErrors.password = "Le mot de passe doit contenir au moins 10 caractères.";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une majuscule.";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une minuscule.";
    } else if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins un chiffre ou caractère spécial.";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }
    if (!formData.filière) newErrors.filière = "La filière est requise.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    if (validateForm()) {
      try {
        const response = await fetch("http://localhost:5000/etudiant", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            Cin: formData.Cin,
            Nom_et_prénom: formData.Nom_et_prénom,
            Téléphone: formData.Téléphone,
            email: formData.email, // Changé de Email à email
            password: formData.password, // Changé de Password à password
            confirmPassword: formData.confirmPassword,
            filière: formData.filière
          }),
        });
  
        const data = await response.json();
        
        if (!response.ok) {
          // Gestion des erreurs venant du backend
          if (data.errors) {
            setErrors(data.errors);
          }
          if (data.passwordFeedback) {
            setPasswordFeedback(data.passwordFeedback);
          }
          alert(data.message || "Erreur lors de l'inscription");
          return;
        }
  
        // Si succès
        localStorage.setItem('selectedFiliere', formData.filière);
        alert("Inscription réussie !");
        navigate("/connexion");
        
      } catch (error) {
        console.error("Erreur réseau:", error);
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
                      placeholder="Mot de passe (10 caractères min)"
                    />
                    {errors.password && <span style={styles.error}>{errors.password}</span>}
                    
                    {/* Barre de force du mot de passe */}
                    {passwordFeedback && (
                      <div style={{ marginTop: "10px" }}>
                        <div style={{
                          height: "5px",
                          backgroundColor: "#e0e0e0",
                          borderRadius: "5px",
                          marginBottom: "5px"
                        }}>
                          <div style={{
                            width: `${passwordFeedback.percentage}%`,
                            height: "100%",
                            backgroundColor: getStrengthColor(passwordFeedback.percentage),
                            borderRadius: "5px",
                            transition: "all 0.3s ease"
                          }}></div>
                        </div>
                        <small>Force du mot de passe: {passwordFeedback.strength}/5</small>
                        
                        {/* Liste des exigences */}
                        <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px", fontSize: "12px" }}>
                          <li style={{ color: passwordFeedback.requirements.minLength ? "green" : "red" }}>
                            Au moins 10 caractères
                          </li>
                          <li style={{ color: passwordFeedback.requirements.hasUpper ? "green" : "red" }}>
                            Au moins une majuscule
                          </li>
                          <li style={{ color: passwordFeedback.requirements.hasLower ? "green" : "red" }}>
                            Au moins une minuscule
                          </li>
                          <li style={{ color: passwordFeedback.requirements.hasNumber ? "green" : "red" }}>
                            Au moins un chiffre
                          </li>
                          <li style={{ color: passwordFeedback.requirements.hasSpecial ? "green" : "red" }}>
                            Au moins un caractère spécial
                          </li>
                        </ul>
                      </div>
                    )}
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