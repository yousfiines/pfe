import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminGuard from './components/AdminGuard';
import Dashboard from './pages/Dashboard';
import ListeUtilisateurs from './pages/utilisateurs/ListeUtilisateurs';
import FormulaireUtilisateur from './pages/utilisateurs/FormulaireUtilisateur';
import ListeCours from './pages/cours/ListeCours';
import FormulaireCours from './pages/cours/FormulaireCours';
import Parametres from './pages/parametres/Parametres';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminGuard />}>
        <Route index element={<Dashboard />} />
        <Route path="utilisateurs">
          <Route index element={<ListeUtilisateurs />} />
          <Route path="nouveau" element={<FormulaireUtilisateur />} />
          <Route path=":id/modifier" element={<FormulaireUtilisateur />} />
        </Route>
        <Route path="cours">
          <Route index element={<ListeCours />} />
          <Route path="nouveau" element={<FormulaireCours />} />
          <Route path=":id/modifier" element={<FormulaireCours />} />
        </Route>
        <Route path="parametres" element={<Parametres />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;