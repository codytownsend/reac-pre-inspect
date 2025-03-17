// src/pages/settings/Settings.jsx (updated with team options)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Alert from '../../components/Alert';
import { User, LogOut, HelpCircle, Shield, Bell, Info, Trash2, Users, Building } from 'lucide-react';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out: ' + error.message);
      setLoading(false);
    }
  };
  
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all app data? This cannot be undone.')) {
      // In a real app, this would clear data from Firebase
      // For now, we'll just show a success message
      setSuccess('All data has been cleared. You will be logged out.');
      
      // Logout after a short delay
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    }
  };
  
  return (
    <div className="container settings-page">
      <Header title="Settings" />
      
      {success && <Alert type="success" message={success} />}
      {error && <Alert type="danger" message={error} />}
      
      {/* User profile section */}
      <Card className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-info">
            <h2>{currentUser.displayName || 'User'}</h2>
            <p>{currentUser.email}</p>
          </div>
        </div>
      </Card>
      
      {/* Settings sections */}
      <div className="settings-section">
        <h3>Application</h3>
        <ul className="settings-list">
          <li className="settings-item">
            <div className="settings-item-icon">
              <Bell size={20} />
            </div>
            <div className="settings-item-content">
              <h4>Notifications</h4>
              <p>Configure app notification settings</p>
            </div>
          </li>
          
          <li className="settings-item">
            <div className="settings-item-icon">
              <HelpCircle size={20} />
            </div>
            <div className="settings-item-content">
              <h4>Help & Support</h4>
              <p>View tutorials and contact support</p>
            </div>
          </li>
          
          <li className="settings-item">
            <div className="settings-item-icon">
              <Info size={20} />
            </div>
            <div className="settings-item-content">
              <h4>About NSPIRE Pre-Inspection</h4>
              <p>Version 1.0.0</p>
            </div>
          </li>
        </ul>
      </div>
      
      <div className="settings-section">
        <h3>Account</h3>
        <ul className="settings-list">
          <li className="settings-item">
            <div className="settings-item-icon">
              <Shield size={20} />
            </div>
            <div className="settings-item-content">
              <h4>Privacy & Security</h4>
              <p>Manage account security settings</p>
            </div>
          </li>
          
          <li className="settings-item danger" onClick={handleClearData}>
            <div className="settings-item-icon">
              <Trash2 size={20} />
            </div>
            <div className="settings-item-content">
              <h4>Clear App Data</h4>
              <p>Delete all stored data and reset app</p>
            </div>
          </li>
          
          <li className="settings-item danger" onClick={handleLogout}>
            <div className="settings-item-icon">
              <LogOut size={20} />
            </div>
            <div className="settings-item-content">
              <h4>Logout</h4>
              <p>Sign out of your account</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;