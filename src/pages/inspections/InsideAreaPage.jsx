// src/pages/inspections/InsideAreaPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { 
  Building,
  Plus, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  Clock,
  ArrowLeft,
  Search,
  Coffee,
  DoorOpen,
  Users,
  Wrench
} from 'lucide-react';

const InsideAreaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [insideAreas, setInsideAreas] = useState([]);
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
        
        // Filter inside areas
        const areas = inspectionData.areas 
          ? inspectionData.areas.filter(area => area.areaType === 'inside')
          : [];
        
        setInsideAreas(areas);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, navigate]);
  
  // Helper to get icon for inside area type
  const getAreaIcon = (areaType) => {
    switch (areaType) {
      case 'hallway':
        return <DoorOpen size={20} className="text-purple-500" />;
      case 'laundry':
        return <Wrench size={20} className="text-purple-500" />;
      case 'community':
        return <Users size={20} className="text-purple-500" />;
      case 'office':
        return <Coffee size={20} className="text-purple-500" />;
      case 'mechanical':
        return <Wrench size={20} className="text-purple-500" />;
      default:
        return <Building size={20} className="text-purple-500" />;
    }
  };
  
  const getSeverityIcon = (area) => {
    if (!area.findings || area.findings.length === 0) {
      return <CheckCircle size={20} className="text-green-500" />;
    }
    
    // Check for life-threatening findings
    const hasLifeThreatening = area.findings.some(f => f.severity === 'lifeThreatening');
    if (hasLifeThreatening) {
      return <AlertCircle size={20} className="text-red-500" />;
    }
    
    // Check for severe findings
    const hasSevere = area.findings.some(f => f.severity === 'severe');
    if (hasSevere) {
      return <AlertTriangle size={20} className="text-orange-500" />;
    }
    
    // Check for moderate findings
    const hasModerate = area.findings.some(f => f.severity === 'moderate');
    if (hasModerate) {
      return <Clock size={20} className="text-yellow-500" />;
    }
    
    return <CheckCircle size={20} className="text-green-500" />;
  };
  
  // Filter areas based on search term
  const filteredAreas = insideAreas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddArea = () => {
    navigate(`/inspections/${id}/inside/add`);
  };

  // Quick add buttons for common inside area types
  const quickAddButtons = [
    { type: 'hallway', label: 'Hallway', icon: <DoorOpen size={20} /> },
    { type: 'laundry', label: 'Laundry', icon: <Wrench size={20} /> },
    { type: 'community', label: 'Community', icon: <Users size={20} /> },
    { type: 'office', label: 'Office', icon: <Coffee size={20} /> }
  ];
  
  const handleQuickAdd = (type) => {
    navigate(`/inspections/${id}/inside/add?type=${type}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inside areas...</p>
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
            className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium"
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
          <h1 className="text-xl font-bold">Inside Areas</h1>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {insideAreas.length} Area{insideAreas.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Quick Add Section */}
      {insideAreas.length > 0 && (
        <div className="bg-white p-4 border-b">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Add</h3>
          <div className="grid grid-cols-4 gap-2">
            {quickAddButtons.map(item => (
              <button 
                key={item.type}
                className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-purple-50"
                onClick={() => handleQuickAdd(item.type)}
              >
                <div className="text-purple-500 mb-1">
                  {item.icon}
                </div>
                <span className="text-xs text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
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
            className="bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 block w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search inside areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Areas List */}
      <div className="px-4">
        {filteredAreas.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            {searchTerm ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-600 mb-6">No inside areas found matching "{searchTerm}"</p>
                <button 
                  className="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium flex items-center justify-center mx-auto"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building size={24} className="text-purple-500" />
                </div>
                <p className="text-gray-600 mb-6">No inside areas have been added yet.</p>
                <button 
                  className="py-3 px-4 bg-purple-500 text-white rounded-lg font-medium flex items-center justify-center mx-auto"
                  onClick={handleAddArea}
                >
                  <Plus size={18} className="mr-2" /> Add First Area
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3 mb-24">
            {filteredAreas.map((area) => (
              <div 
                key={area.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button 
                  className="w-full p-4 flex items-center justify-between"
                  onClick={() => navigate(`/inspections/${id}/inside/${area.id}`)}
                >
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-lg mr-3">
                      {getAreaIcon(area.type)}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">{area.name}</h3>
                      <p className="text-sm text-gray-600">
                        {area.findings?.length || 0} finding{area.findings?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {getSeverityIcon(area)}
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
          className="w-14 h-14 bg-purple-500 rounded-full text-white shadow-lg flex items-center justify-center"
          onClick={handleAddArea}
          aria-label="Add Inside Area"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default InsideAreaPage;