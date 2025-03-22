import React from "react";
import { BrowserRouter as Router, Routes, Route,} from "react-router-dom";
import Header from "./components/layout/Header/header.js";
import Footer from "./components/layout/Footer/footer.js";
import "./styles.css"
import Connexion from "./pages/connexion.js"
import Inscription from "./pages/inscription.js"
import InscriptionEN from "./pages/inscriptionEN.js";
import Enseignant from "./pages/enseignant.js"
function App() {
  return (
   
    <Router>
       <Header /> 
      <div className="app">
      <Routes>
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/inscriptionEn" element={<InscriptionEN />} />
        <Route path="/enseignant" element={<Enseignant />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;