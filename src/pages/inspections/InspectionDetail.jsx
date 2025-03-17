// src/pages/inspections/InspectionDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useProperty } from '../../context/PropertyContext';
import { 
  Plus, 
  Calendar, 
  User, 
  Clipboard, 
  Trash2, 
  Download,
  ChevronDown,
  ChevronUp,
  Building,
  Home,
  ArrowLeft
} from 'lucide-react';
import AddAreaModal from '../../components/AddAreaModal';
import Button from '../../components/Button';

const InspectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection, updateInspection, deleteInspection, calculateScore } = useInspection();
  const { getProperty } = useProperty();
  
  const [inspection, setInspection] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [score, setScore] = useState(100);
  const [expandedAreas, setExpandedAreas] = useState({});
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get inspection details
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        // Initialize areas array if it doesn't exist
        if (!inspectionData.areas) {
          inspectionData.areas = [];
        }
        
        setInspection(inspectionData);
        
        // Get property details
        const propertyData = getProperty(inspectionData.propertyId);
        if (!propertyData) {
          setError('Property not found for this inspection');
        } else {
          setProperty(propertyData);
        }
        
        // Calculate score
        const calculatedScore = calculateScore(id);
        setScore(calculatedScore);
        
        // Initialize expanded state for areas
        const expandedState = {};
        if (inspectionData.areas) {
          inspectionData.areas.forEach(area => {
            expandedState[area.id] = false;
          });
        }
        setExpandedAreas(expandedState);
      } catch (error) {
        setError('Error loading inspection: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, getProperty, navigate, calculateScore]);
  
  const handleDeleteInspection = async () => {
    if (window.confirm('Are you sure you want to delete this inspection?')) {
      try {
        await deleteInspection(id);
        navigate('/inspections');
      } catch (error) {
        setError('Error deleting inspection: ' + error.message);
      }
    }
  };
  
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateInspection(id, { status: newStatus });
      setInspection({ ...inspection, status: newStatus });
    } catch (error) {
      setError('Error updating status: ' + error.message);
    }
  };
  
  const handleSaveArea = async (newArea) => {
    try {
      // Add the new area to the inspection
      const updatedAreas = [...(inspection.areas || []), newArea];
      await updateInspection(id, { areas: updatedAreas });
      
      // Update local state
      setInspection({ ...inspection, areas: updatedAreas });
      
      // Close the modal
      setShowAddAreaModal(false);
      
      // Update expanded state
      setExpandedAreas({ ...expandedAreas, [newArea.id]: true });
      
      // Recalculate score if needed
      const calculatedScore = calculateScore(id);
      setScore(calculatedScore);
    } catch (error) {
      setError('Error adding area: ' + error.message);
    }
  };
  
  const handleDeleteArea = async (areaId) => {
    if (window.confirm('Are you sure you want to delete this area and all its findings?')) {
      try {
        // Remove the area from the inspection
        const updatedAreas = inspection.areas.filter(area => area.id !== areaId);
        await updateInspection(id, { areas: updatedAreas });
        
        // Update local state
        setInspection({ ...inspection, areas: updatedAreas });
        
        // Recalculate score if needed
        const calculatedScore = calculateScore(id);
        setScore(calculatedScore);
      } catch (error) {
        setError('Error deleting area: ' + error.message);
      }
    }
  };
  
  const toggleAreaExpand = (areaId) => {
    setExpandedAreas(prev => ({
      ...prev,
      [areaId]: !prev[areaId]
    }));
  };
  
  const handleGenerateReport = () => {
    navigate(`/inspections/${id}/report`);
  };
  
  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading inspection details...</div>
      </div>
    );
  }
  
  if (!inspection) {
    return (
      <div className="container">
        <div className="alert alert-danger">Inspection not found</div>
        <Button 
          variant="primary"
          onClick={() => navigate('/inspections')}
        >
          Back to Inspections
        </Button>
      </div>
    );
  }
  
  // Helper function to get the icon for an area type
  const getAreaIcon = (areaType) => {
    switch (areaType) {
      case 'unit':
        return <Home size={18} />;
      case 'exterior':
      case 'common':
        return <Building size={18} />;
      default:
        return <Clipboard size={18} />;
    }
  };
  
  return (
    <div className="container">
      {/* Property header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <button 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            marginRight: '10px',
            padding: '8px'
          }} 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{property ? property.name : 'Inspection Details'}</h1>
      </div>
      
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}
      
      {/* Inspection details card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Inspection Details</h2>
          <div style={{ 
            backgroundColor: '#000', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            fontWeight: 'bold' 
          }}>
            Score: {score}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} />
            <span>{new Date(inspection.date).toLocaleDateString()}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} />
            <span>Inspector: {inspection.inspector}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <label htmlFor="status" style={{ marginRight: '8px' }}>Status:</label>
          <select
            id="status"
            value={inspection.status}
            onChange={handleStatusChange}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              backgroundColor: inspection.status === 'Completed' ? '#d4edda' : 
                             inspection.status === 'In Progress' ? '#fff3cd' : '#cce5ff'
            }}
          >
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        
        {inspection.notes && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '8px' }}>Notes</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{inspection.notes}</p>
          </div>
        )}
      </div>
      
      {/* Actions row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', marginBottom: '24px' }}>
        <Button 
          variant="primary"
          onClick={() => setShowAddAreaModal(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add Area/Unit
        </Button>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            variant="secondary"
            onClick={handleGenerateReport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} /> Report
          </Button>
          
          <Button 
            variant="danger"
            onClick={handleDeleteInspection}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Trash2 size={16} /> Delete
          </Button>
        </div>
      </div>
      
      {/* Areas/Units section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clipboard size={20} />
          Areas/Units {inspection.areas ? `(${inspection.areas.length})` : '(0)'}
        </h2>
        
        {!inspection.areas || inspection.areas.length === 0 ? (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '32px 16px', 
            textAlign: 'center',
            borderRadius: '8px'
          }}>
            <Clipboard size={32} style={{ color: '#ccc', marginBottom: '16px' }} />
            <p style={{ marginBottom: '8px' }}>No areas or units added yet.</p>
            <p>Click the "Add Area/Unit" button to begin your inspection.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {inspection.areas.map(area => (
              <div 
                key={area.id}
                className="card"
                style={{ margin: 0, overflow: 'hidden' }}
              >
                {/* Area header - always visible */}
                <div 
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: expandedAreas[area.id] ? '1px solid #eee' : 'none',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleAreaExpand(area.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getAreaIcon(area.areaType)}
                    <span style={{ fontWeight: 'bold' }}>{area.name}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                      {area.findings.length} {area.findings.length === 1 ? 'Finding' : 'Findings'}
                    </span>
                    {expandedAreas[area.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                
                {/* Area content - visible when expanded */}
                {expandedAreas[area.id] && (
                  <div style={{ padding: '16px' }}>
                    {area.findings.map((finding, index) => (
                      <div 
                        key={finding.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px', 
                          marginBottom: '8px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${
                            finding.severity === 3 ? '#f8d7da' : 
                            finding.severity === 2 ? '#fff3cd' : '#cce5ff'
                          }`
                        }}
                      >
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          backgroundColor: '#eee',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          marginRight: '12px'
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {finding.category}: {finding.subcategory}
                          </div>
                          <div style={{ marginBottom: '4px' }}>{finding.deficiency}</div>
                          <div style={{ 
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            backgroundColor: finding.severity === 3 ? '#f8d7da' : 
                                            finding.severity === 2 ? '#fff3cd' : '#cce5ff',
                            color: finding.severity === 3 ? '#721c24' : 
                                   finding.severity === 2 ? '#856404' : '#004085'
                          }}>
                            Level {finding.severity}
                          </div>
                        </div>
                        {finding.photos && finding.photos.length > 0 && (
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <img 
                              src={finding.photos[0].data || finding.photos[0].url} 
                              alt="Finding" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <Button 
                        variant="danger"
                        onClick={() => handleDeleteArea(area.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Trash2 size={16} /> Remove Area
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Area Modal */}
      {showAddAreaModal && (
        <AddAreaModal 
          inspectionId={id}
          onClose={() => setShowAddAreaModal(false)}
          onSave={handleSaveArea}
        />
      )}
    </div>
  );
};

export default InspectionDetail;