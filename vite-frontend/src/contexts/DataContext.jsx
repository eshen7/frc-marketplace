import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  // Separate states for each data type
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sales, setSales] = useState([]);
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  
  // Separate loading states
  const [loadingStates, setLoadingStates] = useState({
    users: true,
    requests: true,
    sales: true,
    parts: true,
    categories: true,
    manufacturers: true
  });

  // Separate error states
  const [errors, setErrors] = useState({
    users: null,
    requests: null,
    sales: null,
    parts: null,
    categories: null,
    manufacturers: null
  });

  // Separate fetch functions for each data type
  const fetchUsers = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, users: true }));
      const response = await axiosInstance.get('/users/');
      setUsers(response.data || []);
      setErrors(prev => ({ ...prev, users: null }));
      console.log("All Teams initialized.");
    } catch (err) {
      console.error('Error fetching users:', err);
      setErrors(prev => ({ ...prev, users: 'Failed to fetch users' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, users: false }));
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, requests: true }));
      const response = await axiosInstance.get('/requests/');
      setRequests(response.data || []);
      setErrors(prev => ({ ...prev, requests: null }));
      console.log("All Requests initialized.");
    } catch (err) {
      console.error('Error fetching requests:', err);
      setErrors(prev => ({ ...prev, requests: 'Failed to fetch requests' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, requests: false }));
    }
  };

  const fetchSales = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, sales: true }));
      const response = await axiosInstance.get('/sales/');
      setSales(response.data || []);
      setErrors(prev => ({ ...prev, sales: null }));
      console.log("All Sales initialized.");
    } catch (err) {
      console.error('Error fetching sales:', err);
      setErrors(prev => ({ ...prev, sales: 'Failed to fetch sales' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, sales: false }));
    }
  };

  const fetchParts = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, parts: true }));
      const response = await axiosInstance.get('/parts/');
      setParts(response.data || []);
      setErrors(prev => ({ ...prev, parts: null }));
      console.log("All Parts initialized.");
    } catch (err) {
      console.error('Error fetching parts:', err);
      setErrors(prev => ({ ...prev, parts: 'Failed to fetch parts' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, parts: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, categories: true }));
      const response = await axiosInstance.get('/parts/categories/');
      setCategories(response.data || []);
      setErrors(prev => ({ ...prev, categories: null }));
      console.log("All Categories initialized.");
    } catch (err) {
      console.error('Error fetching categories:', err);
      setErrors(prev => ({ ...prev, categories: 'Failed to fetch categories' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, categories: false }));
    }
  };

  const fetchManufacturers = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, manufacturers: true }));
      const response = await axiosInstance.get('/parts/manufacturers/');
      setManufacturers(response.data || []);
      setErrors(prev => ({ ...prev, manufacturers: null }));
      console.log("All Manufacturers initialized.");
    } catch (err) {
      console.error('Error fetching manufacturers:', err);
      setErrors(prev => ({ ...prev, manufacturers: 'Failed to fetch manufacturers' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, manufacturers: false }));
    }
  };

  // Initial fetch for all data types
  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchSales();
    fetchParts();
    fetchCategories();
    fetchManufacturers();
  }, []);

  // CRUD operations for each type
  const updateData = (type, newData) => {
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    switch(type) {
      case 'users':
        setUsers(newData);
        break;
      case 'requests':
        setRequests(newData);
        break;
      case 'sales':
        setSales(newData);
        break;
      case 'parts':
        setParts(newData);
        break;
      case 'categories':
        setCategories(newData);
        break;
    }
    setLoadingStates(prev => ({ ...prev, [type]: false }));
  };

  const addItem = (type, item) => {
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    switch(type) {
      case 'users':
        setUsers(prev => [...prev, item]);
        break;
      case 'requests':
        setRequests(prev => [...prev, item]);
        break;
      case 'sales':
        setSales(prev => [...prev, item]);
        break;
      case 'parts':
        setParts(prev => [...prev, item]);
        break;
    }
    setLoadingStates(prev => ({ ...prev, [type]: false }));
  };

  const updateItem = (type, id, updatedItem) => {
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    switch(type) {
      case 'users':
        setUsers(prev => prev.map(item => item.id === id ? updatedItem : item));
        break;
      case 'requests':
        setRequests(prev => prev.map(item => item.id === id ? updatedItem : item));
        break;
      case 'sales':
        setSales(prev => prev.map(item => item.id === id ? updatedItem : item));
        break;
      case 'parts':
        setParts(prev => prev.map(item => item.id === id ? updatedItem : item));
        break;
    }
    setLoadingStates(prev => ({ ...prev, [type]: false }));
  };

  const removeItem = (type, id) => {
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    switch(type) {
      case 'users':
        setUsers(prev => prev.filter(item => item.id !== id));
        break;
      case 'requests':
        setRequests(prev => prev.filter(item => item.id !== id));
        break;
      case 'sales':
        setSales(prev => prev.filter(item => item.id !== id));
        break;
      case 'parts':
        setParts(prev => prev.filter(item => item.id !== id));
        break;
    }
    setLoadingStates(prev => ({ ...prev, [type]: false }));
  };

  // Function to refresh a single type
  const refreshSingle = (type) => {
    switch(type) {
      case 'users':
        fetchUsers();
        break;
      case 'requests':
        fetchRequests();
        break;
      case 'sales':
        fetchSales();
        break;
      case 'parts':
        fetchParts();
        break;
      case 'categories':
        fetchCategories();
        break;
      case 'manufacturers':
        fetchManufacturers();
        break;
      default:
        console.warn(`Unknown type: ${type}`);
    }
  };

  // Function to refresh multiple data types
  const refreshData = (types) => {
    if (!types) {
      // If no types specified, refresh all
      fetchUsers();
      fetchRequests();
      fetchSales();
      fetchParts();
      fetchCategories();
      fetchManufacturers();
      return;
    }

    // If types is an array, refresh each type
    if (Array.isArray(types)) {
      types.forEach(type => refreshSingle(type));
      return;
    }

    // If types is a single string, refresh that type
    refreshSingle(types);
  };

  return (
    <DataContext.Provider value={{
      users,
      requests,
      sales,
      parts,
      categories,
      manufacturers,
      loadingStates,
      errors,
      updateData,
      addItem,
      updateItem,
      removeItem,
      refreshData,
      refreshSingle
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 