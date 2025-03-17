// src/pages/inspections/InspectionMain.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useProperty } from '../../context/PropertyContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';
import { 
  Home, 
  Building, 
  Grid, 
  CheckSquare, 
  PenTool, 
  Users, 
  Clipboard, 
  Download,
  Share2, 
  ChevronRight 
} from 'lucide-react';

const InspectionMain = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection, calculateScore } = useInspection();
  const { getProperty } = useProperty();
  
  const [inspection, setInspection] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [score, setScore] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        const propertyData = getProperty(inspectionData.propertyId);
        if (propertyData) {
          setProperty(propertyData);
        }
        
        // Calculate score
        const calculatedScore = calculateScore(id);
        setScore(calculatedScore);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, getProperty, calculateScore, navigate]);
  
  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const getInspectionCycle = (score) => {
    if (score >= 90) return '3 Years';
    if (score >= 80) return '2 Years';
    if (score >= 60) return '1 Year';
    return 'Failing';
  };
  
  const handleGenerateReport = () => {
    navigate(`/inspections/${id}/report`);
  };
  
  const handleShareReport = () => {
    navigate(`/inspections/${id}/share`);
  };
  
  if (loading) {
    return <Loading message="Loading inspection details..." />;
  }
  
  if (!inspection || !property) {
    return (
      <div className="container">
        <Alert type="danger" message={error || "Inspection or property not found"} />
        <Button variant="primary" onClick={() => navigate('/inspections')}>
          Back to Inspections
        </Button>
      </div>
    );
  }
  
  // Get counts for each area
  const unitCount = inspection.areas?.filter(area => area.areaType === 'unit').length || 0;
  const insideLocations = inspection.areas?.filter(area => area.areaType === 'inside').length || 0;
  const outsideLocations = inspection.areas?.filter(area => area.areaType === 'outside').length || 0;
  
  // Get finding counts for each area
  const unitFindings = inspection.areas?.filter(area => area.areaType === 'unit')
    .reduce((sum, area) => sum + (area.findings?.length || 0), 0) || 0;
  
  const insideFindings = inspection.areas?.filter(area => area.areaType === 'inside')
    .reduce((sum, area) => sum + (area.findings?.length || 0), 0) || 0;
  
  const outsideFindings = inspection.areas?.filter(area => area.areaType === 'outside')
    .reduce((sum, area) => sum + (area.findings?.length || 0), 0) || 0;
  
  return (
    <div className="container pb-16">
      <Header 
        title="Inspection Details" 
        showBack={true}
      />
      
      {error && <Alert type="danger" message={error} />}
      
      {/* Inspection Header Card */}
      <Card className="mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold">{property.name}</h1>
            <p className="text-gray-500">{property.address}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold ${getScoreColor(score)}`}>
            Score: {score}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Inspection Date</p>
            <p className="font-medium">{new Date(inspection.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Inspector</p>
            <p className="font-medium">{inspection.inspector}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{inspection.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Inspection Cycle</p>
            <p className="font-medium">{getInspectionCycle(score)}</p>
          </div>
        </div>
        
        <div className="border-t pt-4 flex gap-2 justify-end">
          <Button
            variant="secondary"
            onClick={handleShareReport}
          >
            <Share2 size={16} className="mr-1" /> Share
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerateReport}
          >
            <Download size={16} className="mr-1" /> Report
          </Button>
        </div>
      </Card>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center p-4 justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Units</span>
            <span className="text-xl font-bold">{unitCount}</span>
            <span className="text-xs text-gray-500">{unitFindings} findings</span>
          </div>
          <Home size={32} className="text-gray-400" />
        </Card>
        
        <Card className="flex items-center p-4 justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Inside</span>
            <span className="text-xl font-bold">{insideLocations}</span>
            <span className="text-xs text-gray-500">{insideFindings} findings</span>
          </div>
          <Building size={32} className="text-gray-400" />
        </Card>
        
        <Card className="flex items-center p-4 justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Outside</span>
            <span className="text-xl font-bold">{outsideLocations}</span>
            <span className="text-xs text-gray-500">{outsideFindings} findings</span>
          </div>
          <Grid size={32} className="text-gray-400" />
        </Card>
      </div>
      
      {/* Areas Grid */}
      <h2 className="text-lg font-bold mb-4">Inspection Areas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Units Area Card */}
        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/inspections/${id}/areas/units`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Home size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold">Units</h3>
                <p className="text-sm text-gray-500">Dwelling units and apartments</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </Card>
        
        {/* Inside Area Card */}
        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/inspections/${id}/areas/inside`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <Building size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold">Inside</h3>
                <p className="text-sm text-gray-500">Common areas and building systems</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </Card>
        
        {/* Outside Area Card */}
        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/inspections/${id}/areas/outside`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <Grid size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-bold">Outside</h3>
                <p className="text-sm text-gray-500">Building exterior, site, and grounds</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </Card>
        
        {/* NSPIRE Standards Reference Card */}
        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/inspections/${id}/standards`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <Clipboard size={24} className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold">NSPIRE Standards</h3>
                <p className="text-sm text-gray-500">Reference guide and definitions</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </Card>
      </div>
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-white border-t">
        <div className="container flex justify-between">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/inspections')}
          >
            Back to List
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InspectionMain;