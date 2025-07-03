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
  inventory: {
    total_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
  };
}

export const DashboardSection: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo
      setStats({
        appointments: {
          total: 156,
          confirmed: 142,
          completed: 128,
          cancelled: 14,
          today: 8,
          upcoming: 24,
          completion_rate: 89.7,
          cancellation_rate: 9.0
        },
        revenue: {
          total_revenue: 2840000,
          deposit_revenue: 1420000,
          pending_revenue: 340000,
          avg_revenue_per_appointment: 18205
        },
        clients: {
          total_clients: 89,
          new_clients: 23,
          active_clients: 67,
          retention_rate: 75.3
        },
        inventory: {
          total_products: 45,
          low_stock_products: 3,
          out_of_stock_products: 1
        }
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
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
          value={`${stats.appointments.completion_rate}%`}
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
            <h3 className="text-lg font-semibold text-gray-800">Inventario</h3>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total productos</span>
              <span className="font-semibold text-gray-800">{stats.inventory.total_products}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stock bajo</span>
              <span className="font-semibold text-yellow-600">{stats.inventory.low_stock_products}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sin stock</span>
              <span className="font-semibold text-red-600">{stats.inventory.out_of_stock_products}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Retención</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasa de retención</span>
              <span className="font-semibold text-green-600">{stats.clients.retention_rate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Clientes totales</span>
              <span className="font-semibold text-gray-800">{stats.clients.total_clients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Promedio por turno</span>
              <span className="font-semibold text-blue-600">{formatCurrency(stats.revenue.avg_revenue_per_appointment)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-6 border border-yellow-200">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">Alertas de Inventario</h3>
          </div>
          <p className="text-yellow-700 mb-4">
            Tienes {stats.inventory.low_stock_products} productos con stock bajo y {stats.inventory.out_of_stock_products} sin stock.
          </p>
          <button className="bg-yellow-600 text-white px-4 py-2 rounded-2xl hover:bg-yellow-700 transition-colors duration-200">
            Ver Inventario
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-800">Recordatorios</h3>
          </div>
          <p className="text-blue-700 mb-4">
            Hay {stats.appointments.upcoming} turnos programados para los próximos 7 días.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition-colors duration-200">
            Ver Calendario
          </button>
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