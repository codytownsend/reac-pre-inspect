// src/context/PropertyContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const PropertyContext = createContext();

export const useProperty = () => {
  return useContext(PropertyContext);
};

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setProperties([]);
      setLoading(false);
      return;
    }

    const fetchProperties = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'properties'),
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const propertiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProperties(propertiesData);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [currentUser]);

  const addProperty = async (property) => {
    try {
      const newProperty = {
        ...property,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'properties'), newProperty);
      
      const propertyWithId = {
        ...newProperty,
        id: docRef.id
      };
      
      setProperties(prev => [...prev, propertyWithId]);
      
      return propertyWithId;
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  };

  const getProperty = (id) => {
    return properties.find(property => property.id === id);
  };

  const updateProperty = async (id, updatedProperty) => {
    try {
      await updateDoc(doc(db, 'properties', id), updatedProperty);
      
      setProperties(prev => 
        prev.map(property => 
          property.id === id ? { ...property, ...updatedProperty } : property
        )
      );
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  };

  const deleteProperty = async (id) => {
    try {
      await deleteDoc(doc(db, 'properties', id));
      
      setProperties(prev => 
        prev.filter(property => property.id !== id)
      );
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  };

  const value = {
    properties,
    loading,
    addProperty,
    getProperty,
    updateProperty,
    deleteProperty
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};