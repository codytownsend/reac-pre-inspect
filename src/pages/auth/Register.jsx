// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      await register(formData.name, formData.email, formData.password);
      setCurrentStep(2); // Move to team creation step
    } catch (error) {
      setError('Failed to create account: ' + error.message);
      setLoading(false);
    }
  };

  const handleCreateTeam = async (teamName) => {
    try {
      setLoading(true);
      console.log("Creating team:", teamName); // Debug log
      
      // If you have the TeamProvider set up:
      const { createTeam } = useTeam();
      await createTeam(teamName);
      
      // Without TeamProvider, just log and proceed
      console.log("Team would be created:", teamName);
      
      // Navigate to dashboard after successful team creation
      navigate('/');
    } catch (error) {
      console.error("Team creation error:", error);
      setError('Failed to create team: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo-container">
            <div className="logo">NSPIRE</div>
            <div className="logo-subtitle">Pre-Inspection App</div>
          </div>
          <h1>{currentStep === 1 ? 'Create Account' : 'Create Your Team'}</h1>
          <p>
            {currentStep === 1 
              ? 'Sign up to start managing property inspections' 
              : 'Create a team to collaborate with colleagues'}
          </p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        {currentStep === 1 ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                required
                className="auth-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="auth-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength="6"
                  className="auth-input"
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength="6"
                className="auth-input"
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <TeamCreationStep 
            onCreateTeam={handleCreateTeam} 
            onSkip={() => navigate('/')}
            loading={loading}
          />
        )}
        
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};


const TeamCreationStep = ({ onCreateTeam, onSkip, loading }) => {
  const [teamName, setTeamName] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (teamName.trim()) {
      try {
        setLocalLoading(true);
        await onCreateTeam(teamName);
      } catch (error) {
        console.error("Team creation error:", error);
        setLocalLoading(false);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="teamName">Team Name</label>
        <input
          id="teamName"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="My Inspection Team"
          required
          className="auth-input"
        />
        <p className="input-help">Create a team to share properties and inspections with colleagues</p>
      </div>
      
      <button 
        type="submit" 
        className="auth-button"
        disabled={localLoading || loading || !teamName.trim()}
      >
        {localLoading || loading ? 'Creating Team...' : (
          <>
            <Users size={18} />
            <span>Create Team</span>
          </>
        )}
      </button>
      
      <button 
        type="button" 
        className="auth-button-secondary"
        onClick={onSkip}
        disabled={localLoading || loading}
      >
        Skip for now
      </button>
    </form>
  );
};

export default Register;