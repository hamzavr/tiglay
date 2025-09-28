import axios from 'axios';
import { User, CreateUserData, UpdateUserData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configuration d'axios pour inclure le token d'authentification
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userService = {
  // Obtenir tous les utilisateurs
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Créer un nouvel utilisateur
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Mettre à jour un utilisateur
  async updateUser(userData: UpdateUserData): Promise<User> {
    const { id, ...updateData } = userData;
    const response = await apiClient.put(`/users/${id}`, updateData);
    return response.data;
  },

  // Supprimer un utilisateur
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },

  // Obtenir un utilisateur par ID
  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },
};

export default userService;
