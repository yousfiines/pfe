import React, { useEffect, useState } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import animation from "./assets/lotties/animation.json"
function App() {
  // State pour stocker les utilisateurs
  const [users, setUsers] = useState([]);
  // States pour le formulaire
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // State pour le message (succès ou erreur)
  const [message, setMessage] = useState("");

  // Récupérer les utilisateurs au chargement de la page
  const fetchUsers = () => {
    axios.get("http://localhost:5000/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    // Réinitialiser le message
    setMessage("");

    // Envoyer les données au backend
    axios.post("http://localhost:5000/users", { name, email })
      .then((response) => {
        setMessage("Utilisateur ajouté !");
        // Réinitialiser les champs du formulaire
        setName("");
        setEmail("");
        // Actualiser la liste des utilisateurs
        fetchUsers();
      })
      .catch((error) => {
        console.error("Erreur lors de l'insertion :", error);
        setMessage("Erreur lors de l'ajout de l'utilisateur.");
      });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Gestion des utilisateurs</h1>
      <Lottie animationData={animation} loop={true} />
      
      {/* Formulaire d'insertion */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div>
          <label>Nom :</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ marginLeft: "10px" }}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <label>Email :</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ marginLeft: "10px" }}
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>Ajouter</button>
      </form>

      {message && <p>{message}</p>}

      {/* Liste des utilisateurs */}
      <h2>Liste des utilisateurs</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;