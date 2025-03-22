import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Pour la redirection
import login from "../assets/lotties/login.json";
import Lottie from "lottie-react";

const Connexion = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Pour la navigation
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
  
        if (response.ok) {
          alert(data.message);
          if (data.role === "enseignant") {
            navigate("/enseignant"); // Rediriger vers la page enseignant
          } else if (data.role === "etudiant") {
            navigate("/etudiant"); // Rediriger vers la page étudiant
          }
        } else {
          alert(data.message); // Afficher le message d'erreur
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        alert("Erreur réseau. Veuillez réessayer.");
      }
    } else {
      console.log("Erreurs dans le formulaire :", errors);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
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

        <p style={styles.signupLink}>
          Pas encore de compte ?{" "}
          <a href="/inscriptionEN" style={styles.link}>
            Inscrivez-vous en tant qu'enseignant
          </a>
        </p>
        <p style={styles.signupLink}>
          <a href="/inscription" style={styles.link}>
            Inscrivez-vous en tant qu'étudiant
          </a>
        </p>
      </div>

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

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "100%",
    marginRight: "50px",
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
  link: {
    color: "#007bff",
    textDecoration: "none",
  },
  lottieContainer: {
    maxWidth: "400px",
    width: "100%",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
};

export default Connexion;