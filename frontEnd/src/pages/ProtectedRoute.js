import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const cin = localStorage.getItem('teacherCin');
  
  if (!cin) {
    return <Navigate to="/connexion" replace />;
  }
  
  return children;
};

export default ProtectedRoute;