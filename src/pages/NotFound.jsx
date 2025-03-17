// src/pages/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container">
      <div className="not-found">
        <AlertTriangle size={64} />
        <h1>Page Not Found</h1>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/')}
        >
          <Home size={16} /> Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;