// src/pages/inspections/UnitAreaPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import { 
  Home, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const UnitAreaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [units, setUnits] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        // Filter units from areas
        const unitAreas = inspectionData.areas 
          ? inspectionData.areas.filter(area => area.areaType === 'unit')
          : [];
        
        setUnits(unitAreas);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, navigate]);
  
  const handleAddUnit = () => {
    navigate(`/inspections/${id}/units/add`);
  };
  
  const getSeverityIcon = (unit) => {
    if (!unit.findings || unit.findings.length === 0) return null;
    
    const hasLifeThreatening = unit.findings.some(f => f.severity === 'lifeThreatening');
    if (hasLifeThreatening) {
      return <AlertCircle size={18} className="text-red-500" />;
    }
    
    const hasSevere = unit.findings.some(f => f.severity === 'severe');
    if (hasSevere) {
      return <AlertTriangle size={18} className="text-orange-500" />;
    }
    
    const hasModerate = unit.findings.some(f => f.severity === 'moderate');
    if (hasModerate) {
      return <Clock size={18} className="text-yellow-500" />;
    }
    
    return <CheckCircle size={18} className="text-green-500" />;
  };
  
  if (loading) {
    return <Loading message="Loading units..." />;
  }
  
  if (!inspection) {
    return (
      <div className="container">
        <Alert type="danger" message={error || "Inspection not found"} />
        <Button variant="primary" onClick={() => navigate('/inspections')}>
          Back to Inspections
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container pb-16">
      <Header 
        title="Units" 
        showBack={true}
      />
      
      {error && <Alert type="danger" message={error} />}
      
      {/* Instructions Card */}
      <Card className="mb-4 bg-blue-50">
        <div className="flex items-start">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <Home size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-blue-800">Unit Inspection</h2>
            <p className="text-sm text-blue-600">
              Add units to inspect and record findings for each unit. Units can be apartments, 
              houses, or any dwelling spaces. Tap on a unit to view or add findings.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Units List */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Units ({units.length})</h2>
          <Button 
            variant="primary"
            onClick={handleAddUnit}
          >
            <Plus size={16} className="mr-1" /> Add Unit
          </Button>
        </div>
        
        {units.length === 0 ? (
          <Card className="p-4 text-center">
            <p className="text-gray-500 mb-4">No units have been added yet.</p>
            <Button 
              variant="primary"
              onClick={handleAddUnit}
            >
              <Plus size={16} className="mr-1" /> Add First Unit
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {units.map((unit) => (
              <Card 
                key={unit.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/inspections/${id}/units/${unit.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <Home size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold">{unit.name}</h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          {unit.findings ? unit.findings.length : 0} findings
                        </span>
                        {getSeverityIcon(unit)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-white border-t">
        <div className="container flex justify-between">
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/inspections/${id}`)}
          >
            Back to Inspection
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleAddUnit}
          >
            <Plus size={16} className="mr-1" /> Add Unit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnitAreaPage;