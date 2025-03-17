// src/components/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, Calendar, Settings } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  // Function to check if the path is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="nav-container">
      <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <Home className="nav-icon" />
        <span>Home</span>
      </Link>
      <Link to="/properties" className={`nav-item ${isActive('/properties') ? 'active' : ''}`}>
        <List className="nav-icon" />
        <span>Properties</span>
      </Link>
      <Link to="/inspections" className={`nav-item ${isActive('/inspections') ? 'active' : ''}`}>
        <Calendar className="nav-icon" />
        <span>Inspections</span>
      </Link>
      <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
        <Settings className="nav-icon" />
        <span>Settings</span>
      </Link>
    </nav>
  );
};

export default Navigation;