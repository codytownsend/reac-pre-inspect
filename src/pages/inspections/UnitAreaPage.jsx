// src/pages/inspections/UnitAreaPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { 
  Home, 
  Plus, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  Clock,
  ArrowLeft,
  Search
} from 'lucide-react';

const UnitAreaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
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
    if (!unit.findings || unit.findings.length === 0) {
      return <CheckCircle size={20} className="text-green-500" />;
    }
    
    // Check for life-threatening findings
    const hasLifeThreatening = unit.findings.some(f => f.severity === 'lifeThreatening');
    if (hasLifeThreatening) {
      return <AlertCircle size={20} className="text-red-500" />;
    }
    
    // Check for severe findings
    const hasSevere = unit.findings.some(f => f.severity === 'severe');
    if (hasSevere) {
      return <AlertTriangle size={20} className="text-orange-500" />;
    }
    
    // Check for moderate findings
    const hasModerate = unit.findings.some(f => f.severity === 'moderate');
    if (hasModerate) {
      return <Clock size={20} className="text-yellow-500" />;
    }
    
    return <CheckCircle size={20} className="text-green-500" />;
  };
  
  // Filter units based on search term
  const filteredUnits = units.filter(unit => 
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading units...</p>
        </div>
      </div>
    );
  }
  
  if (!inspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Inspection Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The inspection you're looking for doesn't exist or has been removed."}
          </p>
          <button 
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium"
            onClick={() => navigate('/inspections')}
          >
            Back to Inspections
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* App Bar */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
            onClick={() => navigate(`/inspections/${id}`)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Units</h1>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {units.length} Unit{units.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 block w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Units List */}
      <div className="px-4">
        {filteredUnits.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            {searchTerm ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-600 mb-6">No units found matching "{searchTerm}"</p>
                <button 
                  className="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium flex items-center justify-center mx-auto"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home size={24} className="text-blue-500" />
                </div>
                <p className="text-gray-600 mb-6">No units have been added yet.</p>
                <button 
                  className="py-3 px-4 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center mx-auto"
                  onClick={handleAddUnit}
                >
                  <Plus size={18} className="mr-2" /> Add First Unit
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3 mb-24">
            {filteredUnits.map((unit) => (
              <div 
                key={unit.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button 
                  className="w-full p-4 flex items-center justify-between"
                  onClick={() => navigate(`/inspections/${id}/units/${unit.id}`)}
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-3">
                      <Home size={20} className="text-blue-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">{unit.name}</h3>
                      <p className="text-sm text-gray-600">
                        {unit.findings?.length || 0} finding{unit.findings?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {getSeverityIcon(unit)}
                    <ChevronRight size={20} className="text-gray-400 ml-1" />
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed right-4 bottom-20">
        <button 
          className="w-14 h-14 bg-blue-500 rounded-full text-white shadow-lg flex items-center justify-center"
          onClick={handleAddUnit}
          aria-label="Add Unit"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default UnitAreaPage;