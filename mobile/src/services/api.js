import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBackendUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }

  // Extract host IP from Expo Metro bundler
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

const API_URL = getBackendUrl();
console.log('MedhaNet Mobile connecting to Backend API at:', API_URL);

let authToken = null;
let currentUser = null;
let onUnauthorized = null;

export const setOnUnauthorized = (handler) => {
  onUnauthorized = handler;
};

export const setAuthToken = (token) => {
  authToken = token;
};

export const setCurrentUser = (user) => {
  currentUser = user;
};

export const getAuthToken = () => authToken;
export const getCurrentUser = () => currentUser;

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// A reload drops the in-memory token, so surface that as a trip back to the
// login screen rather than a string of unexplained 401s.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      authToken = null;
      currentUser = null;
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(err);
  }
);

export const api = {
  // Auth
  login: async (phone, password) => {
    const res = await client.post('/auth/login', { phone, password });
    authToken = res.data.token;
    currentUser = res.data.user;
    return res.data;
  },

  register: async (phone, password, name) => {
    const res = await client.post('/auth/register', { phone, password, name, role: 'PATIENT' });
    authToken = res.data.token;
    currentUser = res.data.user;
    return res.data;
  },

  getMe: async () => {
    const res = await client.get('/auth/me');
    currentUser = res.data;
    return res.data;
  },

  // Search Medicines & Nearby Stock
  searchStock: async (query, lat = 8.9945, lng = 38.7896, radiusKm = 15) => {
    const res = await client.get('/search', {
      params: { q: query, lat, lng, radiusKm },
    });
    return res.data;
  },

  // Medicines Catalogue
  getMedicines: async (query = '') => {
    const res = await client.get('/medicines', { params: { q: query } });
    return res.data;
  },

  // Reservations
  createReservation: async (inventoryId, quantity = 1) => {
    const res = await client.post('/reservations', { inventoryId, quantity });
    return res.data;
  },

  getPatientReservations: async () => {
    const res = await client.get('/reservations/me');
    return res.data;
  },

  cancelReservation: async (id) => {
    const res = await client.patch(`/reservations/${id}/cancel`);
    return res.data;
  },

  // Prescription Upload & AI Scan
  uploadPrescription: async (uri, mimeType = 'image/jpeg') => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'prescription.jpg';
    
    formData.append('prescription', {
      uri,
      name: filename,
      type: mimeType,
    });

    // Gemini needs ~20s to read a prescription, well past the default client timeout.
    const res = await client.post('/prescriptions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },

  getNearbyPharmacies: async (lat = 8.9945, lng = 38.7896, radiusKm = 15) => {
    const res = await client.get('/prescriptions/pharmacies/nearby', {
      params: { lat, lng, radiusKm },
    });
    return res.data;
  },

  sendPrescriptionToPharmacy: async (prescriptionId, pharmacyId, note = '') => {
    const res = await client.post(`/prescriptions/${prescriptionId}/send-to-pharmacy`, {
      pharmacyId,
      note,
    });
    return res.data;
  },

  getMyPrescriptions: async () => {
    const res = await client.get('/prescriptions/mine');
    return res.data;
  },

  // AI Assistant Chat & Emergency Guardrails
  sendChatMessage: async (message, lat = 8.9945, lng = 38.7896) => {
    const res = await client.post('/chat/message', { message, lat, lng });
    return res.data;
  },

  transcribeVoiceAudio: async (audio_base64 = null, text = null, mime_type = null) => {
    const res = await client.post(
      '/chat/voice',
      { audio_base64, text, mime_type },
      { timeout: 60000 }
    );
    return res.data;
  },

  getChatHistory: async () => {
    const res = await client.get('/chat/history');
    return res.data;
  },
};
