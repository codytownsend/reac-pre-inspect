// Simplified src/pages/settings/Settings.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import { User, LogOut } from 'lucide-react';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="container max-w-lg mx-auto pb-20 px-4">
      <Header title="Settings" />
      
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <User size={28} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentUser.displayName || 'User'}
              </h2>
              <p className="text-gray-600">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Account</h3>
        </div>
        
        <div className="p-2">
          <button 
            onClick={handleLogout}
            disabled={loading}
            className="w-full text-left px-4 py-4 hover:bg-red-50 text-red-600 rounded-lg transition-colors flex items-center"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">
              {loading ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        </div>
      </div>
      
      {/* App Info */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>NSPIRE Pre-Inspection App</p>
        <p>Version 1.0.0</p>
      </div>
    </div>
  );
};

export default Settings;