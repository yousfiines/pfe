import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import inscriptionEnAnim from "../assets/lotties/inscription.json";
import Lottie from "lottie-react";

const Suivant = () => {
  const [formData, setFormData] = useState({
    Numero_tel: "",
    Classement: "",
    Description: "",
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

    if (!formData.Numero_tel) {
      newErrors.Numero_tel = "Le numéro de téléphone est requis.";
    } else if (!/^\d{8}$/.test(formData.Numero_tel)) {
      newErrors.Numero_tel = "Le numéro doit contenir exactement 8 chiffres.";
    }

    if (!formData.Classement) {
      newErrors.Classement = "Le classement est requis.";
    }

    if (!formData.Description) {
      newErrors.Description = "La description est requise.";
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
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Inscription réussie !");
          navigate("/teacherProfil");
        } else {
          if (data.errors) {
            setErrors(data.errors);
          }
          alert(`Erreur : ${data.message || "Une erreur s'est produite."}`);
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
                      name="Numero_tel"
                      value={formData.Numero_tel}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Numéro de téléphone"
                    />
                    {errors.Numero_tel && <span style={styles.error}>{errors.Numero_tel}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <input
                      type="text"
                      name="Classement"
                      value={formData.Classement}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Classement"
                    />
                    {errors.Classement && (
                      <span style={styles.error}>{errors.Classement}</span>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <textarea
                      name="Description"
                      value={formData.Description}
                      onChange={handleChange}
                      style={{...styles.input, minHeight: "100px"}}
                      placeholder="Description"
                    />
                    {errors.Description && <span style={styles.error}>{errors.Description}</span>}
                  </div>

                  <button
                    type="submit"
                    style={styles.button}
                    disabled={isSubmitting}
                  >
                   S'inscrire
                  </button>
                </form>

                <p style={styles.loginLink}>
                  Déjà inscrit?{" "}
                  <a href="/connexion" style={styles.link}>
                    Connectez-vous
                  </a>
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

export default Suivant;