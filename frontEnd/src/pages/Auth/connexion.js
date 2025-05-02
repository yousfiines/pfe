import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import login from "../../assets/lotties/login.json";
import Lottie from "lottie-react";

const Connexion = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  setIsSubmitting(true);

  if (validateForm()) {
    try {
      const response = await fetch("http://localhost:5000/connexion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Erreur serveur");
      }
  
        // Stockage des informations de session
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', data.token); // Stockage du token JWT
        localStorage.setItem('userRole', data.role);
        
        if (data.role === "enseignant") {
          localStorage.setItem('teacherCin', data.cin);
          localStorage.setItem('teacherEmail', data.email);
          navigate("/teacherProfil");
        } else if (data.role === "etudiant") {
          localStorage.setItem('studentCin', data.cin);
          navigate("/etudiantProfil");
        } else if (data.role === "admin") {
          navigate("/admin/dashboard");
        }
        
      } catch (error) {
        console.error("Erreur détaillée:", error);
        alert(`Erreur: ${error.message}\n\nVeuillez réessayer plus tard.`);
      } finally {
        setIsSubmitting(false);
      }
  
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.formContainer}>
          <div style={styles.card}>
            <h2 style={styles.title}>Connexion</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
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

              <div style={styles.formGroup}>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Saisir votre mot de passe"
                />
                {errors.password && <span style={styles.error}>{errors.password}</span>}
              </div>

              <button type="submit" style={styles.button} disabled={isSubmitting}>
                {isSubmitting ? "En cours..." : "Se Connecter"}
              </button>
            </form>

            <div style={styles.linksContainer}>
              <p style={styles.signupLink}>
                Pas encore de compte ?{" "}
                <a href="/inscriptionEN" style={styles.link}>
                  Enseignant
                </a>{" "}
                ou{" "}
                <a href="/inscription" style={styles.link}>
                  Étudiant
                </a>
              </p>
            </div>
          </div>
        </div>

        <div style={styles.animationContainer}>
          <Lottie
            animationData={login}
            loop={true}
            style={styles.lottieAnimation}
          />
        </div>
      </div>
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
  contentWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "900px",
    width: "100%",
    gap: "40px",
  },
  formContainer: {
    flex: 1,
    maxWidth: "400px",
    minWidth: "300px",
  },
  animationContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "450px", // Ajustez selon la hauteur de votre formulaire
  },
  lottieAnimation: {
    width: "100%",
    height: "100%",
    maxWidth: "450px",
    maxHeight: "450px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
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
    marginBottom: "25px",
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
  buttonHover: {
    backgroundColor: "#0056b3",
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
  linksContainer: {
    marginTop: "20px",
    textAlign: "center",
  },
  signupLink: {
    fontSize: "14px",
    color: "#666",
  },
};

export default Connexion;