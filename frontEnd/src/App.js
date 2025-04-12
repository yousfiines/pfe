import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/layout/Header/header.js";
import Footer from "./components/layout/Footer/footer.js";
import "./styles.css";
import Connexion from "./pages/connexion.js";
import Inscription from "./pages/inscription.js";
import InscriptionEN from "./pages/inscriptionEN.js";
import Enseignant from "./pages/enseignant.js";
import EventForm from "./pages/eventForm.js";
import Licence from "./pages/licence.js";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home"; // Importez votre composant Home (ou le composant de votre page d'accueil)

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  const publicRoutes = ["/", "/connexion", "/inscription", "/inscriptionEN", "/enseignant", "/licence", "/eventForm"];
  const isAdminRoute = location.pathname.startsWith("/admin");
  const shouldShowHeader = publicRoutes.includes(location.pathname) && !isAdminRoute;
  //Liste des chemins où le Header doit être affiché
  const pathsWithHeader = ["/" ];


  return (
    <div className="app">
      {shouldShowHeader && <Header />}
      

      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} /> {/* Utilisez votre composant Home ici */}
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/inscriptionEN" element={<InscriptionEN />} />
        <Route path="/enseignant" element={<Enseignant />} />
        <Route path="/eventForm" element={<EventForm />} />
        <Route path="/licence" element={<Licence />} />

        {/* Routes admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>

      {shouldShowHeader && <Footer />}
    </div>
  );
}

export default App;