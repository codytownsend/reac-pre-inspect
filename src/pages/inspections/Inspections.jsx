// Updated Inspections.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useProperty } from '../../context/PropertyContext';
import Header from '../../components/Header';
import { 
  Plus, Calendar, Search, CheckCircle, Clock, AlertTriangle, 
  AlertCircle, Filter, ChevronRight 
} from 'lucide-react';

const Inspections = () => {
  const navigate = useNavigate();
  const { inspections, loading } = useInspection();
  const { properties } = useProperty();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortedInspections, setSortedInspections] = useState([]);
  
  // Get property name by ID
  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : 'Unknown Property';
  };
  
  // Calculate score for display
  const calculateDisplayScore = (inspection) => {
    if (!inspection.areas || inspection.areas.length === 0) return 100;
    
    // Count findings and calculate score
    let totalFindings = 0;
    let deductions = 0;
    
    inspection.areas.forEach(area => {
      if (area.findings && area.findings.length > 0) {
        totalFindings += area.findings.length;
        
        area.findings.forEach(finding => {
          switch (finding.severity) {
            case 'lifeThreatening': deductions += 5; break;
            case 'severe': deductions += 3; break;
            case 'moderate': deductions += 1; break;
            case 'low': deductions += 0.5; break;
          }
        });
      }
    });
    
    return {
      score: Math.max(0, Math.round(100 - deductions)),
      findingsCount: totalFindings
    };
  };
  
  // Process and sort inspections
  useEffect(() => {
    // Filter inspections based on search term and status
    const filtered = inspections.filter(inspection => {
      const propertyName = getPropertyName(inspection.propertyId);
      const matchesSearch = 
        propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort inspections by date (newest first)
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setSortedInspections(sorted);
  }, [inspections, searchTerm, statusFilter, properties]);
  
  // Get status color and icon
  const getStatusInfo = (status) => {
    switch(status) {
      case 'Completed':
        return { color: 'green', icon: CheckCircle };
      case 'In Progress':
        return { color: 'blue', icon: Clock };
      case 'Scheduled':
        return { color: 'yellow', icon: Calendar };
      default:
        return { color: 'gray', icon: Calendar };
    }
  };
  
  // Get score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'yellow';
    if (score >= 60) return 'orange';
    return 'red';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inspections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-md mx-auto pb-20">
      <Header 
        title="Inspections" 
        action={
          <button 
            className="p-2 bg-blue-500 text-white rounded-lg flex items-center"
            onClick={() => navigate('/inspections/new')}
          >
            <Plus size={18} className="mr-1" /> New
          </button>
        } 
      />
      
      {/* Search and filter */}
      <div className="mb-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search inspections..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex overflow-x-auto py-1 gap-2 hide-scrollbar">
          <button 
            className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${
              statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setStatusFilter('all')}
          >
            All Statuses
          </button>
          <button 
            className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${
              statusFilter === 'Scheduled' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700'
            }`}
            onClick={() => setStatusFilter('Scheduled')}
          >
            <Calendar size={14} className="inline mr-1" /> Scheduled
          </button>
          <button 
            className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${
              statusFilter === 'In Progress' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'
            }`}
            onClick={() => setStatusFilter('In Progress')}
          >
            <Clock size={14} className="inline mr-1" /> In Progress
          </button>
          <button 
            className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${
              statusFilter === 'Completed' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'
            }`}
            onClick={() => setStatusFilter('Completed')}
          >
            <CheckCircle size={14} className="inline mr-1" /> Completed
          </button>
        </div>
      </div>
      
      {/* Inspections list */}
      <div className="mb-4">
        {sortedInspections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No inspections found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your filters or search terms" 
                : "Create your first inspection to get started"}
            </p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg inline-flex items-center"
              onClick={() => navigate('/inspections/new')}
            >
              <Plus size={18} className="mr-2" /> Create Inspection
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {sortedInspections.map(inspection => {
              const propertyName = getPropertyName(inspection.propertyId);
              const statusInfo = getStatusInfo(inspection.status);
              const { score, findingsCount } = calculateDisplayScore(inspection);
              const scoreColor = getScoreColor(score);
              
              return (
                <div 
                  key={inspection.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/inspections/${inspection.id}`)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{propertyName}</h3>
                      <div className={`ml-2 flex-shrink-0 px-2 py-1 rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-700 text-xs font-medium flex items-center`}>
                        <statusInfo.icon size={12} className="mr-1" /> {inspection.status}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Calendar size={14} className="mr-1" /> 
                      {new Date(inspection.date).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      <span>Inspector: {inspection.inspector}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full bg-${scoreColor}-100 text-${scoreColor}-700 flex items-center justify-center mr-2 font-bold text-sm`}>
                          {score}
                        </div>
                        <span className="text-sm text-gray-600">{findingsCount} findings</span>
                      </div>
                      
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Floating action button */}
      <button 
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
        onClick={() => navigate('/inspections/new')}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Inspections;