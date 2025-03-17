// src/pages/teams/Teams.jsx (updated)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../../context/TeamContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Alert from '../../components/Alert';
import { Users, ArrowRight, UserPlus, Mail } from 'lucide-react';
import Loading from '../../components/Loading';

const Teams = () => {
  const { teams, activeTeam, loading, error, switchTeam, inviteTeamMember } = useTeam();
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const navigate = useNavigate();
  
  if (loading) {
    return <Loading message="Loading teams..." />;
  }
  
  const handleSwitchTeam = (teamId) => {
    if (switchTeam(teamId)) {
      // Refresh properties and inspections for new team
      navigate('/');
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
        // Keep modal open to show success message
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
    <div className="container">
      <Header title="Teams" />
      
      {error && <Alert type="danger" message={error} />}
      
      <div className="teams-container">
        {teams.length === 0 ? (
          // Empty state with card-style create button
          <div className="teams-empty-state">
            <div className="empty-state-icon">
              <Users size={48} />
            </div>
            <h3>No Teams Yet</h3>
            <p>Create a team to collaborate with others</p>
            
            {/* Card-style team creation button */}
            <div className="team-creation-card" onClick={() => navigate('/teams/new')}>
              <div className="team-creation-icon">
                <Users size={32} />
              </div>
              <div className="team-creation-content">
                <h3>Create a New Team</h3>
                <p>Start collaborating with your colleagues</p>
              </div>
              <div className="team-creation-action">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <h3>Your Team</h3>
            <div className="teams-list">
              {teams.map(team => (
                <Card 
                  key={team.id} 
                  className={`team-card ${activeTeam?.id === team.id ? 'active-team' : ''}`}
                  onClick={() => handleSwitchTeam(team.id)}
                >
                  <div className="team-info">
                    <h3 className="team-name">{team.name}</h3>
                    <p className="team-members">{team.members.length} Members</p>
                  </div>
                  {activeTeam?.id === team.id && (
                    <div className="active-indicator">Active</div>
                  )}
                </Card>
              ))}
              
              {/* Invite team member button */}
              <div className="team-creation-card" onClick={() => setShowInviteModal(true)}>
                <div className="team-creation-icon invite-icon">
                  <UserPlus size={24} />
                </div>
                <div className="team-creation-content">
                  <h3>Invite Team Member</h3>
                  <p>Add colleagues to your team</p>
                </div>
                <div className="team-creation-action">
                  <Mail size={20} />
                </div>
              </div>
            </div>
            
            <div className="team-actions">
              <h3>Team Members</h3>
              <div className="members-list">
                {activeTeam?.members?.map(member => (
                  <div className="member-item" key={member.userId}>
                    <div className="member-avatar">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-info">
                      <p className="member-name">{member.name}</p>
                      <p className="member-role">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-container invitation-modal">
            <div className="modal-header">
              <h3>Invite to {activeTeam?.name}</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteError('');
                  setInviteSuccess('');
                }}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              {inviteError && <Alert type="danger" message={inviteError} />}
              {inviteSuccess && <Alert type="success" message={inviteSuccess} />}
              
              <form onSubmit={handleInviteSubmit}>
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
                    disabled={inviteLoading}
                  />
                  <p className="input-help">Enter the email address of the person you want to invite to your team.</p>
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="auth-button-secondary"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                      setInviteError('');
                      setInviteSuccess('');
                    }}
                    disabled={inviteLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="auth-button"
                    disabled={inviteLoading || !inviteEmail.trim()}
                  >
                    {inviteLoading ? 'Sending...' : (
                      <>
                        <Mail size={16} /> Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;