// src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProperty } from '../../context/PropertyContext';
import { useInspection } from '../../context/InspectionContext';
import { Home, Calendar, ArrowRight, AlertTriangle, Clock } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { properties } = useProperty();
  const { inspections } = useInspection();
  const navigate = useNavigate();
  
  // Get active inspections (not completed)
  const activeInspections = inspections.filter(inspection => 
    inspection.status !== 'Completed'
  );
  
  // Get recent inspections (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentInspections = inspections
    .filter(inspection => {
      const inspectionDate = new Date(inspection.date);
      return inspectionDate >= oneWeekAgo;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, most recent first

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
      
      {/* Quick Actions section - improved layout */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '16px' }}>
          <div className="card action-card" onClick={() => navigate('/properties/new')} style={{ margin: '0', gridColumn: 'span 2' }}>
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

{/* Recent Inspections Section */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Recent Inspections</h2>
          {recentInspections.length > 5 && (
            <Link to="/inspections" style={{ color: '#333', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          )}
        </div>
        
        {recentInspections.length === 0 ? (
          <div className="card" style={{ padding: '24px', textAlign: 'center', background: '#f9fafb' }}>
            <p style={{ marginBottom: '16px', color: '#666' }}>No recent inspections found</p>
            <button 
              onClick={() => navigate('/inspections/new')} 
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <Calendar size={18} style={{ marginRight: '8px' }} /> Start New Inspection
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInspections.slice(0, 5).map(inspection => {
              const property = properties.find(p => p.id === inspection.propertyId);
              
              // Calculate days since inspection date
              const inspectionDate = new Date(inspection.date);
              const today = new Date();
              const diffTime = Math.abs(today - inspectionDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              return (
                <div 
                  key={inspection.id}
                  className="card" 
                  style={{ margin: 0, cursor: 'pointer', padding: '16px' }}
                  onClick={() => navigate(`/inspections/${inspection.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px',
                      backgroundColor: inspection.status === 'Completed' ? '#d1fae5' : '#e0f2fe',
                      color: inspection.status === 'Completed' ? '#059669' : '#0369a1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px'
                    }}>
                      {inspection.status === 'Completed' ? (
                        <Home size={24} />
                      ) : (
                        <Clock size={24} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>
                        {property ? property.name : 'Unknown Property'}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          {formatDate(inspection.date)} • {diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`}
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
        )}
      </section>
      
      {/* Properties Requiring Attention - if any */}
      {propertiesToInspect.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Properties Needing Inspection</h2>
            {propertiesToInspect.length > 3 && (
              <Link to="/properties" style={{ color: '#333', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                View All <ArrowRight size={16} className="ml-1" />
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
    </div>
  );
};

export default Dashboard;