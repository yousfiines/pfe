import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/layout/Header/header.js";
import Footer from "./components/layout/Footer/footer.js";
import "./styles.css";
import ProtectedRoute from './pages/ProtectedRoute.js';
// Routes Admin
import AdminLayout from './admin/layouts/AdminLayout.jsx';
import AdminDashboard from './admin/pages/Dashboard';
import AdminLogin from './admin/pages/Login';
import GestionUtilisateurs from './admin/pages/GestionUtilisateurs';
import GestionDocuments from './admin/pages/GestionDocuments';
import GestionFormations from './admin/pages/GestionFormations';
import Statistiques from './admin/pages/Statistiques';
import GestionCours from './admin/pages/GestionCours';
import GestionEvenements from './admin/pages/GestionEvenements';
import Parametres from './admin/pages/Parametres';
import StudentDoc from "./components/studentDoc.js";
import TeacherUploadDocument from "./components/teacherUploadDoc.js";

// Routes publiques
import Connexion from "./pages/connexion.js";
import Inscription from "./pages/inscription.js";
import InscriptionEN from "./pages/inscriptionEN.js";
import Enseignant from "./pages/enseignant.js";
import EventForm from "./pages/eventForm.js";
import Licence from "./pages/licence.js";
import Home from "./pages/Home";
import Teacher from "./pages/teacher.js";
import Etudiant from "./pages/etudiant.js";
import TeacherProfil from "./components/layout/teacherProfil.js"
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
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/inscriptionEN" element={<InscriptionEN />} />
        <Route path="/enseignant" element={<Enseignant />} />
        <Route path="/eventForm" element={<EventForm />} />
        <Route path="/licence" element={<Licence />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/etudiant" element={<Etudiant />} />
        <Route path="/studentdoc" element={<StudentDoc />} />
        <Route path="/teacherProfil" element={<TeacherProfil />} />
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
          <Route path="evenements" element={<GestionEvenements />} />
          <Route path="parametres" element={<Parametres />} />
        </Route>
      </Routes>

      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default App;