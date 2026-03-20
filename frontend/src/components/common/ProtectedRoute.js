import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-deep-brown border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-warm-gray font-sans text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export default ProtectedRoute;
