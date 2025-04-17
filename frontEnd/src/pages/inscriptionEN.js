import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import inscriptionEnAnim from "../assets/lotties/inscription.json"; // Animation Lottie spécifique
import Lottie from "lottie-react";

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
  const navigate = useNavigate();

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
          alert("Inscription réussie !");
          navigate("/connexion");
        } else {
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
    }
  };

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.formCell}>
              <div style={styles.card}>
                <h2 style={styles.title}>Inscription Enseignant</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.formGroup}>
                    <input
                      type="text"
                      name="Cin"
                      value={formData.Cin}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Numéro CIN"
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
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Adresse email académique"
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
                  animationData={inscriptionEnAnim}
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

export default InscriptionEn;