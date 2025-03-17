// src/pages/dashboard/Dashboard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProperty } from '../../context/PropertyContext';
import { useInspection } from '../../context/InspectionContext';
import { useTeam } from '../../context/TeamContext';
import { Home, Calendar, Users, ArrowRight, Clipboard, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { properties } = useProperty();
  const { inspections } = useInspection();
  const { activeTeam } = useTeam();
  const navigate = useNavigate();
  
  // Get active inspections (not completed)
  const activeInspections = inspections.filter(inspection => 
    inspection.status !== 'Completed'
  );
  
  // Get recent inspections (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentInspections = inspections.filter(inspection => {
    const inspectionDate = new Date(inspection.date);
    return inspectionDate >= oneWeekAgo;
  });

  // Find properties with no recent inspections
  const propertiesToInspect = properties.filter(property => {
    // Check if property has any inspection in the last 90 days
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
    
    const hasRecentInspection = inspections.some(inspection => {
      return inspection.propertyId === property.id && 
             new Date(inspection.date) >= threeMonthsAgo;
    });
    
    return !hasRecentInspection;
  });
  
  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container">
      {/* Header section with better spacing */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>
          Hello, {currentUser.displayName || currentUser.email.split('@')[0]}
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      
      {/* Team banner section - if no active team */}
      {!activeTeam && (
        <div className="card" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/teams')}>
          <div className="action-icon" style={{ marginRight: '16px', marginBottom: 0 }}>
            <Users size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Create a team to collaborate</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Share properties and inspections with your colleagues</p>
          </div>
          <ArrowRight size={20} />
        </div>
      )}
      
      {/* Quick Actions section - improved layout */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '16px' }}>
          <div className="card action-card" onClick={() => navigate('/properties/new')} style={{ margin: 0 }}>
            <div className="action-icon">
              <Home size={24} />
            </div>
            <span style={{ fontWeight: 500 }}>Add Property</span>
          </div>
          
          <div className="card action-card" onClick={() => navigate('/inspections/new')} style={{ margin: 0 }}>
            <div className="action-icon">
              <Calendar size={24} />
            </div>
            <span style={{ fontWeight: 500 }}>New Inspection</span>
          </div>
        </div>
      </section>
      
      {/* Stats Overview - improved layout */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div className="card" style={{ margin: 0, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            <div className="action-icon" style={{ marginRight: '12px', marginBottom: 0 }}>
              <Home size={20} />
            </div>
            <div>
              <div className="stat-value">{properties.length}</div>
              <div className="stat-label" style={{ fontSize: '0.9rem', color: '#666' }}>Properties</div>
            </div>
          </div>
          
          <div className="card" style={{ margin: 0, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            <div className="action-icon" style={{ marginRight: '12px', marginBottom: 0 }}>
              <Calendar size={20} />
            </div>
            <div>
              <div className="stat-value">{activeInspections.length}</div>
              <div className="stat-label" style={{ fontSize: '0.9rem', color: '#666' }}>Active Inspections</div>
            </div>
          </div>
          
          <div className="card" style={{ margin: 0, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            <div className="action-icon" style={{ marginRight: '12px', marginBottom: 0 }}>
              <Clipboard size={20} />
            </div>
            <div>
              <div className="stat-value">{recentInspections.length}</div>
              <div className="stat-label" style={{ fontSize: '0.9rem', color: '#666' }}>Recent Reports</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Properties Requiring Attention - if any */}
      {propertiesToInspect.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Properties Needing Inspection</h2>
            {propertiesToInspect.length > 3 && (
              <Link to="/properties" style={{ color: '#333', fontSize: '0.9rem' }}>
                View All
              </Link>
            )}
          </div>
          
          <div className="alert alert-warning" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <AlertTriangle size={18} />
            <span style={{ marginLeft: '8px' }}>These properties haven't been inspected in 90+ days</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {propertiesToInspect.slice(0, 3).map(property => (
              <div 
                key={property.id}
                className="card property-card" 
                style={{ margin: 0, cursor: 'pointer', padding: '16px' }}
                onClick={() => navigate(`/properties/${property.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Home size={20} style={{ marginRight: '12px', color: '#666' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{property.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{property.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Recent Inspections - if any */}
      {recentInspections.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Recent Inspections</h2>
            {recentInspections.length > 3 && (
              <Link to="/inspections" style={{ color: '#333', fontSize: '0.9rem' }}>
                View All
              </Link>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentInspections.slice(0, 3).map(inspection => {
              const property = properties.find(p => p.id === inspection.propertyId);
              return (
                <div 
                  key={inspection.id}
                  className="card inspection-card" 
                  style={{ margin: 0, cursor: 'pointer', padding: '16px' }}
                  onClick={() => navigate(`/inspections/${inspection.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Calendar size={20} style={{ marginRight: '12px', color: '#666' }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>
                        {property ? property.name : 'Unknown Property'}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          {formatDate(inspection.date)}
                        </span>
                        <span className={`status-badge status-${inspection.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {inspection.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;