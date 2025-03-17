// src/components/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Header = ({ title, showBack = false, action = null }) => {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <div className="flex items-center gap-2">
        {showBack && (
          <button 
            className="btn-icon" 
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 className="page-title">{title}</h1>
      </div>
      {action}
    </div>
  );
};

export default Header;