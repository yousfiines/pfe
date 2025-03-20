import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "./components/layout/Header/header.js";
import Footer from "./components/layout/Footer/footer.js";
import "./styles.css"

function App() {
  return (
    <Router>
      <div className="app">
        {/* En-tête avec navigation */}
        <Header />

        {/* Contenu principal avec les routes */}
        <Routes>
         
          {/*
          <Route path="/se connecter" element={<SeConnecter />} /> */}
         
        </Routes>

        {/* Pied de page */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;