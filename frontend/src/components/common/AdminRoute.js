import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-10 h-10 border-2 border-deep-brown border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;
