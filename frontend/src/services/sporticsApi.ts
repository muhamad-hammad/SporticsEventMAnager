import apiClient from './api';
import { Sport, House, Team } from '../types';

// Sports API
export const sportsApi = {
  getAll: () => apiClient.get<Sport[]>('/api/sports/'),
  getById: (id: number) => apiClient.get<Sport>(`/api/sports/${id}/`),
  create: (data: Omit<Sport, 'id'>) => apiClient.post<Sport>('/api/sports/', data),
  update: (id: number, data: Partial<Sport>) => apiClient.put<Sport>(`/api/sports/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/api/sports/${id}/`),
};

// Houses API
export const housesApi = {
  getAll: () => apiClient.get<House[]>('/api/houses/'),
  getById: (id: number) => apiClient.get<House>(`/api/houses/${id}/`),
  create: (data: Omit<House, 'id'>) => apiClient.post<House>('/api/houses/', data),
  update: (id: number, data: Partial<House>) => apiClient.put<House>(`/api/houses/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/api/houses/${id}/`),
};

// Teams API
export const teamsApi = {
  getAll: () => apiClient.get<Team[]>('/api/teams/'),
  getById: (id: number) => apiClient.get<Team>(`/api/teams/${id}/`),
  create: (data: Omit<Team, 'id'>) => apiClient.post<Team>('/api/teams/', data),
  update: (id: number, data: Partial<Team>) => apiClient.put<Team>(`/api/teams/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/api/teams/${id}/`),
};
