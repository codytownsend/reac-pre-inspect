// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being determined
  if (loading) {
    return <Loading message="Authenticating..." />;
  }

  // Only redirect if authentication is complete and user is not logged in
  if (!currentUser) {
    // Save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated, render children
  return children;
};

export default PrivateRoute;