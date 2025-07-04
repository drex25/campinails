import axios from 'axios';
import type { 
  AuthResponse, 
  ApiResponse, 
  Service, 
  Client, 
  Appointment, 
  CreateAppointmentRequest, 
  CreateAppointmentResponse,
  TimeSlot, 
  CreateTimeSlotRequest, 
  CreateTimeSlotsBulkRequest, 
  Employee,
  EmployeeSchedule
} from '../types';

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
  async getAll(params?: { date?: string; status?: string; client_id?: number; employee_id?: number }) {
    const response = await api.get<Appointment[]>('/appointments', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  async create(data: CreateAppointmentRequest) {
    const response = await api.post<CreateAppointmentResponse>('/appointments', data);
    console.log('Respuesta de creación de turno:', response.data);
    
    // Asegurarse de que tenemos un objeto de cita válido
    if (!response.data.appointment && response.data) {
      // Si la respuesta es directamente el objeto de cita
      return {
        appointment: response.data as unknown as Appointment,
        requires_payment: false
      };
    }
    
    return {
      ...response.data,
      requires_payment: !!response.data.requires_payment
    };
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

export const employeeService = {
  async getAll(params?: { active?: boolean; service_id?: number }) {
    const response = await api.get<Employee[]>('/employees', { params });
    return response.data;
  },

  async getPublic(params: { service_id: number; active?: boolean }) {
    const response = await api.get<Employee[]>('/employees/public', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  async create(data: Partial<Employee>) {
    const response = await api.post<Employee>('/employees', data);
    return response.data;
  },

  async update(id: number, data: Partial<Employee>) {
    const response = await api.put<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  async getSchedule(id: number, startDate: string, endDate: string, serviceId?: number) {
    const response = await api.get<{ employee: Employee; schedule: EmployeeSchedule[] }>(`/employees/${id}/schedule`, {
      params: { start_date: startDate, end_date: endDate, service_id: serviceId }
    });
    return response.data;
  },

  async createSchedule(id: number, data: Partial<EmployeeSchedule>) {
    const response = await api.post<EmployeeSchedule>(`/employees/${id}/schedules`, data);
    return response.data;
  },

  async updateSchedule(employeeId: number, scheduleId: number, data: Partial<EmployeeSchedule>) {
    const response = await api.put<EmployeeSchedule>(`/employees/${employeeId}/schedules/${scheduleId}`, data);
    return response.data;
  },

  async deleteSchedule(employeeId: number, scheduleId: number) {
    const response = await api.delete(`/employees/${employeeId}/schedules/${scheduleId}`);
    return response.data;
  },

  async createSlots(id: number, data: any) {
    const response = await api.post<{ message: string; created_count: number }>(`/employees/${id}/slots`, data);
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

  async getAvailableSlots(serviceId: number, date: string, employeeId?: number) {
    const response = await api.get<TimeSlot[]>('/time-slots/available', {
      params: { service_id: serviceId, date, employee_id: employeeId }
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

  async getAvailableDays(serviceId: number, startDate: string, endDate: string, employeeId?: number) {
    const response = await api.get<string[]>('/time-slots/available-days', {
      params: { service_id: serviceId, start_date: startDate, end_date: endDate, employee_id: employeeId }
    });
    return response.data;
  },
};

// Servicios para pagos
export const paymentService = {
  async getAll(params?: { status?: string; payment_method?: string; appointment_id?: number }) {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/payments', data);
    console.log('Respuesta de creación de pago:', response.data);
    return response.data;
  },

  async processAppointmentPayment(appointmentId: number, data: { payment_method: string }) {
    const response = await api.post(`/appointments/${appointmentId}/process-payment`, data);
    console.log('Respuesta de procesamiento de pago:', response.data);
    return response.data;
  },

  async confirm(id: number) {
    const response = await api.post(`/payments/${id}/confirm`);
    return response.data;
  },

  async refund(id: number, data: { amount?: number; reason: string }) {
    const response = await api.post(`/payments/${id}/refund`, data);
    return response.data;
  }
};

// Servicios para promociones
export const promotionService = {
  async getAll(params?: { active?: boolean; code?: string }) {
    const response = await api.get('/promotions', { params });
    return response.data;
  },

  async getActive() {
    const response = await api.get('/promotions/active');
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/promotions/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/promotions', data);
    return response.data;
  },

  async update(id: number, data: any) {
    const response = await api.put(`/promotions/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/promotions/${id}`);
    return response.data;
  },

  async validate(data: { code: string; service_id: number; date: string; amount: number }) {
    const response = await api.post('/promotions/validate', data);
    return response.data;
  }
};

// Servicios para inventario
export const productService = {
  async getAll(params?: { category?: string; active?: boolean; low_stock?: boolean; search?: string }) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/products', data);
    return response.data;
  },

  async update(id: number, data: any) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  async adjustStock(id: number, data: { quantity: number; reason: string; notes?: string }) {
    const response = await api.post(`/products/${id}/adjust-stock`, data);
    return response.data;
  },

  async getLowStock() {
    const response = await api.get('/products/low-stock');
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/products/categories');
    return response.data;
  },

  async getStockReport(params?: { category?: string }) {
    const response = await api.get('/products/stock-report', { params });
    return response.data;
  }
};

// Servicios para notificaciones
export const notificationService = {
  async getAll(params?: { type?: string; status?: string; recipient_type?: string }) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/notifications', data);
    return response.data;
  },

  async markAsRead(id: number) {
    const response = await api.patch(`/notifications/${id}/mark-as-read`);
    return response.data;
  },

  async resend(id: number) {
    const response = await api.post(`/notifications/${id}/resend`);
    return response.data;
  },

  async sendBulk(data: any) {
    const response = await api.post('/notifications/bulk', data);
    return response.data;
  }
};

// Servicios para dashboard
export const dashboardService = {
  async getStats(period: string = 'month') {
    const response = await api.get('/dashboard/stats', { params: { period } });
    return response.data;
  },

  async getUpcomingAppointments() {
    const response = await api.get('/dashboard/upcoming-appointments');
    return response.data;
  },

  async getRecentActivity() {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  }
};

export default api;