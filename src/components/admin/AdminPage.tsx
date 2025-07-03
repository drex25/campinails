import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Clock, 
  Users, 
  UserCheck, 
  Bell, 
  CreditCard, 
  Tag, 
  Package, 
  BarChart3, 
  Settings,
  LogOut,
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  CalendarClock
} from 'lucide-react';
import { DashboardSection } from '../components/admin/DashboardSection';
import { CalendarSection } from '../components/admin/CalendarSection';
import { ServicesSection } from '../components/admin/ServicesSection';
import { AppointmentsSection } from '../components/admin/AppointmentsSection';
import { ClientsSection } from '../components/admin/ClientsSection';
import { EmployeesSection } from '../components/admin/EmployeesSection';
import { EmployeeScheduleSection } from '../components/admin/EmployeeScheduleSection';
import { NotificationsSection } from '../components/admin/NotificationsSection';
import { PaymentsSection } from '../components/admin/PaymentsSection';
import { PromotionsSection } from '../components/admin/PromotionsSection';
import { InventorySection } from '../components/admin/InventorySection';
import { ReportsSection } from '../components/admin/ReportsSection';

type AdminSection = 
  | 'dashboard' 
  | 'calendar' 
  | 'services' 
  | 'appointments' 
  | 'clients' 
  | 'employees'
  | 'employee_schedules'
  | 'notifications'
  | 'payments'
  | 'promotions'
  | 'inventory'
  | 'reports';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
    { id: 'calendar', label: 'Calendario', icon: Calendar, color: 'text-purple-600' },
    { id: 'appointments', label: 'Turnos', icon: Clock, color: 'text-green-600' },
    { id: 'clients', label: 'Clientes', icon: Users, color: 'text-pink-600' },
    { id: 'employees', label: 'Empleados', icon: UserCheck, color: 'text-indigo-600' },
    { id: 'employee_schedules', label: 'Horarios', icon: CalendarClock, color: 'text-violet-600' },
    { id: 'services', label: 'Servicios', icon: Scissors, color: 'text-rose-600' },
    { id: 'payments', label: 'Pagos', icon: CreditCard, color: 'text-emerald-600' },
    { id: 'promotions', label: 'Promociones', icon: Tag, color: 'text-orange-600' },
    { id: 'inventory', label: 'Inventario', icon: Package, color: 'text-cyan-600' },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, color: 'text-yellow-600' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, color: 'text-violet-600' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'calendar':
        return <CalendarSection />;
      case 'services':
        return <ServicesSection />;
      case 'appointments':
        return <AppointmentsSection />;
      case 'clients':
        return <ClientsSection />;
      case 'employees':
        return <EmployeesSection />;
      case 'employee_schedules':
        return <EmployeeScheduleSection employeeId={selectedEmployeeId} />;
      case 'notifications':
        return <NotificationsSection />;
      case 'payments':
        return <PaymentsSection />;
      case 'promotions':
        return <PromotionsSection />;
      case 'inventory':
        return <InventorySection />;
      case 'reports':
        return <ReportsSection />;
      default:
        return <DashboardSection />;
    }
  };

  // Función para navegar a los horarios de un empleado específico
  const navigateToEmployeeSchedule = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setActiveSection('employee_schedules');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-2xl transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'} flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Campi Nails
                </h1>
                <p className="text-sm text-gray-500">Panel Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AdminSection)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color} group-hover:scale-110 transition-transform duration-200`} />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center space-x-3 p-3 rounded-2xl bg-gray-50 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`w-full mt-3 flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-all duration-200 group ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            {!sidebarCollapsed && (
              <span className="font-medium">Cerrar Sesión</span>
            )}
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
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-800 capitalize">
                  {activeSection === 'dashboard' ? 'Panel de Control' : 
                   activeSection === 'employee_schedules' ? 'Horarios de Empleados' :
                   menuItems.find(item => item.id === activeSection)?.label}
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

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                <Mail className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};