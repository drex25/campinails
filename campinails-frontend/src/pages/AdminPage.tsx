import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, appointmentService, serviceService, clientService, employeeService } from '../services/api';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  Scissors, 
  Users, 
  UserCheck,
  LogOut,
  Bell,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  DollarSign,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import type { Appointment, Service, Client, Employee } from '../types';
import ReactModal from 'react-modal';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';

type AdminSection = 'dashboard' | 'calendar' | 'appointments' | 'services' | 'clients' | 'employees';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    { id: 'clients', label: 'Clientes', icon: Users, color: 'from-indigo-500 to-indigo-600' },
    { id: 'employees', label: 'Empleados', icon: UserCheck, color: 'from-orange-500 to-orange-600' },
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
      case 'clients':
        return <ClientsSection />;
      case 'employees':
        return <EmployeesSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white shadow-2xl transition-all duration-300 flex flex-col border-r border-gray-200`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">Campi Nails</h1>
                <p className="text-sm text-gray-500">Panel Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AdminSection)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 capitalize">
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
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors duration-200" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

// Dashboard Section
const DashboardSection: React.FC = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingDeposits: 0,
    totalClients: 0,
    totalServices: 0,
    monthlyRevenue: 0,
    completedToday: 0
  });

  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [appointments, clients, services] = await Promise.all([
        appointmentService.getAll({ date: today }),
        clientService.getAll(),
        serviceService.getAll()
      ]);

      setStats({
        todayAppointments: appointments.length,
        pendingDeposits: appointments.filter(a => a.status === 'pending_deposit').length,
        totalClients: clients.length,
        totalServices: services.filter(s => s.is_active).length,
        monthlyRevenue: appointments.reduce((sum, a) => sum + a.total_price, 0),
        completedToday: appointments.filter(a => a.status === 'completed').length
      });

      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Turnos Hoy',
      value: stats.todayAppointments,
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Pendientes de Seña',
      value: stats.pendingDeposits,
      icon: AlertCircle,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-50 to-yellow-100'
    },
    {
      title: 'Clientes Totales',
      value: stats.totalClients,
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      title: 'Servicios Activos',
      value: stats.totalServices,
      icon: Scissors,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">¡Bienvenido de vuelta! 👋</h1>
            <p className="text-pink-100 text-lg">
              Aquí tienes un resumen de tu negocio hoy
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgColor} rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/50`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {stat.title}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Turnos de Hoy</h3>
            <RefreshCw 
              className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
              onClick={loadDashboardData}
            />
          </div>
          
          <div className="space-y-4">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {appointment.client?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{appointment.client?.name}</div>
                    <div className="text-sm text-gray-600">{appointment.service?.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(appointment.scheduled_at).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    appointment.status === 'pending_deposit' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Confirmado' :
                     appointment.status === 'pending_deposit' ? 'Pendiente' :
                     appointment.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay turnos para hoy</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Acciones Rápidas</h3>
          
          <div className="space-y-4">
            <button className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Nuevo Turno</div>
                <div className="text-sm text-gray-600">Crear una nueva cita</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl hover:from-green-100 hover:to-green-200 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Nuevo Cliente</div>
                <div className="text-sm text-gray-600">Agregar cliente al sistema</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Ver Calendario</div>
                <div className="text-sm text-gray-600">Gestionar horarios</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Calendar Section
const CalendarSection: React.FC = () => (
  <div className="bg-white rounded-3xl shadow-lg p-8">
    <div className="text-center">
      <Calendar className="w-16 h-16 text-purple-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Calendario</h2>
      <p className="text-gray-600">Vista de calendario en desarrollo...</p>
    </div>
  </div>
);

// Appointments Section
const AppointmentsSection: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending_deposit': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending_deposit': return 'Pendiente Seña';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestión de Turnos</h2>
          <p className="text-gray-600">Administra todas las citas y reservas</p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Nuevo Turno</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-300 transition-all duration-300"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-12 pr-8 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-300 transition-all duration-300 appearance-none bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="pending_deposit">Pendiente Seña</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando turnos...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Servicio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Precio</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {appointment.client?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{appointment.client?.name}</div>
                          <div className="text-sm text-gray-600">{appointment.client?.whatsapp}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{appointment.service?.name}</div>
                      <div className="text-sm text-gray-600">{appointment.service?.duration_minutes} min</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {new Date(appointment.scheduled_at).toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(appointment.scheduled_at).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">${appointment.total_price.toLocaleString()}</div>
                      {appointment.deposit_amount > 0 && (
                        <div className="text-sm text-gray-600">
                          Seña: ${appointment.deposit_amount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay turnos</h3>
            <p className="text-gray-500">No se encontraron turnos con los filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Services Section
const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      console.error('Error loading services:', error);
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

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      try {
        await serviceService.delete(id);
        await loadServices();
      } catch (error) {
        console.error('Error deleting service:', error);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestión de Servicios</h2>
          <p className="text-gray-600">Administra todos los servicios disponibles</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEdit(service)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
              {service.description && (
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Precio:</span>
                  <span className="font-semibold text-gray-800">${service.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Duración:</span>
                  <span className="font-semibold text-gray-800">{service.duration_minutes} min</span>
                </div>
                {service.requires_deposit && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Seña:</span>
                    <span className="font-semibold text-gray-800">{service.deposit_percentage}%</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {service.is_active ? 'Activo' : 'Inactivo'}
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

// Clients Section
const ClientsSection: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.whatsapp.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await clientService.delete(id);
        await loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const handleModalSave = async () => {
    setShowModal(false);
    setEditingClient(null);
    await loadClients();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestión de Clientes</h2>
          <p className="text-gray-600">Administra toda tu base de clientes</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, WhatsApp o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300"
          />
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Contacto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Registro</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{client.name}</div>
                          {client.notes && (
                            <div className="text-sm text-gray-600 truncate max-w-xs">{client.notes}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-800">{client.whatsapp}</span>
                        </div>
                        {client.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{client.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        client.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {client.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(client.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleEdit(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay clientes</h3>
            <p className="text-gray-500">No se encontraron clientes con los filtros aplicados</p>
          </div>
        )}
      </div>

      <ClientFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        client={editingClient}
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

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      try {
        await employeeService.delete(id);
        await loadEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestión de Empleados</h2>
          <p className="text-gray-600">Administra tu equipo de trabajo</p>
        </div>
        <button 
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2" 
          onClick={handleAdd}
        >
          <Plus className="w-5 h-5" />
          <span>Agregar Empleado</span>
        </button>
      </div>
      
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando empleados...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Empleado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Contacto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Servicios</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {emp.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{emp.name}</div>
                          {emp.specialties && emp.specialties.length > 0 && (
                            <div className="text-sm text-gray-600">{emp.specialties.join(', ')}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-800">{emp.email}</span>
                        </div>
                        {emp.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{emp.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.services?.slice(0, 2).map(s => (
                          <span key={s.id} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                            {s.name}
                          </span>
                        ))}
                        {emp.services && emp.services.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{emp.services.length - 2} más
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        emp.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {emp.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200" 
                          onClick={() => handleEdit(emp)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                          onClick={() => handleDelete(emp.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && employees.length === 0 && (
              <div className="p-8 text-center">
                <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay empleados</h3>
                <p className="text-gray-500">Agrega empleados para comenzar a gestionar tu equipo</p>
              </div>
            )}
          </div>
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
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: '',
      description: '',
      duration_minutes: 60,
      price: 0,
      is_active: true,
      requires_deposit: true,
      deposit_percentage: 50,
    },
  });

  const requiresDeposit = watch('requires_deposit');

  useEffect(() => {
    if (service) {
      reset(service);
    } else {
      reset({
        name: '',
        description: '',
        duration_minutes: 60,
        price: 0,
        is_active: true,
        requires_deposit: true,
        deposit_percentage: 50,
      });
    }
  }, [service, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (service) {
        await serviceService.update(service.id, data);
      } else {
        await serviceService.create(data);
      }
      onSave();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar');
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-2xl mx-auto mt-20 bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50"
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {service ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del servicio</label>
            <input {...register('name', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duración (minutos)</label>
            <input {...register('duration_minutes', { required: true, valueAsNumber: true })} type="number" className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <textarea {...register('description')} className="input-field" rows={3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
            <input {...register('price', { required: true, valueAsNumber: true })} type="number" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select {...register('is_active')} className="input-field">
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input {...register('requires_deposit')} type="checkbox" className="w-4 h-4 text-pink-600" />
            <label className="text-sm font-medium text-gray-700">Requiere seña</label>
          </div>
          
          {requiresDeposit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Porcentaje de seña (%)</label>
              <input {...register('deposit_percentage', { valueAsNumber: true })} type="number" min="0" max="100" className="input-field" />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-200 rounded-2xl font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-2xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Guardar</span>
          </button>
        </div>
      </form>
    </ReactModal>
  );
};

// Client Form Modal
interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  client: Client | null;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, onSave, client }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      whatsapp: '',
      email: '',
      notes: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (client) {
      reset(client);
    } else {
      reset({
        name: '',
        whatsapp: '',
        email: '',
        notes: '',
        is_active: true,
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (client) {
        await clientService.update(client.id, data);
      } else {
        await clientService.create(data);
      }
      onSave();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar');
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-2xl mx-auto mt-20 bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50"
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {client ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
            <input {...register('name', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
            <input {...register('whatsapp', { required: true })} className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input {...register('email')} type="email" className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
          <textarea {...register('notes')} className="input-field" rows={3} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select {...register('is_active')} className="input-field">
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-200 rounded-2xl font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-2xl font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Guardar</span>
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
  const { register, handleSubmit, control, setValue, watch, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      is_active: true,
      specialties: '',
      notes: '',
      service_ids: [] as number[],
      schedule: daysOfWeek.map(day => ({ 
        day_of_week: day.id, 
        start_time: '09:00', 
        end_time: '18:00', 
        is_active: true 
      })),
    },
  });

  useEffect(() => {
    if (employee) {
      reset({
        ...employee,
        service_ids: employee.services?.map(s => s.id) || [],
        specialties: Array.isArray(employee.specialties) ? employee.specialties.join(', ') : '',
        schedule: (employee as any).schedules || daysOfWeek.map(day => ({ 
          day_of_week: day.id, 
          start_time: '09:00', 
          end_time: '18:00', 
          is_active: true 
        })),
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        is_active: true,
        specialties: '',
        notes: '',
        service_ids: [],
        schedule: daysOfWeek.map(day => ({ 
          day_of_week: day.id, 
          start_time: '09:00', 
          end_time: '18:00', 
          is_active: true 
        })),
      });
    }
  }, [employee, reset]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      specialties: typeof data.specialties === 'string' && data.specialties.trim() !== ''
        ? data.specialties.split(',').map((s: string) => s.trim())
        : [],
      service_ids: data.service_ids.map((id: any) => Number(id)),
      schedules: data.schedule,
    };
    
    try {
      if (employee) {
        await employeeService.update(employee.id, payload);
      } else {
        await employeeService.create(payload);
      }
      onSave();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar');
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-4xl mx-auto mt-10 bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50"
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
            <input {...register('name', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input {...register('email', { required: true })} type="email" className="input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input {...register('phone')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select {...register('is_active')} className="input-field">
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Especialidades (separadas por coma)</label>
          <input {...register('specialties')} className="input-field" placeholder="Ej: Manicura, Pedicura, Diseño de uñas" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Servicios asignados</label>
          <Controller
            control={control}
            name="service_ids"
            render={({ field }) => (
              <Select
                isMulti
                options={services.map(s => ({ value: s.id, label: s.name }))}
                value={services
                  .filter(s => (field.value || []).includes(s.id))
                  .map(s => ({ value: s.id, label: s.name }))}
                onChange={selected => field.onChange(selected.map((opt: any) => opt.value))}
                classNamePrefix="react-select"
                placeholder="Selecciona servicios..."
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
          <textarea {...register('notes')} className="input-field" rows={3} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">Horario semanal</label>
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3">Día</th>
                    <th className="text-center py-2 px-3">Activo</th>
                    <th className="text-center py-2 px-3">Desde</th>
                    <th className="text-center py-2 px-3">Hasta</th>
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map((day, idx) => (
                    <tr key={day.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 font-medium">{day.label}</td>
                      <td className="py-2 px-3 text-center">
                        <Controller
                          control={control}
                          name={`schedule.${idx}.is_active`}
                          render={({ field }) => (
                            <input 
                              type="checkbox" 
                              checked={field.value} 
                              onChange={e => field.onChange(e.target.checked)}
                              className="w-4 h-4 text-orange-600 rounded"
                            />
                          )}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Controller
                          control={control}
                          name={`schedule.${idx}.start_time`}
                          render={({ field }) => (
                            <input 
                              type="time" 
                              className="w-full px-2 py-1 border border-gray-200 rounded-lg text-sm"
                              {...field} 
                            />
                          )}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Controller
                          control={control}
                          name={`schedule.${idx}.end_time`}
                          render={({ field }) => (
                            <input 
                              type="time" 
                              className="w-full px-2 py-1 border border-gray-200 rounded-lg text-sm"
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
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-200 rounded-2xl font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Guardar</span>
          </button>
        </div>
      </form>
    </ReactModal>
  );
};