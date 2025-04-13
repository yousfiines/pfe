import axios from 'axios';

const API_URL = 'http://votre-api.com/admin'; // Remplacez par votre URL d'API

const getAuthHeader = () => {
  const token = localStorage.getItem('adminToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const adminApi = {
  // Authentification
  login: (credentials) => axios.post(`${API_URL}/login`, credentials),
  
  // Utilisateurs
  getUsers: () => axios.get(`${API_URL}/users`, getAuthHeader()),
  createUser: (userData) => axios.post(`${API_URL}/users`, userData, getAuthHeader()),
  updateUser: (id, userData) => axios.put(`${API_URL}/users/${id}`, userData, getAuthHeader()),
  deleteUser: (id) => axios.delete(`${API_URL}/users/${id}`, getAuthHeader()),
  
  // Documents
  getDocuments: () => axios.get(`${API_URL}/documents`, getAuthHeader()),
  uploadDocument: (documentData) => {
    const formData = new FormData();
    Object.keys(documentData).forEach(key => {
      formData.append(key, documentData[key]);
    });
    return axios.post(`${API_URL}/documents`, formData, {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateDocument: (id, documentData) => axios.put(`${API_URL}/documents/${id}`, documentData, getAuthHeader()),
  deleteDocument: (id) => axios.delete(`${API_URL}/documents/${id}`, getAuthHeader()),
  
  // Formations
  getFormations: () => axios.get(`${API_URL}/formations`, getAuthHeader()),
  createFormation: (formationData) => axios.post(`${API_URL}/formations`, formationData, getAuthHeader()),
  updateFormation: (id, formationData) => axios.put(`${API_URL}/formations/${id}`, formationData, getAuthHeader()),
  deleteFormation: (id) => axios.delete(`${API_URL}/formations/${id}`, getAuthHeader()),
  
  // Statistiques
  getStats: () => axios.get(`${API_URL}/stats`, getAuthHeader()),
};