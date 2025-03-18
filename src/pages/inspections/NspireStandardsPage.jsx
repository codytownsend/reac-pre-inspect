// src/pages/inspections/NspireStandardsPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Clipboard, Search, ChevronRight, AlertCircle, AlertTriangle, Clock } from 'lucide-react';

const NspireStandardsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { nspireCategories, nspireDeficiencies } = useInspection();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  
  // Filter categories based on search term
  const filteredCategories = Object.entries(nspireCategories).filter(([key, category]) => {
    if (searchTerm.trim() === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(searchLower) ||
      category.subcategories.some(sub => sub.toLowerCase().includes(searchLower))
    );
  });
  
  // Get deficiencies for a specific category
  const getDeficienciesForCategory = (categoryKey) => {
    if (!nspireDeficiencies) return [];
    
    return Object.entries(nspireDeficiencies)
      .filter(([_, deficiency]) => deficiency.category === categoryKey)
      .map(([id, deficiency]) => ({ id, ...deficiency }));
  };
  
  // Filtered deficiencies based on selected category and severity
  const getFilteredDeficiencies = () => {
    if (!nspireDeficiencies) return [];
    
    return Object.entries(nspireDeficiencies)
      .filter(([_, deficiency]) => {
        if (selectedCategory && deficiency.category !== selectedCategory) return false;
        if (selectedSeverity && deficiency.severity !== selectedSeverity) return false;
        
        if (searchTerm.trim() === '') return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          deficiency.description.toLowerCase().includes(searchLower) ||
          deficiency.category.toLowerCase().includes(searchLower)
        );
      })
      .map(([id, deficiency]) => ({ id, ...deficiency }));
  };
  
  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'lifeThreatening':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'severe':
        return <AlertTriangle size={16} className="text-orange-500" />;
      case 'moderate':
      case 'low':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return null;
    }
  };
  
  // Get severity text
  const getSeverityText = (severity) => {
    switch (severity) {
      case 'lifeThreatening':
        return 'Life Threatening';
      case 'severe':
        return 'Severe';
      case 'moderate':
        return 'Moderate';
      case 'low':
        return 'Low';
      default:
        return 'Unknown';
    }
  };
  
  // Get repair timeframe text
  const getRepairTimeframeText = (deficiency) => {
    if (deficiency.repairDue === 24) {
      return '24 Hours';
    }
    return `${deficiency.repairDue} Days`;
  };
  
  // Show category details
  const CategoryDetailView = () => {
    if (!selectedCategory) return null;
    
    const category = nspireCategories[selectedCategory];
    if (!category) return null;
    
    const deficiencies = getDeficienciesForCategory(selectedCategory);
    
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{category.name}</h2>
          <Button 
            variant="secondary"
            onClick={() => setSelectedCategory(null)}
          >
            Back to Categories
          </Button>
        </div>
        
        <Card className="mb-4">
          <h3 className="font-bold mb-2">Subcategories</h3>
          <div className="grid grid-cols-2 gap-2">
            {category.subcategories.map(subcategory => (
              <div key={subcategory} className="border p-2 rounded">
                {subcategory}
              </div>
            ))}
          </div>
        </Card>
        
        <h3 className="font-bold mb-2">Common Deficiencies</h3>
        <div className="space-y-3">
          {deficiencies.length === 0 ? (
            <Card className="p-4 text-center">
              <p className="text-gray-500">No deficiencies found for this category.</p>
            </Card>
          ) : (
            deficiencies.map(deficiency => (
              <Card key={deficiency.id} className="p-4">
                <div className="flex items-start">
                  <div className="mr-3">
                    {getSeverityIcon(deficiency.severity)}
                  </div>
                  <div>
                    <h4 className="font-bold">{deficiency.description}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {getSeverityText(deficiency.severity)}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Repair: {getRepairTimeframeText(deficiency)}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        HCV: {deficiency.hcvRating === 'fail' ? 'Fail' : 'Pass'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container pb-16">
      <Header 
        title="NSPIRE Standards" 
        showBack={true}
      />
      
      {/* Search */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
          placeholder="Search standards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Severity Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            selectedSeverity === null 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => setSelectedSeverity(null)}
        >
          All Severities
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap flex items-center ${
            selectedSeverity === 'lifeThreatening' 
              ? 'bg-red-500 text-white' 
              : 'bg-red-100 text-red-800'
          }`}
          onClick={() => setSelectedSeverity(
            selectedSeverity === 'lifeThreatening' ? null : 'lifeThreatening'
          )}
        >
          <AlertCircle size={12} className="mr-1" />
          Life Threatening
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap flex items-center ${
            selectedSeverity === 'severe' 
              ? 'bg-orange-500 text-white' 
              : 'bg-orange-100 text-orange-800'
          }`}
          onClick={() => setSelectedSeverity(
            selectedSeverity === 'severe' ? null : 'severe'
          )}
        >
          <AlertTriangle size={12} className="mr-1" />
          Severe
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap flex items-center ${
            selectedSeverity === 'moderate' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-yellow-100 text-yellow-800'
          }`}
          onClick={() => setSelectedSeverity(
            selectedSeverity === 'moderate' ? null : 'moderate'
          )}
        >
          <Clock size={12} className="mr-1" />
          Moderate
        </button>
      </div>
      
      {/* Content */}
      {selectedCategory ? (
        <CategoryDetailView />
      ) : (
        <div>
          <h2 className="text-lg font-bold mb-3">Categories</h2>
          <div className="space-y-3">
            {filteredCategories.map(([key, category]) => (
              <Card 
                key={key} 
                className="p-4 cursor-pointer"
                onClick={() => setSelectedCategory(key)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      {category.subcategories.length} subcategories
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
          
          {searchTerm && (
            <>
              <h2 className="text-lg font-bold mt-6 mb-3">Matching Deficiencies</h2>
              <div className="space-y-3">
                {getFilteredDeficiencies().map(deficiency => (
                  <Card key={deficiency.id} className="p-4">
                    <div className="flex items-start">
                      <div className="mr-3">
                        {getSeverityIcon(deficiency.severity)}
                      </div>
                      <div>
                        <h4 className="font-bold">{deficiency.description}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {getSeverityText(deficiency.severity)}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            Repair: {getRepairTimeframeText(deficiency)}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            HCV: {deficiency.hcvRating === 'fail' ? 'Fail' : 'Pass'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-white border-t">
        <div className="container">
          <Button 
            variant="secondary" 
            block={true}
            onClick={() => navigate(`/inspections/${id}`)}
          >
            Back to Inspection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NspireStandardsPage;