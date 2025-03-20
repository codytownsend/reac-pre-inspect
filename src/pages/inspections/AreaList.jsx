// src/pages/inspections/AreaList.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { 
  Plus, 
  AlertCircle, 
  ChevronRight,
  ArrowLeft,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Home,
  Building,
  Grid,
  Trash2
} from 'lucide-react';

const AreaList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getInspection, updateInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);
  
  // Determine area type from URL path
  const areaType = location.pathname.includes('/units') 
    ? 'unit' 
    : location.pathname.includes('/inside') 
      ? 'inside' 
      : 'outside';
  
  // Get configuration for this area type
  const config = getAreaConfig(areaType);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        // Filter areas by type
        const filteredAreas = inspectionData.areas 
          ? inspectionData.areas.filter(area => area.areaType === areaType)
          : [];
        
        setAreas(filteredAreas);
      } catch (error) {
        console.error(`Error loading ${areaType} areas:`, error);
        setError(`Error loading ${areaType} areas`);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, navigate, areaType]);
  
  // Filter areas based on search term
  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddArea = () => {
    // This corrects the URL path to use the plural form for the route
    const urlPathType = areaType === 'unit' ? 'units' : 
                      areaType === 'inside' ? 'inside' : 'outside';
    navigate(`/inspections/${id}/${urlPathType}/add`);
  };

  const handleConfirmDelete = async () => {
    if (!areaToDelete) return;
    
    try {
      // Remove the area from the inspection
      const updatedAreas = inspection.areas.filter(area => area.id !== areaToDelete.id);
      
      // Update inspection in Firestore
      await updateInspection(id, { areas: updatedAreas });
      
      // Update local state
      setAreas(areas.filter(area => area.id !== areaToDelete.id));
      
      // Reset
      setAreaToDelete(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting area:", error);
      setError('Failed to delete area');
    }
  };
  
  const promptDeleteArea = (e, area) => {
    e.stopPropagation(); // Prevent navigation to area details
    setAreaToDelete(area);
    setShowDeleteConfirm(true);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {config.title.toLowerCase()}...</p>
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
          <h1 className="text-xl font-bold">{config.title}</h1>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500">
            {areas.length} {areas.length === 1 ? areaType : `${areaType}s`}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder={`Search ${config.title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Areas List */}
      <div className="px-4">
        {filteredAreas.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm mt-4">
            {searchTerm ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <h2 className="text-lg font-semibold mb-2">No results found</h2>
                <p className="text-gray-600 text-center mb-4">No {areaType} areas found matching "{searchTerm}"</p>
                <button 
                  className="py-2 px-4 bg-gray-100 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className={`w-16 h-16 bg-${getColorForType(areaType)}-100 rounded-full flex items-center justify-center mb-4 text-${getColorForType(areaType)}-500`}>
                  {getIconForType(areaType, 32)}
                </div>
                <h2 className="text-lg font-semibold mb-2">No {areaType} areas added yet</h2>
                <p className="text-gray-600 text-center mb-4">Add your first {areaType} area to begin the inspection</p>
                <button 
                  className={`py-2 px-4 bg-${getColorForType(areaType)}-500 text-white rounded-lg font-medium flex items-center hover:bg-${getColorForType(areaType)}-600 active:bg-${getColorForType(areaType)}-700 transition-colors`}
                  onClick={handleAddArea}
                >
                  <Plus size={18} className="mr-2" /> Add First {areaType.charAt(0).toUpperCase() + areaType.slice(1)}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAreas.map((area) => {
              const findingCount = area.findings?.length || 0;
              const severityClass = getSeverityClass(area);
              
              return (
                <div 
                  key={area.id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/inspections/${id}/${areaType}/${area.id}`)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg bg-${getColorForType(areaType)}-50 flex items-center justify-center mr-3 text-${getColorForType(areaType)}-500`}>
                        {getIconForType(areaType, 20)}
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">{area.name}</h3>
                        <p className="text-sm text-gray-600">
                          {findingCount} finding{findingCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors mr-1"
                        onClick={(e) => promptDeleteArea(e, area)}
                      >
                        <Trash2 size={18} />
                      </button>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <button 
        className={`fixed bottom-20 right-4 w-14 h-14 rounded-full bg-${getColorForType(areaType)}-500 text-white flex items-center justify-center shadow-lg hover:bg-${getColorForType(areaType)}-600 active:bg-${getColorForType(areaType)}-700 transition-colors`}
        onClick={handleAddArea}
        aria-label={`Add ${areaType}`}
      >
        <Plus size={24} />
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && areaToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg">Delete {areaType.charAt(0).toUpperCase() + areaType.slice(1)}?</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700">
                Are you sure you want to delete "{areaToDelete.name}"? All findings associated with this {areaType} will be permanently deleted.
              </p>
            </div>
            <div className="flex flex-col p-4 border-t space-y-2">
              <button 
                className="w-full py-2 bg-red-500 text-white rounded-lg font-medium"
                onClick={handleConfirmDelete}
              >
                Delete {areaType.charAt(0).toUpperCase() + areaType.slice(1)}
              </button>
              <button 
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
                onClick={() => {
                  setAreaToDelete(null);
                  setShowDeleteConfirm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function getAreaConfig(areaType) {
  const configs = {
    unit: {
      title: 'Units',
      icon: Home,
      color: 'blue',
      addPath: (inspectionId) => `/inspections/${inspectionId}/units/add`,
      quickAddOptions: [
        { type: '101', label: '101', icon: Home },
        { type: '102', label: '102', icon: Home },
        { type: '201', label: '201', icon: Home },
        { type: '202', label: '202', icon: Home }
      ]
    },
    inside: {
      title: 'Inside Areas',
      icon: Building,
      color: 'purple',
      addPath: (inspectionId) => `/inspections/${inspectionId}/inside/add`,
      quickAddOptions: [
        { type: 'hallway', label: 'Hallway', icon: Building },
        { type: 'laundry', label: 'Laundry', icon: Building },
        { type: 'community', label: 'Community', icon: Building },
        { type: 'office', label: 'Office', icon: Building }
      ]
    },
    outside: {
      title: 'Outside Areas',
      icon: Grid,
      color: 'green',
      addPath: (inspectionId) => `/inspections/${inspectionId}/outside/add`,
      quickAddOptions: [
        { type: 'building', label: 'Building', icon: Grid },
        { type: 'parking', label: 'Parking', icon: Grid },
        { type: 'grounds', label: 'Grounds', icon: Grid },
        { type: 'playground', label: 'Playground', icon: Grid }
      ]
    }
  };
  
  return configs[areaType] || configs.unit;
}

function getColorForType(areaType) {
  const colors = {
    unit: 'blue',
    inside: 'purple',
    outside: 'green'
  };
  
  return colors[areaType] || 'blue';
}

function getIconForType(areaType, size = 20) {
  if (areaType === 'unit') return <Home size={size} />;
  if (areaType === 'inside') return <Building size={size} />;
  if (areaType === 'outside') return <Grid size={size} />;
  return <Home size={size} />;
}

function getSeverityClass(area) {
  if (!area.findings || area.findings.length === 0) {
    return 'none';
  }
  
  // Check for life-threatening findings
  const hasLifeThreatening = area.findings.some(f => f.severity === 'lifeThreatening');
  if (hasLifeThreatening) {
    return 'critical';
  }
  
  // Check for severe findings
  const hasSevere = area.findings.some(f => f.severity === 'severe');
  if (hasSevere) {
    return 'serious';
  }
  
  // Check for moderate findings
  const hasModerate = area.findings.some(f => f.severity === 'moderate');
  if (hasModerate) {
    return 'moderate';
  }
  
  return 'minor';
}

export default AreaList;