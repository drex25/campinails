import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, employeeService, serviceService, appointmentService, timeSlotService } from '../services/api';
import type { Employee, Service, Appointment, TimeSlot } from '../types';
import ReactModal from 'react-modal';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { 
  LayoutDashboard, 
  Users, 
  Scissors, 
  Calendar, 
  Settings, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  TrendingUp,
  Clock,
  DollarSign,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Bell,
  Menu,
  X,
  Sparkles,
  Star,
  Heart
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type AdminSection = 'dashboard' | 'calendar' | 'services' | 'employees' | 'appointments';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      navigate('/login');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
    { id: 'calendar', label: 'Calendario', icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { id: 'appointments', label: 'Turnos', icon: Clock, color: 'from-green-500 to-green-600' },
    { id: 'services', label: 'Servicios', icon: Scissors, color: 'from-pink-500 to-pink-600' },
    { id: 'employees', label: 'Empleados', icon: Users, color: 'from-orange-500 to-orange-600' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'calendar':
        return <CalendarSection />;
      case 'appointments':
        return <AppointmentsSection />;
      case 'services':
        return <ServicesSection />;
      case 'employees':
        return <EmployeesSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Campi Nails
                </h1>
                <p className="text-xs text-gray-500">Panel Admin</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as AdminSection);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeSection === 'dashboard' ? 'Panel de Control' : activeSection}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

// Dashboard Section
const DashboardSection: React.FC = () => {
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    pendingDeposits: 0,
    totalRevenue: 0,
    activeClients: 0,
    totalServices: 0,
    totalEmployees: 0,
    recentAppointments: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [appointments, services, employees] = await Promise.all([
        appointmentService.getAll({ date: today }),
        serviceService.getAll(),
        employeeService.getAll({ active: true })
      ]);

      const totalRevenue = appointments
        .filter((a: any) => a.status === 'completed')
        .reduce((sum: number, a: any) => sum + a.total_price, 0);

      setStats({
        appointmentsToday: appointments.length,
        pendingDeposits: appointments.filter((a: any) => a.status === 'pending_deposit').length,
        totalRevenue,
        activeClients: new Set(appointments.map((a: any) => a.client_id)).size,
        totalServices: services.length,
        totalEmployees: employees.length,
        recentAppointments: appointments.slice(0, 5)
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Turnos Hoy',
      value: stats.appointmentsToday,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Pendientes Seña',
      value: stats.pendingDeposits,
      icon: AlertCircle,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-50 to-yellow-100'
    },
    {
      title: 'Ingresos Hoy',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      title: 'Clientes Activos',
      value: stats.activeClients,
      icon: UserCheck,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido de vuelta! 👋</h1>
          <p className="text-pink-100 text-lg">Aquí tienes un resumen de tu negocio hoy</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.title}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Últimos Turnos</h3>
            <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">Ver todos</button>
          </div>
          
          {stats.recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {stats.recentAppointments.map((appointment: any) => (
                <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {appointment.client?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{appointment.client?.name}</p>
                    <p className="text-sm text-gray-500">{appointment.service?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(appointment.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending_deposit' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay turnos programados para hoy</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200">
              <Plus className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Nuevo Turno</span>
            </button>
            
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl hover:from-green-100 hover:to-green-200 transition-all duration-200">
              <UserCheck className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Nuevo Cliente</span>
            </button>
            
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200">
              <Scissors className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Nuevo Servicio</span>
            </button>
            
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl hover:from-orange-100 hover:to-orange-200 transition-all duration-200">
              <Users className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">Nuevo Empleado</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Calendar Section
const CalendarSection: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const workHours = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadTimeSlots();
    }
  }, [selectedService, currentWeek]);

  const loadServices = async () => {
    try {
      const servicesData = await serviceService.getAll();
      setServices(servicesData);
      if (servicesData.length > 0) {
        setSelectedService(servicesData[0].id);
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  const loadTimeSlots = async () => {
    if (!selectedService) return;
    
    setIsLoading(true);
    try {
      const startDate = format(startOfWeek(currentWeek), 'yyyy-MM-dd');
      const endDate = format(endOfWeek(currentWeek), 'yyyy-MM-dd');
      
      const slots = await timeSlotService.getByDateRange(selectedService, startDate, endDate);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error cargando slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getSlotForTimeAndDate = (time: string, date: Date) => {
    return timeSlots.find(slot => 
      slot.start_time === time && 
      isSameDay(parseISO(slot.date), date)
    );
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Calendario de Turnos</h2>
              <p className="text-gray-500">Gestiona los horarios disponibles</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedService || ''}
              onChange={(e) => setSelectedService(Number(e.target.value))}
              className="px-4 py-2 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all duration-300"
            >
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                ←
              </button>
              
              <span className="text-sm font-medium text-gray-700 px-4">
                {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM', { locale: es })} - 
                {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: es })}
              </span>
              
              <button
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 w-20">Hora</th>
                {getWeekDays().map(day => (
                  <th key={day.toISOString()} className="p-4 text-center text-sm font-semibold text-gray-600 min-w-32">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 uppercase">
                        {format(day, 'EEE', { locale: es })}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {format(day, 'dd')}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workHours.map(time => (
                <tr key={time} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-500 font-medium">
                    {time}
                  </td>
                  {getWeekDays().map(day => {
                    const slot = getSlotForTimeAndDate(time, day);
                    return (
                      <td key={`${time}-${day.toISOString()}`} className="p-2">
                        {slot ? (
                          <div className={`p-3 text-xs rounded-2xl border ${getSlotStatusColor(slot.status)} cursor-pointer hover:opacity-80 transition-opacity`}>
                            <div className="font-medium capitalize">{slot.status}</div>
                            {slot.appointment && (
                              <div className="text-xs opacity-75 mt-1">
                                {slot.appointment.client?.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button className="w-full p-3 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl hover:border-gray-300 hover:text-gray-600 transition-colors">
                            <Plus className="w-4 h-4 mx-auto" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-gray-600">Reservado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-gray-600">Bloqueado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
              <span className="text-gray-600">Cancelado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Appointments Section
const AppointmentsSection: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Error cargando turnos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending_deposit': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'pending_deposit': return AlertCircle;
      case 'cancelled': return XCircle;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Turnos</h2>
              <p className="text-gray-500">Administra todas las citas y reservas</p>
            </div>
          </div>

          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Nuevo Turno</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-300 transition-all duration-300"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-300 transition-all duration-300"
          >
            <option value="">Todos los estados</option>
            <option value="pending_deposit">Pendiente seña</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>

          <button className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-200">
            <Download className="w-5 h-5" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando turnos...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Servicio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Precio</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((appointment) => {
                  const StatusIcon = getStatusIcon(appointment.status);
                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {appointment.client?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{appointment.client?.name}</p>
                            <p className="text-sm text-gray-500">{appointment.client?.whatsapp}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{appointment.service?.name}</p>
                        <p className="text-sm text-gray-500">{appointment.service?.duration_minutes} min</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {new Date(appointment.scheduled_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">${appointment.total_price.toLocaleString()}</p>
                        {appointment.deposit_amount > 0 && (
                          <p className="text-sm text-gray-500">
                            Seña: ${appointment.deposit_amount.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron turnos</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Services Section
const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await serviceService.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = async (service: Service) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el servicio "${service.name}"?`)) {
      try {
        await serviceService.delete(service.id);
        await loadServices();
      } catch (error) {
        console.error('Error eliminando servicio:', error);
        alert('Error al eliminar el servicio');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleModalSave = async () => {
    setShowModal(false);
    setEditingService(null);
    await loadServices();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Servicios</h2>
              <p className="text-gray-500">Administra todos los tratamientos disponibles</p>
            </div>
          </div>

          <button 
            onClick={handleAdd}
            className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Servicio</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(service)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(service)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
              {service.description && (
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Precio</span>
                  <span className="text-xl font-bold text-gray-900">${service.price.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Duración</span>
                  <span className="text-sm font-medium text-gray-700">{service.duration_minutes} min</span>
                </div>

                {service.requires_deposit && (
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-3">
                    <div className="text-sm text-pink-700">
                      <strong>Seña:</strong> ${Math.round(service.price * service.deposit_percentage / 100).toLocaleString()} ({service.deposit_percentage}%)
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Activo
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ServiceFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        service={editingService}
      />
    </div>
  );
};

// Employees Section
const EmployeesSection: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
    loadServices();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const data = await serviceService.getAll();
      setServices(data);
    } catch {}
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleModalSave = async () => {
    setShowModal(false);
    setEditingEmployee(null);
    await loadEmployees();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h2>
              <p className="text-gray-500">Administra tu equipo de profesionales</p>
            </div>
          </div>

          <button 
            onClick={handleAdd}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Empleado</span>
          </button>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          employees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(employee)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">{employee.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{employee.email}</p>

              {employee.specialties && employee.specialties.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-1">
                    {employee.specialties.map((specialty, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Servicios asignados</p>
                  <p className="text-sm text-gray-700">
                    {employee.services?.map(s => s.name).join(', ') || 'Sin servicios asignados'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    employee.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      employee.is_active ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    {employee.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <EmployeeFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        employee={editingEmployee}
        services={services}
      />
    </div>
  );
};

// Service Form Modal
interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  service: Service | null;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ isOpen, onClose, onSave, service }) => {
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration_minutes: 60,
      requires_deposit: false,
      deposit_percentage: 50,
    },
  });

  const requiresDeposit = watch('requires_deposit');

  useEffect(() => {
    if (service) {
      reset({
        ...service,
        requires_deposit: service.requires_deposit || false,
        deposit_percentage: service.deposit_percentage || 50,
      });
    } else {
      reset();
    }
  }, [service, reset]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      price: Number(data.price),
      duration_minutes: Number(data.duration_minutes),
      deposit_percentage: data.requires_deposit ? Number(data.deposit_percentage) : null,
      requires_deposit: data.requires_deposit || false,
    };
    
    try {
      if (service) {
        await serviceService.update(service.id, payload);
      } else {
        await serviceService.create(payload);
      }
      onSave();
    } catch (err: any) {
      alert(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Error al guardar');
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      style={{
        content: {
          background: 'white',
          zIndex: 9999,
          padding: 0,
          maxWidth: 600,
          width: '90vw',
          maxHeight: '90vh',
          margin: 'auto',
          borderRadius: 24,
          overflow: 'hidden',
          border: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }
      }}
      onRequestClose={onClose}
      contentLabel="Servicio"
      ariaHideApp={false}
    >
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold">{service ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del servicio *</label>
          <input 
            {...register('name', { required: true })} 
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300" 
            placeholder="Ej: Manicura completa" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
          <textarea 
            {...register('description')} 
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300 resize-none" 
            rows={3} 
            placeholder="Descripción del servicio..." 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Precio *</label>
            <input 
              {...register('price', { required: true, min: 0 })} 
              type="number" 
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300" 
              placeholder="0" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Duración (minutos) *</label>
            <input 
              {...register('duration_minutes', { required: true, min: 15 })} 
              type="number" 
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300" 
              placeholder="60" 
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input 
              {...register('requires_deposit')} 
              type="checkbox" 
              id="requires_deposit"
              className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label htmlFor="requires_deposit" className="text-sm font-semibold text-gray-700">
              Requiere seña
            </label>
          </div>
          
          {requiresDeposit && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Porcentaje de seña (%)</label>
              <input 
                {...register('deposit_percentage', { min: 10, max: 100 })} 
                type="number" 
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300" 
                placeholder="50"
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-all duration-300"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105"
          >
            Guardar
          </button>
        </div>
      </form>
    </ReactModal>
  );
};

// Employee Form Modal
interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  employee: Employee | null;
  services: Service[];
}

const daysOfWeek = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
];

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ isOpen, onClose, onSave, employee, services }) => {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      is_active: 'true',
      specialties: '',
      notes: '',
      service_ids: [] as (string | number)[],
      schedule: daysOfWeek.map(day => ({ day_of_week: day.id, start_time: '09:00', end_time: '18:00', is_active: true })),
    },
  });

  useEffect(() => {
    if (employee) {
      reset({
        ...employee,
        service_ids: employee.services?.map(s => s.id) || [],
        schedule: (employee as any).schedules || daysOfWeek.map(day => ({ day_of_week: day.id, start_time: '09:00', end_time: '18:00', is_active: true })),
        is_active: employee.is_active ? 'true' : 'false',
        specialties: Array.isArray(employee.specialties) ? employee.specialties.join(', ') : employee.specialties || '',
      });
    } else {
      reset();
    }
  }, [employee, reset]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      specialties: Array.isArray(data.specialties)
        ? data.specialties
        : (typeof data.specialties === 'string' && data.specialties.trim() !== ''
            ? data.specialties.split(',').map((s: string) => s.trim())
            : []),
      service_ids: Array.isArray(data.service_ids)
        ? data.service_ids.map((id: any) => Number(id))
        : [],
      schedules: data.schedule,
      is_active: data.is_active === 'true' || data.is_active === true,
    };
    try {
      if (employee) {
        await employeeService.update(employee.id, payload);
      } else {
        await employeeService.create(payload);
      }
      onSave();
    } catch (err: any) {
      alert(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Error al guardar');
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      style={{
        content: {
          background: 'white',
          zIndex: 9999,
          padding: 0,
          maxWidth: 800,
          width: '90vw',
          maxHeight: '90vh',
          margin: 'auto',
          borderRadius: 24,
          overflow: 'hidden',
          border: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }
      }}
      onRequestClose={onClose}
      contentLabel="Empleado"
      ariaHideApp={false}
    >
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold">{employee ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
              <input {...register('name', { required: true })} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input {...register('email')} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
              <input {...register('phone')} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
              <select {...register('is_active')} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Especialidades</label>
            <input {...register('specialties')} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300" placeholder="Ej: Manicura, Pedicura" />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
            <textarea {...register('notes')} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300 resize-none" rows={3} />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Servicios asignados</label>
            <Controller
              control={control}
              name="service_ids"
              render={({ field }) => (
                <Select
                  isMulti
                  options={services.map(s => ({ value: s.id, label: s.name }))}
                  value={services
                    .filter(s => (field.value || []).map(Number).includes(s.id))
                    .map(s => ({ value: s.id, label: s.name }))}
                  onChange={selected => field.onChange(selected.map((opt: any) => Number(opt.value)))}
                  classNamePrefix="react-select"
                  placeholder="Selecciona servicios..."
                />
              )}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">Horario semanal</label>
            <div className="bg-gray-50 rounded-2xl p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Día</th>
                    <th className="text-center py-2">Activo</th>
                    <th className="text-center py-2">Desde</th>
                    <th className="text-center py-2">Hasta</th>
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map((day, idx) => (
                    <tr key={day.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-2 font-medium">{day.label}</td>
                      <td className="py-2 text-center">
                        <Controller
                          control={control}
                          name={`schedule.${idx}.is_active`}
                          render={({ field }) => (
                            <input 
                              type="checkbox" 
                              checked={field.value} 
                              onChange={e => field.onChange(e.target.checked)}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                          )}
                        />
                      </td>
                      <td className="py-2">
                        <Controller
                          control={control}
                          name={`schedule.${idx}.start_time`}
                          render={({ field }) => (
                            <input 
                              type="time" 
                              className="w-full px-2 py-1 border border-gray-200 rounded-lg text-center text-sm" 
                              {...field} 
                            />
                          )}
                        />
                      </td>
                      <td className="py-2">
                        <Controller
                          control={control}
                          name={`schedule.${idx}.end_time`}
                          render={({ field }) => (
                            <input 
                              type="time" 
                              className="w-full px-2 py-1 border border-gray-200 rounded-lg text-center text-sm" 
                              {...field} 
                            />
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-all duration-300"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </ReactModal>
  );
};