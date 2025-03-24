// src/pages/properties/PropertyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty } from '../../context/PropertyContext';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Loading from '../../components/Loading';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  Building, 
  Users, 
  MapPin,
  Plus,
  ChevronRight,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProperty, deleteProperty } = useProperty();
  const { inspections } = useInspection();
  const [property, setProperty] = useState(null);
  const [propertyInspections, setPropertyInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    // Get property details
    const propertyData = getProperty(id);
    if (!propertyData) {
      navigate('/properties');
      return;
    }
    setProperty(propertyData);
    
    // Get inspections for this property
    const relatedInspections = inspections.filter(
      inspection => inspection.propertyId === id
    );
    
    // Sort inspections by date (newest first)
    const sortedInspections = [...relatedInspections].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    
    setPropertyInspections(sortedInspections);
    setLoading(false);
  }, [id, getProperty, inspections, navigate]);
  
  const handleDelete = async () => {
    try {
      await deleteProperty(id);
      navigate('/properties');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property. Please try again.');
    }
  };
  
  const handleNewInspection = () => {
    navigate('/inspections/new', { state: { propertyId: id } });
  };
  
  if (loading) {
    return <Loading message="Loading property details..." />;
  }
  
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <button 
            className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium"
            onClick={() => navigate('/properties')}
          >
            Back to Properties
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
            onClick={() => navigate('/properties')}
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Property Details</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
            onClick={() => navigate(`/properties/${id}/edit`)}
            aria-label="Edit Property"
          >
            <Edit size={20} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100 text-red-500"
            onClick={() => setShowDeleteModal(true)}
            aria-label="Delete Property"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      {/* Property Details Card */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">{property.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Address</p>
                <p className="text-gray-700">{property.address}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-500">
                <Building size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Buildings</p>
                <p className="text-gray-700">{property.buildingCount}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-green-50 text-green-500">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Units</p>
                <p className="text-gray-700">{property.units}</p>
              </div>
            </div>
            
            {property.lastInspection && (
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-500">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Last Inspection</p>
                  <p className="text-gray-700">{new Date(property.lastInspection).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Actions</h3>
          <button 
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center hover:bg-blue-600 active:bg-blue-700 transition-colors"
            onClick={handleNewInspection}
          >
            <Calendar size={18} className="mr-2" /> Start New Inspection
          </button>
        </div>
        
        {/* Inspections List */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Inspections</h3>
            <span className="text-sm text-gray-500">
              {propertyInspections.length} {propertyInspections.length === 1 ? 'inspection' : 'inspections'}
            </span>
          </div>
          
          {propertyInspections.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 mb-4">No inspections found for this property</p>
              <button 
                className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                onClick={handleNewInspection}
              >
                <Plus size={16} className="inline mr-1" /> Start First Inspection
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {propertyInspections.map(inspection => (
                <div 
                  key={inspection.id} 
                  className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/inspections/${inspection.id}`)}
                >
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                        <Calendar size={18} />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{new Date(inspection.date).toLocaleDateString()}</p>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            inspection.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            inspection.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inspection.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Inspector: {inspection.inspector}
                        </p>
                      </div>
                    </div>
                    
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg">Delete Property?</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700">
                Are you sure you want to delete "{property.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col p-4 border-t space-y-2">
              <button 
                className="w-full py-2 bg-red-500 text-white rounded-lg font-medium"
                onClick={handleDelete}
              >
                Delete Property
              </button>
              <button 
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
                onClick={() => setShowDeleteModal(false)}
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

export default PropertyDetail;