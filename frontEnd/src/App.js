import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/layout/Header/header.js";
import Footer from "./components/layout/Footer/footer.js";
import "./styles.css";
import ProtectedRoute from './pages/Auth/ProtectedRoute.js';
import Filieres from "./pages/config/filieres.js"
// Routes Admin
import AdminLayout from './pages/Admin/AdminLayout.js';
import AdminDashboard from './pages/Admin/Dashboard.jsx';
import AdminLogin from './pages/Auth/Login.jsx';
import GestionUtilisateurs from './pages/Admin/GestionUtilisateurs.jsx';
import GestionDocuments from './pages/Admin/GestionDocuments.jsx';
import GestionFormations from './pages/Admin/GestionFormations.jsx';
import Statistiques from './pages/Admin/Statistiques.jsx';
import GestionCours from './pages/Admin/GestionCours.jsx';
import GestionEvenements from './pages/Admin/GestionEvenements.jsx';
import GestionFilieres from './pages/Admin/Filière.js';
import GestionClasses from './pages/Admin/Classe.js';
import GestionMatieres from './pages/Admin/Matière.js';
import GestionSemestres from './pages/Admin/Semestre.js';
import Parametres from './pages/Admin/Parametres.jsx';
import StudentDoc from "./pages/Student/studentDoc.js";
import TeacherUploadDocument from "./pages/Enseignant/teacherUploadDoc.js";
import "./pages/Student/studentDoc.css";
// Routes publiques
import Connexion from "./pages/Auth/connexion.js";
import Inscription from "./pages/Auth/inscription.js";
import InscriptionEN from "./pages/Auth/inscriptionEN.js";
import Enseignant from "./pages/Enseignant/enseignant.js";
import EventForm from "./components/commun/eventForm.js";
import Home from "./components/commun/Home.js";
import Teacher from "./pages/Enseignant/teacher.js";
import Etudiant from "./pages/Student/etudiant.js";
import TeacherProfil from "./pages/Enseignant/teacherProfil.js";
import EtudiantProfil from "./pages/Student/etudiantProfil.js";
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  const AdminRoute = ({ children }) => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    return isAdmin ? children : <Navigate to="/admin/login" />;
  };

  const isAdminRoute = location.pathname.startsWith("/admin");
  const shouldShowHeader = location.pathname === "/" && !isAdminRoute;
  const shouldShowFooter = !isAdminRoute; // Footer sur toutes les pages publiques

  return (
    <div className="app">
      {shouldShowHeader && <Header />}

      <Routes>
        {/* Routes publiques */}
        <Route path="/filieres" element={<Filieres />} />
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/inscriptionEN" element={<InscriptionEN />} />
        <Route path="/enseignant" element={<Enseignant />} />
        <Route path="/eventForm" element={<EventForm />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/etudiant" element={<Etudiant/>} />
        <Route path="/studentdoc" element={<StudentDoc />} />
        <Route path="/teacherProfil" element={<TeacherProfil />} />
        <Route path="/etudiantProfil" element={<EtudiantProfil />} />
        <Route path="/teacheruploaddoc" element={<TeacherUploadDocument />} />
        <Route path="/teacher" element={
  <ProtectedRoute><TeacherProfil /></ProtectedRoute>} />
        {/* Route login admin (hors layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Routes admin imbriquées */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="utilisateurs" element={<GestionUtilisateurs />} />
          <Route path="documents" element={<GestionDocuments />} />
          <Route path="formations" element={<GestionFormations />} />
          <Route path="statistiques" element={<Statistiques />} />
          <Route path="cours" element={<GestionCours />} />
          <Route path="filière" element={<GestionFilieres />} />
          <Route path="classe" element={<GestionClasses />} />
          <Route path="matière" element={<GestionMatieres />} />
          <Route path="semestre" element={<GestionSemestres />} />
          
          <Route path="evenements" element={<GestionEvenements />} />
          <Route path="parametres" element={<Parametres />} />
        </Route>
      </Routes>

      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default App;