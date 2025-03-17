// src/pages/teams/CreateTeam.jsx (updated with success state)
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTeam } from '../../context/TeamContext';
import { Users, CheckCircle, Mail, ArrowRight } from 'lucide-react';
import Alert from '../../components/Alert';

const CreateTeam = () => {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdTeam, setCreatedTeam] = useState(null); // Store the created team
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const { createTeam, inviteTeamMember } = useTeam();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }
    
    try {
      setLoading(true);
      // Create the team
      const newTeam = await createTeam(teamName);
      setCreatedTeam(newTeam); // Store the created team to show success state
    } catch (err) {
      console.error('Team creation error:', err);
      setError('Failed to create team: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      setInviteError('Email address is required');
      return;
    }
    
    try {
      setInviteLoading(true);
      setInviteError('');
      
      const result = await inviteTeamMember(inviteEmail);
      
      if (result.success) {
        setInviteSuccess(result.message || 'Invitation sent successfully');
        setInviteEmail('');
      } else {
        setInviteError(result.message || 'Failed to send invitation');
      }
    } catch (error) {
      setInviteError('Failed to send invitation: ' + error.message);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {!createdTeam ? (
          // Team creation form
          <>
            <div className="auth-header">
              <div className="logo-container">
                <div className="logo">NSPIRE</div>
                <div className="logo-subtitle">Pre-Inspection App</div>
              </div>
              <h1>Create Your Team</h1>
              <p>Create a team to collaborate with colleagues</p>
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            
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
                disabled={loading || !teamName.trim()}
              >
                {loading ? 'Creating Team...' : (
                  <>
                    <Users size={18} />
                    <span>Create Team</span>
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                className="auth-button-secondary"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Skip for now
              </button>
            </form>
          </>
        ) : (
          // Team created success state with invitation option
          <>
            <div className="auth-success-header">
              <div className="success-icon">
                <CheckCircle size={48} color="#4caf50" />
              </div>
              <h1>Team Created!</h1>
              <p>Your team "{createdTeam.name}" has been created successfully</p>
            </div>
            
            <div className="auth-success-content">
              <h3 className="invite-heading">Invite Team Members</h3>
              
              {inviteError && <Alert type="danger" message={inviteError} />}
              {inviteSuccess && <Alert type="success" message={inviteSuccess} />}
              
              <form onSubmit={handleInviteSubmit} className="invite-form">
                <div className="form-group">
                  <label htmlFor="email">Colleague's Email</label>
                  <input
                    id="email"
                    type="email"
                    className="auth-input"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    required
                  />
                  <p className="input-help">Enter the email address of a colleague to invite them to your team.</p>
                </div>
                
                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={inviteLoading || !inviteEmail.trim()}
                >
                  {inviteLoading ? 'Sending...' : (
                    <>
                      <Mail size={18} />
                      <span>Send Invitation</span>
                    </>
                  )}
                </button>
              </form>
              
              <div className="auth-button-secondary continue-button" onClick={() => navigate('/')}>
                <span>Continue to Dashboard</span>
                <ArrowRight size={18} />
              </div>
            </div>
          </>
        )}
        
        <div className="auth-footer">
          <p>
            Back to <Link to="/" className="auth-link">Dashboard</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;