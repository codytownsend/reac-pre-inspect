// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import Loading from './components/Loading';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Property Pages
import Properties from './pages/properties/Properties';
import PropertyDetail from './pages/properties/PropertyDetail';
import NewProperty from './pages/properties/NewProperty';
import EditProperty from './pages/properties/EditProperty';

// Inspection Pages (Consolidated)
import Inspections from './pages/inspections/Inspections';
import NewInspection from './pages/inspections/NewInspection';
import InspectionMain from './pages/inspections/InspectionMain';
import AreaList from './pages/inspections/AreaList';
import AreaDetail from './pages/inspections/AreaDetail';
import AddAreaPage from './pages/inspections/AddAreaPage';
import InspectionReportPage from './pages/inspections/InspectionReportPage';

// Shared
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
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shared/reports/:id" element={<SharedReport />} />
        
        {/* Private routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* Property routes */}
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
        
        {/* Inspection routes - consolidated */}
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
            <InspectionMain />
          </PrivateRoute>
        } />
        
        {/* Area routes */}
        <Route path="/inspections/:id/units" element={
          <PrivateRoute>
            <AreaList />
          </PrivateRoute>
        } />
        <Route path="/inspections/:id/inside" element={
          <PrivateRoute>
            <AreaList />
          </PrivateRoute>
        } />
        <Route path="/inspections/:id/outside" element={
          <PrivateRoute>
            <AreaList />
          </PrivateRoute>
        } />
        
        {/* Add area routes */}
        <Route path="/inspections/:id/units/add" element={
          <PrivateRoute>
            <AddAreaPage />
          </PrivateRoute>
        } />
        <Route path="/inspections/:id/inside/add" element={
          <PrivateRoute>
            <AddAreaPage />
          </PrivateRoute>
        } />
        <Route path="/inspections/:id/outside/add" element={
          <PrivateRoute>
            <AddAreaPage />
          </PrivateRoute>
        } />
        
        {/* Area detail routes */}
        <Route path="/inspections/:id/units/:areaId" element={
          <PrivateRoute>
            <AreaDetail />
          </PrivateRoute>
        } />
        <Route path="/inspections/:id/inside/:areaId" element={
          <PrivateRoute>
            <AreaDetail />
          </PrivateRoute>
        } />
        <Route path="/inspections/:id/outside/:areaId" element={
          <PrivateRoute>
            <AreaDetail />
          </PrivateRoute>
        } />
        
        {/* Report route */}
        <Route path="/inspections/:id/report" element={
          <PrivateRoute>
            <InspectionReportPage />
          </PrivateRoute>
        } />
        
        {/* Settings */}
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