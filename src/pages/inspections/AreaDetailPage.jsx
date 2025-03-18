// src/pages/inspections/AreaDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import FindingEntryForm from '../../components/FindingEntryForm';
import { 
  Plus, 
  AlertCircle, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Camera,
  Trash2,
  Home,
  Building,
  Grid
} from 'lucide-react';

const AreaDetailPage = () => {
  const { id, areaId } = useParams();
  const navigate = useNavigate();
  const { getInspection, updateInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddFinding, setShowAddFinding] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        // Find the area
        const areaData = inspectionData.areas?.find(a => a.id === areaId);
        if (!areaData) {
          setError('Area not found');
          setLoading(false);
          return;
        }
        
        setArea(areaData);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, areaId, getInspection, navigate]);
  
  const handleSaveFinding = async (newFinding) => {
    try {
      // Add finding to area
      const updatedArea = {
        ...area,
        findings: [...(area.findings || []), newFinding]
      };
      
      // Update areas in inspection
      const updatedAreas = inspection.areas.map(a => 
        a.id === areaId ? updatedArea : a
      );
      
      // Update inspection in Firebase
      await updateInspection(id, { areas: updatedAreas });
      
      // Update local state
      setArea(updatedArea);
      setShowAddFinding(false);
    } catch (error) {
      console.error("Error saving finding:", error);
      setError('Error saving finding');
    }
  };
  
  const handleDeleteFinding = async (findingId) => {
    if (!window.confirm('Are you sure you want to delete this finding?')) {
      return;
    }
    
    try {
      // Remove finding from area
      const updatedArea = {
        ...area,
        findings: area.findings.filter(f => f.id !== findingId)
      };
      
      // Update areas in inspection
      const updatedAreas = inspection.areas.map(a => 
        a.id === areaId ? updatedArea : a
      );
      
      // Update inspection in Firebase
      await updateInspection(id, { areas: updatedAreas });
      
      // Update local state
      setArea(updatedArea);
    } catch (error) {
      console.error("Error deleting finding:", error);
      setError('Error deleting finding');
    }
  };
  
  const getAreaIcon = () => {
    switch (area?.areaType) {
      case 'unit':
        return <Home size={20} />;
      case 'inside':
        return <Building size={20} />;
      case 'outside':
        return <Grid size={20} />;
      default:
        return null;
    }
  };
  
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'lifeThreatening':
        return <AlertCircle size={18} className="text-red-500" />;
      case 'severe':
        return <AlertTriangle size={18} className="text-orange-500" />;
      case 'moderate':
        return <Clock size={18} className="text-yellow-500" />;
      case 'low':
        return <CheckCircle size={18} className="text-blue-500" />;
      default:
        return <CheckCircle size={18} className="text-green-500" />;
    }
  };
  
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'lifeThreatening':
        return 'border-red-200 bg-red-50';
      case 'severe':
        return 'border-orange-200 bg-orange-50';
      case 'moderate':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return '';
    }
  };
  
  const getBackUrl = () => {
    if (area?.areaType === 'unit') {
      return `/inspections/${id}/areas/units`;
    } else if (area?.areaType === 'inside') {
      return `/inspections/${id}/areas/inside`;
    } else if (area?.areaType === 'outside') {
      return `/inspections/${id}/areas/outside`;
    }
    return `/inspections/${id}`;
  };
  
  if (loading) {
    return <Loading message="Loading area details..." />;
  }
  
  if (!area) {
    return (
      <div className="container">
        <Alert type="danger" message={error || "Area not found"} />
        <Button variant="primary" onClick={() => navigate(`/inspections/${id}`)}>
          Back to Inspection
        </Button>
      </div>
    );
  }
  
  // If showing add finding form
  if (showAddFinding) {
    return (
      <div className="container">
        <Header 
          title="Add Finding" 
          showBack={true}
          onBackClick={() => setShowAddFinding(false)}
        />
        
        <FindingEntryForm 
          inspectionId={id}
          areaId={areaId}
          areaType={area.areaType}
          onSave={handleSaveFinding}
          onCancel={() => setShowAddFinding(false)}
        />
      </div>
    );
  }
  
  return (
    <div className="container pb-16">
      <Header 
        title={area.name}
        showBack={true}
      />
      
      {error && <Alert type="danger" message={error} />}
      
      {/* Area Info Card */}
      <Card className="mb-4">
        <div className="flex items-center">
          <div className="bg-gray-100 p-3 rounded-full mr-3">
            {getAreaIcon()}
          </div>
          <div>
            <h2 className="font-bold">{area.name}</h2>
            <p className="text-gray-500">{area.areaType}</p>
          </div>
        </div>
      </Card>
      
      {/* Findings Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">
          Findings ({area.findings?.length || 0})
        </h2>
        <Button 
          variant="primary"
          onClick={() => setShowAddFinding(true)}
        >
          <Plus size={16} className="mr-1" /> Add Finding
        </Button>
      </div>
      
      {/* Findings List */}
      {!area.findings || area.findings.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-gray-500 mb-4">No findings have been added yet.</p>
          <Button 
            variant="primary"
            onClick={() => setShowAddFinding(true)}
          >
            <Plus size={16} className="mr-1" /> Add First Finding
          </Button>
        </Card>
      ) : (
        <div className="space-y-4 mb-4">
          {area.findings.map((finding) => (
            <Card 
              key={finding.id} 
              className={`p-4 border-l-4 ${getSeverityClass(finding.severity)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{finding.subcategory}</h3>
                <div className="flex items-center">
                  {getSeverityIcon(finding.severity)}
                </div>
              </div>
              
              <p className="mb-3">{finding.deficiency}</p>
              
              {finding.notes && (
                <p className="text-sm text-gray-500 mb-3">{finding.notes}</p>
              )}
              
              {/* Photos thumbnails */}
              {finding.photos && finding.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {finding.photos.map((photo, index) => (
                    <div 
                      key={index} 
                      className="w-16 h-16 border rounded overflow-hidden"
                    >
                      <img 
                        src={photo.data} 
                        alt={`Photo ${index+1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end">
                <Button
                  variant="danger"
                  className="p-2"
                  onClick={() => handleDeleteFinding(finding.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-white border-t">
        <div className="container flex justify-between">
          <Button 
            variant="secondary" 
            onClick={() => navigate(getBackUrl())}
          >
            Back
          </Button>
          
          <Button 
            variant="primary" 
            onClick={() => setShowAddFinding(true)}
          >
            <Plus size={16} className="mr-1" /> Add Finding
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AreaDetailPage;