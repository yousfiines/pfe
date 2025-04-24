import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Utilisateurs from "./pages/Utilisateurs";
import Cours from "./pages/Cours";
import Evenements from "./pages/Evenements";
import Statistiques from "./pages/Statistiques";

const AdminDashboard = () => {
  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Routes>
            <Route path="/admin/utilisateurs" element={<Utilisateurs />} />
            <Route path="/admin/cours" element={<Cours />} />
            <Route path="/admin/evenements" element={<Evenements />} />
            <Route path="/admin/statistiques" element={<Statistiques />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default AdminDashboard;
