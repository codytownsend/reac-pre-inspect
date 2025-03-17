// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import Loading from './components/Loading';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Properties from './pages/properties/Properties';
import PropertyDetail from './pages/properties/PropertyDetail';
import NewProperty from './pages/properties/NewProperty';
import EditProperty from './pages/properties/EditProperty';
import Inspections from './pages/inspections/Inspections';
import NewInspection from './pages/inspections/NewInspection';
import InspectionDetail from './pages/inspections/InspectionDetail';
import CapturePhoto from './pages/inspections/CapturePhoto';
import InspectionReport from './pages/inspections/InspectionReport';
import SharedReport from './pages/shared/SharedReport';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import { InspectionProvider } from './context/InspectionContext';

const AppContent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loading message="Starting application..." />;
  }

  return (
    <div className="app">
      <Routes>
        {/* Public routes - accessible without authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Shared report route - accessible without authentication */}
        <Route path="/shared/reports/:id" element={<SharedReport />} />
        
        {/* Private routes - require authentication */}
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/properties" element={
          <PrivateRoute>
            <Properties />
          </PrivateRoute>
        } />
        
        <Route path="/properties/new" element={
          <PrivateRoute>
            <NewProperty />
          </PrivateRoute>
        } />
        
        <Route path="/properties/:id" element={
          <PrivateRoute>
            <PropertyDetail />
          </PrivateRoute>
        } />
        
        <Route path="/properties/:id/edit" element={
          <PrivateRoute>
            <EditProperty />
          </PrivateRoute>
        } />
        
        <Route path="/inspections" element={
          <PrivateRoute>
            <Inspections />
          </PrivateRoute>
        } />
        
        <Route path="/inspections/new" element={
          <PrivateRoute>
            <NewInspection />
          </PrivateRoute>
        } />
        
        <Route path="/inspections/:id" element={
          <PrivateRoute>
            <InspectionDetail />
          </PrivateRoute>
        } />
        
        <Route path="/inspections/:id/photo" element={
          <PrivateRoute>
            <CapturePhoto />
          </PrivateRoute>
        } />
        
        <Route path="/inspections/:id/report" element={
          <PrivateRoute>
            <InspectionReport />
          </PrivateRoute>
        } />

        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        
        {/* Not found route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Only show navigation when user is authenticated */}
      {currentUser && <Navigation />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <PropertyProvider>
          <InspectionProvider>
            <AppContent />
          </InspectionProvider>
        </PropertyProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;