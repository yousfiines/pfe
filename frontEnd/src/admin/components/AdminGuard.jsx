import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminGuard = () => {
  const { utilisateur, estAuthentifie } = useSelector(state => state.auth);

  if (!estAuthentifie) {
    return <Navigate to="/connexion" replace />;
  }

  if (utilisateur?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;