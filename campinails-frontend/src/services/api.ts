import axios from 'axios';
import type { AuthResponse, ApiResponse, Service, Client, Appointment, CreateAppointmentRequest, TimeSlot, CreateTimeSlotRequest, CreateTimeSlotsBulkRequest } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', { email, password });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export const serviceService = {
  async getAll() {
    const response = await api.get<Service[]>('/services');
    return response.data;
  },

  async getPublic() {
    const response = await api.get<Service[]>('/services/public');
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  async create(data: Partial<Service>) {
    const response = await api.post<Service>('/services', data);
    return response.data;
  },

  async update(id: number, data: Partial<Service>) {
    const response = await api.put<Service>(`/services/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

export const clientService = {
  async getAll() {
    const response = await api.get<Client[]>('/clients');
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  async create(data: Partial<Client>) {
    const response = await api.post<Client>('/clients', data);
    return response.data;
  },

  async update(id: number, data: Partial<Client>) {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};

export const appointmentService = {
  async getAll(params?: { date?: string; status?: string; client_id?: number }) {
    const response = await api.get<Appointment[]>('/appointments', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  async create(data: CreateAppointmentRequest) {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  async update(id: number, data: Partial<Appointment>) {
    const response = await api.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};

export const timeSlotService = {
  async getAll(params?: { service_id?: number; date?: string; status?: string; future?: boolean }) {
    const response = await api.get<TimeSlot[]>('/time-slots', { params });
    return response.data;
  },

  async getByDateRange(serviceId: number, startDate: string, endDate: string) {
    const response = await api.get<TimeSlot[]>(`/time-slots`, {
      params: { service_id: serviceId, start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getAvailableSlots(serviceId: number, date: string) {
    const response = await api.get<TimeSlot[]>('/time-slots/available', {
      params: { service_id: serviceId, date }
    });
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get<TimeSlot>(`/time-slots/${id}`);
    return response.data;
  },

  async create(data: CreateTimeSlotRequest) {
    const response = await api.post<TimeSlot>('/time-slots', data);
    return response.data;
  },

  async createBulk(data: CreateTimeSlotsBulkRequest) {
    const response = await api.post<{ message: string; created_count: number }>('/time-slots/bulk', data);
    return response.data;
  },

  async update(id: number, data: Partial<TimeSlot>) {
    const response = await api.put<TimeSlot>(`/time-slots/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/time-slots/${id}`);
    return response.data;
  },

  async toggleBlock(id: number) {
    const response = await api.patch<{ message: string; slot: TimeSlot }>(`/time-slots/${id}/toggle-block`);
    return response.data;
  },
};

export default api; 