// src/pages/inspections/AddUnitPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import { Home, Save, Plus } from 'lucide-react';

const AddUnitPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection, updateInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [unitName, setUnitName] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, navigate]);
  
  const handleSave = async () => {
    if (!unitName.trim()) {
      setError('Please enter a unit name or number');
      return;
    }
    
    try {
      setSaving(true);
      
      // Create a new unit area
      const newUnit = {
        id: `unit-${Date.now()}`,
        name: unitName.trim(),
        areaType: 'unit',
        type: 'unit',
        findings: [],
        createdAt: new Date().toISOString()
      };
      
      // Update the inspection with the new unit
      const updatedAreas = [...(inspection.areas || []), newUnit];
      await updateInspection(id, { areas: updatedAreas });
      
      // Navigate to the new unit
      navigate(`/inspections/${id}/units/${newUnit.id}`);
    } catch (error) {
      console.error("Error saving unit:", error);
      setError('Error saving unit');
      setSaving(false);
    }
  };
  
  if (loading) {
    return <Loading message="Loading inspection..." />;
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
        title="Add Unit" 
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
            <h2 className="font-bold text-blue-800">Add a New Unit</h2>
            <p className="text-sm text-blue-600">
              Enter the unit number or identifier. After saving, you'll be able to add findings for this unit.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Unit Form */}
      <Card className="mb-4">
        <div className="mb-4">
          <label htmlFor="unitName" className="block text-sm font-medium text-gray-700 mb-1">
            Unit Number/Name
          </label>
          <input
            type="text"
            id="unitName"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            placeholder="e.g., 101, A1, or Suite 303"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </Card>
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-white border-t">
        <div className="container flex justify-between">
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/inspections/${id}/areas/units`)}
          >
            Cancel
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={saving || !unitName.trim()}
          >
            {saving ? 'Saving...' : (
              <>
                <Save size={16} className="mr-1" /> Save Unit
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddUnitPage;