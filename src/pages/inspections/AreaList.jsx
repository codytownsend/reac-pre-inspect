// src/pages/inspections/AreaList.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useInspectionData } from '../../hooks/useInspectionData';
import { getAreaConfig, getSeverityIcon, getSeverityClass } from '../../utils/areaUtils';
import { 
  Plus, 
  AlertCircle, 
  ChevronRight,
  ArrowLeft,
  Search,
} from 'lucide-react';

const AreaList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
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
    navigate(config.addPath(id));
  };
  
  const handleQuickAdd = (quickAddType) => {
    navigate(`${config.addPath(id)}?type=${quickAddType}`);
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
  
  // Create IconComponent from config
  const IconComponent = config.icon;
  
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
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Quick Add Section */}
      {areas.length > 0 && (
        <div className="p-4 bg-white border-b">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Add</h3>
          <div className="grid grid-cols-4 gap-2">
            {config.quickAddOptions.map(item => {
              const ItemIcon = item.icon;
              return (
                <button 
                  key={item.type}
                  className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                  onClick={() => handleQuickAdd(item.type)}
                >
                  <div className={`text-${config.color}-500 mb-1`}>
                    <ItemIcon size={20} />
                  </div>
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg"
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
                  className="py-2 px-4 bg-gray-100 rounded-lg font-medium text-gray-700"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className={`w-16 h-16 bg-${config.color}-100 rounded-full flex items-center justify-center mb-4 text-${config.color}-500`}>
                  <IconComponent size={32} />
                </div>
                <h2 className="text-lg font-semibold mb-2">No {areaType} areas added yet</h2>
                <p className="text-gray-600 text-center mb-4">Add your first {areaType} area to begin the inspection</p>
                <button 
                  className={`py-2 px-4 bg-${config.color}-500 text-white rounded-lg font-medium flex items-center`}
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
              const AreaIcon = config.getItemIcon(area.type);
              const SeverityIcon = getSeverityIcon(area);
              const severityClass = getSeverityClass(area);
              
              return (
                <div 
                  key={area.id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                  onClick={() => navigate(`/inspections/${id}/${areaType}/${area.id}`)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg bg-${config.color}-50 flex items-center justify-center mr-3 text-${config.color}-500`}>
                        <AreaIcon size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">{area.name}</h3>
                        <p className="text-sm text-gray-600">
                          {area.findings?.length || 0} finding{area.findings?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`severity-icon--${severityClass}`}>
                        <SeverityIcon size={20} />
                      </div>
                      <ChevronRight size={20} className="text-gray-400 ml-1" />
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
        className={`fixed bottom-20 right-4 w-14 h-14 rounded-full bg-${config.color}-500 text-white flex items-center justify-center shadow-lg`}
        onClick={handleAddArea}
        aria-label={`Add ${areaType}`}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default AreaList;