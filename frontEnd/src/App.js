import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header/header.js";
import Footer from "./components/layout/Footer/footer.js";
import "./styles.css";
import Connexion from "./pages/connexion.js";
import Inscription from "./pages/inscription.js";
import InscriptionEN from "./pages/inscriptionEN.js";
import Enseignant from "./pages/enseignant.js";
import { useLocation } from "react-router-dom";


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation(); // Hook pour obtenir le chemin actuel

  // Liste des chemins où le Header doit être affiché
  const pathsWithHeader = ["/" ];

  // Vérifie si le chemin actuel est dans la liste
  const shouldShowHeader = pathsWithHeader.includes(location.pathname);

  return (
    <div className="app">
      {/* Affiche le Header uniquement si nécessaire */}
      {shouldShowHeader && <Header />}
      <Routes>
        {/* Redirige l'utilisateur vers /connexion lorsque l'URL est / */}
        <Route path="/" element={<Navigate to="/" />} />
        </Routes>

      <Routes>
       
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/inscriptionEn" element={<InscriptionEN />} />
        <Route path="/enseignant" element={<Enseignant />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;