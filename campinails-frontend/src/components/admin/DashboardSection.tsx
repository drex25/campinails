import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Package,
  Bell,
  ArrowUp,
  ArrowDown,
  Eye,
  Phone,
  Mail
} from 'lucide-react';
import { appointmentService, clientService, serviceService } from '../../services/api';
import type { Appointment, Client, Service } from '../../types';

interface DashboardStats {
  appointments: {
    total: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    today: number;
    upcoming: number;
    completion_rate: number;
    cancellation_rate: number;
  };
  revenue: {
    total_revenue: number;
    deposit_revenue: number;
    pending_revenue: number;
    avg_revenue_per_appointment: number;
  };
  clients: {
    total_clients: number;
    new_clients: number;
    active_clients: number;
    retention_rate: number;
  };
}

export const DashboardSection: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [appointmentsData, clientsData] = await Promise.all([
        appointmentService.getAll(),
        clientService.getAll()
      ]);

      // Calcular estadísticas reales
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const monthlyAppointments = appointmentsData.filter(apt => 
        new Date(apt.created_at) >= startOfMonth
      );

      const todayAppointments = appointmentsData.filter(apt => 
        new Date(apt.scheduled_at).toDateString() === today.toDateString()
      );

      const upcomingAppointments = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.scheduled_at);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return aptDate >= today && aptDate <= nextWeek && apt.status !== 'cancelled';
      });

      const completedAppointments = monthlyAppointments.filter(apt => apt.status === 'completed');
      const cancelledAppointments = monthlyAppointments.filter(apt => 
        apt.status === 'cancelled' || apt.status === 'no_show'
      );

      const totalRevenue = completedAppointments.reduce((sum, apt) => sum + apt.total_price, 0);
      const depositRevenue = monthlyAppointments
        .filter(apt => apt.deposit_paid)
        .reduce((sum, apt) => sum + apt.deposit_amount, 0);
      
      const pendingRevenue = appointmentsData
        .filter(apt => apt.status === 'confirmed' && !apt.deposit_paid)
        .reduce((sum, apt) => sum + apt.deposit_amount, 0);

      const newClients = clientsData.filter(client => 
        new Date(client.created_at) >= startOfMonth
      );

      setStats({
        appointments: {
          total: monthlyAppointments.length,
          confirmed: monthlyAppointments.filter(apt => apt.status === 'confirmed').length,
          completed: completedAppointments.length,
          cancelled: cancelledAppointments.length,
          today: todayAppointments.length,
          upcoming: upcomingAppointments.length,
          completion_rate: monthlyAppointments.length > 0 ? 
            (completedAppointments.length / monthlyAppointments.length) * 100 : 0,
          cancellation_rate: monthlyAppointments.length > 0 ? 
            (cancelledAppointments.length / monthlyAppointments.length) * 100 : 0
        },
        revenue: {
          total_revenue: totalRevenue,
          deposit_revenue: depositRevenue,
          pending_revenue: pendingRevenue,
          avg_revenue_per_appointment: completedAppointments.length > 0 ? 
            totalRevenue / completedAppointments.length : 0
        },
        clients: {
          total_clients: clientsData.length,
          new_clients: newClients.length,
          active_clients: clientsData.filter(client => client.is_active).length,
          retention_rate: 75.3 // Esto requeriría un cálculo más complejo
        }
      });

      // Obtener turnos recientes
      const recent = appointmentsData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentAppointments(recent);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color, 
    trend, 
    trendValue 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color: string;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">¡Bienvenida de vuelta! 👋</h1>
          <p className="text-gray-600 mt-1">Aquí tienes un resumen de tu negocio</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
          >
            <option value="day">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
          </select>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Turnos de Hoy"
          value={stats.appointments.today}
          subtitle={`${stats.appointments.upcoming} próximos`}
          icon={Calendar}
          color="bg-gradient-to-r from-blue-500 to-indigo-500"
          trend="up"
          trendValue="12%"
        />
        
        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(stats.revenue.total_revenue)}
          subtitle={`${formatCurrency(stats.revenue.pending_revenue)} pendientes`}
          icon={DollarSign}
          color="bg-gradient-to-r from-green-500 to-emerald-500"
          trend="up"
          trendValue="8.5%"
        />
        
        <StatCard
          title="Clientes Activos"
          value={stats.clients.active_clients}
          subtitle={`${stats.clients.new_clients} nuevos este mes`}
          icon={Users}
          color="bg-gradient-to-r from-purple-500 to-pink-500"
          trend="up"
          trendValue="15%"
        />
        
        <StatCard
          title="Tasa de Finalización"
          value={`${stats.appointments.completion_rate.toFixed(1)}%`}
          subtitle={`${stats.appointments.completed} completados`}
          icon={CheckCircle}
          color="bg-gradient-to-r from-orange-500 to-red-500"
          trend="up"
          trendValue="2.3%"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Estado de Turnos</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Confirmados</span>
              <span className="font-semibold text-green-600">{stats.appointments.confirmed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completados</span>
              <span className="font-semibold text-blue-600">{stats.appointments.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cancelados</span>
              <span className="font-semibold text-red-600">{stats.appointments.cancelled}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Ingresos</h3>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total del mes</span>
              <span className="font-semibold text-gray-800">{formatCurrency(stats.revenue.total_revenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Señas cobradas</span>
              <span className="font-semibold text-green-600">{formatCurrency(stats.revenue.deposit_revenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pendientes</span>
              <span className="font-semibold text-yellow-600">{formatCurrency(stats.revenue.pending_revenue)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Clientes</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total clientes</span>
              <span className="font-semibold text-gray-800">{stats.clients.total_clients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nuevos este mes</span>
              <span className="font-semibold text-blue-600">{stats.clients.new_clients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Promedio por turno</span>
              <span className="font-semibold text-purple-600">{formatCurrency(stats.revenue.avg_revenue_per_appointment)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Actividad Reciente</h3>
        
        <div className="space-y-4">
          {recentAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  appointment.status === 'confirmed' ? 'bg-green-100' :
                  appointment.status === 'pending_deposit' ? 'bg-yellow-100' :
                  appointment.status === 'completed' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {appointment.status === 'confirmed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {appointment.status === 'pending_deposit' && <Clock className="w-5 h-5 text-yellow-600" />}
                  {appointment.status === 'completed' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                  {appointment.status === 'cancelled' && <XCircle className="w-5 h-5 text-red-600" />}
                </div>
                
                <div>
                  <div className="font-medium text-gray-800">{appointment.client?.name}</div>
                  <div className="text-sm text-gray-600">{appointment.service?.name}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  {formatCurrency(appointment.total_price)}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(appointment.scheduled_at).toLocaleDateString('es-ES')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105">
            <Phone className="w-5 h-5" />
            <span className="font-medium">Llamar Cliente</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105">
            <Mail className="w-5 h-5" />
            <span className="font-medium">Enviar Email</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105">
            <Eye className="w-5 h-5" />
            <span className="font-medium">Ver Reportes</span>
          </button>
        </div>
      </div>
    </div>
  );
};