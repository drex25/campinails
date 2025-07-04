export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  requires_deposit: boolean;
  deposit_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  name: string;
  whatsapp: string;
  email?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  service_id: number;
  client_id: number;
  employee_id?: number;
  scheduled_at: string;
  ends_at: string;
  status: 'pending_deposit' | 'confirmed' | 'rescheduled' | 'cancelled' | 'no_show' | 'completed';
  total_price: number;
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_at?: string;
  reschedule_count: number;
  special_requests?: string;
  reference_photo?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  service?: Service;
  client?: Client;
  employee?: Employee;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  specialties?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  services?: Service[];
}

export interface EmployeeSchedule {
  id: number;
  employee_id: number;
  day_of_week: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  start_time: string;
  end_time: string;
  is_active: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeSlot {
  id: number | null;
  service_id: number;
  employee_id?: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'reserved' | 'cancelled' | 'blocked';
  appointment_id?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  service?: Service;
  employee?: Employee;
  appointment?: Appointment;
  is_virtual?: boolean;
}

export interface CreateAppointmentRequest {
  service_id: number;
  client_id?: number;
  employee_id?: number;
  name?: string;
  whatsapp?: string;
  email?: string;
  scheduled_at: string;
  special_requests?: string;
}

export interface CreateAppointmentResponse {
  appointment?: Appointment;
  payment_url?: string;
  payment_id?: string;
  requires_payment?: boolean;
  message?: string;
}

export interface CreateTimeSlotRequest {
  service_id: number;
  employee_id?: number;
  date: string;
  start_time: string;
  end_time: string;
  status?: 'available' | 'blocked';
  notes?: string;
}

export interface CreateTimeSlotsBulkRequest {
  service_id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  days_of_week?: number[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Payment {
  id: number;
  appointment_id: number;
  amount: number;
  currency: string;
  payment_method: 'card' | 'transfer' | 'cash' | 'mercadopago' | 'stripe';
  payment_provider: string;
  provider_payment_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  metadata?: Record<string, any>;
  paid_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  created_at: string;
  updated_at: string;
  appointment?: Appointment;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}